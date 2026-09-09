const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
const plansPath=process.argv[3];
if(!plansPath)throw Error('BALANCED_PLANS_PATH_REQUIRED');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');
const must=(v,m)=>{if(!v)throw Error(m)};
const plans=JSON.parse(fs.readFileSync(plansPath,'utf8'));

// A) Fix the browser/desktop leak: neither the static mobile dock nor the runtime dock may render as raw buttons below the footer.
let css=read('assets/css/ms-v101815-clean-mobile.css');
if(!css.includes('.mobile-nav.ms938-nav{display:none!important}')){
  css=css.replace('@media (max-width:980px){','.mobile-nav.ms938-nav{display:none!important}\n.ms101815-bottom-nav{display:none!important}\n@media (max-width:980px){\n  .ms101815-bottom-nav{display:grid!important}');
}else if(!css.includes('.ms101815-bottom-nav{display:none!important}')){
  css=css.replace('.mobile-nav.ms938-nav{display:none!important}','.mobile-nav.ms938-nav{display:none!important}\n.ms101815-bottom-nav{display:none!important}');
}
must(css.includes('.mobile-nav.ms938-nav{display:none!important}'),'STATIC_MOBILE_DOCK_HIDE_PATCH_FAILED');
must(css.includes('.ms101815-bottom-nav{display:none!important}'),'DESKTOP_DOCK_HIDE_PATCH_FAILED');
must(css.includes('.ms101815-bottom-nav{display:grid!important}'),'MOBILE_DOCK_SHOW_PATCH_FAILED');
write('assets/css/ms-v101815-clean-mobile.css',css);

let runtime=read('assets/js/ms-v101815-clean-mobile.js');
if(!runtime.includes("const MOBILE=window.matchMedia('(max-width:980px)');")){
  runtime=runtime.replace("if(!isApp&&!isWeights)return;","if(!isApp&&!isWeights)return;\nconst MOBILE=window.matchMedia('(max-width:980px)');");
}
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
if(!runtime.includes("MOBILE.addEventListener?.('change',repair)")){
  runtime=runtime.replace("function boot(){repair();","function boot(){repair();MOBILE.addEventListener?.('change',repair);");
}
must(runtime.includes('if(!MOBILE.matches){n?.remove();return}'),'DESKTOP_RUNTIME_DOCK_GUARD_MISSING');
must(runtime.includes("MOBILE.addEventListener?.('change',repair)"),'RESPONSIVE_DOCK_LISTENER_MISSING');
write('assets/js/ms-v101815-clean-mobile.js',runtime);

// B) Replace the training session plans at the data source, then synchronize program metadata.
let data=read('assets/js/data.js');
const a=data.indexOf('  const sessionPlans={');
const b=data.indexOf('  const smartSwaps=[',a+1);
must(a>=0&&b>a,'SESSION_PLANS_BLOCK_NOT_FOUND');
const block=`  const sessionPlans=${JSON.stringify(plans,null,2)};\n\n  // Keep public program metadata synchronized with the real member sessions.\n  for(const program of programs){\n    const sessions=sessionPlans[program.code];\n    if(!Array.isArray(sessions))continue;\n    program.days=sessions.length;\n    program.dayNames=sessions.map(s=>s.name);\n    program.exerciseIds=[...new Set(sessions.flatMap(s=>s.items.map(i=>Array.isArray(i)?i[0]:i?.exercise_id).filter(Boolean)))];\n  }\n\n`;
data=data.slice(0,a)+block+data.slice(b);
write('assets/js/data.js',data);

// C) Cache-bust only the surfaces that consume the member training data and current clean mobile owner.
for(const file of ['app.html','weights.html','programs.html']){
  const full=path.join(root,file);if(!fs.existsSync(full))continue;
  let h=fs.readFileSync(full,'utf8');
  h=h.replace(/assets\/js\/data\.js\?v=\d+/g,'assets/js/data.js?v=101816');
  h=h.replace(/ms-v101815-clean-mobile\.css\?v=\d+/g,'ms-v101815-clean-mobile.css?v=101816');
  h=h.replace(/ms-v101815-clean-mobile\.js\?v=\d+/g,'ms-v101815-clean-mobile.js?v=101816');
  h=h.replace(/assets\/js\/pwa\.js\?v=\d+/g,'assets/js/pwa.js?v=101816');
  h=h.replace(/manifest\.webmanifest\?v=\d+/g,'manifest.webmanifest?v=101816');
  fs.writeFileSync(full,h,'utf8');
}
let pwa=read('assets/js/pwa.js');
pwa=pwa.replace(/const VERSION='\d+';/,"const VERSION='101816';");
write('assets/js/pwa.js',pwa);
let sw=read('sw.js');
sw=sw.replace(/const VERSION='muscle-state-pwa-v\d+';/,"const VERSION='muscle-state-pwa-v101816';");
write('sw.js',sw);

console.log('V101816_BROWSER_BALANCE_PATCH_OK');
console.log('desktop_mobile_dock=HIDDEN');
console.log('mobile_dock=RESPONSIVE_ONLY');
console.log('training_plans=BALANCED_SOURCE_REPLACED');
console.log('program_metadata=SYNCED');