const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
function read(f){const p=path.join(root,f);if(!fs.existsSync(p))throw new Error('MISSING_'+f);return fs.readFileSync(p,'utf8')}
function write(f,s){fs.writeFileSync(path.join(root,f),s,'utf8')}
function cleanLiteralNewlines(s){return s.replace(/>\\n</g,'>\n<').replace(/>\\r\\n</g,'>\n<')}
function removeScript(s,re){return s.replace(new RegExp(`<script[^>]+src=["'][^"']*${re}[^"']*["'][^>]*><\\/script>\\s*`,'gi'),'')}
function removeCss(s,re){return s.replace(new RegExp(`<link[^>]+href=["'][^"']*${re}[^"']*["'][^>]*>\\s*`,'gi'),'')}
function ensureCss(s){if(!s.includes('assets/css/ms-v1016-3.css?v=10163'))s=s.replace('</head>','<link rel="stylesheet" href="assets/css/ms-v1016-3.css?v=10163">\n</head>');return s}
function ensureScript(s){if(!s.includes('assets/js/ms-v1016-3-runtime.js?v=10163'))s=s.replace('</body>','<script src="assets/js/ms-v1016-3-runtime.js?v=10163"></script>\n</body>');return s}
let app=cleanLiteralNewlines(read('app.html'));
for(const r of ["ms-training-normalizer-v[^\"']+\\.js","ms-training-explorer-v[^\"']+\\.js","ms-exercise-swaps-v[^\"']+\\.js","ms-home-only-v[^\"']+\\.js"])app=removeScript(app,r);
for(const r of ["ms-training-explorer-v[^\"']+\\.css","ms-exercise-swaps-v[^\"']+\\.css"])app=removeCss(app,r);
app=ensureScript(ensureCss(app));write('app.html',app);
let weights=cleanLiteralNewlines(read('weights.html'));
for(const r of ["ms-training-normalizer-v[^\"']+\\.js","ms-weight-swaps-v[^\"']+\\.js"])weights=removeScript(weights,r);
weights=ensureScript(ensureCss(weights));write('weights.html',weights);
let exercise=cleanLiteralNewlines(read('exercise.html'));
if(!exercise.includes('assets/js/api-client.js'))exercise=exercise.replace('</body>','<script src="assets/js/api-client.js?v=910"></script>\n</body>');
if(!exercise.includes('ms-fitness-bridge.js'))exercise=exercise.replace('</body>','<script src="ms-fitness-bridge.js?v=885"></script>\n</body>');
exercise=ensureScript(ensureCss(exercise));write('exercise.html',exercise);
const checks=[
 ['app.html','assets/js/ms-v1016-3-runtime.js?v=10163'],['weights.html','assets/js/ms-v1016-3-runtime.js?v=10163'],['exercise.html','assets/js/ms-v1016-3-runtime.js?v=10163'],
 ['app.html','assets/css/ms-v1016-3.css?v=10163'],['weights.html','assets/css/ms-v1016-3.css?v=10163'],['exercise.html','assets/css/ms-v1016-3.css?v=10163']
];
for(const [f,m] of checks){const s=read(f);if(!s.includes(m))throw new Error('CHECK_FAIL_'+f+'_'+m)}
const a=read('app.html'),w=read('weights.html');
if(/ms-training-explorer-v\d+\.js|ms-exercise-swaps-v\d+\.js|ms-training-normalizer-v\d+\.js|ms-home-only-v\d+\.js/.test(a))throw new Error('APP_OLD_RUNTIME_REMAINS');
if(/ms-weight-swaps-v\d+\.js|ms-training-normalizer-v\d+\.js/.test(w))throw new Error('WEIGHTS_OLD_RUNTIME_REMAINS');
if((a.match(/ms-v1016-3-runtime\.js/g)||[]).length!==1)throw new Error('APP_RUNTIME_DUPLICATE');
if((w.match(/ms-v1016-3-runtime\.js/g)||[]).length!==1)throw new Error('WEIGHTS_RUNTIME_DUPLICATE');
console.log('V1016_3_HTML_PATCH_OK');
console.log('old_training_runtimes_removed=true');
console.log('single_runtime=true');
console.log('literal_backslash_n_cleaned=true');
