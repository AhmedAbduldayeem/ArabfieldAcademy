// analytics.js - نظام التحليلات الآمن لـ Arabfield Academy
class AdvancedAnalytics {
    constructor() {
        this.trackingEnabled = true;
        this.anonymizeIP = true;
        this.respectDNT = true;
        this.sessionId = this.generateSessionId();
        this.pageStartTime = Date.now();
        this.init();
    }

    init() {
        if (this.shouldTrack()) {
            this.trackPageView();
            this.setupEventTracking();
            this.trackUserEngagement();
            this.setupPerformanceTracking();
        }
    }

    shouldTrack() {
        // احترام طلب عدم التتبع
        if (this.respectDNT && navigator.doNotTrack === "1") {
            return false;
        }
        return this.trackingEnabled;
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    generateUserId() {
        let userId = localStorage.getItem('ara_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ara_user_id', userId);
        }
        return userId;
    }

    trackPageView() {
        const pageData = {
            session_id: this.sessionId,
            user_id: this.generateUserId(),
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language
        };

        this.sendToAnalytics('page_view', pageData);
        console.log('📊 Page View:', pageData);
    }

    trackEvent(category, action, label = null, value = null) {
        const eventData = {
            session_id: this.sessionId,
            user_id: this.generateUserId(),
            category: category,
            action: action,
            label: label,
            value: value,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };

        this.sendToAnalytics('event', eventData);
        console.log('📊 Event:', eventData);
    }

    trackConversion(goal, value = null) {
        const conversionData = {
            session_id: this.sessionId,
            user_id: this.generateUserId(),
            goal: goal,
            value: value,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };

        this.sendToAnalytics('conversion', conversionData);
        console.log('📊 Conversion:', conversionData);
    }

    setupEventTracking() {
        // تتبع النقرات على الروابط المهمة
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a') || e.target.closest('button');
            if (target) {
                let category = 'engagement';
                let action = 'click';
                let label = target.textContent?.trim() || target.getAttribute('aria-label') || target.className;

                if (target.classList.contains('btn-primary')) {
                    category = 'conversion';
                    action = 'primary_button_click';
                } else if (target.classList.contains('btn-secondary')) {
                    category = 'engagement';
                    action = 'secondary_button_click';
                } else if (target.href && target.href.includes('contact')) {
                    category = 'conversion';
                    action = 'contact_click';
                } else if (target.href && target.href.includes('programs')) {
                    category = 'navigation';
                    action = 'programs_click';
                }

                this.trackEvent(category, action, label);
            }
        });

        // تتبع تعبئة النماذج
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.id === 'trial-form') {
                this.trackConversion('free_trial_booking', 1);
            } else if (form.classList.contains('contact-form')) {
                this.trackConversion('contact_form_submission', 1);
            }
        });

        // تتبع التمرير
        let scrollTracked = false;
        window.addEventListener('scroll', () => {
            if (!scrollTracked) {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (scrollPercent > 25) {
                    this.trackEvent('engagement', 'scroll_25_percent');
                    scrollTracked = true;
                }
            }
        }, { passive: true });
    }

    trackUserEngagement() {
        // وقت البقاء في الصفحة
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - this.pageStartTime;
            this.trackEvent('engagement', 'time_spent', null, Math.round(timeSpent / 1000));
        });

        // تفاعل مع الفيديو (إذا وجد)
        const videos = document.querySelectorAll('video');
        videos.forEach((video, index) => {
            video.addEventListener('play', () => {
                this.trackEvent('media', 'video_play', `video_${index}`);
            });
            video.addEventListener('pause', () => {
                this.trackEvent('media', 'video_pause', `video_${index}`);
            });
            video.addEventListener('ended', () => {
                this.trackEvent('media', 'video_complete', `video_${index}`);
            });
        });
    }

    setupPerformanceTracking() {
        // تتبع أداء تحميل الصفحة
        window.addEventListener('load', () => {
            const loadTime = Date.now() - this.pageStartTime;
            this.trackEvent('performance', 'page_load_time', null, loadTime);

            // تتبع أداء الصور
            const images = document.querySelectorAll('img');
            images.forEach((img, index) => {
                if (img.complete) {
                    this.trackImageLoad(img, index);
                } else {
                    img.addEventListener('load', () => this.trackImageLoad(img, index));
                    img.addEventListener('error', () => this.trackEvent('performance', 'image_load_error', img.src));
                }
            });
        });

        // تتبع سرعة الاتصال
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.trackEvent('performance', 'connection_type', connection.effectiveType, connection.downlink);
        }
    }

    trackImageLoad(img, index) {
        const loadTime = Date.now() - this.pageStartTime;
        this.trackEvent('performance', 'image_load', `image_${index}`, loadTime);
    }

    sendToAnalytics(type, data) {
        // في بيئة الإنتاج، يمكن إرسال البيانات لسيرفر التحليلات
        // هنا نستخدم console.log للعرض فقط
        if (window.ENVIRONMENT === 'development') {
            console.log(`📊 Analytics [${type}]:`, data);
        }

        // محاكاة إرسال البيانات (يمكن استبدالها بـ fetch حقيقي)
        this.simulateDataSend(type, data);
    }

    simulateDataSend(type, data) {
        // محاكاة إرسال البيانات بدون تخزين فعلي
        const analyticsData = {
            type: type,
            data: data,
            sent_at: new Date().toISOString()
        };

        // يمكن تفعيل هذا في الإنتاج:
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(analyticsData)
        // });
    }

    // تقارير الأداء
    getPerformanceReport() {
        return {
            session_id: this.sessionId,
            user_id: this.generateUserId(),
            page_load_time: Date.now() - this.pageStartTime,
            pages_visited: JSON.parse(sessionStorage.getItem('visited_pages') || '[]'),
            screen_resolution: `${screen.width}x${screen.height}`,
            color_depth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    // تنظيف البيانات القديمة
    cleanupOldData() {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const visitedPages = JSON.parse(sessionStorage.getItem('visited_pages') || '[]');
        const recentPages = visitedPages.filter(page => page.timestamp > oneMonthAgo);
        sessionStorage.setItem('visited_pages', JSON.stringify(recentPages));
    }
}

// التصدير للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.AdvancedAnalytics = AdvancedAnalytics;
    window.analytics = new AdvancedAnalytics();
}