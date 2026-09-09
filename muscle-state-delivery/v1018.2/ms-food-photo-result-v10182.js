(()=>{'use strict';
const SERVICE_MARK='vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let last=null, externalResultOpen=false;
function r1(n){return Math.round((Number(n)||0)*10)/10}
function n(v){return Number(v)||0}
function isAnalyze(url){
  const s=typeof url==='string'?url:(url&&url.url)||'';
  return s.includes(SERVICE_MARK)&&/[?&]action=analyze(?:&|$)/.test(s);
}
function totalsFrom(d){
  const t=d?.totals||{};
  if(n(t.kcal)||n(t.protein_g)||n(t.carbs_g)||n(t.fat_g)||n(t.fiber_g)) return {
    kcal:Math.round(n(t.kcal)),protein_g:r1(n(t.protein_g)),carbs_g:r1(n(t.carbs_g)),fat_g:r1(n(t.fat_g)),fiber_g:r1(n(t.fiber_g))
  };
  return (d?.components||[]).reduce((a,x)=>({
    kcal:a.kcal+n(x.kcal),protein_g:r1(a.protein_g+n(x.protein_g)),carbs_g:r1(a.carbs_g+n(x.carbs_g)),
    fat_g:r1(a.fat_g+n(x.fat_g)),fiber_g:r1(a.fiber_g+n(x.fiber_g))
  }),{kcal:0,protein_g:0,carbs_g:0,fat_g:0,fiber_g:0});
}
function itemCard(x,i){
  const matched=!!x?.matched && !!x?.food_slug;
  const label=esc(x?.detected_label||x?.name_ar||('عنصر '+(i+1)));
  const grams=Math.max(1,Math.round(n(x?.grams)||100));
  const conf=x?.confidence==null?'':`<span class="ms10182-confidence">ثقة ${Math.round(n(x.confidence)*100)}%</span>`;
  return `<article class="ms10182-food ${matched?'matched':'unmatched'}">
    <div class="ms10182-food-title"><div><small>العنصر ${i+1}</small><h4>${label}</h4></div>${conf}</div>
    <div class="ms10182-food-meta"><b>${grams} جم</b>${matched?`<strong>${Math.round(n(x.kcal))} kcal</strong>`:'<strong>يحتاج اختيار صنف مطابق</strong>'}</div>
    ${matched?`<div class="ms10182-mini-macros"><span>P <b>${r1(n(x.protein_g))}g</b></span><span>C <b>${r1(n(x.carbs_g))}g</b></span><span>F <b>${r1(n(x.fat_g))}g</b></span></div>`:`<p>تم التعرف على هذا المكوّن، لكنه غير موجود كتطابق مباشر في كتالوج Muscle State الحالي. اختَر أقرب صنف من القائمة بالأسفل قبل الحفظ.</p>`}
  </article>`;
}
function summaryHTML(d){
  const comps=Array.isArray(d?.components)?d.components:[];
  const matched=comps.filter(x=>x?.matched&&x?.food_slug).length;
  const t=totalsFrom(d);
  const confidence=d?.overall_confidence==null?null:Math.round(n(d.overall_confidence)*100);
  const title=comps.length?'تم تحليل الوجبة':'تم التحليل ولم يتم التعرف على مكونات واضحة';
  return `<section class="ms10182-result" id="ms10182Result">
    <header class="ms10182-result-title">
      <div><span>نتيجة التحليل</span><h3>${title}</h3><p>${comps.length?`تم اكتشاف ${comps.length} مكوّن${matched!==comps.length?`، منها ${matched} مطابق لقاعدة السعرات`:''}. راجع النتيجة قبل الحفظ.`:'جرّب صورة أقرب للطبق وبإضاءة أوضح، أو أضف المكونات يدويًا.'}</p></div>
      ${confidence==null?'':`<div class="ms10182-score"><b>${confidence}%</b><small>ثقة التحليل</small></div>`}
    </header>
    ${comps.length?`<div class="ms10182-calories"><small>السعرات المحسوبة للمكونات المطابقة</small><strong>${t.kcal}</strong><b>kcal</b></div>
    <div class="ms10182-macros">
      <div><b>${t.protein_g}g</b><span>بروتين</span></div>
      <div><b>${t.carbs_g}g</b><span>كارب</span></div>
      <div><b>${t.fat_g}g</b><span>دهون</span></div>
      <div><b>${t.fiber_g}g</b><span>ألياف</span></div>
    </div>
    <div class="ms10182-detected"><h4>الأطعمة المكتشفة</h4>${comps.map(itemCard).join('')}</div>`:
    `<div class="ms10182-noresult"><b>لم تظهر نتيجة غذائية قابلة للحساب.</b><p>ده لا يعني إن الصورة فاضية؛ معناه إن خدمة الرؤية لم تستخرج مكونات بثقة كافية من هذه اللقطة.</p></div>`}
    ${d?.note_ar?`<p class="ms10182-note">${esc(d.note_ar)}</p>`:''}
  </section>`;
}
function mountResult(d){
  const m=$('#ms10181Modal'); if(!m) return;
  last=d;
  const body=$('[data-ms10181-body]',m); if(!body) return;
  let old=$('#ms10182Result',body); if(old) old.remove();
  const comps=Array.isArray(d?.components)?d.components:[];
  if(comps.length){
    const anchor=$('.ms10181-result-head',body);
    if(anchor) anchor.insertAdjacentHTML('beforebegin',summaryHTML(d));
    else body.insertAdjacentHTML('afterbegin',summaryHTML(d));
    requestAnimationFrame(()=>$('#ms10182Result',body)?.scrollIntoView({behavior:'smooth',block:'start'}));
    externalResultOpen=false;
    return;
  }
  const stage=$('.ms10181-stage',body);
  if(stage){
    body.innerHTML=summaryHTML(d)+`<div class="ms10182-result-actions">
      <button type="button" data-ms10182-retry>رجوع للصورة وتجربة لقطة أخرى</button>
      <button type="button" data-ms10182-manual>إضافة المكونات يدويًا</button>
    </div>`;
    if(!externalResultOpen){
      history.pushState({...history.state,ms10181Food:true,ms10181Stage:'image',ms10182Result:true},'',location.href);
      externalResultOpen=true;
    }
    $('[data-ms10182-retry]',body).onclick=()=>history.back();
    $('[data-ms10182-manual]',body).onclick=()=>{
      history.back();
      setTimeout(()=>document.querySelector('[data-ms10181-manual]')?.click(),80);
    };
  }
}
function mountError(data,status){
  const m=$('#ms10181Modal'); if(!m) return;
  const body=$('[data-ms10181-body]',m); if(!body) return;
  const reason=String(data?.error||'request_failed');
  const map={
    provider_auth_failed:'مفتاح خدمة التحليل غير صالح.',
    provider_quota_or_billing:'التحليل متوقف لأن حساب OpenAI API يحتاج رصيد أو تفعيل Billing.',
    provider_rate_limited:'حد الاستخدام مؤقتًا ممتلئ. جرّب بعد قليل.',
    provider_model_unavailable:'موديل تحليل الصور غير متاح للحساب حاليًا.',
    provider_request_invalid:'خدمة تحليل الصور تحتاج تحديثًا تقنيًا.',
    vision_empty_result:'خدمة الرؤية لم ترجع نتيجة قابلة للقراءة.',
    vision_invalid_result:'النتيجة التي رجعت من خدمة الرؤية غير مكتملة.',
    vision_analysis_failed:'تعذر إكمال تحليل الصورة.'
  };
  let box=$('#ms10182ProviderError',body);
  if(!box){box=document.createElement('div');box.id='ms10182ProviderError';box.className='ms10182-provider-error';body.prepend(box)}
  box.innerHTML=`<b>لم يكتمل التحليل</b><p>${esc(map[reason]||('تعذر تحليل الصورة. رمز الحالة '+status))}</p>`;
}
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(...args){
  const analyze=isAnalyze(args[0]);
  const res=await nativeFetch(...args);
  if(analyze){
    try{
      const d=await res.clone().json();
      setTimeout(()=>{if(res.ok&&d?.ok)mountResult(d);else mountError(d,res.status)},0);
    }catch{}
  }
  return res;
};
addEventListener('popstate',()=>{externalResultOpen=false;setTimeout(()=>{if(last&&$('#ms10181Modal')&&$('.ms10181-result-head'))mountResult(last)},0)});
window.addEventListener('ms10182:rerender',()=>{if(last)mountResult(last)});
window.MSFoodPhotoResult10182={last:()=>last,render:()=>last&&mountResult(last)};
})();