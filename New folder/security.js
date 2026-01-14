// ==========================================
// مكتبة الأمان - Security Library
// الوظيفة: تطبيق الحماية على جميع النماذج
// المكان: js/security.js
// ==========================================

// إعدادات الأمان
const securityConfig = {
    requiredWord: 'أكاديمي',
    timeout: 30000, // 30 ثانية
    maxAttempts: 3
};

// تطبيق الحماية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 تحميل مكتبة الأمان...');
    initializeFormSecurity();
});

function initializeFormSecurity() {
    const forms = document.querySelectorAll('form');
    console.log(`🔍 تم العثور على ${forms.length} نماذج`);
    
    forms.forEach((form, index) => {
        console.log(`🛡️ تطبيق الحماية على النموذج ${index + 1}`);
        
        // إضافة حقل التحقق البشري
        addHumanVerificationField(form);
        
        // إضافة حدث الإرسال
        form.addEventListener('submit', handleFormSubmission);
        
        // إضافة أحداث التحقق في الوقت الحقيقي
        const humanInput = form.querySelector('.human-verification-input');
        if (humanInput) {
            humanInput.addEventListener('input', handleRealTimeValidation);
        }
    });
}

function addHumanVerificationField(form) {
    const verificationHTML = `
        <div class="human-verification">
            <label for="human_check" class="verification-label">
                🔒 تحقق أمني: أكد أنك إنسان
            </label>
            <input 
                type="text" 
                class="human-verification-input"
                id="human_check" 
                name="human_check" 
                placeholder="اكتب الكلمة 'أكاديمي' هنا..." 
                required
            >
            <small class="verification-help">
                هذه الخطوة تحمي الموقع من الهجمات التلقائية والروبوتات
            </small>
            <div class="verification-result"></div>
        </div>
    `;
    
    // إضافة الحقل قبل زر الإرسال
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
        submitButton.insertAdjacentHTML('beforebegin', verificationHTML);
    } else {
        form.insertAdjacentHTML('beforeend', verificationHTML);
    }
    
    console.log('✅ تم إضافة حقل التحقق البشري');
}

function handleRealTimeValidation(event) {
    const input = event.target;
    const verificationDiv = input.closest('.human-verification');
    const resultDiv = verificationDiv.querySelector('.verification-result');
    const userInput = input.value.trim();
    
    if (userInput === securityConfig.requiredWord) {
        resultDiv.innerHTML = '<span class="verification-success">✅ تحقق ناجح! يمكنك الآن إرسال الرسالة</span>';
        input.style.borderColor = '#28a745';
        input.style.backgroundColor = '#f8fff9';
    } else if (userInput !== '') {
        resultDiv.innerHTML = '<span class="verification-error">❌ الكلمة غير صحيحة. تأكد من كتابة "أكاديمي"</span>';
        input.style.borderColor = '#dc3545';
        input.style.backgroundColor = '#fff5f5';
    } else {
        resultDiv.innerHTML = '';
        input.style.borderColor = '#ddd';
        input.style.backgroundColor = '#fff';
    }
}

function handleFormSubmission(event) {
    console.log('🔄 محاولة إرسال النموذج...');
    const form = event.target;
    const humanInput = form.querySelector('.human-verification-input');
    
    if (!humanInput) {
        console.warn('⚠️ لم يتم العثور على حقل التحقق البشري');
        return true;
    }
    
    const userInput = humanInput.value.trim();
    
    // التحقق من الإدخال البشري
    if (userInput !== securityConfig.requiredWord) {
        event.preventDefault();
        console.log('❌ فشل التحقق البشري');
        
        alert('⚠️ يرجى完成 التحقق الأمني أولاً\n\nأكتب كلمة "أكاديمي" في خانة التحقق');
        humanInput.focus();
        humanInput.style.borderColor = '#dc3545';
        humanInput.style.backgroundColor = '#fff5f5';
        return false;
    }
    
    // التحقق من الوقت بين الإرسالات
    const lastSubmit = localStorage.getItem('lastFormSubmit');
    if (lastSubmit) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - parseInt(lastSubmit);
        
        if (timeDiff < securityConfig.timeout) {
            event.preventDefault();
            const remainingTime = Math.ceil((securityConfig.timeout - timeDiff) / 1000);
            console.log(`⏱️ محاولة إرسال سريعة، انتظر ${remainingTime} ثانية`);
            
            alert(`⏱️ يرجى الانتظار ${remainingTime} ثانية قبل إرسال رسالة أخرى\n\nهذا يحمي الموقع من الإساءة`);
            return false;
        }
    }
    
    // حفظ وقت الإرسال
    localStorage.setItem('lastFormSubmit', new Date().getTime().toString());
    console.log('✅ تم إرسال النموذج بنجاح');
    
    // إظهار رسالة نجاح
    alert('🎉 تم إرسال رسالتك بنجاح! شكراً لتواصلك معنا.');
    
    return true;
}

// دالة مساعدة للتحقق من حالة الأمان
function checkSecurityStatus() {
    const forms = document.querySelectorAll('form');
    const securityInfo = {
        totalForms: forms.length,
        protectedForms: 0,
        securityConfig: securityConfig
    };
    
    forms.forEach(form => {
        if (form.querySelector('.human-verification')) {
            securityInfo.protectedForms++;
        }
    });
    
    console.log('🔒 تقرير حالة الأمان:', securityInfo);
    return securityInfo;
}

// جعل الدوال متاحة globally للاختبار
window.checkSecurityStatus = checkSecurityStatus;
window.securityConfig = securityConfig;