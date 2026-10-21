import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { build } from 'esbuild';
import * as icons from '../dist/index.js';

const metadata = JSON.parse(await readFile(new URL('../dist/metadata.json', import.meta.url), 'utf8'));

test('every source icon is exported once and renders a non-empty SVG', async () => {
  assert.equal(Object.keys(icons).length, metadata.iconCount);
  assert.equal(new Set(metadata.icons.map((icon) => icon.name)).size, metadata.iconCount);
  const app = createSSRApp({ render: () => h('div', metadata.icons.map((icon) => h(icons[icon.componentName], { 'data-source-id': icon.nodeId }))) });
  const html = await renderToString(app);
  assert.equal((html.match(/<svg\b/g) ?? []).length, metadata.iconCount);
  assert.equal((html.match(/data-source-id=/g) ?? []).length, metadata.iconCount);
  for (const icon of metadata.icons) assert.ok(html.includes(`viewBox="${icon.viewBox}"`));
});

test('decorative defaults, title labels, SVG attrs, size, color, and reactivity inputs render correctly', async () => {
  const Component = icons.IconArrowDown;
  assert.ok(Component);
  const decorative = await renderToString(createSSRApp({ render: () => h(Component) }));
  assert.match(decorative, /aria-hidden="true"/);
  assert.match(decorative, /width="24"/);
  assert.match(decorative, /fill="currentColor"/);
  assert.doesNotMatch(decorative, /role="img"/);
  const labelled = await renderToString(createSSRApp({ render: () => h(Component, { size: 32, color: '#0f766e', title: 'Download', class: 'test-icon', 'data-test': 'forwarded', width: 40 }) }));
  assert.match(labelled, /width="40"/);
  assert.match(labelled, /height="32"/);
  assert.match(labelled, /color="#0f766e"/);
  assert.match(labelled, /class="test-icon"/);
  assert.match(labelled, /data-test="forwarded"/);
  assert.match(labelled, /role="img"/);
  assert.doesNotMatch(labelled, /aria-hidden=/);
  const titleId = labelled.match(/<title id="([^"]+)">Download<\/title>/)?.[1];
  assert.ok(titleId);
  assert.ok(labelled.includes(`aria-labelledby="${titleId}"`));
  const ariaLabel = await renderToString(createSSRApp({ render: () => h(Component, { 'aria-label': 'Next' }) }));
  assert.match(ariaLabel, /aria-label="Next"/);
  assert.doesNotMatch(ariaLabel, /aria-hidden=/);
});

test('repeated SVG definitions and title IDs are unique and deterministic across server renders', async () => {
  const candidates = metadata.icons.filter((icon) => icon.definitionIds > 0);
  assert.ok(candidates.length > 0, 'This source set should contain at least one clipped icon.');
  const sample = candidates[0];
  const render = () => renderToString(createSSRApp({ render: () => h('div', [h(icons[sample.componentName], { title: 'First' }), h(icons[sample.componentName], { title: 'Second' })]) }));
  const first = await render();
  const second = await render();
  assert.equal(first, second, 'Equivalent SSR trees must produce stable useId values.');
  const ids = [...first.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  const references = [...first.matchAll(/url\(#([^)]*)\)/g)].map((match) => match[1]);
  assert.ok(references.length >= 2);
  for (const id of references) assert.ok(ids.includes(id), `Missing definition ${id}`);
  assert.notEqual(references[0], references[references.length - 1]);
});

test('named import bundles exclude every unused icon and keep Vue external', async () => {
  const bundled = await build({
    stdin: { contents: "export { IconArrowDown } from './dist/index.js';", resolveDir: new URL('..', import.meta.url).pathname, sourcefile: 'consumer.js' },
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'esm',
    write: false,
    external: ['vue'],
    metafile: true,
  });
  const output = bundled.outputFiles[0].text;
  assert.match(output, /from["']vue["']/);
  assert.match(output, /IconArrowDown/);
  const exportedInputs = Object.entries(Object.values(bundled.metafile.outputs)[0].inputs)
    .filter(([path, contribution]) => path.includes('/icons/') && contribution.bytesInOutput > 0);
  assert.equal(exportedInputs.length, 1, JSON.stringify(exportedInputs));
  console.log(`One icon + runtime: ${Buffer.byteLength(output)} bytes minified, ${gzipSync(output).length} bytes gzip (Vue external).`);
});
