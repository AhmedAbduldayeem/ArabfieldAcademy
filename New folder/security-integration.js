// security-integration.js - مبسط
class SecurityIntegration {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🔒 Security Integration Started');
        this.setupBasicProtection();
    }
    
    setupBasicProtection() {
        // حماية بسيطة بدون تعقيد
        this.preventFormSpam();
        this.monitorSuspiciousActivity();
    }
    
    preventFormSpam() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let lastSubmit = 0;
            form.addEventListener('submit', function(e) {
                const now = Date.now();
                if (now - lastSubmit < 2000) { // 2 ثواني
                    e.preventDefault();
                    alert('Please wait before submitting again.');
                    return;
                }
                lastSubmit = now;
            });
        });
    }
    
    monitorSuspiciousActivity() {
        // مراقبة بسيطة للنشاط المشبوه
        let rapidClicks = 0;
        let lastClick = 0;
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastClick < 100) { // أقل من 0.1 ثانية
                rapidClicks++;
                if (rapidClicks > 10) {
                    console.warn('🚨 Rapid clicking detected');
                    rapidClicks = 0;
                }
            } else {
                rapidClicks = 0;
            }
            lastClick = now;
        });
    }
}

if (typeof window !== 'undefined') {
    window.SecurityIntegration = SecurityIntegration;
    document.addEventListener('DOMContentLoaded', () => {
        window.securityIntegration = new SecurityIntegration();
    });
}