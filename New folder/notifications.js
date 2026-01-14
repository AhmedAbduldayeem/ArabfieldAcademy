// notifications.js - نظام الإشعارات الذكية
class SmartNotifications {
    constructor() {
        this.notifications = [];
        this.permission = 'default';
        this.checkPermission();
        this.loadNotifications();
    }

    async checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
            if (this.permission === 'default') {
                this.permission = await Notification.requestPermission();
            }
        }
    }

    loadNotifications() {
        // إشعارات افتراضية
        this.notifications = [
            {
                id: 1,
                type: 'welcome',
                title: 'Welcome to Arabfield Academy! 🌟',
                message: 'Start your Arabic learning journey with our native tutors',
                icon: '🎓',
                action: { url: 'programs.html', text: 'Explore Programs' },
                showOnce: true
            },
            {
                id: 2,
                type: 'offer',
                title: 'Limited Time Offer! ⏳',
                message: 'Get 20% off your first package when you book this week',
                icon: '🔥',
                action: { url: 'pricing.html', text: 'View Pricing' },
                conditions: { minPageViews: 2 }
            },
            {
                id: 3,
                type: 'trial',
                title: 'Free Trial Available! 🎯',
                message: 'Book your 30-minute free trial lesson with a native tutor',
                icon: '📚',
                action: { url: 'index.html#register', text: 'Book Trial' },
                trigger: 'scroll_50_percent'
            }
        ];
    }

    showNotification(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification || !this.shouldShowNotification(notification)) return;

        if (this.permission === 'granted') {
            this.showBrowserNotification(notification);
        } else {
            this.showInAppNotification(notification);
        }

        this.markAsShown(notification);
    }

    shouldShowNotification(notification) {
        // التحقق إذا تم عرض الإشعار من قبل
        if (notification.showOnce) {
            const shownNotifications = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
            if (shownNotifications.includes(notification.id)) return false;
        }

        // التحقق من الشروط
        if (notification.conditions) {
            if (notification.conditions.minPageViews) {
                const pageViews = parseInt(localStorage.getItem('page_views') || '0');
                if (pageViews < notification.conditions.minPageViews) return false;
            }
        }

        return true;
    }

    showBrowserNotification(notification) {
        const options = {
            body: notification.message,
            icon: '/images/logo-icon.png',
            badge: '/images/logo-icon.png',
            tag: notification.id,
            requireInteraction: true,
            actions: notification.action ? [
                {
                    action: 'view',
                    title: notification.action.text
                }
            ] : []
        };

        const notif = new Notification(notification.title, options);

        notif.onclick = () => {
            window.focus();
            if (notification.action && notification.action.url) {
                window.location.href = notification.action.url;
            }
            notif.close();
        };

        setTimeout(() => notif.close(), 10000);
    }

    showInAppNotification(notification) {
        const notificationHTML = `
            <div class="in-app-notification" data-notification-id="${notification.id}">
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    ${notification.action ? `
                        <a href="${notification.action.url}" class="notification-action">
                            ${notification.action.text}
                        </a>
                    ` : ''}
                </div>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        // إضافة الإشعار للصفحة
        const container = document.getElementById('notifications-container') || this.createNotificationsContainer();
        container.insertAdjacentHTML('beforeend', notificationHTML);

        // إضافة مستمعي الأحداث
        this.setupNotificationEvents(notification.id);
        
        // إخفاء تلقائي بعد 8 ثواني
        setTimeout(() => {
            this.hideNotification(notification.id);
        }, 8000);
    }

    createNotificationsContainer() {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }

    setupNotificationEvents(notificationId) {
        const notificationEl = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (!notificationEl) return;

        // زر الإغلاق
        const closeBtn = notificationEl.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hideNotification(notificationId));

        // إغلاق عند النقر خارج الإشعار
        notificationEl.addEventListener('click', (e) => {
            if (e.target === notificationEl) {
                this.hideNotification(notificationId);
            }
        });
    }

    hideNotification(notificationId) {
        const notificationEl = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationEl) {
            notificationEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notificationEl.remove(), 300);
        }
    }

    markAsShown(notification) {
        const shownNotifications = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
        if (!shownNotifications.includes(notification.id)) {
            shownNotifications.push(notification.id);
            localStorage.setItem('shown_notifications', JSON.stringify(shownNotifications));
        }
    }

    // إشعارات مبرمجة
    scheduleNotification(notification, delayMs) {
        setTimeout(() => {
            this.showNotification(notification.id);
        }, delayMs);
    }

    // إشعار ترحيب بعد 5 ثواني
    scheduleWelcomeNotification() {
        const welcomeNotification = this.notifications.find(n => n.type === 'welcome');
        if (welcomeNotification) {
            this.scheduleNotification(welcomeNotification, 5000);
        }
    }

    // إشعار العروض بعد 3 مشاهدات للصفحة
    scheduleOfferNotification() {
        const pageViews = parseInt(localStorage.getItem('page_views') || '0');
        if (pageViews >= 3) {
            const offerNotification = this.notifications.find(n => n.type === 'offer');
            if (offerNotification) {
                this.showNotification(offerNotification.id);
            }
        }
    }

    // إشعار عند التمرير 50%
    setupScrollTrigger() {
        let scrollTriggered = false;
        window.addEventListener('scroll', () => {
            if (!scrollTriggered) {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (scrollPercent >= 50) {
                    const trialNotification = this.notifications.find(n => n.trigger === 'scroll_50_percent');
                    if (trialNotification) {
                        this.showNotification(trialNotification.id);
                        scrollTriggered = true;
                    }
                }
            }
        }, { passive: true });
    }
}

// التصدير للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.SmartNotifications = SmartNotifications;
}