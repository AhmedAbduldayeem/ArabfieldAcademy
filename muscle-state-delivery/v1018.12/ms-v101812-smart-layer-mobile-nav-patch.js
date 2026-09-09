const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function write(p,s){fs.writeFileSync(path.join(root,p),s,'utf8')}

let h=read('app.html');
const navRe=/<nav class=["']mobile-nav ms938-nav["'][\s\S]*?<\/nav>/;
if(!navRe.test(h))throw Error('MOBILE_NAV_NOT_FOUND');
const nav=`<nav class="mobile-nav ms938-nav" aria-label="التنقل الرئيسي">
<button class="active" data-app-nav="home" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg><span>الرئيسية</span></button>
<button data-app-nav="training" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7v10M17 7v10M4 9v6M20 9v6M7 12h10"/></svg><span>التمرين</span></button>
<button data-app-nav="nutrition" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M10 3v7M7 7h3M8.5 10v11M16 3c2 2 2.5 5.5 0 8v10M16 3v8"/></svg><span>التغذية</span></button>
</nav>`;
h=h.replace(navRe,nav);
if(!h.includes('ms101812-weight-cta')){
  const anchor='<div class="training-day-tabs" id="trainingDays"></div>';
  if(!h.includes(anchor))throw Error('TRAINING_DAYS_ANCHOR_MISSING');
  const cta=`<a class="ms101812-weight-cta" href="./weights.html#weightsWorkspace"><span><strong>تسجيل الأوزان</strong><small>افتح سجل أوزانك وسجّل أرقامك الحالية من داخل التمرين.</small></span><b>↗</b></a>`;
  h=h.replace(anchor,cta+anchor);
}
if(!h.includes('assets/css/ms-v101812-mobile-nav.css'))h=h.replace('</head>','<link rel="stylesheet" href="assets/css/ms-v101812-mobile-nav.css?v=101812">\n</head>');
h=h.replace(/assets\/js\/ms-food-photo-v1018-1\.js\?v=\d+/,'assets/js/ms-food-photo-v1018-1.js?v=101812');
h=h.replace(/assets\/js\/ms-food-photo-result-v10182\.js\?v=\d+/,'assets/js/ms-food-photo-result-v10182.js?v=101812');
h=h.replace(/assets\/js\/pwa\.js\?v=\d+/,'assets/js/pwa.js?v=101812');
write('app.html',h);

let f=read('assets/js/ms-food-photo-v1018-1.js');
f=f.replace('const max=1280','const max=1024');
f=f.replace("cv.toBlob(r,'image/webp',.78)","cv.toBlob(r,'image/webp',.72)");
f=f.replace("cv.toBlob(r,'image/jpeg',.78)","cv.toBlob(r,'image/jpeg',.72)");
f=f.replace('blob?.size>2500000','blob?.size>1200000');
f=f.replace("cv.toBlob(r,'image/jpeg',.58)","cv.toBlob(r,'image/jpeg',.52)");
if(!f.includes('const max=1024'))throw Error('FOOD_IMAGE_MAX_1024_MISSING');
if(!f.includes('blob?.size>1200000'))throw Error('FOOD_IMAGE_1_2MB_GUARD_MISSING');
if(/Gemini|OpenAI|Billing/.test(f))throw Error('EXTERNAL_PROVIDER_COPY_REMAINS_FOOD');
write('assets/js/ms-food-photo-v1018-1.js',f);

let p=read('assets/js/pwa.js');
p=p.replace(/const VERSION='\d+';/,"const VERSION='101812';");
write('assets/js/pwa.js',p);

console.log('V101812_SMART_LAYER_MOBILE_NAV_PATCH_OK');
