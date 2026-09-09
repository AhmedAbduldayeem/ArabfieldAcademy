const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function write(p,s){fs.writeFileSync(path.join(root,p),s,'utf8')}
let n=read('ms-nutrition-personalized.js');
const old=`function token(){for(const k of ['muscle_state_supabase_session','sb-vfqhvkibpisfidulohlm-auth-token','ms_access_token']){try{const x=localStorage.getItem(k);if(!x)continue;if(k==='ms_access_token')return x;const j=JSON.parse(x),v=j?.access_token||j?.currentSession?.access_token||j?.session?.access_token;if(v)return v}catch{}}return null}`;
const neu=`function token(){try{const t=window.MS_API?.getToken?.();if(t)return t}catch{}for(const store of [localStorage,sessionStorage])for(const k of ['muscle_state_supabase_session','sb-vfqhvkibpisfidulohlm-auth-token','ms_access_token']){try{const x=store.getItem(k);if(!x)continue;if(k==='ms_access_token')return x;const j=JSON.parse(x),v=j?.access_token||j?.currentSession?.access_token||j?.session?.access_token;if(v)return v}catch{}}return null}`;
if(n.includes(old))n=n.replace(old,neu);else if(!n.includes('window.MS_API?.getToken?.()'))throw Error('PERSONALIZED_TOKEN_PATTERN_NOT_FOUND');
write('ms-nutrition-personalized.js',n);
let h=read('app.html');
h=h.replace(/\s*<link rel="stylesheet" href="assets\/css\/ms-nutrition-session-v10183\.css\?v=10183">\s*/g,'\n');
h=h.replace(/\s*<script src="assets\/js\/ms-nutrition-session-v10183\.js\?v=10183" defer><\/script>\s*/g,'\n');
const css='<link rel="stylesheet" href="assets/css/ms-nutrition-session-v10183.css?v=10183">\n';
if(!h.includes('</head>'))throw Error('HEAD_END_MISSING');h=h.replace('</head>',css+'</head>');
const a889='<script src="ms-nutrition-personalized.js?v=889" defer></script>';
const a10183='<script src="ms-nutrition-personalized.js?v=10183" defer></script>';
if(!h.includes(a889)&&!h.includes(a10183))throw Error('PERSONALIZED_SCRIPT_ANCHOR_MISSING');
h=h.replace(a10183,a889);
h=h.replace(a889,'<script src="assets/js/ms-nutrition-session-v10183.js?v=10183" defer></script>\n'+a10183);
h=h.replace(/assets\/js\/pwa\.js\?v=\d+/,'assets/js/pwa.js?v=10183');
write('app.html',h);
let p=read('assets/js/pwa.js');
p=p.replace(/const VERSION='\d+';/,"const VERSION='10183';");
write('assets/js/pwa.js',p);
console.log('V10183_PATCH_OK');