import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvg } from '../scripts/svg.mjs';

test('monochrome conversion changes visible paint but preserves masks and clipping geometry', () => {
  const { definition, metadata } = compileSvg(`<svg width="24" height="24" viewBox="0 0 24 24" fill="black">
    <defs><mask id="cutout" style="mask-type:alpha"><rect width="24" height="24" fill="white"/><path d="M0 0H4V4Z" fill="black"/></mask></defs>
    <g mask="url(&quot;#cutout&quot;)"><path d="M0 0H24V24H0Z"/></g>
  </svg>`);
  assert.equal(metadata.colorMode, 'monochrome');
  assert.deepEqual(metadata.sourceColors, ['#000000']);
  const [defs, group] = definition.children;
  assert.equal(defs[2][0][2][0][1].fill, 'white');
  assert.equal(defs[2][0][2][1][1].fill, 'black');
  assert.equal(group[2][0][1].fill, 'currentColor');
  assert.equal(group[2][0][1].d, 'M0 0H24V24H0Z');
});

test('multiple colors and paint servers remain intact', () => {
  const twoColor = compileSvg('<svg viewBox="0 0 24 24"><path fill="#ff0000" d="M0 0H12V12H0Z"/><path fill="#00ff00" d="M12 12H24V24H12Z"/></svg>');
  assert.equal(twoColor.metadata.colorMode, 'original');
  assert.equal(twoColor.definition.children[0][1].fill, '#ff0000');
  assert.equal(twoColor.definition.children[1][1].fill, '#00ff00');
  const gradient = compileSvg('<svg viewBox="0 0 24 24"><defs><linearGradient id="gradient"><stop stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs><path fill="url(#gradient)" d="M0 0H24V24Z"/></svg>');
  assert.equal(gradient.metadata.colorMode, 'original');
  assert.equal(gradient.definition.children[1][1].fill, 'url(#gradient)');
});

test('dangerous/external inputs fail clearly and an original-color override preserves paint', () => {
  assert.throws(() => compileSvg('<svg viewBox="0 0 24 24"><image href="https://example.com/image.png"/></svg>'), /External SVG resource/);
  assert.throws(() => compileSvg('<svg viewBox="0 0 24 24"><script>run()</script><path d="M0 0H24Z"/></svg>'), /Unsupported SVG element/);
  assert.throws(() => compileSvg('<svg viewBox="0 0 0 24"><path d="M0 0H24Z"/></svg>'), /Invalid viewBox/);
  assert.throws(() => compileSvg('<svg viewBox="0 0 24 24"><path clip-path="url(#missing)" d="M0 0H24Z"/></svg>'), /missing local id/);
  const original = compileSvg('<svg viewBox="0 0 24 24"><path fill="#4A4D51" d="M0 0H24Z"/></svg>', { colorMode: 'original' });
  assert.equal(original.definition.children[0][1].fill, '#4A4D51');
});
