const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
const R=f=>fs.readFileSync(path.join(root,f),'utf8');
const W=(f,s)=>fs.writeFileSync(path.join(root,f),s,'utf8');
function injectBeforeEnd(s,code,label){if(s.includes(label))return s;const i=s.lastIndexOf('})();');if(i<0)throw Error('END_NOT_FOUND_'+label);return s.slice(0,i)+code+'\n'+s.slice(i)}

let tp=R('ms-training-personalization.js');
if(!tp.includes('MS_V1017_2_LEGACY_ALT_UI_DISABLED')){
  const a=tp.indexOf('function addTo(el,base,day){');
  const b=tp.indexOf('\nfunction decorate(){',a);
  if(a<0||b<0)throw Error('LEGACY_ADD_TO_ANCHOR_MISSING');
  tp=tp.slice(0,a)+"function addTo(){return}"+tp.slice(b);
  const c=tp.indexOf('function decorate(){',a);
  const d=tp.indexOf("\ndocument.addEventListener('click'",c);
  if(c<0||d<0)throw Error('LEGACY_DECORATE_ANCHOR_MISSING');
  tp=tp.slice(0,c)+"function decorate(){$$('.ms-alt-inline,[data-ms-alt]').forEach(el=>el.remove())}"+tp.slice(d);
  tp=injectBeforeEnd(tp,"\n/* MS_V1017_2_LEGACY_ALT_UI_DISABLED */\n",'MS_V1017_2_LEGACY_ALT_UI_DISABLED');
}
W('ms-training-personalization.js',tp);

let app=R('assets/js/app.js');
app=injectBeforeEnd(app,`\n/* MS_V1017_2_UI_GUARD */\nfunction ms10172Guard(){document.querySelectorAll('.ms-alt-inline,[data-ms-alt]').forEach(el=>el.remove());const home=document.querySelector('[data-section="home"]'),hub=document.querySelector('#msPerformanceHub');if(home&&hub&&hub.parentElement!==home){const a=home.querySelector('#homeInsight');a?home.insertBefore(hub,a):home.append(hub)}document.querySelectorAll('.app-section:not([data-section="home"])').forEach(sec=>sec.querySelectorAll('#msPerformanceHub,[class*="ms-performance"],[class*="ms-recovery"]').forEach(el=>{if(el.id==='msPerformanceHub'||/Performance\\s*&\\s*Recovery|Muscle\\s*Recovery/i.test(el.textContent||''))el.remove()}))}\nnew MutationObserver(ms10172Guard).observe(document.body,{childList:true,subtree:true});setTimeout(ms10172Guard,0);setTimeout(ms10172Guard,500);\n`,'MS_V1017_2_UI_GUARD');
W('assets/js/app.js',app);
let weights=R('assets/js/weights.js');
weights=injectBeforeEnd(weights,`\n/* MS_V1017_2_UI_GUARD */\nfunction ms10172WeightGuard(){document.querySelectorAll('#exerciseList .ms-alt-inline,#exerciseList [data-ms-alt]').forEach(el=>el.remove())}\nconst ms10172Box=document.querySelector('#exerciseList');if(ms10172Box)new MutationObserver(ms10172WeightGuard).observe(ms10172Box,{childList:true,subtree:true});setTimeout(ms10172WeightGuard,0);\n`,'MS_V1017_2_UI_GUARD');
W('assets/js/weights.js',weights);

let perf=R('ms-performance-hub.js');
const old=`function render(){css();const home=$('[data-section="home"]'),progress=$('[data-section="progress"]');if(!home&&!progress)return;let sec=$('#msPerformanceHub');if(!sec){sec=document.createElement('section');sec.id='msPerformanceHub';sec.className='ms-performance';(home?.querySelector('.home-insight')||progress?.querySelector('.progress-cards')||home)?.before(sec)}const sc=score(),h=health[0]||{},mus=muscleRecovery();`;
const neu=`function render(){css();const home=$('[data-section="home"]');if(!home){$('#msPerformanceHub')?.remove();return}let sec=$('#msPerformanceHub');if(!sec){sec=document.createElement('section');sec.id='msPerformanceHub';sec.className='ms-performance'}const anchor=$('#homeInsight',home);if(sec.parentElement!==home){anchor?home.insertBefore(sec,anchor):home.append(sec)}const sc=score(),h=health[0]||{},mus=muscleRecovery();`;
if(perf.includes(old))perf=perf.replace(old,neu);
else if(!perf.includes(`if(sec.parentElement!==home){anchor?home.insertBefore(sec,anchor):home.append(sec)}`))throw Error('PERFORMANCE_HOME_ANCHOR_MISSING');
W('ms-performance-hub.js',perf);

