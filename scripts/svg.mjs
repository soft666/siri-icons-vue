import { DOMParser } from '@xmldom/xmldom';

const PAINT_ATTRIBUTES = new Set(['fill', 'stroke']);
const DEFINITION_TAGS = new Set(['defs', 'mask', 'clipPath', 'pattern', 'marker']);
const VISIBLE_SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'text', 'use']);
const BLOCKED_TAGS = new Set(['script', 'foreignObject', 'iframe', 'audio', 'video', 'style', 'animate', 'animateMotion', 'animateTransform', 'set']);
const ROOT_REMOVALS = new Set(['width', 'height', 'xmlns', 'xmlns:xlink', 'version', 'role', 'aria-hidden', 'aria-labelledby', 'aria-label', 'focusable']);

function styleMap(value) {
  return Object.fromEntries((value ?? '').split(';').map((declaration) => {
    const colon = declaration.indexOf(':');
    return colon < 0 ? [] : [declaration.slice(0, colon).trim().toLowerCase(), declaration.slice(colon + 1).trim()];
  }).filter((entry) => entry.length === 2 && entry[0]));
}

function colorKey(value) {
  const color = value.trim().toLowerCase();
  if (['none', 'transparent', 'currentcolor', 'inherit'].includes(color) || color.startsWith('url(')) return undefined;
  if (color === 'black' || color === '#000' || color === '#000000' || color === 'rgb(0,0,0)' || color === 'rgb(0, 0, 0)') return '#000000';
  if (color === 'white' || color === '#fff' || color === '#ffffff' || color === 'rgb(255,255,255)' || color === 'rgb(255, 255, 255)') return '#ffffff';
  if (/^#[\da-f]{3}$/i.test(color)) return '#' + [...color.slice(1)].map((char) => char + char).join('');
  return color;
}

function hasPaint(value) {
  return value != null && !['none', 'transparent'].includes(value.trim().toLowerCase());
}

function attributesOf(element) {
  const attributes = {};
  for (const attr of Array.from(element.attributes)) {
    if (/^on/i.test(attr.name)) throw new Error(`Inline event handler is unsupported: ${attr.name}`);
    if (attr.name === 'style' && /expression\s*\(|@import|javascript\s*:/i.test(attr.value)) {
      throw new Error('Active SVG styles are unsupported.');
    }
    if ((attr.name === 'href' || attr.name === 'xlink:href') && !attr.value.startsWith('#')) {
      throw new Error(`External SVG resource is unsupported: ${attr.name}`);
    }
    for (const match of attr.value.matchAll(/url\(([^)]*)\)/gi)) {
      const target = match[1].trim().replace(/^(['"])(.*?)\1$/, '$2');
      if (!target.startsWith('#')) throw new Error(`External SVG URL is unsupported: ${attr.name}`);
    }
    attributes[attr.name] = attr.value;
  }
  return attributes;
}

function elementTree(element) {
  const tag = element.localName || element.tagName;
  if (BLOCKED_TAGS.has(tag)) throw new Error(`Unsupported SVG element: ${tag}`);
  const children = [];
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === 1) {
      // Figma source labels must not become an icon's accessible name.
      if (['title', 'desc', 'metadata'].includes(child.localName || child.nodeName)) continue;
      children.push(elementTree(child));
    } else if ((child.nodeType === 3 || child.nodeType === 4) && child.nodeValue?.trim()) {
      children.push(child.nodeValue);
    }
  }
  return [tag, attributesOf(element), children];
}

function visit(node, callback, protectedPaint = false, inherited = { fill: 'black', stroke: 'none' }) {
  if (typeof node === 'string') return;
  const [tag, attributes, children] = node;
  const protectedNext = protectedPaint || DEFINITION_TAGS.has(tag);
  const style = styleMap(attributes.style);
  const paint = { fill: style.fill ?? attributes.fill ?? inherited.fill, stroke: style.stroke ?? attributes.stroke ?? inherited.stroke };
  callback(node, protectedNext, paint);
  for (const child of children) visit(child, callback, protectedNext, paint);
}

/** Parse without optimizing geometry. Only eligible visible paint is normalized. */
export function compileSvg(source, { colorMode } = {}) {
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('SVG document declarations/entities are unsupported.');
  const errors = [];
  const parser = new DOMParser({
    onError: (level, message) => { if (level === 'error' || level === 'fatalError') errors.push(message); },
  });
  const document = parser.parseFromString(source, 'image/svg+xml');
  if (errors.length) throw new Error(errors.join('; '));
  const root = document.documentElement;
  if (!root || root.localName !== 'svg') throw new Error('Expected an SVG root element.');
  const tree = elementTree(root);
  const width = root.getAttribute('width');
  const height = root.getAttribute('height');
  const viewBox = root.getAttribute('viewBox') || `0 0 ${parseFloat(width)} ${parseFloat(height)}`;
  const box = viewBox.trim().split(/[\s,]+/).map(Number);
  if (box.length !== 4 || box.some((value) => !Number.isFinite(value)) || box[2] <= 0 || box[3] <= 0) {
    throw new Error(`Invalid viewBox: ${viewBox}`);
  }
  tree[1].viewBox = viewBox;

  const colors = new Set();
  let usesDefinitionPaint = false;
  let visibleShapeCount = 0;
  const ids = [];
  visit(tree, ([tag, attributes], protectedPaint, paint) => {
    if (attributes.id) {
      if (ids.includes(attributes.id)) throw new Error(`Duplicate source SVG id: ${attributes.id}`);
      ids.push(attributes.id);
    }
    if (protectedPaint || !VISIBLE_SHAPES.has(tag)) return;
    visibleShapeCount += 1;
    for (const value of tag === 'line' ? [paint.stroke] : [paint.fill, paint.stroke]) {
      if (!hasPaint(value)) continue;
      if (/^url\(/i.test(value) || tag === 'use') usesDefinitionPaint = true;
      const key = colorKey(value);
      if (key) colors.add(key);
    }
  });
  if (!visibleShapeCount) throw new Error('SVG has no visible shapes.');
  const isMonochrome = colorMode === 'monochrome' || (
    colorMode !== 'original' && !usesDefinitionPaint && colors.size <= 1
  );
  if (colorMode === 'monochrome' && (colors.size > 1 || usesDefinitionPaint)) {
    throw new Error('Monochrome override would flatten multiple colors or paint-server references.');
  }
  if (isMonochrome) {
    visit(tree, ([tag, attributes], protectedPaint, paint) => {
      if (protectedPaint || !VISIBLE_SHAPES.has(tag)) return;
      const style = styleMap(attributes.style);
      for (const key of PAINT_ATTRIBUTES) {
        if (key === 'fill' && tag === 'line') continue;
        if (colorKey(paint[key])) {
          if (style[key] != null) style[key] = 'currentColor';
          else attributes[key] = 'currentColor';
        }
      }
      if (attributes.style) attributes.style = Object.entries(style).map(([key, value]) => `${key}:${value}`).join(';');
    });
  }

  for (const key of ROOT_REMOVALS) delete tree[1][key];
  const idSet = new Set(ids);
  visit(tree, ([_tag, attributes]) => {
    for (const [attribute, value] of Object.entries(attributes)) {
      const references = [...value.matchAll(/url\(\s*(['"]?)#([^\s)'\"]+)\1\s*\)/gi)].map((match) => match[2]);
      if ((attribute === 'href' || attribute === 'xlink:href') && value.startsWith('#')) references.push(value.slice(1));
      if (attribute === 'aria-labelledby' || attribute === 'aria-describedby') references.push(...value.split(/\s+/));
      for (const id of references) if (!idSet.has(id)) throw new Error(`SVG references missing local id: ${id}`);
    }
  });
  return {
    definition: { attributes: tree[1], children: tree[2], ids },
    metadata: {
      viewBox,
      width: Number.parseFloat(width) || box[2],
      height: Number.parseFloat(height) || box[3],
      colorMode: isMonochrome ? 'monochrome' : 'original',
      sourceColors: [...colors].sort(),
      definitionIds: ids.length,
      visibleShapeCount,
    },
  };
}
