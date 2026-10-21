# อัปเดต Siri Icons

Source ของแพ็กเกจคือ SVG ต้นฉบับและ manifest; output ใน `dist/` generate ใหม่ได้เสมอ

## แก้ไอคอนที่มีอยู่

1. เปิด component ไอคอนใน [Linen Figma](https://www.figma.com/design/OHflJtmY9bt1jGdMFyRPpR/Linen?node-id=112-6764) โดยเลือก component ขนาดไอคอน ไม่ใช่กรอบ Icon card หรือ label
2. Export เป็น SVG โดยรักษา viewBox ของ component
3. แทนที่ไฟล์ใน `assets/original/` ด้วยชื่อเดิม
4. หาก dimensions หรือ source node เปลี่ยน ให้แก้ entry เดิมใน `assets/manifest.json`
5. รัน build, tests และสร้าง catalogue ใหม่

```bash
npm ci
npm run check
npm run gallery
node scripts/build-docs.mjs
```

เปิด `gallery.html` ดูไอคอนที่แก้ ทั้งสีปกติและโหมดสีต้นฉบับ

## เพิ่มไอคอน

เพิ่มไฟล์ เช่น `assets/original/ic_new_feature.svg` แล้วเพิ่ม entry:

```json
{
  "name": "new-feature",
  "componentName": "IconNewFeature",
  "file": "ic_new_feature.svg",
  "nodeId": "ID จาก Figma",
  "figmaName": "ic_new_feature",
  "width": 24,
  "height": 24
}
```

ใช้ node ID จริงจาก Figma; ตัวอย่างด้านบนเป็น placeholder สำหรับอธิบายรูปแบบข้อมูล

- `name`: kebab-case, unique, ใช้เป็น subpath
- `componentName`: ขึ้นต้น `Icon` และ unique
- `file`: ไฟล์ SVG ภายใน `assets/original/`
- `nodeId`/`figmaName`: ตามต้นฉบับเพื่อใช้ตามกลับไป Figma
- `width`/`height`: ขนาดต้นฉบับ; ตัว compiler อ่าน viewBox จาก SVG
- `colorMode`: ปล่อยว่างเพื่อให้ตรวจอัตโนมัติ หรือใช้ `"original"` เมื่อต้องการเก็บสีของ asset ไว้

รันคำสั่งชุดเดิมเพื่อ generate exports และ declarations ใหม่ ระบบจะตรวจชื่อซ้ำ ไฟล์หาย SVG ที่ไม่รองรับ และข้อมูลที่ทำให้ build ไม่ถูกต้อง

## สีและ shapes

runtime ของรุ่นเริ่มต้นใช้ได้กับไอคอนทั้ง 371 ตัว โดยแปลงสี glyph แบบ monochrome เป็น `currentColor` และเก็บสีใน definitions ที่ใช้ clipping/masking ไว้

เมื่อเพิ่ม artwork หลายสี ให้เก็บเป็น `colorMode: "original"` และทดสอบภาพจริง ค่า `color` ไม่ได้เปลี่ยนทุกสีของ artwork หลายสีโดยอัตโนมัติ

หาก SVG ใช้ความสามารถที่ compiler ไม่รองรับ build จะรายงานชื่อไฟล์และสาเหตุ ให้ปรับรูปแบบการ export หรือเพิ่มการรองรับพร้อมทดสอบกับ SVG นั้น โดยไม่ลบ geometry ที่จำเป็นเพื่อให้ build ผ่าน

## Version ใหม่

หลังแก้ไขและตรวจผลแล้ว:

```bash
npm version patch --no-git-tag-version
npm pack
```

tarball ใหม่ติดตั้งใน app ได้ด้วย:

```bash
npm install ./vendor/siri-icons-vue-0.1.1.tgz
```

ใช้ชื่อและ version ที่สร้างจริง การเปลี่ยนชื่อ export หรือลบ icon ที่มีผู้ใช้แล้วควรมีแผนรองรับการเปลี่ยนแปลง; การเก็บชื่อเดิมหรือเพิ่ม alias ช่วยลดผลกระทบได้

## ขอบเขต source snapshot

ชุดเริ่มต้น export COMPONENT 371 รายการใน frame Icons ที่ระบุ และตรวจว่าหน้า Icons ไม่มี component อื่นอยู่นอก frame นั้นแล้ว

INSTANCE 5 รายการที่อยู่ในกรอบ `Icon Name` เป็นส่วนประกอบของ label จึงไม่ถูกนับเป็นไอคอนเพิ่ม ส่วนหน้า Logo, Financial Logo, Pictograms และ Illustration เป็นคนละหมวดกับ frame Icons ที่นำมาทำแพ็กเกจนี้

## เพิ่ม Illustration จาก Object Graphic

ภาพประกอบ 52 ภาพแยก manifest ที่ `assets/illustrations/manifest.json` และ SVG ต้นฉบับ `assets/illustrations/original/` ใช้ `Illustration*` naming โดยรักษา `colorMode: "original"`. เวลาเพิ่มภาพใหม่ให้แก้ manifest และ SVG แล้วรัน `npm run check`, `node scripts/build-docs.mjs`. รูปหลายสีไม่ได้ใช้ `color` แบบ Icon; ค่าเริ่มต้นของ size คือ 120.

## เพิ่ม / แก้ไข Doodle Image

Doodles เป็น PNG 288×288 จาก [Figma Doodle Image](https://www.figma.com/design/OHflJtmY9bt1jGdMFyRPpR/Linen?node-id=6013-7). เพิ่ม/อัปเดต `assets/doodles/original/doodle-*.png` และ `assets/doodles/manifest.json`, ตั้งชื่อ export `Doodle*`, แล้วรัน `npm run check` และ `node scripts/build-docs.mjs`. ห้ามเปลี่ยน PNG เป็น monochrome/icon SVG โดยอัตโนมัติ.
