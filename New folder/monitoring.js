// monitoring.js - مراقبة الأداء والنظام
class SystemMonitor {
    constructor() {
        this.metrics = {
            performance: [],
            errors: [],
            userActions: []
        };
        this.init();
    }

    init() {
        this.startPerformanceMonitoring();
        this.startErrorTracking();
        this.startUserBehaviorTracking();
        this.startResourceMonitoring();
    }

    startPerformanceMonitoring() {
        // تتبع سرعة تحميل الصفحة
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.recordMetric('performance', 'page_load', loadTime);
        });

        // تتبع سرعة الاتصال
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.recordMetric('performance', 'connection_speed', connection.downlink);
        }

        // تتبع استخدام الذاكرة
        if ('memory' in performance) {
            setInterval(() => {
                this.recordMetric('performance', 'memory_usage', performance.memory.usedJSHeapSize);
            }, 30000);
        }
    }

    startErrorTracking() {
        window.addEventListener('error', (e) => {
            this.recordMetric('errors', 'global_error', {
                message: e.message,
                file: e.filename,
                line: e.lineno
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.recordMetric('errors', 'promise_rejection', {
                reason: e.reason?.toString()
            });
        });
    }

    startUserBehaviorTracking() {
        // تتبع الأخطاء في النماذج
        document.addEventListener('invalid', (e) => {
            this.recordMetric('userActions', 'form_validation_error', {
                field: e.target.name,
                type: e.target.type
            });
        }, true);

        // تتبع الروابط المعطلة
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                const link = e.target.href;
                setTimeout(() => {
                    if (window.location.href !== link) {
                        this.recordMetric('userActions', 'broken_link_click', { link });
                    }
                }, 1000);
            }
        });
    }

    startResourceMonitoring() {
        // مراقبة تحميل الصور
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            img.addEventListener('error', () => {
                this.recordMetric('errors', 'image_load_failed', {
                    src: img.src,
                    alt: img.alt
                });
            });

            img.addEventListener('load', () => {
                const loadTime = Date.now() - performance.timing.navigationStart;
                this.recordMetric('performance', `image_${index}_load`, loadTime);
            });
        });
    }

    recordMetric(category, type, data) {
        const metric = {
            type,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.metrics[category].push(metric);

        // الحفاظ على حجم المعقول للسجلات
        if (this.metrics[category].length > 100) {
            this.metrics[category].shift();
        }

        this.saveToStorage();
    }

    saveToStorage() {
        try {
            localStorage.setItem('system_metrics', JSON.stringify(this.metrics));
        } catch (e) {
            console.warn('Failed to save metrics:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('system_metrics');
            if (saved) {
                this.metrics = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load metrics:', e);
        }
    }

    getPerformanceReport() {
        const recentPerf = this.metrics.performance.slice(-20);
        const recentErrors = this.metrics.errors.slice(-10);

        return {
            pageLoadTimes: recentPerf.filter(m => m.type === 'page_load'),
            imageLoadTimes: recentPerf.filter(m => m.type.includes('image')),
            recentErrors: recentErrors,
            totalMetrics: {
                performance: this.metrics.performance.length,
                errors: this.metrics.errors.length,
                userActions: this.metrics.userActions.length
            }
        };
    }

    // تنبيهات الأداء
    checkPerformanceThresholds() {
        const pageLoads = this.metrics.performance.filter(m => m.type === 'page_load');
        const avgLoadTime = pageLoads.reduce((sum, m) => sum + m.data, 0) / pageLoads.length;

        if (avgLoadTime > 3000) { // أكثر من 3 ثواني
            this.triggerAlert('performance', `Slow page load: ${avgLoadTime}ms`);
        }

        const errorRate = this.metrics.errors.length / (this.metrics.performance.length || 1);
        if (errorRate > 0.1) { // أكثر من 10% أخطاء
            this.triggerAlert('errors', `High error rate: ${(errorRate * 100).toFixed(1)}%`);
        }
    }

    triggerAlert(type, message) {
        console.warn(`🚨 ${type.toUpperCase()} ALERT:`, message);
        
        if (window.analytics) {
            window.analytics.trackEvent('monitoring', `${type}_alert`, message);
        }
    }

    // تنظيف البيانات القديمة
    cleanupOldData(days = 7) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        Object.keys(this.metrics).forEach(category => {
            this.metrics[category] = this.metrics[category].filter(metric => 
                new Date(metric.timestamp).getTime() > cutoff
            );
        });
        
        this.saveToStorage();
    }
}

if (typeof window !== 'undefined') {
    window.SystemMonitor = SystemMonitor;
}