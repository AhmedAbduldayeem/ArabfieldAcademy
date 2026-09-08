(()=>{'use strict';
const SERVICE='https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once';
const FOODS=[
['rice-white-cooked','أرز أبيض مطهو',{kcal:130,fat_g:.3,carbs_g:28.2,fiber_g:.4,protein_g:2.7},160,'مطهو بدون دهون مضافة'],
['orange-raw','برتقال',{kcal:47,fat_g:.1,carbs_g:11.8,fiber_g:2.4,protein_g:.9},130,'طازج'],
['sweet-potato-baked','بطاطا حلوة',{kcal:90,fat_g:.2,carbs_g:20.7,fiber_g:3.3,protein_g:2},180,'مخبوزة بدون دهون مضافة'],
['potato-boiled','بطاطس مسلوقة',{kcal:87,fat_g:.1,carbs_g:20.1,fiber_g:1.8,protein_g:1.9},150,'مسلوقة بدون زيت'],
['egg-hard-boiled','بيض مسلوق',{kcal:155,fat_g:10.6,carbs_g:1.1,fiber_g:0,protein_g:12.6},50,'مسلوق بدون دهون مضافة'],
['apple-raw','تفاح',{kcal:52,fat_g:.2,carbs_g:13.8,fiber_g:2.4,protein_g:.3},180,'طازج'],
['tuna-water','تونة مصفاة بالماء',{kcal:116,fat_g:.8,carbs_g:0,fiber_g:0,protein_g:25.5},120,'مصفاة جيدًا'],
['cottage-cheese-lowfat','جبنة قريش قليلة الدسم',{kcal:90,fat_g:2.5,carbs_g:3.5,fiber_g:0,protein_g:12.5},100,'قليلة الدسم'],
['milk-lowfat','حليب قليل الدسم',{kcal:42,fat_g:1,carbs_g:5,fiber_g:0,protein_g:3.4},240,'قليل الدسم بدون سكر مضاف'],
['chickpeas-cooked','حمص مطهو',{kcal:164,fat_g:2.6,carbs_g:27.4,fiber_g:7.6,protein_g:8.9},165,'مطهو بدون دهون مضافة'],
['baladi-bread','خبز بلدي',{kcal:266,fat_g:1.2,carbs_g:55,fiber_g:6.5,protein_g:9},90,'رغيف متوسط'],
['whole-wheat-bread','خبز حبوب كاملة',{kcal:247,fat_g:4.2,carbs_g:41,fiber_g:7,protein_g:13},35,'شرائح خبز حبوب كاملة'],
['greek-yogurt-lowfat','زبادي يوناني قليل الدسم',{kcal:73,fat_g:1.9,carbs_g:3.9,fiber_g:0,protein_g:10},170,'سادة غير محلى'],
['olive-oil','زيت زيتون',{kcal:884,fat_g:100,carbs_g:0,fiber_g:0,protein_g:0},5,'يضاف بالملعقة'],
['mixed-salad','سلطة خضراء مشكلة',{kcal:25,fat_g:.3,carbs_g:4.5,fiber_g:2,protein_g:1.2},200,'خضار طازجة بدون صوص دهني'],
['white-fish-grilled','سمك أبيض مشوي',{kcal:128,fat_g:2.7,carbs_g:0,fiber_g:0,protein_g:26},150,'مشوي بدون زيت زائد'],
['oats-dry','شوفان',{kcal:389,fat_g:6.9,carbs_g:66.3,fiber_g:10.6,protein_g:16.9},40,'جاف قبل التحضير'],
['chicken-breast-grilled','صدر دجاج مشوي',{kcal:165,fat_g:3.6,carbs_g:0,fiber_g:0,protein_g:31},150,'مشوي بدون جلد وبدون زيت زائد'],
['lentils-cooked','عدس مطهو',{kcal:116,fat_g:.4,carbs_g:20.1,fiber_g:7.9,protein_g:9},180,'مطهو بدون دهون مضافة'],
['fava-beans-cooked','فول مطهو',{kcal:110,fat_g:.4,carbs_g:19.7,fiber_g:5.4,protein_g:7.6},180,'مطهو بدون زيت مضاف'],
['lean-beef-cooked','لحم بقري قليل الدهن',{kcal:217,fat_g:12,carbs_g:0,fiber_g:0,protein_g:26},120,'مطهو قليل الدهن'],
['almonds-raw','لوز',{kcal:579,fat_g:49.9,carbs_g:21.6,fiber_g:12.5,protein_g:21.2},15,'نيء غير مملح'],
['pasta-cooked','مكرونة مطهوة',{kcal:158,fat_g:.9,carbs_g:30.9,fiber_g:1.8,protein_g:5.8},140,'مطهوة بدون صوص دهني'],
['banana-raw','موز',{kcal:89,fat_g:.3,carbs_g:22.8,fiber_g:2.6,protein_g:1.1},120,'طازج']
].map(([slug,name_ar,per_100g,portion_grams,preparation])=>({slug,name_ar,per_100g,portion_grams,preparation}));
const BY=new Map(FOODS.map(x=>[x.slug,x]));
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={health:null,components:[],previewUrl:'',imageDataUrl:'',recent:[],busy:false};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const r1=n=>Math.round((Number(n)||0)*10)/10;
function token(){
  try{const t=window.MS_API?.getToken?.();if(t)return t}catch{}
  for(const st of [localStorage,sessionStorage]){
    try{const t=st.getItem('ms_access_token');if(t)return t}catch{}
    for(const k of ['muscle_state_supabase_session','sb-vfqhvkibpisfidulohlm-auth-token']){
      try{const x=JSON.parse(st.getItem(k)||'null');if(x?.access_token)return x.access_token}catch{}
    }
  }
  return '';
}
async function call(action,body,auth=true){
  const h={'content-type':'application/json'};
  const t=token(); if(auth&&t)h.authorization='Bearer '+t;
  const r=await fetch(SERVICE+'?action='+encodeURIComponent(action),{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(d.error||'request_failed'),{status:r.status,data:d});
  return d;
}
function calc(food,grams){const p=food?.per_100g||{},f=(Number(grams)||0)/100;return{kcal:Math.max(0,Math.round((+p.kcal||0)*f)),protein_g:Math.max(0,r1((+p.protein_g||0)*f)),carbs_g:Math.max(0,r1((+p.carbs_g||0)*f)),fat_g:Math.max(0,r1((+p.fat_g||0)*f)),fiber_g:Math.max(0,r1((+p.fiber_g||0)*f))};}
function totals(){return state.components.filter(x=>x.food_slug&&BY.has(x.food_slug)).reduce((a,x)=>{const m=calc(BY.get(x.food_slug),x.grams);return{kcal:a.kcal+m.kcal,protein_g:r1(a.protein_g+m.protein_g),carbs_g:r1(a.carbs_g+m.carbs_g),fat_g:r1(a.fat_g+m.fat_g),fiber_g:r1(a.fiber_g+m.fiber_g)}},{kcal:0,protein_g:0,carbs_g:0,fat_g:0,fiber_g:0});}
function options(selected=''){return '<option value="">اختار الصنف</option>'+FOODS.map(f=>`<option value="${f.slug}" ${f.slug===selected?'selected':''}>${esc(f.name_ar)}</option>`).join('');}
function ensureCard(){
  const sec=$('[data-section="nutrition"]'),title=sec?.querySelector('.section-title');if(!sec||!title)return;
  let card=$('#ms1018FoodPhotoCard');if(card)return;
  card=document.createElement('article');card.id='ms1018FoodPhotoCard';card.className='ms1018-card';
  card.innerHTML=`<div class="ms1018-card-copy"><span>تسجيل ذكي</span><h3>صوّر وجبتك</h3><p>صورة واحدة كبداية، وبعدها راجع الكميات قبل الحفظ.</p><small>الصورة لا تُحفظ بعد التحليل.</small></div><div class="ms1018-card-actions"><button type="button" data-ms1018-camera>التقط صورة</button><button type="button" data-ms1018-gallery>اختار من الصور</button></div><input type="file" accept="image/*" capture="environment" data-ms1018-camera-input hidden><input type="file" accept="image/*" data-ms1018-gallery-input hidden>`;
  title.insertAdjacentElement('afterend',card);
  $('[data-ms1018-camera]',card).onclick=()=> $('[data-ms1018-camera-input]',card).click();
  $('[data-ms1018-gallery]',card).onclick=()=> $('[data-ms1018-gallery-input]',card).click();
  $$('input[type=file]',card).forEach(i=>i.onchange=()=>{const f=i.files?.[0];if(f)openWithFile(f);i.value='';});
}
async function compressImage(file){
  if(!file?.type?.startsWith('image/'))throw Error('invalid_image');
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=url;});
    const max=1280,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d',{alpha:false}).drawImage(img,0,0,w,h);
    let blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.78));
    if(!blob)blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',.78));
    if(!blob)throw Error('image_compress_failed');
    if(blob.size>2500000){blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',.62));}
    const dataUrl=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(blob);});
    return{blob,dataUrl,width:w,height:h};
  }finally{URL.revokeObjectURL(url);}
}
async function getHealth(){try{state.health=await call('health',null,false)}catch{state.health={ok:false,vision_enabled:false}}return state.health;}
function modal(){
  let m=$('#ms1018Modal');if(m)return m;
  m=document.createElement('div');m.id='ms1018Modal';m.className='ms1018-modal';m.innerHTML=`<section class="ms1018-sheet" role="dialog" aria-modal="true"><header><div><small>Muscle State Nutrition</small><h2>صوّر وجبتك واحسبها</h2></div><button type="button" data-close aria-label="إغلاق">×</button></header><div class="ms1018-stage"><div class="ms1018-preview"><img data-preview alt="صورة الوجبة"><div data-preview-empty>اختار أو صوّر وجبتك</div></div><div class="ms1018-side"><label>نوع الوجبة<select data-meal-type><option value="breakfast">فطار</option><option value="lunch" selected>غداء</option><option value="dinner">عشاء</option><option value="snack">سناك</option></select></label><p class="ms1018-note">تقدير الصورة بداية سريعة، عدّل الكمية قبل الحفظ لو محتاج.</p><div class="ms1018-analysis-actions"><button type="button" data-analyze>حلّل الصورة</button><button type="button" data-add>أضف صنف يدويًا</button></div><div class="ms1018-status" data-status></div></div></div><div class="ms1018-components" data-components></div><div class="ms1018-total" data-total></div><div class="ms1018-savebar"><button type="button" data-save>حفظ الوجبة</button></div><div class="ms1018-recent"><h3>آخر الوجبات المسجلة</h3><div data-recent></div></div></section>`;document.body.append(m);
  $('[data-close]',m).onclick=closeModal;m.onclick=e=>{if(e.target===m)closeModal()};
  $('[data-analyze]',m).onclick=analyze;$('[data-add]',m).onclick=()=>addManual();$('[data-save]',m).onclick=saveMeal;
  $('[data-components]',m).addEventListener('input',onRowChange);$('[data-components]',m).addEventListener('change',onRowChange);$('[data-components]',m).addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;state.components.splice(+b.dataset.remove,1);renderComponents();});
  return m;
}
function closeModal(){const m=$('#ms1018Modal');m?.remove();if(state.previewUrl){URL.revokeObjectURL(state.previewUrl);state.previewUrl='';}state.imageDataUrl='';state.components=[];}
async function openWithFile(file){
  const m=modal();m.classList.add('open');setStatus('جاري تجهيز الصورة…');
  try{
    const c=await compressImage(file);
    if(state.previewUrl)URL.revokeObjectURL(state.previewUrl);
    state.previewUrl=URL.createObjectURL(c.blob);state.imageDataUrl=String(c.dataUrl);
    $('[data-preview]',m).src=state.previewUrl;$('[data-preview]',m).hidden=false;$('[data-preview-empty]',m).hidden=true;
    const h=await getHealth();
    if(h.vision_enabled){setStatus('الصورة جاهزة. اضغط «حلّل الصورة».','ok');}
    else{setStatus('التحليل التلقائي يحتاج تفعيل مفتاح الرؤية. تقدر تسجّل مكونات الوجبة يدويًا الآن.','warn');}
    loadRecent();
  }catch(e){setStatus(e.message==='invalid_image'?'اختار صورة صحيحة.':'تعذر تجهيز الصورة.','bad');}
}
function setStatus(text,type=''){const e=$('[data-status]',modal());if(!e)return;e.textContent=text;e.className='ms1018-status'+(type?' '+type:'');}
async function analyze(){
  if(state.busy)return;if(!state.imageDataUrl){setStatus('اختار صورة الأول.','warn');return;}
  const h=state.health||await getHealth();if(!h.vision_enabled){setStatus('التحليل التلقائي غير مفعّل على السيرفر حاليًا. استخدم الإضافة اليدوية لحين تفعيله.','warn');return;}
  if(!token()){setStatus('سجّل دخولك الأول علشان تستخدم تحليل الوجبة.','warn');return;}
  state.busy=true;const b=$('[data-analyze]',modal());b.disabled=true;b.textContent='جاري التحليل…';setStatus('بنقرأ مكونات الوجبة ونطابقها مع قاعدة الأغذية…');
  try{
    const d=await call('analyze',{image_data_url:state.imageDataUrl});
    state.components=(d.components||[]).map(x=>({...x,user_corrected:false}));
    renderComponents();
    setStatus(d.note_ar||'راجع المكونات والجرامات قبل الحفظ.','ok');
  }catch(e){const map={nutrition_access_required:'الميزة متاحة مع التغذية المفعّلة.',vision_analysis_failed:'تعذر تحليل الصورة الآن. جرّب صورة أوضح أو أضف المكونات يدويًا.',image_size_invalid:'الصورة كبيرة جدًا.'};setStatus(map[e.message]||'تعذر تحليل الصورة الآن.','bad');}
  finally{state.busy=false;b.disabled=false;b.textContent='حلّل الصورة';}
}
function addManual(){
  state.components.push({detected_label:'',food_slug:'',grams:100,confidence:null,matched:false,user_corrected:true});
  renderComponents();
  setTimeout(()=>$$('[data-food]',modal()).at(-1)?.focus(),0);
}
function renderComponents(){
  const box=$('[data-components]',modal());
  box.innerHTML=state.components.length?state.components.map((x,i)=>{
    const f=BY.get(x.food_slug),m=f?calc(f,x.grams):{kcal:0,protein_g:0,carbs_g:0,fat_g:0};
    return `<article class="ms1018-row" data-row="${i}"><div class="ms1018-row-head"><select data-food>${options(x.food_slug)}</select><button type="button" data-remove="${i}" aria-label="حذف">×</button></div><div class="ms1018-row-body"><label>الكمية<input data-grams type="number" min="1" max="3000" step="1" value="${Math.round(+x.grams||100)}"><span>جم</span></label><div class="ms1018-row-macros"><b>${m.kcal} kcal</b><span>P ${m.protein_g}g</span><span>C ${m.carbs_g}g</span><span>F ${m.fat_g}g</span></div></div>${x.detected_label?`<small>التعرف: ${esc(x.detected_label)}${x.confidence!=null?` · ثقة ${Math.round(x.confidence*100)}%`:''}</small>`:''}</article>`;
  }).join(''):'<div class="ms1018-empty">حلّل الصورة أو أضف مكونات الوجبة يدويًا.</div>';
  renderTotal();
}
function onRowChange(e){
  const row=e.target.closest('[data-row]');if(!row)return;const i=+row.dataset.row,x=state.components[i];if(!x)return;
  if(e.target.matches('[data-food]')){const slug=e.target.value,f=BY.get(slug);x.food_slug=slug;x.matched=!!f;x.user_corrected=true;if(f&&!x.detected_label)x.detected_label=f.name_ar;if(f&&(!x.grams||x.grams===100))x.grams=f.portion_grams;}
  if(e.target.matches('[data-grams]')){x.grams=Math.max(1,Math.min(3000,+e.target.value||1));x.user_corrected=true;}
  renderComponents();
}
function renderTotal(){const t=totals(),e=$('[data-total]',modal());e.innerHTML=`<div><small>إجمالي الوجبة</small><strong>${t.kcal} kcal</strong></div><div class="ms1018-total-macros"><span><b>${t.protein_g}g</b> بروتين</span><span><b>${t.carbs_g}g</b> كارب</span><span><b>${t.fat_g}g</b> دهون</span><span><b>${t.fiber_g}g</b> ألياف</span></div>`;}
async function saveMeal(){
  const rows=state.components.filter(x=>x.food_slug&&BY.has(x.food_slug));if(!rows.length){setStatus('أضف صنف واحد على الأقل قبل الحفظ.','warn');return;}if(!token()){setStatus('سجّل دخولك الأول علشان تحفظ الوجبة.','warn');return;}
  const b=$('[data-save]',modal());b.disabled=true;b.textContent='جاري الحفظ…';
  try{
    const meal_type=$('[data-meal-type]',modal()).value;
    await call('save',{meal_type,components:rows.map(x=>({food_slug:x.food_slug,grams:+x.grams,detected_label:x.detected_label||BY.get(x.food_slug)?.name_ar,confirmed_label:BY.get(x.food_slug)?.name_ar,confidence:x.confidence,user_corrected:!!x.user_corrected}))});
    setStatus('تم حفظ الوجبة وحسابها من قاعدة Muscle State.','ok');await loadRecent();
  }catch(e){setStatus(e.message==='nutrition_access_required'?'الميزة متاحة مع التغذية المفعّلة.':'تعذر حفظ الوجبة الآن.','bad');}
  finally{b.disabled=false;b.textContent='حفظ الوجبة';}
}
async function loadRecent(){
  if(!token())return;
  try{const d=await call('recent',{});state.recent=d.meals||[];renderRecent();}catch{}
}
function renderRecent(){
  const e=$('[data-recent]',modal());if(!e)return;e.innerHTML=state.recent.length?state.recent.slice(0,5).map(m=>`<div class="ms1018-recent-row"><div><b>${({breakfast:'فطار',lunch:'غداء',dinner:'عشاء',snack:'سناك'})[m.meal_type]||'وجبة'}</b><small>${esc(m.meal_date||'')}</small></div><strong>${Math.round(+m.total_calories||0)} kcal</strong><span>P ${m.protein_g} · C ${m.carbs_g} · F ${m.fat_g}</span></div>`).join(''):'<small>لسه مفيش وجبات مصورة محفوظة.</small>';
}
function boot(){ensureCard();const sec=$('[data-section="nutrition"]');if(sec)new MutationObserver(()=>ensureCard()).observe(sec,{childList:true,subtree:false});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.MSFoodPhoto1018={openWithFile,health:getHealth};
})();