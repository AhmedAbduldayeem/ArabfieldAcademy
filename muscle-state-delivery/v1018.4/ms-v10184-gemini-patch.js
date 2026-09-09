const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function write(p,s){fs.writeFileSync(path.join(root,p),s,'utf8')}

// 1) Personalized nutrition must read the same active session as the rest of the app.
let n=read('ms-nutrition-personalized.js');
const oldToken=`function token(){for(const k of ['muscle_state_supabase_session','sb-vfqhvkibpisfidulohlm-auth-token','ms_access_token']){try{const x=localStorage.getItem(k);if(!x)continue;if(k==='ms_access_token')return x;const j=JSON.parse(x),v=j?.access_token||j?.currentSession?.access_token||j?.session?.access_token;if(v)return v}catch{}}return null}`;
const newToken=`function token(){try{const t=window.MS_API?.getToken?.();if(t)return t}catch{}for(const store of [localStorage,sessionStorage])for(const k of ['muscle_state_supabase_session','sb-vfqhvkibpisfidulohlm-auth-token','ms_access_token']){try{const x=store.getItem(k);if(!x)continue;if(k==='ms_access_token')return x;const j=JSON.parse(x),v=j?.access_token||j?.currentSession?.access_token||j?.session?.access_token;if(v)return v}catch{}}return null}`;
if(n.includes(oldToken))n=n.replace(oldToken,newToken);
else if(!n.includes('window.MS_API?.getToken?.()')||!n.includes('sessionStorage'))throw Error('PERSONALIZED_TOKEN_PATTERN_NOT_FOUND');
write('ms-nutrition-personalized.js',n);

// 2) Food Photo UI must describe Gemini/free-tier behavior, never OpenAI billing.
let f=read('assets/js/ms-food-photo-v1018-1.js');
f=f.replace("provider_auth_failed:'مفتاح خدمة التحليل غير صالح. راجع إعداد OpenAI API.'","provider_auth_failed:'مفتاح Gemini للتحليل غير صالح أو غير متاح.'");
f=f.replace("provider_quota_or_billing:'حساب OpenAI API يحتاج رصيد أو تفعيل Billing قبل تحليل الصور.'","provider_quota_or_billing:'خدمة التحليل القديمة غير متاحة حاليًا.'");
if(!f.includes('provider_free_quota_exceeded:')){
  f=f.replace("provider_auth_failed:'مفتاح Gemini للتحليل غير صالح أو غير متاح.',","provider_auth_failed:'مفتاح Gemini للتحليل غير صالح أو غير متاح.',provider_free_quota_exceeded:'وصلنا لحد الاستخدام المجاني في Gemini مؤقتًا. جرّب بعد شوية.',");
}
f=f.replace("provider_rate_limited:'تم الوصول لحد الاستخدام مؤقتًا. جرّب بعد قليل.'","provider_rate_limited:'وصلنا لحد الاستخدام المجاني في Gemini مؤقتًا. جرّب بعد شوية.'");
f=f.replace("'التحليل التلقائي جاهز.'","'Gemini جاهز. اضغط «حلّل الصورة» لعرض النتيجة.'");
if(/OpenAI API/.test(f))throw Error('OPENAI_COPY_REMAINS_MAIN');
write('assets/js/ms-food-photo-v1018-1.js',f);

let r=read('assets/js/ms-food-photo-result-v10182.js');
r=r.replace("provider_auth_failed:'مفتاح خدمة التحليل غير صالح.'","provider_auth_failed:'مفتاح Gemini للتحليل غير صالح أو غير متاح.'");
r=r.replace("provider_quota_or_billing:'التحليل متوقف لأن حساب OpenAI API يحتاج رصيد أو تفعيل Billing.'","provider_free_quota_exceeded:'وصلنا لحد الاستخدام المجاني في Gemini مؤقتًا. جرّب بعد شوية.'");
r=r.replace("provider_rate_limited:'حد الاستخدام مؤقتًا ممتلئ. جرّب بعد قليل.'","provider_rate_limited:'وصلنا لحد الاستخدام المجاني في Gemini مؤقتًا. جرّب بعد شوية.'");
if(/OpenAI API/.test(r))throw Error('OPENAI_COPY_REMAINS_RESULT');
write('assets/js/ms-food-photo-result-v10182.js',r);

// 3) Canonical app references, session guard and cache-bust.
let h=read('app.html');
h=h.replace(/\s*<link rel="stylesheet" href="assets\/css\/ms-nutrition-session-v10183\.css\?v=\d+">\s*/g,'\n');
h=h.replace(/\s*<script src="assets\/js\/ms-nutrition-session-v10183\.js\?v=\d+" defer><\/script>\s*/g,'\n');
if(!h.includes('</head>'))throw Error('HEAD_END_MISSING');
h=h.replace('</head>','<link rel="stylesheet" href="assets/css/ms-nutrition-session-v10183.css?v=10184">\n</head>');
const pRe=/<script src="ms-nutrition-personalized\.js\?v=\d+" defer><\/script>/;
if(!pRe.test(h))throw Error('PERSONALIZED_SCRIPT_ANCHOR_MISSING');
h=h.replace(pRe,'<script src="assets/js/ms-nutrition-session-v10183.js?v=10184" defer></script>\n<script src="ms-nutrition-personalized.js?v=10184" defer></script>');
h=h.replace(/assets\/js\/ms-food-photo-v1018-1\.js\?v=\d+/,'assets/js/ms-food-photo-v1018-1.js?v=10184');
h=h.replace(/assets\/js\/ms-food-photo-result-v10182\.js\?v=\d+/,'assets/js/ms-food-photo-result-v10182.js?v=10184');
h=h.replace(/assets\/js\/pwa\.js\?v=\d+/,'assets/js/pwa.js?v=10184');
write('app.html',h);

let p=read('assets/js/pwa.js');
p=p.replace(/const VERSION='\d+';/,"const VERSION='10184';");
write('assets/js/pwa.js',p);

console.log('V10184_GEMINI_PATCH_OK');