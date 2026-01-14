// security-init.js - التهيئة الرئيسية لأنظمة الحماية
class SecurityInit {
    constructor() {
        this.systems = {};
        this.init();
    }
    
    init() {
        console.log('🔒 Starting security systems initialization...');
        
        // تفعيل أنظمة الحماية بالترتيب
        this.initializeCoreSecurity();
        this.initializeMonitoring();
        this.initializeRecovery();
        this.initializeFormProtection();
        this.initializeSessionManagement();
        
        console.log('✅ All security systems activated successfully');
        
        // بدء المراقبة المستمرة
        this.startContinuousMonitoring();
    }
    
    initializeCoreSecurity() {
        // الأنظمة الأساسية
        this.systems.xssProtection = new XSSProtection();
        this.systems.authMiddleware = new AuthMiddleware();
        this.systems.dataProtection = new DataProtection();
        this.systems.activityMonitor = new ActivityMonitor();
        
        console.log('🔐 Core security systems: XSS Protection, Auth Middleware, Data Protection, Activity Monitor');
    }
    
    initializeMonitoring() {
        // أنظمة المراقبة
        this.systems.systemMonitor = new SystemMonitor();
        this.systems.securityLogger = new SecurityLogger();
        
        // بدء مراقبة الأداء
        setTimeout(() => {
            this.systems.systemMonitor.checkPerformanceThresholds();
        }, 10000);
        
        console.log('📊 Monitoring systems: System Monitor, Security Logger');
    }
    
    initializeRecovery() {
        // أنظمة الاستعادة
        this.systems.systemRecovery = new SystemRecovery();
        this.systems.backupManager = new BackupManager();
        
        console.log('🔄 Recovery systems: System Recovery, Backup Manager');
    }
    
    initializeFormProtection() {
        // حماية جميع النماذج
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                this.systems.authMiddleware.addFormProtection(form);
            });
        });
        
        console.log('📝 Form protection activated for all forms');
    }
    
    initializeSessionManagement() {
        // إدارة الجلسات
        this.systems.sessionManager = new SessionManager();
        this.systems.permissionManager = new PermissionManager();
        
        console.log('👤 Session management: Session Manager, Permission Manager');
    }
    
    startContinuousMonitoring() {
        // مراقبة مستمرة كل دقيقة
        setInterval(() => {
            this.healthCheck();
        }, 60000);
    }
    
    healthCheck() {
        const health = {
            timestamp: new Date().toISOString(),
            systems: {}
        };
        
        // فحص حالة كل نظام
        Object.keys(this.systems).forEach(systemName => {
            health.systems[systemName] = this.systems[systemName] ? 'ACTIVE' : 'INACTIVE';
        });
        
        // فحص التخزين المحلي
        try {
            localStorage.setItem('health_check', 'test');
            localStorage.removeItem('health_check');
            health.storage = 'HEALTHY';
        } catch (e) {
            health.storage = 'FULL';
        }
        
        // فحص الجلسة
        health.session = sessionStorage.getItem('session_id') ? 'ACTIVE' : 'INACTIVE';
        
        console.log('❤️ Security Health Check:', health);
        
        if (window.analytics) {
            window.analytics.trackEvent('security', 'health_check', health);
        }
    }
    
    getSystemStatus() {
        return {
            totalSystems: Object.keys(this.systems).length,
            activeSystems: Object.keys(this.systems).filter(name => this.systems[name]).length,
            systems: Object.keys(this.systems).reduce((acc, name) => {
                acc[name] = this.systems[name] ? 'ACTIVE' : 'INACTIVE';
                return acc;
            }, {})
        };
    }
    
    emergencyShutdown() {
        console.warn('🚨 EMERGENCY SHUTDOWN INITIATED');
        
        // إيقاف جميع الأنظمة
        Object.keys(this.systems).forEach(systemName => {
            this.systems[systemName] = null;
        });
        
        // تنظيف البيانات الحساسة
        sessionStorage.removeItem('form_token');
        sessionStorage.removeItem('session_id');
        
        // تسجيل الحدث
        if (window.logger) {
            window.logger.security('Emergency shutdown executed');
        }
    }
}

// التفعيل التلقائي عند تحميل الصفحة
if (typeof window !== 'undefined') {
    window.SecurityInit = SecurityInit;
    
    // تفعيل بعد تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.securitySystem = new SecurityInit();
        });
    } else {
        window.securitySystem = new SecurityInit();
    }
}