import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(await readFile(resolve(root, 'dist/metadata.json'), 'utf8'));
const lines = [
  '# Siri Icons — Complete catalogue',
  '',
  'Generated from dist/metadata.json. Run node scripts/build-docs.mjs after npm run build.',
  '',
  '**' + metadata.icons.length + ' icons** exported from [Linen — Icons](' + metadata.source.url + ').',
  '',
  'Component names preserve the Figma source spelling. Import from siri-icons-vue or use the listed per-icon subpath.',
  '',
  '| # | Figma component | Vue export | Subpath | viewBox | Original glyph color | Source node |',
  '| --- | --- | --- | --- | --- | --- | --- |',
];
for (const [index, icon] of metadata.icons.entries()) {
  const url = 'https://www.figma.com/design/' + metadata.source.fileKey + '/Linen?node-id=' + icon.nodeId.replace(':', '-');
  lines.push('| ' + (index + 1) + ' | ' + icon.figmaName + ' | ' + icon.componentName + ' | icons/' + icon.name + ' | ' + icon.viewBox + ' | ' + icon.sourceColors.join(', ') + ' | [' + icon.nodeId + '](' + url + ') |');
}
lines.push('');
await mkdir(resolve(root, 'docs'), { recursive: true });
await writeFile(resolve(root, 'docs/ICONS.md'), lines.join('\n'), 'utf8');
console.log('Generated docs/ICONS.md for ' + metadata.icons.length + ' icons.');

const doodles=metadata.doodles??[];
if(doodles.length){
 const lines=['# Siri Doodles — Complete catalogue','',''+doodles.length+' original 288px PNG doodles from [Figma Doodle Image]('+metadata.doodleSource.url+').','','| # | Figma | Vue export | Subpath | Node |','| --- | --- | --- | --- | --- |'];
 for(const [i,d] of doodles.entries()){
  const url='https://www.figma.com/design/'+metadata.doodleSource.fileKey+'/Linen?node-id='+d.nodeId.replace(':','-');
  lines.push('| '+(i+1)+' | '+d.figmaName+' | '+d.componentName+' | doodles/'+d.name+' | ['+d.nodeId+']('+url+') |');
 }
 await writeFile(resolve(root,'docs/DOODLES.md'),lines.join('\n')+'\n','utf8');
 console.log('Generated docs/DOODLES.md for '+doodles.length+' doodles.');
}
