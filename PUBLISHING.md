# Publish siri-icons-vue to npm

The package is prepared for a public npm publish, but **not yet published**.
The source retains the original Figma attribution and original SVG assets.
Only publish it publicly after confirming you have permission to redistribute them.

## Commands

```bash
node --version
npm --version
npm login --registry=https://registry.npmjs.org/
npm whoami
npm ci
npm run check
npm run gallery
node scripts/build-docs.mjs
npm publish --access public --dry-run
npm publish --access public
```

The package name must be unclaimed on the npm registry. The `private` flag has been removed and `publishConfig.access` is set to `public`. `license` stays `UNLICENSED` until its owner chooses an appropriate license.

## After publishing

```bash
npm install siri-icons-vue
```

```vue
<script setup lang="ts">
import { IconSearch, IconCalendar, IconPlus } from 'siri-icons-vue'
</script>
<template>
  <IconSearch :size="24" />
  <IconCalendar :size="20" />
  <IconPlus :size="20" />
</template>
```

## Releasing updates

After committing the changed icon source and verifying tests, increment the version, then publish. For example:

```bash
npm version patch
npm publish --access public
```

The generated package in this handoff uses pre-existing validated code, renamed to `Siri*`, while this environment could not reinstall dev dependencies to rerun full Vue tests. Please run the documented checks locally before publishing.

## Version 0.2.0: Figma Object Graphic illustrations

This version adds 52 `Illustration*` exports to the 371 `Icon*` exports, without removing existing names. Run `npm ci && npm run check && npm publish --dry-run` locally before publishing. Creating a PR does not automatically publish to npm. Permission to redistribute the source artwork must be confirmed first.

## Version 0.3.0 — 40 Figma Doodle images

Adds 40 `Doodle*` Vue components alongside 371 `Icon*` and 52 `Illustration*` components. The PNGs are bundled as data URLs in individual tree-shakeable Vue modules. Before publishing, run `npm ci && npm run check && npm publish --dry-run` and confirm redistribution rights for all artwork.
