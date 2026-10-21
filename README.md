# Siri Icons for Vue

ไลบรารี Vue 3 จากไอคอนต้นฉบับ **371 รายการ** ใน [Figma: Linen — Icons](https://www.figma.com/design/OHflJtmY9bt1jGdMFyRPpR/Linen?node-id=112-6764)

- Package: `siri-icons-vue` · version `0.1.0`
- Vue component naming: `Icon*` (เช่น `IconSearch`, `IconCalendar`)
- Vue: `>=3.5.0 <4` · Node.js สำหรับติดตั้ง/พัฒนา: `>=20.19.0`
- มี named exports, import รายไอคอน, TypeScript declarations และ SVG ต้นฉบับ
- ขนาดเริ่มต้น 24 px; สีเริ่มต้น `currentColor`
- ไม่ต้องติดตั้ง icon font, CSS framework หรือ Vite SVG plugin เพิ่มเพื่อใช้ Vue components
- Source snapshot: 21 ตุลาคม 2026

## ติดตั้งจาก npm (หลังเผยแพร่แพ็กเกจ)

```bash
npm install siri-icons-vue
```

หมายเหตุ: คำสั่งนี้ใช้ได้หลังเจ้าของไลบรารีเผยแพร่แพ็กเกจขึ้น npm แล้ว
สำหรับทดสอบก่อน publish ใช้ tarball ในหัวข้อถัดไปได้

## ติดตั้งในโปรเจกต์ Vue จากไฟล์ tarball

นำไฟล์ `siri-icons-vue-0.1.0.tgz` ไปไว้ในโปรเจกต์ เช่นโฟลเดอร์ `vendor/` แล้วรัน:

```bash
npm install ./vendor/siri-icons-vue-0.1.0.tgz
```

แพ็กเกจในชุดนี้ติดตั้งจากไฟล์ tarball ไม่ต้องมี npm account สำหรับวิธีนี้ และควรเก็บไฟล์ใน `vendor/` ไว้กับโปรเจกต์เพื่อให้เครื่องอื่นและ CI ติดตั้งจาก lockfile ได้เหมือนกัน ดู [npm: ติดตั้ง tarball](https://docs.npmjs.com/cli/v11/commands/npm-install/#description)

หากวาง tarball ไว้ที่ root ของโปรเจกต์ ใช้:

```bash
npm install ./siri-icons-vue-0.1.0.tgz
```

## ตัวอย่าง Vue

```vue
<script setup lang="ts">
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconArrowDown,
  IconDeleteLine,
} from 'siri-icons-vue'
</script>

<template>
  <button type="button">
    <IconPlus :size="20" />
    เพิ่มรายการ
  </button>

  <IconSearch :size="24" color="#2563eb" title="ค้นหา" />
  <IconCalendar size="1.5rem" class="calendar-icon" />
  <IconArrowDown :size="16" />

  <button type="button" aria-label="ลบรายการ">
    <IconDeleteLine :size="20" />
  </button>
</template>

<style scoped>
button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.calendar-icon {
  color: #16a34a;
}
</style>
```

ตัวอย่างที่นำไปวางใน Vue app ได้อยู่ใน `examples/BasicUsage.vue` ของ source ZIP

## Import เฉพาะไอคอน

Named import จาก package root รองรับ tree shaking:

```ts
import { IconSearch, IconCalendar } from 'siri-icons-vue'
```

หรือเลือก subpath โดยตรง:

```ts
import IconSearch from 'siri-icons-vue/icons/search'
import { IconCalendar } from 'siri-icons-vue/icons/calendar'
```

ไฟล์ที่ build แล้วเป็น ESM และใช้ Vue ของแอปผ่าน peer dependency จึงไม่ bundle Vue ซ้ำเข้าไปในไลบรารี การทดสอบหนึ่ง named import ยืนยันว่ามีเฉพาะโมดูลไอคอนที่เลือกและ runtime ร่วมอยู่ใน bundle ดู [ผลตรวจ](docs/VALIDATION.md)

## Props และ SVG attributes

| Prop / attribute | Type | ค่าเริ่มต้น | การใช้งาน |
| --- | --- | --- | --- |
| `size` | `number \| string` | `24` | กำหนด width และ height เช่น `20`, `"1em"`, `"2rem"` |
| `color` | `string` | `"currentColor"` | กำหนดสีไอคอน เช่น `"#2563eb"` |
| `title` | `string` | ไม่กำหนด | เพิ่ม accessible SVG title และ `role="img"` |
| `class`, `style` | SVG attributes | ไม่กำหนด | ส่งต่อไปยัง root `<svg>` |
| `width`, `height` | SVG attributes | ใช้จาก `size` | override ขนาดแต่ละด้านได้ |
| `aria-label`, `aria-labelledby` | SVG attributes | ไม่กำหนด | ชื่อที่ใช้กับ assistive technology |
| `@click`, events อื่น | SVG events | ไม่กำหนด | ส่งต่อไปยัง root `<svg>` |

ขนาดภายนอกเริ่มที่ 24 px แต่ยังเก็บ `viewBox` เดิมของแต่ละไอคอน: 368 ตัวเป็น 24×24, `share` และ `grid` เป็น 23×23, `file-preview` เป็น 20×20

หากต้องการขนาด native ของสองกลุ่มหลัง:

```vue
<IconShare :size="23" />
<IconGrid :size="23" />
<IconFilePreview :size="20" />
```

## CSS และ Tailwind

`currentColor` ทำให้ไอคอนใช้สีข้อความจาก element หรือ container ได้:

```vue
<div style="color: #dc2626">
  <IconDeleteLine :size="20" />
</div>
```

โปรเจกต์ที่มี Tailwind อยู่แล้วใช้ utility class ได้โดยไม่ต้องเปลี่ยนแพ็กเกจ:

```vue
<IconSearch class="h-5 w-5 text-blue-600" />
<IconCalendar size="1em" class="text-emerald-600" />
```

ปรับรูปแบบการจัดแนวผ่าน CSS ของแอปตามต้องการ เช่น `vertical-align: middle` หรือใช้ `inline-flex` ที่ปุ่ม

ไอคอนชุดนี้ส่วนใหญ่เป็น filled paths ที่มีรูปร่างแบบเส้น สีและขนาดปรับได้ แต่ `stroke-width` ไม่ใช่ตัวควบคุมความหนาของรูปทรงทั้งหมด

## Accessibility

ไอคอนที่ไม่มี `title` หรือ ARIA label จะเป็น decorative และมี `aria-hidden="true"` อัตโนมัติ สำหรับปุ่มที่มีข้อความอยู่แล้ว ปล่อยไอคอนเป็น decorative ได้:

```vue
<button type="button">
  <IconPlus :size="20" />
  เพิ่มรายการ
</button>
```

ปุ่มที่มีเฉพาะไอคอน ให้ตั้งชื่อที่ปุ่ม:

```vue
<button type="button" aria-label="ค้นหา" @click="onSearch">
  <IconSearch :size="20" />
</button>
```

ไอคอนที่สื่อความหมายด้วยตัวเองสามารถใช้ `title` หรือ `aria-label`:

```vue
<IconCheckCircleSolid title="ทำรายการสำเร็จ" color="#16a34a" />
```

ควรใช้ `<button>` สำหรับการกดแทนการทำให้ SVG เป็นปุ่มเอง เพื่อให้ใช้คีย์บอร์ดได้ตามปกติ

## SSR และ Nuxt

runtime ใช้ `useId()` ของ Vue เพื่อแยก ID สำหรับ title และ SVG definitions ต่อ component instance และรักษา ID ระหว่าง server render กับ hydration จึงกำหนด Vue 3.5 ขึ้นไป ดู [Vue useId](https://vuejs.org/api/composition-api-helpers.html#useid)

Nuxt ที่ใช้ Vue เวอร์ชันตาม peer range สามารถ import components แบบ explicit ใน `<script setup>` ได้เช่นเดียวกัน โดยไม่ต้องเพิ่ม plugin ลงทะเบียนไอคอนทั้งหมด ตัวแพ็กเกจทดสอบ Vue SSR และ browser hydration โดยตรง; ไม่ได้ทดสอบกับ Nuxt application แยกอีกชุด

หากมี Vue apps หลายตัวใน HTML document เดียวกัน ให้กำหนด `app.config.idPrefix` แยกกัน และใช้ค่าเดียวกันทั้ง server/client ของแต่ละ app ตามเอกสาร Vue

## สีต้นฉบับและ SVG ดิบ

ไอคอนทั้ง 371 รายการเป็น monochrome; Figma ใช้สีดำ/เกือบดำ/เทาหลายเฉด ไลบรารีแปลงเฉพาะสีของ glyph ที่มองเห็นเป็น `currentColor` ส่วน geometry, viewBox และ clipPath คงเดิม

หากต้องการสีตรงกับ Figma ให้ดู `sourceColors` ใน `dist/metadata.json` แล้วส่งเป็น `color` เช่น:

```vue
<IconAttach color="#4a4d51" />
```

SVG ต้นฉบับอยู่ใน `assets/original/` และสำเนาที่ใช้ชื่อ kebab-case อยู่ใน `dist/svg/` แพ็กเกจ export subpath `siri-icons-vue/svg/search.svg` ไว้สำหรับเครื่องมือที่รองรับ SVG assets โดยตรง SVG ดิบเก็บสีต้นฉบับและไม่ได้ปรับตาม prop ของ Vue

## ชื่อไอคอนและการตามกลับไป Figma

ตารางทั้งหมดอยู่ใน [docs/ICONS.md](docs/ICONS.md) และมี gallery แบบ offline ใน source ZIP ชื่อ `gallery.html` เปิดด้วย browser ได้โดยตรง

ชื่อ Vue component สร้างจากชื่อ component ใน Figma โดยตัด `ic_` แล้วเติม `Siri` และเปลี่ยนเป็น PascalCase เช่น:

| Figma | Import name | Subpath |
| --- | --- | --- |
| `ic_search` | `IconSearch` | `icons/search` |
| `ic_arrow_down` | `IconArrowDown` | `icons/arrow-down` |
| `ic_chevron_down_L` | `IconChevronDownL` | `icons/chevron-down-l` |
| `ic_3d` | `Icon3d` | `icons/3d` |

เก็บชื่อที่สะกดแบบต้นฉบับไว้เพื่อให้ mapping แน่นอน:

| Figma spelling | Vue export |
| --- | --- |
| `ic_gird_create` | `IconGirdCreate` |
| `ic_menu_hamberger` | `IconMenuHamberger` |
| `ic_metrix` | `IconMetrix` |
| `ic_add_wrok` | `IconAddWrok` |

ตัวอักษร L/M/S และ suffix `line`/`solid` เป็นรูปแบบไอคอนคนละตัวตาม Figma ไม่ได้ถูกยุบรวมเป็น prop

## พัฒนาและ build แพ็กเกจใหม่

ใช้ source ZIP ซึ่งมี scripts และ tests ครบ:

```bash
cd siri-icons-vue
npm ci
npm run check
npm run gallery
node scripts/build-docs.mjs
npm pack
```

`npm run check` จะ build, ทดสอบ package/SVG compiler และตรวจ TypeScript ส่วน `npm pack` จะเรียก check ผ่าน `prepack` และสร้าง tarball รุ่นตาม `package.json`

อย่าแก้ไฟล์ `dist/` โดยตรง: ใช้ `assets/original/`, `assets/manifest.json`, `src/runtime.js` และ build scripts เป็น source ของการแก้ไข ดู [ขั้นตอนเพิ่มและอัปเดต](docs/UPDATING.md)

## โครงสร้างไฟล์

| Path | หน้าที่ |
| --- | --- |
| `assets/original/*.svg` | SVG ต้นฉบับจาก Figma 371 ไฟล์ |
| `assets/manifest.json` | mapping Figma node → SVG file → Vue component |
| `src/runtime.js` | props, SVG rendering, accessibility และ instance IDs |
| `scripts/svg.mjs` | parse/validate SVG และจัดการ monochrome colors |
| `scripts/build.mjs` | generate ESM modules, type declarations และ metadata |
| `scripts/build-gallery.mjs` | generate gallery แบบ offline |
| `scripts/build-docs.mjs` | generate ตารางไอคอนจาก metadata |
| `dist/icons/*` | Vue component รายตัวพร้อม `.d.ts` |
| `dist/index.js` | named exports ของทุกไอคอน |
| `dist/svg/*` | SVG ต้นฉบับในชื่อ kebab-case |
| `dist/metadata.json` | dimensions, source colors, hashes และ node IDs |
| `test/` | package, SVG compiler และ TypeScript verification |
| `docs/` | icon list, maintenance และ validation |

## การแจกจ่าย

รุ่นนี้ตั้ง `private: true` และ `license: "UNLICENSED"` ใน package metadata สำหรับการใช้งานผ่านไฟล์ที่ส่งให้ สามารถติดตั้ง tarball ในหลายโปรเจกต์ได้

หากจะเผยแพร่ผ่าน registry ภายหลัง ให้เจ้าของแพ็กเกจกำหนดชื่อ scope, registry, access และเงื่อนไขการแจกจ่ายของ assets แล้วเปลี่ยน metadata ตามช่องทางนั้นก่อน publish

## แหล่งที่มา

- [Linen Figma Icons — frame 112:6764](https://www.figma.com/design/OHflJtmY9bt1jGdMFyRPpR/Linen?node-id=112-6764)
- [Vue useId](https://vuejs.org/api/composition-api-helpers.html#useid)
- [Vue defineComponent](https://vuejs.org/api/general.html#definecomponent)
- [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/)
