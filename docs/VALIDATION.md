# Validation — Siri Icons Vue 0.1.0

ตรวจสอบ SVG ต้นฉบับวันที่ **2026-10-21** จาก snapshot ใน [Figma Icons](https://www.figma.com/design/OHflJtmY9bt1jGdMFyRPpR/Linen?node-id=112-6764)

## Source integrity

| Check | Result |
| --- | --- |
| Figma COMPONENT count | 371 |
| Original SVG files | 371 |
| Unique Vue export names | 371 |
| Unique package subpaths | 371 |
| Well-formed XML / SVG | PASS — all 371 |
| SVG root dimensions and viewBox | PASS |
| Missing definition references / duplicate IDs | 0 |
| Exact duplicate SVG files / normalized geometries | 0 |
| Total original SVG bytes | 178,050 |
| Visible monochrome glyphs | 371 |

Original viewBoxes: 368 × 24×24, 2 × 23×23 (`share`, `grid`), 1 × 20×20 (`file-preview`). The source contains 962 paths and one clipPath in `attach`; there are no masks, gradients, embedded images, text nodes or filters in this snapshot.

## Visual fidelity

Vue components were server-rendered and rasterized with Sharp/librsvg at a common **96×96 pixel viewport**. Each component received its original glyph color through `color`, and both renders preserved the original viewBox.

| Comparison | Result |
| --- | --- |
| Original SVG vs Vue SSR SVG | **371 / 371 exact RGBA matches** |
| Pixel mismatches | **0** |
| Rendering errors | **0** |

This validates the artwork in the generated components, including clipping and native 23px/20px viewBoxes. The default `currentColor` behavior intentionally follows the application’s color, so the comparison restored source colors to distinguish geometry preservation from the intended color feature.

| Source glyph color | Icons |
| --- | ---: |
| `#000000` | 218 |
| `#231F20` | 140 |
| `#010101` | 7 |
| `#161617` | 5 |
| `#4A4D51` | 1 |

## Package and browser

- Build generated all 371 ESM icon modules and type declarations.
- Package/SVG parser tests: 7 substantive cases passed.
- TypeScript consumer declarations: passed.
- Tree shaking: importing one icon included one icon module plus shared runtime, with Vue external.
- An `IconArrowDown` sample (before renaming, with identical SVG payload) measured **1,575 bytes minified / 924 bytes gzip**, excluding Vue. Actual application bundles depend on the consuming toolchain.
- Real Chromium hydration: stable server/client IDs; no hydration warnings.
- Repeated title/clipPath IDs: unique and correctly referenced.
- Events: click listeners forwarded.
- Reactivity: size, color and title updates work.
- CSS: inherited color and CSS sizing work.
- Browser runtime check: zero page errors and zero warnings.

Validation environment: Vue and server renderer 3.5.44, TypeScript 7.0.2, esbuild 0.28.2, Chromium 133.0.6943.0. These are the tested versions; the package peer range is Vue >=3.5.0 <4.

The automated tests use Vue directly. Nuxt-specific integration and user application layouts were not independently exercised.

## Rename-only verification — `Siri*` → `Icon*`

The npm package remains `siri-icons-vue`. All 371 Vue component names have been renamed with the `Icon` prefix. Shared TypeScript types are now `IconProps`, `IconComponent` and `IconName`. Source SVG files, icon subpaths, viewBoxes and glyph definitions were not modified.

Static validation after this rename passed for **371 / 371** manifest names, bundled ESM exports, declarations, metadata and original SVG SHA-256 values. The gallery and catalogue were regenerated from the updated manifest. An npm tarball was created with `npm pack --ignore-scripts`.

**Full Vue runtime/browser/TypeScript checks listed above were performed on the prior component-prefix build and were not rerun for the renamed build** because npm dependencies could not be retrieved in this environment. Run `npm ci && npm run check` in an environment with npm registry access before publishing; publishing runs the same checks via the `prepack` script.

## Reproduce package checks

```bash
npm ci
npm run check
```

Machine-readable source and fidelity reports are included under `docs/qa/`.
