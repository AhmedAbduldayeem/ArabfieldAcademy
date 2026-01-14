// session-manager.js - نظام متقدم لإدارة الجلسات
class SessionManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 دقيقة
        this.cleanupInterval = 5 * 60 * 1000; // 5 دقائق
        this.init();
    }

    init() {
        this.startSession();
        this.setupActivityTracking();
        this.startCleanupTimer();
        this.setupVisibilityHandler();
    }

    startSession() {
        if (!sessionStorage.getItem('session_id')) {
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('session_id', sessionId);
            sessionStorage.setItem('session_start', Date.now().toString());
            sessionStorage.setItem('last_activity', Date.now().toString());
            
            this.logSessionEvent('session_started');
        }
    }

    setupActivityTracking() {
        const activities = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activities.forEach(event => {
            document.addEventListener(event, () => {
                sessionStorage.setItem('last_activity', Date.now().toString());
            }, { passive: true });
        });

        // تتبع تغيير الصفحة
        window.addEventListener('beforeunload', () => {
            this.logSessionEvent('session_ended');
        });
    }

    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkSessionValidity();
            }
        });
    }

    checkSessionValidity() {
        const lastActivity = parseInt(sessionStorage.getItem('last_activity') || '0');
        const now = Date.now();
        
        if (now - lastActivity > this.sessionTimeout) {
            this.handleSessionTimeout();
        }
    }

    handleSessionTimeout() {
        this.logSessionEvent('session_timeout');
        
        // تنظيف الجلسة
        sessionStorage.removeItem('form_token');
        sessionStorage.setItem('last_activity', Date.now().toString());
        
        // إشعار المستخدم
        if (document.visibilityState === 'visible') {
            this.showSessionRenewalPrompt();
        }
    }

    showSessionRenewalPrompt() {
        const renew = confirm('Your session has expired for security reasons. Would you like to start a new session?');
        if (renew) {
            sessionStorage.setItem('last_activity', Date.now().toString());
            this.logSessionEvent('session_renewed');
        } else {
            window.location.reload();
        }
    }

    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, this.cleanupInterval);
    }

    cleanupExpiredSessions() {
        const sessionStart = parseInt(sessionStorage.getItem('session_start') || '0');
        const now = Date.now();
        
        // تنظيف الجلسات الأقدم من 24 ساعة
        if (now - sessionStart > (24 * 60 * 60 * 1000)) {
            this.clearSession();
            this.startSession();
        }

        // تنظيف محاولات rate limit القديمة
        this.cleanupOldRateLimits();
    }

    cleanupOldRateLimits() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rate_limit_')) {
                const attempts = JSON.parse(localStorage.getItem(key) || '[]');
                const recentAttempts = attempts.filter(time => time > oneDayAgo);
                
                if (recentAttempts.length === 0) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(recentAttempts));
                }
            }
        }
    }

    clearSession() {
        const sessionId = sessionStorage.getItem('session_id');
        sessionStorage.clear();
        this.logSessionEvent('session_cleared', { sessionId });
    }

    logSessionEvent(event, extraData = {}) {
        const eventData = {
            event: event,
            sessionId: sessionStorage.getItem('session_id'),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            ...extraData
        };

        if (window.analytics) {
            window.analytics.trackEvent('session', event, eventData.sessionId);
        }

        console.log('🔒 Session Event:', eventData);
    }

    getSessionInfo() {
        return {
            id: sessionStorage.getItem('session_id'),
            startTime: sessionStorage.getItem('session_start'),
            lastActivity: sessionStorage.getItem('last_activity'),
            duration: Date.now() - parseInt(sessionStorage.getItem('session_start') || '0')
        };
    }
}

if (typeof window !== 'undefined') {
    window.SessionManager = SessionManager;
}