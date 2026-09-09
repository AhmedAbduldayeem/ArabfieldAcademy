const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
function must(v,m){if(!v)throw Error(m)}

// 1) Remove the legacy v952 owner that replaces the last mobile dock item with Packages.
let phase=read('assets/js/ms-phase-v952.js');
const phaseA=phase.indexOf('/* Mobile packages:');
const phaseB=phase.indexOf('/* Admin:',phaseA+1);
must(phaseA>=0&&phaseB>phaseA,'PHASE_MOBILE_PACKAGES_SECTION_NOT_FOUND');
phase=phase.slice(0,phaseA)+'/* Mobile workspace navigation is owned by v1018.15. */\n'+phase.slice(phaseB);
must(!phase.includes('ms952-pricing-nav'),'PHASE_PRICING_NAV_STILL_PRESENT');
must(!phase.includes('last.replaceWith(a)'),'PHASE_LAST_CHILD_REPLACE_STILL_PRESENT');
write('assets/js/ms-phase-v952.js',phase);

// 2) Keep v943 member notifications/account extras, but retire its competing legacy quick-access trigger.
let member=read('assets/js/ms-member-v943.js');
member=member.replace(/const old=inner\.querySelector\(':scope > div:last-child'\);\s*if\(old&&old!==h\)old\.classList\.add\('ms943-legacy-account'\);/,"const old=inner.querySelector(':scope > div:last-child');if(old)old.classList.remove('ms943-legacy-account');");
const memberA=member.indexOf('function ensureActions(){');
const memberB=member.indexOf('function ensureAccountExtras(){',memberA+1);
must(memberA>=0&&memberB>memberA,'MEMBER_ENSURE_ACTIONS_SECTION_NOT_FOUND');
const bellOnly=`function ensureActions(){
  if(!token())return;
  const h=host();if(!h)return;
  $('#ms931Bell')?.remove();$('#ms931Quick')?.remove();$('#ms943Quick')?.remove();
  let bell=$('#ms943Bell');
  if(!bell){bell=document.createElement('button');bell.id='ms943Bell';bell.className='ms943-bell';bell.type='button';bell.setAttribute('aria-label','الإشعارات');bell.innerHTML=BELL+'<span class="ms943-badge" hidden>0</span>';bell.onclick=openSheet}
  if(bell.parentElement!==h)h.append(bell);
  refreshBadge();
}
`;
member=member.slice(0,memberA)+bellOnly+member.slice(memberB);
must(!member.includes('ms943-account-trigger'),'MEMBER_LEGACY_QUICK_TRIGGER_STILL_PRESENT');
must(!member.includes("classList.add('ms943-legacy-account')"),'MEMBER_LEGACY_ACCOUNT_HIDE_STILL_PRESENT');
write('assets/js/ms-member-v943.js',member);

