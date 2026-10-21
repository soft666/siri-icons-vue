import { defineComponent, h, mergeProps, useId } from 'vue';

// XML IDs are mapped per component instance. Vue's useId keeps these references
// stable during server rendering and hydration, including async component trees.
function makeIdMap(definition, prefix) {
  return Object.fromEntries(definition.ids.map((id, index) => [id, `${prefix}-d${index}`]));
}

function rewriteReferences(value, ids, attribute) {
  if (typeof value !== 'string') return value;
  if (attribute === 'id') return ids[value] ?? value;
  if ((attribute === 'href' || attribute === 'xlink:href') && value.startsWith('#')) {
    const target = value.slice(1);
    return ids[target] ? `#${ids[target]}` : value;
  }
  if (attribute === 'aria-labelledby' || attribute === 'aria-describedby') {
    return value.split(/\s+/).map((id) => ids[id] ?? id).join(' ');
  }
  return value.replace(/url\(\s*(['"]?)#([^\s)'"]+)\1\s*\)/g, (reference, _quote, id) => (
    ids[id] ? `url(#${ids[id]})` : reference
  ));
}

function renderNode(node, ids) {
  if (typeof node === 'string') return node;
  const [tag, attributes, children] = node;
  const props = Object.fromEntries(Object.entries(attributes).map(([key, value]) => (
    [key, rewriteReferences(value, ids, key)]
  )));
  return h(tag, props, children.map((child) => renderNode(child, ids)));
}

/** @internal Generated icon modules use this shared runtime. */
export function createIcon(name, definition, defaultSize = 24) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      size: { type: [Number, String], default: defaultSize },
      color: { type: String, default: 'currentColor' },
      title: { type: String, default: undefined },
    },
    setup(props, { attrs }) {
      const instanceId = `siri-${useId()}`;
      const ids = makeIdMap(definition, instanceId);
      const titleId = `${instanceId}-title`;

      return () => {
        const title = props.title?.trim();
        const externalLabel = attrs['aria-label'] || attrs['aria-labelledby'];
        const isLabelled = Boolean(title || externalLabel);
        const labelledBy = title && !externalLabel ? titleId : undefined;
        const children = definition.children.map((node) => renderNode(node, ids));
        if (title) children.unshift(h('title', { id: titleId }, title));

        const rootAttributes = Object.fromEntries(Object.entries(definition.attributes).map(([key, value]) => (
          [key, rewriteReferences(value, ids, key)]
        )));

        return h('svg', mergeProps(
          rootAttributes,
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: props.size,
            height: props.size,
            color: props.color,
            'aria-hidden': isLabelled ? undefined : true,
            'aria-labelledby': labelledBy,
            role: isLabelled ? 'img' : undefined,
            focusable: 'false',
          },
          attrs,
        ), children);
      };
    },
  });
}

export function createIllustration(name, definition) { return createIcon(name, definition, 120); }

/** Original Figma raster doodles rendered as self-contained PNG-backed Vue components. */
export function createDoodle(name, src) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      size: { type: [Number, String], default: 288 },
      title: { type: String, default: undefined },
    },
    setup(props,{attrs}) {
      return () => {
        const title=props.title?.trim();
        const isLabelled=Boolean(title||attrs['aria-label']||attrs['aria-labelledby']||attrs.alt);
        return h('img', mergeProps({
          src, width:props.size,height:props.size,
          alt: isLabelled ? (attrs.alt || title || '') : '',
          'aria-hidden':isLabelled ? undefined : true,
          decoding:'async',
        },attrs));
      };
    },
  });
}
