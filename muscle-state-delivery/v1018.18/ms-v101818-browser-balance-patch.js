const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
const plansPath=process.argv[3];
if(!plansPath)throw Error('BALANCED_PLANS_PATH_REQUIRED');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
const must=(v,m)=>{if(!v)throw Error(m)};
const plans=JSON.parse(fs.readFileSync(plansPath,'utf8'));
const setDay=(code,name,items)=>{const d=plans[code]?.find(x=>x.name===name);must(d,'DAY_NOT_FOUND '+code+' '+name);d.items=items};

// Correct paired-muscle imbalance discovered by live QA.
setDay('recomp4','Upper',[
 ['bench','3 × 6–10'],['inclinedb','3 × 8–12'],['cablefly','2 × 12–15'],
 ['latpull','3 × 8–12'],['seatedrow','3 × 8–12'],['pullover','2 × 10–15'],['lateral','2 × 12–18']
]);
setDay('recomp4','Upper + Cardio',[
 ['inclinedb','3 × 8–12'],['chestpress','3 × 8–12'],['pushup','2 × 10–20'],
 ['barrow','3 × 8–12'],['latpull','3 × 8–12'],['seatedrow','2 × 8–12'],['treadmill','20–30 دقيقة معتدل']
]);
setDay('fatloss4','Upper',[
 ['bench','3 × 6–10'],['inclinedb','3 × 8–12'],['cablefly','2 × 12–15'],
 ['latpull','3 × 8–12'],['seatedrow','3 × 8–12'],['pullover','2 × 10–15'],['lateral','2 × 12–18']
]);

