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
