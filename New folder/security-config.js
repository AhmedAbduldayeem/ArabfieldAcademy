// ==========================================
// ملف إعدادات الأمان - Security Config
// الوظيفة: حماية النماذج من الهجمات والروبوتات
// المكان: security/security-config.js
// ==========================================

const SecurityConfig = {
    // إعدادات التحقق البشري
    humanVerification: {
        requiredWord: 'أكاديمي',
        timeout: 30000, // 30 ثانية بين كل إرسال
        maxAttempts: 5
    },
    
    // إعدادات الحماية
    protection: {
        preventSpam: true,
        enableTimeout: true,
        validateInputs: true
    },
    
    // رسائل التنبيه
    messages: {
        success: '✅ تحقق ناجح! يمكنك الآن إرسال الرسالة',
        failure: '❌ الكلمة غير صحيحة. تأكد من كتابة "أكاديمي"',
        timeout: '⏱️ يرجى الانتظار 30 ثانية بين كل رسالة',
        required: '🔒 هذه الخانة مطلوبة للأمان'
    }
};

// دوال التحقق
function validateHumanInput(inputValue) {
    return inputValue.trim() === SecurityConfig.humanVerification.requiredWord;
}

function checkTimeSinceLastSubmit() {
    const lastSubmit = localStorage.getItem('lastFormSubmit');
    if (!lastSubmit) return true;
    
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - parseInt(lastSubmit);
    
    return timeDiff > SecurityConfig.humanVerification.timeout;
}

// تصدير الإعدادات للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityConfig, validateHumanInput, checkTimeSinceLastSubmit };
}