const fs=require('fs'),path=require('path');
const root=process.argv[2]||process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function write(p,s){fs.writeFileSync(path.join(root,p),s,'utf8')}
function replaceErrorValue(s,key,value){const re=new RegExp('('+key+":\\s*)'[^']*'",'g');return s.replace(re,(_,prefix)=>prefix+"'"+value+"'")}
function clean(rel){
 let s=read(rel);
 s=s.replace(/getHealth\(\)\.then\(h=>setStatus\(h\.vision_enabled\?'[^']*':'[^']*',h\.vision_enabled\?'ok':'warn'\)\)/g,"getHealth().then(h=>{if(!h.vision_enabled)setStatus('التحليل غير متاح مؤقتًا. جرّب مرة أخرى بعد قليل.','warn')})");
 const map={
  provider_auth_failed:'تعذر تشغيل التحليل الآن. جرّب مرة أخرى بعد قليل.',
  provider_free_quota_exceeded:'الخدمة مشغولة حاليًا. جرّب بعد قليل.',
  provider_quota_or_billing:'تعذر تشغيل التحليل الآن. جرّب مرة أخرى بعد قليل.',
  provider_rate_limited:'الخدمة مشغولة حاليًا. جرّب بعد قليل.',
  provider_model_unavailable:'التحليل غير متاح مؤقتًا. جرّب بعد قليل.',
  provider_request_invalid:'تعذر إكمال التحليل الآن. جرّب مرة أخرى.',
  vision_empty_result:'لم نتمكن من استخراج نتيجة واضحة من الصورة. جرّب صورة أوضح.',
  vision_invalid_result:'النتيجة غير مكتملة. جرّب صورة أوضح.',
  vision_analysis_failed:'تعذر تحليل الصورة الآن. جرّب مرة أخرى.'
 };
 for(const [k,v] of Object.entries(map))s=replaceErrorValue(s,k,v);
 if(/Gemini|OpenAI|Billing/.test(s))throw Error('EXTERNAL_PROVIDER_COPY_REMAINS '+rel);
 write(rel,s);
}
clean('assets/js/ms-food-photo-v1018-1.js');
clean('assets/js/ms-food-photo-result-v10182.js');
let h=read('app.html');
h=h.replace(/assets\/js\/ms-food-photo-v1018-1\.js\?v=\d+/,'assets/js/ms-food-photo-v1018-1.js?v=101811');
h=h.replace(/assets\/js\/ms-food-photo-result-v10182\.js\?v=\d+/,'assets/js/ms-food-photo-result-v10182.js?v=101811');
h=h.replace(/assets\/js\/pwa\.js\?v=\d+/,'assets/js/pwa.js?v=101811');
write('app.html',h);
let p=read('assets/js/pwa.js');
p=p.replace(/const VERSION='\d+';/,"const VERSION='101811';");
write('assets/js/pwa.js',p);
console.log('V101811_TOLERANT_UI_PATCH_OK');