let css=R('assets/css/app.css');
if(!css.includes('MS_V1017_2_IDENTITY'))css+=`\n/* MS_V1017_2_IDENTITY */\n:root{--ms-vanilla:#fff7e8;--ms-cream:#f6ead7;--ms-fresh-green:#6da77a;--ms-fresh-green-2:#8fc79a;--ms-fluoro:#c9ff3d;--ms-green-ink:#214b31}\n.ms1017-alt-btn{background:#c9ff3d!important;color:#214b31!important;border:1px solid #94cf23!important;box-shadow:0 8px 20px rgba(132,191,35,.22)!important;font-weight:900!important}.ms1017-alt-btn:hover,.ms1017-alt-btn:focus-visible{background:#d7ff66!important;color:#173d27!important;border-color:#7fb51d!important}.ms1017-actions .log-open{background:#fff7e8!important;color:#214b31!important;border:1px solid #b8d5be!important}.ms1017-alt-sheet{background:#fff7e8!important;color:#24372a!important;border:1px solid #b7d4bd!important}.ms1017-alt-sheet header button[data-close]{background:#f6ead7!important;color:#214b31!important;border:1px solid #b8d5be!important}.ms1017-alt-tools input,.ms1017-alt-tools select{background:#fffdf8!important;color:#29392e!important;border:1px solid #b8d5be!important}.ms1017-alt-card{background:#fffaf0!important;color:#29392e!important;border:1px solid #c7ddcb!important}.ms1017-alt-card:hover,.ms1017-alt-card:focus-visible{background:#eff8e7!important;border-color:#8fc79a!important}.training-day-tab,.weights-day{background:#fff7e8!important;color:#33453a!important;border-color:#c6dac9!important}.training-day-tab.active,.weights-day.active{background:#eaf5df!important;color:#214b31!important;border-color:#6da77a!important}\n`;
W('assets/css/app.css',css);

let pwa=R('assets/js/pwa.js');
pwa=pwa.replace(/const VERSION='\d+';/,"const VERSION='10172';");W('assets/js/pwa.js',pwa);
for(const f of ['app.html','weights.html']){
  let h=R(f);
  h=h.replace(/assets\/css\/app\.css\?v=\d+/g,'assets/css/app.css?v=10172')
     .replace(/assets\/js\/app\.js\?v=\d+/g,'assets/js/app.js?v=10172')
     .replace(/assets\/js\/weights\.js\?v=\d+/g,'assets/js/weights.js?v=10172')
     .replace(/ms-performance-hub\.js\?v=\d+/g,'ms-performance-hub.js?v=10172')
     .replace(/ms-training-personalization\.js\?v=\d+/g,'ms-training-personalization.js?v=10172')
     .replace(/assets\/js\/pwa\.js\?v=\d+/g,'assets/js/pwa.js?v=10172');
  W(f,h);
}

const T=R('ms-training-personalization.js'),A=R('assets/js/app.js'),WW=R('assets/js/weights.js'),P=R('ms-performance-hub.js'),C=R('assets/css/app.css'),AH=R('app.html'),WH=R('weights.html'),PW=R('assets/js/pwa.js');
if(!T.includes('MS_V1017_2_LEGACY_ALT_UI_DISABLED'))throw Error('LEGACY_MARKER_MISSING');
if(T.includes('function addTo(el,base,day){'))throw Error('LEGACY_ADD_TO_STILL_ACTIVE');
if(!T.includes("function decorate(){$$('.ms-alt-inline,[data-ms-alt]').forEach(el=>el.remove())}"))throw Error('LEGACY_DECORATE_NOT_DISABLED');
if(!A.includes('class=\\"ms1017-alt-btn\\"')&&!A.includes('ms1017-alt-btn'))throw Error('NEW_APP_ALT_BUTTON_MISSING');
if(!WW.includes('ms1017-alt-btn'))throw Error('NEW_WEIGHTS_ALT_BUTTON_MISSING');
if(!C.includes('.ms1017-alt-btn{background:#c9ff3d!important'))throw Error('FLUORESCENT_STYLE_MISSING');
if(!P.includes(`if(sec.parentElement!==home){anchor?home.insertBefore(sec,anchor):home.append(sec)}`))throw Error('RECOVERY_NOT_HOME_ONLY');
if(!AH.includes('ms-training-personalization.js?v=10172')||!WH.includes('ms-training-personalization.js?v=10172'))throw Error('PERSONALIZATION_CACHE_BUST_MISSING');
if(!PW.includes("const VERSION='10172';"))throw Error('PWA_VERSION_MISSING');
console.log('V1017_2_LEGACY_ALT_REMOVAL_OK');
console.log('legacy_alt_button=SOURCE_DISABLED');
console.log('legacy_selected_alt_button=SOURCE_DISABLED');
console.log('new_alt_button=ONLY_MS1017_FLUORESCENT');
console.log('performance_recovery=HOME_ONLY');
console.log('muscle_recovery=HOME_ONLY');
console.log('identity=VANILLA_CREAM_FRESH_GREEN');
console.log('pwa_cache=10172');
