const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function write(p,s){fs.writeFileSync(path.join(root,p),s,'utf8')}
function replaceErrorValue(s,key,value){const re=new RegExp('('+key+":\\s*)'[^']*'",'g');return s.replace(re,(_,prefix)=>prefix+"'"+value+"'")}
function quotedStrings(src){const out=[];for(let i=0;i<src.length;i++){const q=src[i];if(q!=="'"&&q!=='"'&&q!=='`')continue;let v='',ok=false;for(i=i+1;i<src.length;i++){const c=src[i];if(c==='\\'){if(i+1<src.length){v+=c+src[i+1];i++;continue}}if(c===q){ok=true;break}v+=c}if(ok)out.push(v)}return out}
function assertNoExternalUserCopy(s,rel){for(const v of quotedStrings(s)){if(/Gemini|OpenAI|Billing/i.test(v))throw Error('EXTERNAL_USER_COPY_REMAINS '+rel+' '+v.slice(0,120))}}
function cleanFood(rel){let s=read(rel);
 s=s.replace(/getHealth\(\)\.then\(h=>setStatus\(h\.vision_enabled\?'[^']*':'[^']*',h\.vision_enabled\?'ok':'warn'\)\)/g,"getHealth().then(h=>{if(!h.vision_enabled)setStatus('التحليل غير متاح مؤقتًا. جرّب مرة أخرى بعد قليل.','warn')})");
 const map={provider_auth_failed:'تعذر تشغيل التحليل الآن. جرّب مرة أخرى بعد قليل.',provider_free_quota_exceeded:'الخدمة مشغولة حاليًا. جرّب بعد قليل.',provider_quota_or_billing:'تعذر تشغيل التحليل الآن. جرّب مرة أخرى بعد قليل.',provider_rate_limited:'الخدمة مشغولة حاليًا. جرّب بعد قليل.',provider_model_unavailable:'التحليل غير متاح مؤقتًا. جرّب بعد قليل.',provider_request_invalid:'تعذر إكمال التحليل الآن. جرّب مرة أخرى.',vision_empty_result:'لم نتمكن من استخراج نتيجة واضحة من الصورة. جرّب صورة أوضح.',vision_invalid_result:'النتيجة غير مكتملة. جرّب صورة أوضح.',vision_analysis_failed:'تعذر تحليل الصورة الآن. جرّب مرة أخرى.'};
 for(const [k,v] of Object.entries(map))s=replaceErrorValue(s,k,v);
 if(!s.includes("getHealth().then(h=>{if(!h.vision_enabled)setStatus("))throw Error('HEALTH_SUCCESS_HIDE_PATCH_MISSING '+rel);
 if(!s.includes('provider_quota_or_billing'))throw Error('INTERNAL_ERROR_KEY_MISSING '+rel);
 assertNoExternalUserCopy(s,rel);write(rel,s)}
cleanFood('assets/js/ms-food-photo-v1018-1.js');
cleanFood('assets/js/ms-food-photo-result-v10182.js');
let h=read('app.html');h=h.replace(/assets\/js\/ms-food-photo-v1018-1\.js\?v=\d+/,'assets/js/ms-food-photo-v1018-1.js?v=10189');h=h.replace(/assets\/js\/ms-food-photo-result-v10182\.js\?v=\d+/,'assets/js/ms-food-photo-result-v10182.js?v=10189');h=h.replace(/assets\/js\/pwa\.js\?v=\d+/,'assets/js/pwa.js?v=10189');write('app.html',h);
let p=read('assets/js/pwa.js');p=p.replace(/const VERSION='\d+';/,"const VERSION='10189';");write('assets/js/pwa.js',p);
console.log('V10189_SAFE_UI_PATCH_OK');
