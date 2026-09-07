const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s,'utf8');
function addCss(s){
 s=s.replace(/<link[^>]+ms-v1016-3\.css[^>]*>\s*/gi,'');
 s=s.replace(/<link[^>]+ms-v1016-4\.css[^>]*>\s*/gi,'');
 return s.replace('</head>','<link rel="stylesheet" href="assets/css/ms-v1016-4.css?v=10164">\n</head>');
}
function bustPwa(s){return s.replace(/assets\/js\/pwa\.js\?v=\d+/g,'assets/js/pwa.js?v=10164')}
function addRuntime(s){
 s=s.replace(/<script[^>]+ms-v1016-3-runtime\.js[^>]*><\/script>\s*/gi,'');
 s=s.replace(/<script[^>]+ms-v1016-4-runtime\.js[^>]*><\/script>\s*/gi,'');
 return s.replace('</body>','<script src="assets/js/ms-v1016-4-runtime.js?v=10164" defer></script>\n</body>');
}
let app=read('app.html');
app=app.replace(/<article class="account-card" id="demoPlanCard"[\s\S]*?<\/article>/i,'');
app=app.replace(/>CUSTOM TRAINING</g,'>برنامجك المخصص<');
app=addRuntime(addCss(bustPwa(app)));
write('app.html',app);

let weights=addRuntime(addCss(bustPwa(read('weights.html'))));
write('weights.html',weights);

let exercise=addRuntime(addCss(bustPwa(read('exercise.html'))));
if(!exercise.includes('assets/js/api-client.js'))exercise=exercise.replace('</body>','<script src="assets/js/api-client.js?v=910"></script>\n</body>');
if(!exercise.includes('ms-fitness-bridge.js'))exercise=exercise.replace('</body>','<script src="ms-fitness-bridge.js?v=885"></script>\n</body>');
write('exercise.html',exercise);

for(const f of ['app.html','weights.html','exercise.html']){
 const s=read(f);
 if((s.match(/ms-v1016-4-runtime\.js/g)||[]).length!==1)throw new Error('RUNTIME_COUNT_'+f);
 if((s.match(/ms-v1016-4\.css/g)||[]).length!==1)throw new Error('CSS_COUNT_'+f);
 if(/ms-v1016-3-runtime\.js|ms-v1016-3\.css/.test(s))throw new Error('OLD_V10163_REMAINS_'+f);
 if(!/ms-v1016-4-runtime\.js\?v=10164" defer/.test(s))throw new Error('RUNTIME_NOT_DEFER_'+f);
 if(s.includes('assets/js/pwa.js')&&!s.includes('assets/js/pwa.js?v=10164'))throw new Error('PWA_QUERY_NOT_BUSTED_'+f);
}
if(read('app.html').includes('id="demoPlanCard"'))throw new Error('DEMO_CARD_REMAINS');

const pwa=path.join(root,'assets/js/pwa.js');
if(fs.existsSync(pwa)){
 let ps=fs.readFileSync(pwa,'utf8');
 if(!/const VERSION='\d+';/.test(ps))throw new Error('PWA_VERSION_ANCHOR_MISSING');
 ps=ps.replace(/const VERSION='\d+';/,"const VERSION='10164';");
 fs.writeFileSync(pwa,ps,'utf8');
 if(!fs.readFileSync(pwa,'utf8').includes("const VERSION='10164';"))throw new Error('PWA_VERSION_PATCH_FAILED');
}
console.log('V1016_4_HTML_PATCH_OK');
console.log('runtime_load=defer_after_existing_scripts');
console.log('pwa_cache_bust=10164');
console.log('demo_internal_card=removed');
