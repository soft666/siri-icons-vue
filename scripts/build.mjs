import { readFile, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { compileSvg } from './svg.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'assets/manifest.json');
const originalRoot = join(root, 'assets/original');
const outputRoot = join(root, 'dist');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const icons = Array.isArray(manifest) ? manifest : manifest.icons;
if (!Array.isArray(icons) || icons.length === 0) throw new Error('Manifest must contain at least one exported icon.');

const names = new Set();
const componentNames = new Set();
const prepared = [];
for (const icon of icons) {
  const { name, componentName, file } = icon;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? '')) throw new Error(`Invalid icon name: ${name}`);
  if (!/^Siri[A-Za-z0-9]+$/.test(componentName ?? '')) throw new Error(`Invalid component name: ${componentName}`);
  if (names.has(name)) throw new Error(`Duplicate icon name: ${name}`);
  if (componentNames.has(componentName)) throw new Error(`Duplicate component name: ${componentName}`);
  names.add(name);
  componentNames.add(componentName);
  const sourcePath = resolve(originalRoot, file);
  const childPath = relative(originalRoot, sourcePath);
  if (childPath.startsWith('..') || isAbsolute(childPath) || !file.endsWith('.svg')) throw new Error(`Invalid SVG path: ${file}`);
  const source = await readFile(sourcePath, 'utf8');
  let compiled;
  try {
    compiled = compileSvg(source, { colorMode: icon.colorMode });
  } catch (error) {
    throw new Error(`${file}: ${error.message}`, { cause: error });
  }
  prepared.push({ icon, source, sourcePath, ...compiled });
}
prepared.sort((a, b) => a.icon.name.localeCompare(b.icon.name, 'en'));

// Validation precedes replacing generated output, leaving a passing prior build
// available if a newly exported SVG needs attention.
await rm(outputRoot, { recursive: true, force: true });
await mkdir(join(outputRoot, 'icons'), { recursive: true });
await mkdir(join(outputRoot, 'svg'), { recursive: true });
await copyFile(join(root, 'src/runtime.js'), join(outputRoot, 'runtime.js'));
await copyFile(join(root, 'src/runtime.d.ts'), join(outputRoot, 'runtime.d.ts'));

const exports = [];
const declarations = [];
const metadata = [];
for (const { icon, source, sourcePath, definition, metadata: details } of prepared) {
  const { name, componentName } = icon;
  const code = `// Generated from Figma node ${icon.nodeId ?? 'unknown'}; run npm run build to regenerate.\n` +
    `import { createIcon } from '../runtime.js';\n` +
    `const ${componentName} = /*#__PURE__*/ createIcon(${JSON.stringify(componentName)}, ${JSON.stringify(definition)});\n` +
    `export { ${componentName} };\nexport default ${componentName};\n`;
  await writeFile(join(outputRoot, 'icons', `${name}.js`), code);
  await writeFile(join(outputRoot, 'icons', `${name}.d.ts`),
    `import type { IconComponent } from '../runtime.js';\n` +
    `declare const ${componentName}: IconComponent;\nexport { ${componentName} };\nexport default ${componentName};\n`);
  await copyFile(sourcePath, join(outputRoot, 'svg', `${name}.svg`));
  exports.push(`export { default as ${componentName} } from './icons/${name}.js';`);
  declarations.push(`export { default as ${componentName} } from './icons/${name}.js';`);
  metadata.push({ ...icon, ...details, sha256: createHash('sha256').update(source).digest('hex'), svg: `svg/${name}.svg`, import: componentName });
}
await writeFile(join(outputRoot, 'index.js'), exports.join('\n') + '\n');
await writeFile(join(outputRoot, 'index.d.ts'), [
  `export type { IconProps, IconComponent } from './runtime.js';`,
  `export type IconName = ${prepared.map(({ icon }) => JSON.stringify(icon.name)).join(' | ')};`,
  ...declarations,
].join('\n') + '\n');
await writeFile(join(outputRoot, 'metadata.json'), JSON.stringify({
  source: manifest.source ?? null,
  iconCount: metadata.length,
  icons: metadata,
}, null, 2) + '\n');

const sourceBytes = prepared.reduce((total, item) => total + Buffer.byteLength(item.source), 0);
const modes = metadata.reduce((counts, icon) => ({ ...counts, [icon.colorMode]: (counts[icon.colorMode] ?? 0) + 1 }), {});
console.log(JSON.stringify({ icons: prepared.length, colorModes: modes, sourceBytes, output: relative(root, outputRoot) }, null, 2));