// Browser/desktop cleanup plus a real desktop quick-access style owner.
let css=read('assets/css/ms-v101815-clean-mobile.css');
const marker='/* V101818_BROWSER_DOCK_FINAL_OVERRIDE */';
if(!css.includes(marker))css+=`\n${marker}\n.ms101815-bottom-nav,.mobile-nav.ms938-nav{display:none!important}\n#ms101815QuickAccessBtn{min-height:64px!important;min-width:196px!important;padding:10px 15px!important;border:2px solid #6da77a!important;border-radius:19px!important;background:#c9ff3d!important;color:#214b31!important;box-shadow:0 14px 30px rgba(109,167,122,.30)!important;display:flex!important;align-items:center!important;gap:10px!important;text-align:right!important;transform:none!important}\n#ms101815QuickAccessBtn:hover,#ms101815QuickAccessBtn:focus-visible,#ms101815QuickAccessBtn:active{background:#c9ff3d!important;color:#214b31!important;border-color:#6da77a!important}\n#ms101815QuickAccessBtn .v850-avatar{background:#6da77a!important;color:#fff!important;flex:0 0 auto}\n.ms101815-quick-copy{display:grid!important;gap:2px!important;line-height:1.15!important;flex:1!important}\n.ms101815-quick-copy>b{font-size:1rem!important;color:#214b31!important}\n.ms101815-quick-copy>small{font-size:.74rem!important;color:#214b31!important;opacity:.82!important;white-space:nowrap!important}\n.ms101815-quick-chevron{font-size:1.2rem!important;font-weight:900!important;color:#214b31!important}\n@media (max-width:980px){\n  .ms101815-bottom-nav{display:grid!important}\n  .mobile-nav.ms938-nav{display:none!important}\n  #ms101815QuickAccessBtn{min-height:62px!important;min-width:184px!important;padding:9px 13px!important}\n}\n`;
must(css.includes(marker),'DESKTOP_DOCK_OVERRIDE_MARKER_MISSING');
must(css.includes('.ms101815-bottom-nav,.mobile-nav.ms938-nav{display:none!important}'),'DESKTOP_DOCK_HIDE_OVERRIDE_MISSING');
must(/@media\s*\(\s*max-width\s*:\s*980px\s*\)\s*\{[\s\S]*?\.ms101815-bottom-nav\s*\{\s*display\s*:\s*grid!important\s*\}/m.test(css),'MOBILE_DOCK_SHOW_OVERRIDE_MISSING');
must(css.includes('#ms101815QuickAccessBtn{min-height:64px!important;min-width:196px!important'),'DESKTOP_QUICK_ACCESS_STYLE_MISSING');
must(css.includes('background:#c9ff3d!important'),'QUICK_ACCESS_LIME_MISSING');
must(css.includes('.ms101815-quick-copy{display:grid!important'),'DESKTOP_QUICK_COPY_STYLE_MISSING');
write('assets/css/ms-v101815-clean-mobile.css',css);

let runtime=read('assets/js/ms-v101815-clean-mobile.js');
if(!runtime.includes("const MOBILE=window.matchMedia('(max-width:980px)');"))runtime=runtime.replace("if(!isApp&&!isWeights)return;","if(!isApp&&!isWeights)return;\nconst MOBILE=window.matchMedia('(max-width:980px)');");
const mountStart=runtime.indexOf('function mountNav(){');
const mountEnd=runtime.indexOf('function syncNav(){',mountStart+1);
must(mountStart>=0&&mountEnd>mountStart,'MOUNT_NAV_SECTION_NOT_FOUND');
const mount=`function mountNav(){
  document.documentElement.classList.add('ms101815-clean');
  $$('.mobile-nav.ms938-nav,.ms-universal-mobile').forEach(n=>n.remove());
  let n=$('.ms101815-bottom-nav');
  if(!MOBILE.matches){n?.remove();return}
  if(!n){
    n=document.createElement('nav');
    n.className='ms101815-bottom-nav';
    n.setAttribute('aria-label','التنقل الرئيسي');
    n.innerHTML=NAV;
    document.body.append(n);
    n.addEventListener('click',e=>{const b=e.target.closest('[data-ms101815-route]');if(!b)return;e.preventDefault();route(b.dataset.ms101815Route)});
  }
  syncNav();
}
`;
runtime=runtime.slice(0,mountStart)+mount+runtime.slice(mountEnd);
if(!runtime.includes("MOBILE.addEventListener?.('change',repair)"))runtime=runtime.replace('function boot(){repair();',"function boot(){repair();MOBILE.addEventListener?.('change',repair);");
must(runtime.includes('if(!MOBILE.matches){n?.remove();return}'),'DESKTOP_RUNTIME_DOCK_GUARD_MISSING');
must(runtime.includes("MOBILE.addEventListener?.('change',repair)"),'RESPONSIVE_DOCK_LISTENER_MISSING');
must(runtime.includes("b.id='ms101815QuickAccessBtn'"),'QUICK_ACCESS_RUNTIME_OWNER_MISSING');
must(runtime.includes("background:'#c9ff3d'"),'QUICK_ACCESS_INLINE_LIME_MISSING');
write('assets/js/ms-v101815-clean-mobile.js',runtime);

// Replace training sessions and synchronize program metadata.
let data=read('assets/js/data.js');
const a=data.indexOf('  const sessionPlans={');
const b=data.indexOf('  const smartSwaps=[',a+1);
must(a>=0&&b>a,'SESSION_PLANS_BLOCK_NOT_FOUND');
const block=`  const sessionPlans=${JSON.stringify(plans,null,2)};\n\n  for(const program of programs){\n    const sessions=sessionPlans[program.code];\n    if(!Array.isArray(sessions))continue;\n    program.days=sessions.length;\n    program.dayNames=sessions.map(s=>s.name);\n    program.exerciseIds=[...new Set(sessions.flatMap(s=>s.items.map(i=>Array.isArray(i)?i[0]:i?.exercise_id).filter(Boolean)))];\n  }\n\n`;
data=data.slice(0,a)+block+data.slice(b);
write('assets/js/data.js',data);

for(const file of ['app.html','weights.html','programs.html']){
 const full=path.join(root,file);if(!fs.existsSync(full))continue;
 let h=fs.readFileSync(full,'utf8');
 h=h.replace(/assets\/js\/data\.js\?v=\d+/g,'assets/js/data.js?v=101818');
 h=h.replace(/ms-v101815-clean-mobile\.css\?v=\d+/g,'ms-v101815-clean-mobile.css?v=101818');
 h=h.replace(/ms-v101815-clean-mobile\.js\?v=\d+/g,'ms-v101815-clean-mobile.js?v=101818');
 h=h.replace(/assets\/js\/pwa\.js\?v=\d+/g,'assets/js/pwa.js?v=101818');
 h=h.replace(/manifest\.webmanifest\?v=\d+/g,'manifest.webmanifest?v=101818');
 fs.writeFileSync(full,h,'utf8');
}
let pwa=read('assets/js/pwa.js');pwa=pwa.replace(/const VERSION='\d+';/,"const VERSION='101818';");write('assets/js/pwa.js',pwa);
let sw=read('sw.js');sw=sw.replace(/const VERSION='muscle-state-pwa-v\d+';/,"const VERSION='muscle-state-pwa-v101818';");write('sw.js',sw);

console.log('V101818_BROWSER_BALANCE_PATCH_OK');
console.log('corrected_days=recomp4_upper,recomp4_upper_cardio,fatloss4_upper');
console.log('desktop_mobile_dock=FINAL_OVERRIDE_HIDDEN');
console.log('mobile_dock=RESPONSIVE_ONLY');
console.log('browser_quick_access=FLUORESCENT_LIME_FIXED');
console.log('training_plans=BALANCED_SOURCE_REPLACED');
console.log('program_metadata=SYNCED');