const navApp=`<nav class="mobile-nav ms938-nav" aria-label="التنقل الرئيسي">
<button class="active" data-app-nav="home" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg><span>الرئيسية</span></button>
<button data-app-nav="training" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7v10M17 7v10M4 9v6M20 9v6M7 12h10"/></svg><span>التمرين</span></button>
<button data-app-nav="nutrition" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M10 3v7M7 7h3M8.5 10v11M16 3c2 2 2.5 5.5 0 8v10M16 3v8"/></svg><span>التغذية</span></button>
</nav>`;
const navWeights=`<nav class="mobile-nav ms938-nav" aria-label="التنقل الرئيسي">
<a href="./app.html?open=home#home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg><span>الرئيسية</span></a>
<a class="active" href="./app.html?open=training#training"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7v10M17 7v10M4 9v6M20 9v6M7 12h10"/></svg><span>التمرين</span></a>
<a href="./app.html?open=nutrition#nutrition"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M10 3v7M7 7h3M8.5 10v11M16 3c2 2 2.5 5.5 0 8v10M16 3v8"/></svg><span>التغذية</span></a>
</nav>`;
const weight=`<a class="ms101815-weight-cta" href="./weights.html#weightsWorkspace"><span class="ms101815-weight-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8v8M19 8v8M8 6v12M16 6v12M8 12h8M3 10v4M21 10v4"/></svg></span><span class="ms101815-weight-copy"><small>تسجيل سريع من داخل التمرين</small><strong>سجّل أوزانك الآن</strong><em>افتح سجلك وآخر أرقامك بضغطة واحدة</em></span><span class="ms101815-weight-arrow">←</span></a>`;
function commonPage(s){
  s=s.replace(/<link rel="stylesheet" href="assets\/css\/ms-v10181(?:3-mobile-nav|4-quick-access-nav|5-clean-mobile)\.css\?v=\d+">\s*/g,'');
  s=s.replace('</head>','<link rel="stylesheet" href="assets/css/ms-v101815-clean-mobile.css?v=101815">\n</head>');
  s=s.replace(/<script src="assets\/js\/ms-v10181(?:4-quick-access-nav|5-clean-mobile)\.js\?v=\d+" defer><\/script>\s*/g,'');
  s=s.replace('</body>','<script src="assets/js/ms-v101815-clean-mobile.js?v=101815" defer></script>\n</body>');
  s=s.replace(/assets\/js\/ms-member-v943\.js\?v=\d+/g,'assets/js/ms-member-v943.js?v=101815');
  s=s.replace(/assets\/js\/ms-phase-v952\.js\?v=\d+/g,'assets/js/ms-phase-v952.js?v=101815');
  s=s.replace(/assets\/js\/pwa\.js\?v=\d+/g,'assets/js/pwa.js?v=101815');
  s=s.replace(/manifest\.webmanifest\?v=\d+/g,'manifest.webmanifest?v=101815');
  return s;
}
let app=commonPage(read('app.html'));
const navRe=/<nav class=["']mobile-nav ms938-nav["'][\s\S]*?<\/nav>/;
must(navRe.test(app),'APP_MOBILE_NAV_NOT_FOUND');
app=app.replace(navRe,navApp);
if(/<a class="ms10181(?:2|3|4|5)-weight-cta"[\s\S]*?<\/a>/.test(app))app=app.replace(/<a class="ms10181(?:2|3|4|5)-weight-cta"[\s\S]*?<\/a>/,weight);
else if(!app.includes('ms101815-weight-cta')){const anchor='<div class="training-day-tabs" id="trainingDays"></div>';must(app.includes(anchor),'APP_TRAINING_DAYS_ANCHOR_MISSING');app=app.replace(anchor,weight+anchor)}
app=app.replace(/assets\/js\/ms-food-photo-v1018-1\.js\?v=\d+/,'assets/js/ms-food-photo-v1018-1.js?v=101815');
app=app.replace(/assets\/js\/ms-food-photo-result-v10182\.js\?v=\d+/,'assets/js/ms-food-photo-result-v10182.js?v=101815');
write('app.html',app);

let weights=commonPage(read('weights.html'));
must(navRe.test(weights),'WEIGHTS_MOBILE_NAV_NOT_FOUND');
weights=weights.replace(navRe,navWeights);
write('weights.html',weights);

// 3) Make PWA updates explicit and force a one-time reload when a new worker takes control.
let pwa=read('assets/js/pwa.js');
pwa=pwa.replace(/const VERSION='\d+';/,"const VERSION='101815';");
pwa=pwa.replace("await navigator.serviceWorker.register('/sw.js?v='+VERSION,{scope:'/'});","const reg=await navigator.serviceWorker.register('/sw.js?v='+VERSION,{scope:'/',updateViaCache:'none'});try{await reg.update()}catch{}");
if(!pwa.includes('ms_pwa_controller_101815')){
  const anchor="window.addEventListener('beforeinstallprompt'";
  must(pwa.includes(anchor),'PWA_LISTENER_ANCHOR_MISSING');
  const code=`if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('controllerchange',()=>{try{const k='ms_pwa_controller_101815';if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1')}catch{}location.reload()})}\n`;
  pwa=pwa.replace(anchor,code+anchor);
}
must(pwa.includes("const VERSION='101815';"),'PWA_VERSION_101815_FAILED');
must(pwa.includes("updateViaCache:'none'"),'PWA_UPDATE_CACHE_CONTROL_FAILED');
write('assets/js/pwa.js',pwa);

let sw=read('sw.js');
sw=sw.replace(/const VERSION='muscle-state-pwa-v\d+';/,"const VERSION='muscle-state-pwa-v101815';");
must(sw.includes("const VERSION='muscle-state-pwa-v101815';"),'SW_VERSION_101815_FAILED');
write('sw.js',sw);

console.log('V101815_CLEANUP_PATCH_OK');
console.log('legacy_mobile_pricing_owner=REMOVED');
console.log('legacy_quick_access_owner=REMOVED');
console.log('workspace_mobile_owner=V101815_ONLY');
