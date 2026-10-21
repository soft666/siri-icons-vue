#!/usr/bin/env node
/** Build the offline catalogue from the original exported SVGs. No dependencies. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'assets/manifest.json'), 'utf8'));
const assetRoot = path.join(root, 'assets/original');
let pkg = { name: 'siri-icons-vue', version: '0.1.0' };
try { pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')); } catch {}
if (!Array.isArray(manifest.icons) || !manifest.icons.length) throw new Error('No icons in assets/manifest.json');

const icons = await Promise.all(manifest.icons.map(async (icon) => {
  const filename = path.resolve(assetRoot, icon.file);
  if (!filename.startsWith(assetRoot + path.sep)) throw new Error('Icon path escapes assets/original: ' + icon.file);
  const svg = await readFile(filename, 'utf8');
  if (!/<svg\b/i.test(svg) || !/\bviewBox\s*=/i.test(svg)) throw new Error('Missing SVG/viewBox: ' + icon.file);
  if (/<script\b|<foreignObject\b|\son\w+\s*=|(?:href|src)\s*=\s*["']https?:/i.test(svg)) {
    throw new Error('The offline catalogue cannot embed active or external SVG content: ' + icon.file);
  }
  return { ...icon, svg };
}));

const payload = JSON.stringify({ source: manifest.source, package: { name: pkg.name, version: pkg.version }, icons })
  .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const html = String.raw`<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Siri Icons — Vue catalogue</title>
  <style>
    :root { --paper:#f6f5f1; --surface:#fff; --ink:#193042; --muted:#64747d; --line:#dfe4e2; --accent:#17665d; --tint:#eaf4ef; --icon-color:#193042; --icon-size:28px; }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font:15px/1.55 system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif; }
    button,input,select { font:inherit; }
    button { cursor:pointer; }
    button,input,select,a { -webkit-tap-highlight-color:transparent; }
    button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible { outline:3px solid #58a591; outline-offset:3px; }
    a { color:var(--accent); text-underline-offset:3px; }
    code,pre,kbd { font-family:ui-monospace,SFMono-Regular,Consolas,monospace; }
    button { color:inherit; }
    .masthead { border-bottom:1px solid var(--line); background:rgba(255,255,255,.72); }
    .mast-inner { max-width:1680px; margin:auto; min-height:76px; padding:16px 40px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .brand { display:flex; align-items:center; gap:12px; font-weight:720; letter-spacing:-.02em; }
    .brand-mark { display:grid; place-items:center; width:34px; height:34px; border:1px solid var(--ink); border-radius:9px; background:var(--ink); color:#fff; font:23px Georgia,serif; }
    .brand small { margin-left:10px; color:var(--muted); font-size:12px; font-weight:500; letter-spacing:.03em; }
    .tag { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border:1px solid var(--line); border-radius:99px; background:white; font-size:12px; color:var(--muted); white-space:nowrap; }
    .status-dot { width:6px; height:6px; border-radius:50%; background:#428874; }
    main { max-width:1680px; margin:auto; padding:34px 40px 48px; }
    .hero { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:26px; }
    .eyebrow { margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:.14em; color:var(--accent); text-transform:uppercase; }
    h1 { font-size:clamp(34px,3.1vw,48px); font-weight:650; line-height:1.15; letter-spacing:-.045em; margin:0 0 12px; }
    .hero p { margin:0; color:var(--muted); max-width:720px; }
    .hero-link { font-size:13px; white-space:nowrap; margin-bottom:3px; }
    .toolbar { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:21px; padding:14px; border:1px solid var(--line); border-radius:13px; background:var(--surface); }
    .search-box { position:relative; min-width:210px; flex:1; }
    .search-box input { width:100%; height:43px; border:1px solid var(--line); border-radius:8px; background:#f9faf8; padding:0 66px 0 14px; color:var(--ink); }
    .search-box input::placeholder { color:#71808a; }
    .search-key { position:absolute; right:13px; top:10px; display:block; min-width:24px; height:24px; border:1px solid var(--line); border-radius:4px; background:white; text-align:center; color:#89959a; font-size:12px; line-height:22px; }
    #clear-search { position:absolute; right:8px; top:6px; width:32px; height:31px; border:0; background:transparent; font-size:22px; }
    .control { display:flex; align-items:center; gap:9px; color:var(--muted); font-size:12px; }
    .control select { border:1px solid var(--line); border-radius:8px; background:#fff; height:43px; max-width:160px; padding:0 30px 0 12px; color:var(--ink); font-size:13px; }
    .control input[type=range] { width:91px; accent-color:var(--accent); }
    .control output { min-width:33px; color:var(--ink); font-variant-numeric:tabular-nums; }
    .color-input { display:flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    .color-input input { width:30px; height:31px; padding:0; border:0; background:transparent; cursor:pointer; }
    .original { display:flex; align-items:center; gap:6px; color:var(--muted); font-size:12px; white-space:nowrap; }
    .original input { accent-color:var(--accent); width:15px; height:15px; }
    .workspace { display:grid; grid-template-columns:minmax(0,1fr) 345px; align-items:start; gap:24px; }
    .results-heading { display:flex; align-items:center; justify-content:space-between; gap:15px; margin:0 1px 14px; min-height:24px; }
    .results-heading p { margin:0; color:var(--muted); font-size:12px; }
    .results-heading strong { color:var(--ink); font-size:14px; font-weight:650; }
    .hint { color:#829099; font-size:11px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(118px,1fr)); gap:10px; }
    .icon-card { min-width:0; min-height:116px; border:1px solid var(--line); border-radius:10px; padding:15px 8px 11px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; background:#fff; text-align:center; transition:border-color .12s,background .12s,box-shadow .12s; }
    .icon-card:hover { border-color:#8fb7aa; background:#fbfdfb; }
    .icon-card[aria-pressed=true] { border-color:var(--accent); background:var(--tint); box-shadow:0 0 0 1px var(--accent); }
    .icon-picture { display:flex; height:45px; width:100%; justify-content:center; align-items:center; color:var(--icon-color); }
    .icon-picture svg { width:var(--icon-size); height:var(--icon-size); max-width:100%; overflow:visible; flex:none; }
    .icon-label { width:100%; font-size:10px; line-height:1.45; overflow-wrap:anywhere; color:#586874; }
    .icon-card[aria-pressed=true] .icon-label { color:var(--accent); font-weight:650; }
    .empty { background:white; border:1px dashed #cbd4d0; border-radius:12px; padding:55px 25px; text-align:center; }
    .empty h2 { font-size:18px; margin:0 0 6px; }
    .empty p { color:var(--muted); margin:0; font-size:13px; }
    .inspector { position:sticky; top:24px; background:#fff; border:1px solid var(--line); border-radius:14px; overflow:hidden; }
    .inspector-top { padding:19px 21px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .inspector-top h2 { font-size:11px; text-transform:uppercase; letter-spacing:.09em; color:var(--muted); font-weight:650; margin:0; }
    .dimension { font:10px ui-monospace,monospace; color:var(--muted); }
    .preview-stage { margin:0 20px; min-height:150px; display:flex; align-items:center; justify-content:center; border:1px solid #e8ece7; border-radius:8px; color:var(--icon-color); background-color:#fafbf8; background-image:radial-gradient(#ced8d1 .7px,transparent .7px); background-size:13px 13px; }
    .preview-stage svg { width:80px; height:80px; }
    .detail-body { padding:18px 21px 20px; }
    #selected-name { margin:0; font-size:18px; line-height:1.35; letter-spacing:-.025em; overflow-wrap:anywhere; }
    .figma-name { margin:7px 0 12px; color:var(--muted); font-size:11px; overflow-wrap:anywhere; }
    .detail-tags { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px; }
    .small-tag { font-size:10px; line-height:1.5; padding:3px 7px; border-radius:5px; background:#f1f4f1; color:#5b7065; }
    .tabs { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:9px; }
    .tab-set { display:flex; gap:14px; }
    .tab { font-size:12px; padding:4px 0; border:0; border-bottom:2px solid transparent; background:transparent; color:var(--muted); }
    .tab[aria-pressed=true] { border-color:var(--accent); color:var(--accent); font-weight:650; }
    .copy { min-width:56px; background:white; border:1px solid var(--line); border-radius:5px; padding:4px 8px; font-size:10px; }
    pre { margin:0; border:1px solid #e2e8e2; border-radius:8px; padding:13px 12px; background:#f7f9f5; color:#21493d; font-size:10px; line-height:1.7; overflow:auto; max-height:290px; white-space:pre; tab-size:2; }
    .detail-note { font-size:11px; line-height:1.65; color:var(--muted); margin:13px 0 18px; }
    .detail-actions { display:flex; gap:8px; }
    .action { display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:7px; background:#fff; padding:8px 10px; font-size:11px; text-decoration:none; flex:1; }
    .action.primary { background:var(--ink); color:white; border-color:var(--ink); }
    .footer-note { border-top:1px solid var(--line); margin-top:30px; padding-top:16px; display:flex; justify-content:space-between; gap:14px; color:var(--muted); font-size:11px; }
    #copy-status { min-height:18px; margin:7px 0 0; color:var(--accent); font-size:10px; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    [hidden] { display:none!important; }
    @media(max-width:1150px) { main { padding:27px 25px 36px; } .mast-inner { padding:15px 25px; } .workspace { grid-template-columns:minmax(0,1fr) 300px; gap:18px; } .grid { grid-template-columns:repeat(auto-fill,minmax(105px,1fr)); gap:8px; } .inspector-top,.detail-body { padding-left:17px; padding-right:17px; } .preview-stage { margin:0 16px; } .toolbar { gap:10px; } .hint { display:none; } }
    @media(max-width:800px) { .workspace { grid-template-columns:minmax(0,1fr); } .inspector { position:static; order:-1; display:grid; grid-template-columns:150px 1fr; border-radius:11px; } .inspector-top { grid-column:1/-1; padding:13px 16px 10px; } .preview-stage { min-height:120px; height:130px; margin:2px 0 17px 16px; } .preview-stage svg { width:64px; height:64px; } .detail-body { padding:0 16px 15px; } .detail-tags { margin-bottom:12px; } .tabs,pre,.detail-note,#copy-status { display:none; } .detail-actions { margin-top:11px; } .detail-body.expanded .tabs,.detail-body.expanded pre,.detail-body.expanded .detail-note,.detail-body.expanded #copy-status { display:flex; } .detail-body.expanded pre { display:block; } .inspector.show-code { display:block; } .inspector.show-code .preview-stage { display:none; } .hero { align-items:start; } .hero-link { display:none; } .hero p { font-size:13px; } .mobile-code { display:inline-flex!important; } .brand small { display:none; } .grid { grid-template-columns:repeat(auto-fill,minmax(103px,1fr)); } }
    @media(max-width:480px) { main { padding:23px 16px 30px; } .mast-inner { padding:13px 16px; min-height:65px; } h1 { font-size:36px; } .hero { margin-bottom:22px; } .toolbar { padding:11px; gap:13px 10px; } .search-box { flex-basis:100%; } .control select { max-width:126px; height:35px; font-size:11px; padding-left:7px; } .control input[type=range] { width:61px; } .control { gap:5px; } .original { font-size:11px; } .inspector { grid-template-columns:118px 1fr; } .preview-stage { height:116px; min-height:116px; } #selected-name { font-size:15px; } .detail-tags { display:none; } .detail-actions { flex-wrap:wrap; } .action { font-size:10px; padding:7px 8px; } .icon-card { min-height:106px; } .grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; } .icon-label { font-size:9px; } .footer-note { flex-direction:column; gap:5px; } }
    @media(prefers-reduced-motion:reduce) { * { transition:none!important; scroll-behavior:auto!important; } }
  </style>
</head>
<body>
  <header class="masthead"><div class="mast-inner">
    <div class="brand"><span class="brand-mark" aria-hidden="true">S</span><span>Siri <small>DESIGN ASSETS</small></span></div>
    <span class="tag"><span class="status-dot" aria-hidden="true"></span>Vue 3 · Offline catalogue</span>
  </div></header>
  <main>
    <section class="hero" aria-labelledby="page-title"><div>
      <p class="eyebrow">Siri / Icon library</p>
      <h1 id="page-title">A little icon. A clear idea.</h1>
      <p>ค้นหาไอคอนจาก Figma เลือกดูชื่อ component แล้วคัดลอกไปใช้ใน Vue ได้เลย</p>
    </div><a id="source-link" class="hero-link" target="_blank" rel="noopener noreferrer">เปิดชุด Icons ใน Figma ↗</a></section>
    <section class="toolbar" aria-label="ค้นหาและปรับตัวอย่างไอคอน">
      <div class="search-box"><label class="sr-only" for="search">ค้นหาชื่อไอคอนหรือ component</label><input id="search" type="search" placeholder="ค้นหาไอคอน เช่น arrow, calendar, user…" autocomplete="off" spellcheck="false"><kbd class="search-key" aria-hidden="true">/</kbd><button id="clear-search" type="button" hidden aria-label="ล้างคำค้นหา">×</button></div>
      <label class="control"><span class="sr-only">หมวดไอคอน</span><select id="category"><option value="">ทุกหมวด</option></select></label>
      <label class="control" for="size"><span>ขนาด</span><input id="size" type="range" min="16" max="48" step="4" value="28"><output id="size-value" for="size">28px</output></label>
      <label class="control"><span>สี</span><span class="color-input"><input id="color" type="color" value="#193042" aria-label="สีตัวอย่างไอคอน"></span></label>
      <label class="original"><input id="original" type="checkbox">สีต้นฉบับ</label>
    </section>
    <div class="workspace">
      <section aria-labelledby="result-count"><div class="results-heading"><p><strong id="result-count" aria-live="polite"></strong><span id="result-detail"></span></p><span class="hint">เลือกไอคอนเพื่อดูวิธีใช้ · กด / เพื่อค้นหา</span></div><div class="grid" id="grid"></div><div id="empty" class="empty" hidden><h2>ไม่พบไอคอนที่ตรงกับคำค้นหา</h2><p>ลองใช้ชื่อสั้น ๆ เช่น doc, arrow, person หรือเปลี่ยนหมวด</p></div></section>
      <aside class="inspector" aria-labelledby="selected-name">
        <div class="inspector-top"><h2>Icon details</h2><span class="dimension" id="dimension"></span></div>
        <div class="preview-stage" id="preview" aria-hidden="true"></div>
        <div class="detail-body"><h2 id="selected-name"></h2><p class="figma-name" id="figma-name"></p><div class="detail-tags"><span class="small-tag" id="category-tag"></span><span class="small-tag" id="color-tag"></span><span class="small-tag">SVG vector</span></div>
          <div class="tabs"><div class="tab-set"><button type="button" class="tab" id="vue-tab" aria-pressed="true">Vue</button><button type="button" class="tab" id="svg-tab" aria-pressed="false">SVG ต้นฉบับ</button></div><button class="copy" id="copy" type="button">คัดลอก</button></div>
          <pre tabindex="0" aria-label="โค้ดตัวอย่าง"><code id="code"></code></pre><p id="copy-status" role="status" aria-live="polite"></p>
          <p class="detail-note" id="detail-note"></p>
          <div class="detail-actions"><button type="button" class="action mobile-code" id="mobile-code" style="display:none">ดูโค้ด</button><button type="button" class="action" id="download">ดาวน์โหลด SVG</button><a class="action primary" id="figma-link" target="_blank" rel="noopener noreferrer">ดูใน Figma ↗</a></div>
        </div>
      </aside>
    </div>
    <footer class="footer-note"><span id="footer-source"></span><span>ไฟล์นี้เปิดได้แบบออฟไลน์ · ไม่ต้องติดตั้งโปรแกรมเพิ่ม</span></footer>
  </main>
  <script id="icon-data" type="application/json">__SIRI_ICON_DATA__</script>
  <script>
  'use strict';
  const DATA=JSON.parse(document.getElementById('icon-data').textContent);
  const $=(id)=>document.getElementById(id);
  const parser=new DOMParser();
  const state={selected:0,tab:'vue',query:'',category:'',size:28,color:'#193042',original:false};
  const categories={navigation:'Navigation',documents:'Documents',people:'People',property:'Property',finance:'Finance',actions:'Actions',shapes:'Shapes',other:'Other'};
  function inferredCategory(name){
    if(/^(arrow|chevron|double-chevron|pull|push|menu|more|left-sidebar|shortcut|expand|login|logout|entrance|upanddown)/.test(name)) return 'Navigation';
    if(/^(doc|file|folder|clipboard|form|receipt|letter|mail|inbox|manual|news|create-blog|create-news|create-comment)/.test(name)) return 'Documents';
    if(/^(person|people|employee|human|customer|user|group|child|gender|marital|id-|smile|sad|poker)/.test(name)) return 'People';
    if(/^(house|building|project|unit|condo|townhome|construction|store|stock|warehouse|stair|rack|slot|section|row|column)/.test(name)) return 'Property';
    if(/(baht|coin|credit|wallet|deposit|withdraw|diamond|price|installment|compensation|bank)/.test(name)) return 'Finance';
    if(/^(circle|square|dot|star|asterisk|hash|twinkle|grid)/.test(name)) return 'Shapes';
    if(/^(add|create|write|edit|delete|check|clear|close|correct|save|search|print|upload|download|share|copy|filter|sorting|reload|reverse|scan|crop|translate|play|skip|spinner|drag|plus|minus|setting)/.test(name)) return 'Actions';
    return 'Other';
  }
  function colorKey(value){const v=value.toLowerCase().replace(/\s+/g,'');return /^(black|#000|#000000|rgb\(0,0,0\))$/.test(v)?'#000000':/^(white|#fff|#ffffff|rgb\(255,255,255\))$/.test(v)?'#ffffff':v;}
  function visiblePaint(el){return !el.closest('defs,mask,clipPath,linearGradient,radialGradient,pattern');}
  const originals=DATA.icons.map((icon,index)=>{
    const doc=parser.parseFromString(icon.svg,'image/svg+xml');
    if(doc.querySelector('parsererror')) throw new Error('Invalid SVG: '+icon.file);
    const svg=doc.documentElement;
    const paints=new Set();
    for(const el of [svg,...svg.querySelectorAll('*')]) if(visiblePaint(el)) for(const attr of ['fill','stroke']){
      const v=el.getAttribute(attr); if(v&&!/^(none|transparent|currentcolor)$/i.test(v)&&!v.startsWith('url('))paints.add(colorKey(v));
    }
    icon.category=icon.category||inferredCategory(icon.name);
    icon.monochrome=icon.colorMode==='monochrome'||(icon.colorMode!=='original'&&paints.size<=1);
    icon.originalWidth=svg.getAttribute('width')||svg.viewBox?.baseVal?.width||24;
    icon.originalHeight=svg.getAttribute('height')||svg.viewBox?.baseVal?.height||24;
    icon.search=[icon.name,icon.componentName,icon.figmaName,icon.category,...(icon.aliases||[])].join(' ').toLowerCase().replace(/[_-]/g,' ');
    return svg;
  });
  function svgFor(index,context){
    const svg=originals[index].cloneNode(true), icon=DATA.icons[index];
    const ids=new Map();
    for(const el of [svg,...svg.querySelectorAll('[id]')]) if(el.hasAttribute('id')){
      const old=el.id, id='siri-'+context+'-'+index+'-'+old.replace(/[^A-Za-z0-9_-]/g,'_');ids.set(old,id);el.id=id;
    }
    for(const el of [svg,...svg.querySelectorAll('*')]){
      for(const attr of [...el.attributes]){
        let value=attr.value.replace(/url\(\s*["']?#([^\s)'"']+)["']?\s*\)/g,(all,id)=>ids.has(id)?'url(#'+ids.get(id)+')':all);
        if((attr.localName==='href'||attr.name==='href')&&value[0]==='#'&&ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));
        if(attr.name==='aria-labelledby'||attr.name==='aria-describedby')value=value.split(/\s+/).map(id=>ids.get(id)||id).join(' ');
        if(value!==attr.value)el.setAttributeNS(attr.namespaceURI,attr.name,value);
      }
      if(icon.monochrome&&!state.original&&visiblePaint(el))for(const attr of ['fill','stroke']){
        const value=el.getAttribute(attr);if(value&&!/^(none|transparent|currentcolor)$/i.test(value)&&!value.startsWith('url('))el.setAttribute(attr,'currentColor');
      }
    }
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.removeAttribute('role');
    if(icon.monochrome&&!state.original&&!svg.hasAttribute('fill'))svg.setAttribute('fill','currentColor');
    return document.importNode(svg,true);
  }
  function sourceUrl(icon){return 'https://www.figma.com/design/'+DATA.source.fileKey+'/Linen?node-id='+icon.nodeId.replace(/:/g,'-')+'&m=dev';}
  function snippet(){
    const icon=DATA.icons[state.selected];
    if(state.tab==='svg')return icon.svg.trim();
    return '<script setup lang="ts">\nimport { '+icon.componentName+" } from '"+DATA.package.name+"'\n"+'<'+ '/script>\n\n<template>\n  <'+icon.componentName+'\n    :size="'+state.size+'"\n    color="'+state.color+'"\n  />\n</template>';
  }
  function updateCode(){
    $('code').textContent=snippet();$('vue-tab').setAttribute('aria-pressed',String(state.tab==='vue'));$('svg-tab').setAttribute('aria-pressed',String(state.tab==='svg'));$('copy-status').textContent='';
  }
  function selectIcon(index){
    state.selected=index;const icon=DATA.icons[index];
    for(const card of $('grid').children)card.setAttribute('aria-pressed',String(Number(card.dataset.index)===index));
    $('preview').replaceChildren(svgFor(index,'preview'));$('selected-name').textContent=icon.componentName;
    $('figma-name').textContent=icon.figmaName+' · '+icon.nodeId;
    $('dimension').textContent=icon.originalWidth+' × '+icon.originalHeight;
    $('category-tag').textContent=icon.category;$('color-tag').textContent=icon.monochrome?'currentColor':'Original colors';
    $('figma-link').href=sourceUrl(icon);
    $('detail-note').textContent=icon.monochrome?'เปลี่ยนสีด้วย color หรือ CSS color ได้ รูปทรงและ viewBox มาจาก SVG ต้นฉบับ ในปุ่มที่มีข้อความอยู่แล้ว ไอคอนจะเป็นภาพประกอบโดยอัตโนมัติ':'ไอคอนนี้คงสีหลายสีจากต้นฉบับไว้ ดู SVG ต้นฉบับได้จากแท็บด้านบน';
    if(state.original)$('detail-note').textContent+=' ขณะนี้ตัวอย่างแสดงสีต้นฉบับ ส่วนโค้ด Vue ใช้ค่า color ที่เลือก';
    updateCode();
  }
  let visible=[];
  function renderGrid(){
    const query=state.query.trim().toLowerCase().replace(/[_-]/g,' '), words=query.split(/\s+/).filter(Boolean);
    visible=DATA.icons.map((icon,index)=>({icon,index})).filter(({icon})=>(!state.category||icon.category===state.category)&&words.every(word=>icon.search.includes(word)||icon.search.replace(/ /g,'').includes(word)));
    const fragment=document.createDocumentFragment();
    for(const {icon,index} of visible){
      const card=document.createElement('button');card.type='button';card.className='icon-card';card.dataset.index=index;card.setAttribute('aria-label',icon.componentName+' — '+icon.figmaName);card.setAttribute('aria-pressed',String(index===state.selected));
      const picture=document.createElement('span');picture.className='icon-picture';picture.append(svgFor(index,'grid'));
      const label=document.createElement('span');label.className='icon-label';label.textContent=icon.name;
      card.append(picture,label);card.addEventListener('click',()=>selectIcon(index));fragment.append(card);
    }
    $('grid').replaceChildren(fragment);$('empty').hidden=visible.length!==0;
    $('result-count').textContent=visible.length+' icons';$('result-detail').textContent=visible.length===DATA.icons.length?' · ทั้งชุด':' / '+DATA.icons.length+' ทั้งหมด';
    if(visible.length&&!visible.some(({index})=>index===state.selected))selectIcon(visible[0].index);
    $('clear-search').hidden=!state.query;document.querySelector('.search-key').hidden=!!state.query;
  }
  function repaint(){renderGrid();selectIcon(state.selected);}
  const categoryNames=[...new Set(DATA.icons.map(i=>i.category))].sort();
  for(const category of categoryNames){const option=document.createElement('option');option.value=category;option.textContent=category;$('category').append(option);}
  $('source-link').href=DATA.source.url||sourceUrl({nodeId:DATA.source.nodeId});
  $('footer-source').textContent=DATA.package.name+' v'+DATA.package.version+' · '+DATA.icons.length+' SVGs from Linen / Icons';
  $('search').addEventListener('input',event=>{state.query=event.target.value;renderGrid();});
  $('clear-search').addEventListener('click',()=>{state.query='';$('search').value='';renderGrid();$('search').focus();});
  $('category').addEventListener('change',event=>{state.category=event.target.value;renderGrid();});
  $('size').addEventListener('input',event=>{state.size=Number(event.target.value);document.documentElement.style.setProperty('--icon-size',state.size+'px');$('size-value').textContent=state.size+'px';updateCode();});
  $('color').addEventListener('input',event=>{state.color=event.target.value;document.documentElement.style.setProperty('--icon-color',state.color);updateCode();});
  $('original').addEventListener('change',event=>{state.original=event.target.checked;repaint();});
  $('vue-tab').addEventListener('click',()=>{state.tab='vue';updateCode();});$('svg-tab').addEventListener('click',()=>{state.tab='svg';updateCode();});
  $('mobile-code').addEventListener('click',()=>{const open=document.querySelector('.detail-body').classList.toggle('expanded');document.querySelector('.inspector').classList.toggle('show-code',open);$('mobile-code').textContent=open?'ซ่อนโค้ด':'ดูโค้ด';});
  $('copy').addEventListener('click',async()=>{
    let success=false;const text=snippet();
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);success=true;}}catch{}
    if(!success){const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();try{success=document.execCommand('copy');}catch{}area.remove();$('copy').focus();}
    $('copy-status').textContent=success?'คัดลอกโค้ดแล้ว':'คัดลอกอัตโนมัติไม่ได้ เลือกโค้ดแล้วกด Ctrl/Cmd + C';
    if(!success){const range=document.createRange();range.selectNodeContents($('code'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
  });
  $('download').addEventListener('click',()=>{const icon=DATA.icons[state.selected],url=URL.createObjectURL(new Blob([icon.svg],{type:'image/svg+xml;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=icon.file;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('grid').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const cards=[...$('grid').children],position=cards.indexOf(document.activeElement);if(position<0)return;
    const columns=getComputedStyle($('grid')).gridTemplateColumns.split(' ').length;let next=position;
    if(event.key==='ArrowLeft')next--;if(event.key==='ArrowRight')next++;if(event.key==='ArrowUp')next-=columns;if(event.key==='ArrowDown')next+=columns;if(event.key==='Home')next=0;if(event.key==='End')next=cards.length-1;
    next=Math.max(0,Math.min(cards.length-1,next));event.preventDefault();cards[next].focus();selectIcon(Number(cards[next].dataset.index));
  });
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){event.preventDefault();$('search').focus();}});
  renderGrid();selectIcon(0);
  </script>
</body>
</html>
`.replace('__SIRI_ICON_DATA__', payload);

const destination = path.join(root, 'gallery.html');
await writeFile(destination, html);
console.log(JSON.stringify({ output: destination, icons: icons.length, bytes: Buffer.byteLength(html) }));
