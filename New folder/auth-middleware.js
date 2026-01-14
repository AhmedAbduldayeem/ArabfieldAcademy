// auth-middleware.js - نظام المصادقة والصلاحيات
class AuthMiddleware {
    constructor() {
        this.userRoles = ['student', 'teacher', 'admin', 'guest'];
        this.init();
    }

    init() {
        this.setupAuthChecks();
        this.protectSensitiveRoutes();
    }

    setupAuthChecks() {
        // حماية صفحات المعلمين
        if (window.location.pathname.includes('teacher')) {
            this.requireTeacherAuth();
        }

        // حماية النماذج
        this.protectForms();
    }

    requireTeacherAuth() {
        const isAuthenticated = sessionStorage.getItem('teacher_authenticated');
        if (!isAuthenticated && !window.location.pathname.includes('teacher-login')) {
            window.location.href = 'teacher-login.html';
            return false;
        }
        return true;
    }

    protectForms() {
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form[action*="formsubmit.co"]');
            forms.forEach(form => {
                this.addFormProtection(form);
            });
        });
    }

    addFormProtection(form) {
        // إضافة التوكن الأمني
        const token = this.generateFormToken();
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_security_token';
        tokenInput.value = token;
        form.appendChild(tokenInput);

        // إضافة honeypot
        const honeypot = document.createElement('div');
        honeypot.innerHTML = `
            <div style="position: absolute; left: -9999px;" aria-hidden="true">
                <label for="website_url">Leave this field blank</label>
                <input type="text" id="website_url" name="website_url" tabindex="-1" autocomplete="off">
            </div>
        `;
        form.appendChild(honeypot);

        // التحقق قبل الإرسال
        form.addEventListener('submit', (e) => {
            if (!this.validateFormSubmission(form)) {
                e.preventDefault();
                this.handleSuspiciousActivity('Form submission blocked');
            }
        });
    }

    generateFormToken() {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('form_token', token);
        setTimeout(() => sessionStorage.removeItem('form_token'), 300000);
        return token;
    }

    validateFormSubmission(form) {
        // التحقق من honeypot
        const honeypot = form.querySelector('input[name="website_url"]');
        if (honeypot && honeypot.value) {
            return false;
        }

        // التحقق من التوكن
        const token = form.querySelector('input[name="_security_token"]');
        if (token) {
            const storedToken = sessionStorage.getItem('form_token');
            if (!storedToken || storedToken !== token.value) {
                return false;
            }
        }

        // rate limiting
        const formId = form.id || 'unknown_form';
        if (!this.checkRateLimit(formId)) {
            alert('Too many submission attempts. Please try again later.');
            return false;
        }

        return true;
    }

    checkRateLimit(key, maxAttempts = 3, windowMs = 900000) {
        const now = Date.now();
        const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
        const validAttempts = attempts.filter(time => now - time < windowMs);
        
        if (validAttempts.length >= maxAttempts) {
            return false;
        }
        
        validAttempts.push(now);
        localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
        return true;
    }

    handleSuspiciousActivity(reason) {
        console.warn('🚨 Suspicious activity detected:', reason);
        
        if (window.analytics) {
            window.analytics.trackEvent('security', 'suspicious_activity', reason);
        }

        // في بيئة الإنتاج، يمكن إرسال تنبيه
        this.sendSecurityAlert(reason);
    }

    sendSecurityAlert(reason) {
        const alertData = {
            type: 'security_alert',
            reason: reason,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // محاكاة إرسال التنبيه
        console.log('🔒 Security Alert:', alertData);
    }
}

if (typeof window !== 'undefined') {
    window.AuthMiddleware = AuthMiddleware;
}