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
  if (!/^Icon[A-Za-z0-9]+$/.test(componentName ?? '')) throw new Error(`Invalid component name: ${componentName}`);
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
const illustrationManifest = JSON.parse(await readFile(join(root,'assets/illustrations/manifest.json'),'utf8'));
const artRoot = join(root,'assets/illustrations/original');
const preparedIllustrations = [];
const illustrationNames = new Set();
for (const art of illustrationManifest.illustrations) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(art.name) || !/^Illustration[A-Za-z0-9]+$/.test(art.componentName))
    throw new Error('Invalid illustration name: '+art.name);
  if (illustrationNames.has(art.name) || componentNames.has(art.componentName)) throw new Error('Duplicate illustration: '+art.name);
  illustrationNames.add(art.name);
  const path = resolve(artRoot,art.file);
  if (relative(artRoot,path).startsWith('..') || isAbsolute(relative(artRoot,path)) || !path.endsWith('.svg')) throw new Error('Invalid illustration SVG path');
  const source = await readFile(path,'utf8');
  const compiled = compileSvg(source,{colorMode:'original'});
  preparedIllustrations.push({art,path,source,...compiled});
}
preparedIllustrations.sort((a,b)=>a.art.name.localeCompare(b.art.name,'en'));

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
await mkdir(join(outputRoot,'illustrations/svg'),{recursive:true});
const illustrationMetadata=[];
for (const {art,path,source,definition,metadata: details} of preparedIllustrations) {
  const {name,componentName}=art;
  await writeFile(join(outputRoot,'illustrations',name+'.js'),
    '// Generated from Figma node '+art.nodeId+'\n'+
    "import { createIllustration } from '../runtime.js';\n"+
    'const '+componentName+' = /*#__PURE__*/ createIllustration('+JSON.stringify(componentName)+','+JSON.stringify(definition)+');\n'+
    'export { '+componentName+' };\nexport default '+componentName+';\n');
  await writeFile(join(outputRoot,'illustrations',name+'.d.ts'),
    "import type { IllustrationComponent } from '../runtime.js';\n"+
    'declare const '+componentName+': IllustrationComponent;\nexport { '+componentName+' };\nexport default '+componentName+';\n');
  await copyFile(path,join(outputRoot,'illustrations/svg',name+'.svg'));
  exports.push("export { default as "+componentName+" } from './illustrations/"+name+".js';");
  declarations.push("export { default as "+componentName+" } from './illustrations/"+name+".js';");
  illustrationMetadata.push({...art,...details,sha256:createHash('sha256').update(source).digest('hex'),svg:'illustrations/svg/'+name+'.svg'});
}
await writeFile(join(outputRoot, 'index.js'), exports.join('\n') + '\n');
await writeFile(join(outputRoot, 'index.d.ts'), [
  `export type { IconProps, IconComponent, IllustrationProps, IllustrationComponent } from './runtime.js';`,
  `export type IconName = ${prepared.map(({ icon }) => JSON.stringify(icon.name)).join(' | ')};`,
  `export type IllustrationName = ${preparedIllustrations.map(({art})=>JSON.stringify(art.name)).join(' | ')};`,
  ...declarations,
].join('\n') + '\n');
await writeFile(join(outputRoot, 'metadata.json'), JSON.stringify({
  source: manifest.source ?? null,
  iconCount: metadata.length,
  icons: metadata,
  illustrationCount: illustrationMetadata.length,
  illustrationSource: illustrationManifest.source,
  illustrations: illustrationMetadata,
}, null, 2) + '\n');

const sourceBytes = prepared.reduce((total, item) => total + Buffer.byteLength(item.source), 0);
const modes = metadata.reduce((counts, icon) => ({ ...counts, [icon.colorMode]: (counts[icon.colorMode] ?? 0) + 1 }), {});
console.log(JSON.stringify({ icons: prepared.length, illustrations: preparedIllustrations.length, colorModes: modes, sourceBytes, output: relative(root, outputRoot) }, null, 2));
