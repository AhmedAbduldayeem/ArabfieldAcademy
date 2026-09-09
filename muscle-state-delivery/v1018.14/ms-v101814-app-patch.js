const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
let h=read('app.html');
const navRe=/<nav class=["']mobile-nav ms938-nav["'][\s\S]*?<\/nav>/;
if(!navRe.test(h))throw Error('MOBILE_NAV_NOT_FOUND');
const nav=`<nav class="mobile-nav ms938-nav" aria-label="التنقل الرئيسي">
<button class="active" data-app-nav="home" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg><span>الرئيسية</span></button>
<button data-app-nav="training" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7v10M17 7v10M4 9v6M20 9v6M7 12h10"/></svg><span>التمرين</span></button>
<button data-app-nav="nutrition" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M10 3v7M7 7h3M8.5 10v11M16 3c2 2 2.5 5.5 0 8v10M16 3v8"/></svg><span>التغذية</span></button>
</nav>`;
h=h.replace(navRe,nav);
const weight=`<a class="ms101814-weight-cta" href="./weights.html#weightsWorkspace"><span class="ms101814-weight-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8v8M19 8v8M8 6v12M16 6v12M8 12h8M3 10v4M21 10v4"/></svg></span><span class="ms101814-weight-copy"><small>داخل صفحة التمرين</small><strong>سجّل أوزانك الآن</strong><em>وصول مباشر لسجلك وآخر أرقامك</em></span><span class="ms101814-weight-arrow">←</span></a>`;
if(/<a class="ms10181(?:2|3)-weight-cta"[\s\S]*?<\/a>/.test(h))h=h.replace(/<a class="ms10181(?:2|3)-weight-cta"[\s\S]*?<\/a>/,weight);
else if(!h.includes('ms101814-weight-cta')){const a='<div class="training-day-tabs" id="trainingDays"></div>';if(!h.includes(a))throw Error('TRAINING_DAYS_ANCHOR_MISSING');h=h.replace(a,weight+a)}
h=h.replace(/<link rel="stylesheet" href="assets\/css\/ms-v101813-mobile-nav\.css\?v=\d+">\s*/g,'');
h=h.replace(/<link rel="stylesheet" href="assets\/css\/ms-v101814-quick-access-nav\.css\?v=\d+">\s*/g,'');
h=h.replace('</head>','<link rel="stylesheet" href="assets/css/ms-v101814-quick-access-nav.css?v=101814">\n</head>');
h=h.replace(/<script src="assets\/js\/ms-v101814-quick-access-nav\.js\?v=\d+" defer><\/script>\s*/g,'');
h=h.replace('</body>','<script src="assets/js/ms-v101814-quick-access-nav.js?v=101814" defer></script>\n</body>');
h=h.replace(/assets\/js\/pwa\.js\?v=\d+/,'assets/js/pwa.js?v=101814');
write('app.html',h);
let p=read('assets/js/pwa.js');
p=p.replace(/const VERSION='\d+';/,"const VERSION='101814';");
if(!p.includes("const VERSION='101814';"))throw Error('PWA_VERSION_PATCH_FAILED');
write('assets/js/pwa.js',p);
console.log('V101814_APP_PATCH_OK');
