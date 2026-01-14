// recovery.js - نظام الاستعادة والتعافي
class SystemRecovery {
    constructor() {
        this.backupInterval = 6 * 60 * 60 * 1000; // 6 ساعات
        this.maxAutoBackups = 10;
        this.init();
    }

    init() {
        this.setupAutoBackup();
        this.setupErrorRecovery();
        this.setupDataValidation();
    }

    setupAutoBackup() {
        // نسخ احتياطي تلقائي كل 6 ساعات
        setInterval(() => {
            this.createAutoBackup();
        }, this.backupInterval);

        // نسخ احتياطي قبل إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            this.createQuickBackup();
        });
    }

    createAutoBackup() {
        const backupData = {
            type: 'auto_backup',
            timestamp: new Date().toISOString(),
            data: {
                session: this.getSessionData(),
                userData: this.getUserData(),
                forms: this.getFormsData()
            }
        };

        this.saveBackup(backupData);
        this.cleanupOldBackups();

        if (window.logger) {
            window.logger.info('Auto backup created', { timestamp: backupData.timestamp });
        }
    }

    createQuickBackup() {
        const criticalData = {
            type: 'quick_backup',
            timestamp: new Date().toISOString(),
            data: {
                sessionId: sessionStorage.getItem('session_id'),
                formData: this.getUnsavedFormData(),
                currentPage: window.location.href
            }
        };

        localStorage.setItem('last_quick_backup', JSON.stringify(criticalData));
    }

    getSessionData() {
        return {
            sessionId: sessionStorage.getItem('session_id'),
            lastActivity: sessionStorage.getItem('last_activity'),
            userPreferences: this.getUserPreferences()
        };
    }

    getUserData() {
        return {
            userId: localStorage.getItem('ara_user_id'),
            chatHistory: JSON.parse(localStorage.getItem('ara_chat_history') || '[]'),
            bookings: JSON.parse(localStorage.getItem('ara_bookings') || '[]')
        };
    }

    getFormsData() {
        // حفظ بيانات النماذج غير المسلمة
        const formsData = {};
        document.querySelectorAll('form').forEach((form, index) => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            if (Object.keys(data).length > 0) {
                formsData[form.id || `form_${index}`] = data;
            }
        });
        return formsData;
    }

    getUnsavedFormData() {
        const unsavedData = {};
        document.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.value && field.value !== field.defaultValue) {
                unsavedData[field.name] = field.value;
            }
        });
        return unsavedData;
    }

    getUserPreferences() {
        const prefs = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_pref_') || key.startsWith('ara_')) {
                prefs[key] = localStorage.getItem(key);
            }
        }
        return prefs;
    }

    saveBackup(backupData) {
        const backups = this.getBackups();
        backups.push(backupData);
        localStorage.setItem('system_backups', JSON.stringify(backups));
    }

    getBackups() {
        try {
            return JSON.parse(localStorage.getItem('system_backups') || '[]');
        } catch {
            return [];
        }
    }

    cleanupOldBackups() {
        const backups = this.getBackups();
        const autoBackups = backups.filter(b => b.type === 'auto_backup');
        
        if (autoBackups.length > this.maxAutoBackups) {
            const recentBackups = autoBackups.slice(-this.maxAutoBackups);
            const otherBackups = backups.filter(b => b.type !== 'auto_backup');
            const allBackups = [...otherBackups, ...recentBackups];
            localStorage.setItem('system_backups', JSON.stringify(allBackups));
        }
    }

    setupErrorRecovery() {
        // استعادة من آخر نسخة عند وجود أخطاء
        window.addEventListener('error', () => {
            setTimeout(() => {
                this.attemptRecovery();
            }, 1000);
        });

        // استعادة عند فشل تحميل الصفحة
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason instanceof TypeError) {
                this.attemptRecovery();
            }
        });
    }

    attemptRecovery() {
        const lastBackup = localStorage.getItem('last_quick_backup');
        if (lastBackup) {
            try {
                const backup = JSON.parse(lastBackup);
                this.restoreFromBackup(backup);
            } catch (e) {
                console.warn('Recovery failed:', e);
            }
        }
    }

    restoreFromBackup(backup) {
        console.log('🔄 Attempting recovery from backup:', backup.timestamp);

        // استعادة بيانات الجلسة
        if (backup.data.sessionId) {
            sessionStorage.setItem('session_id', backup.data.sessionId);
        }

        // استعادة بيانات النماذج
        if (backup.data.formData) {
            this.restoreFormData(backup.data.formData);
        }

        if (window.logger) {
            window.logger.info('System recovery attempted', { 
                timestamp: backup.timestamp,
                success: true 
            });
        }
    }

    restoreFormData(formData) {
        Object.keys(formData).forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field && field.value === '') {
                field.value = formData[fieldName];
            }
        });
    }

    setupDataValidation() {
        // التحقق من سلامة البيانات بانتظام
        setInterval(() => {
            this.validateStoredData();
        }, 30 * 60 * 1000); // كل 30 دقيقة
    }

    validateStoredData() {
        let issues = 0;

        // التحقق من بيانات الحجوزات
        try {
            const bookings = JSON.parse(localStorage.getItem('ara_bookings') || '[]');
            if (!Array.isArray(bookings)) {
                localStorage.setItem('ara_bookings', '[]');
                issues++;
            }
        } catch {
            localStorage.setItem('ara_bookings', '[]');
            issues++;
        }

        // التحقق من سجل المحادثة
        try {
            const chatHistory = JSON.parse(localStorage.getItem('ara_chat_history') || '[]');
            if (!Array.isArray(chatHistory)) {
                localStorage.setItem('ara_chat_history', '[]');
                issues++;
            }
        } catch {
            localStorage.setItem('ara_chat_history', '[]');
            issues++;
        }

        if (issues > 0 && window.logger) {
            window.logger.warn('Data validation found issues', { issuesCount: issues });
        }

        return issues === 0;
    }

    // استعادة كاملة للنظام
    fullSystemRecovery() {
        const backups = this.getBackups();
        const latestBackup = backups[backups.length - 1];
        
        if (latestBackup) {
            this.restoreFromBackup(latestBackup);
            return true;
        }
        return false;
    }

    // إعادة تعيين النظام
    resetSystem() {
        if (confirm('Are you sure you want to reset all system data? This cannot be undone.')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    }

    getRecoveryStatus() {
        const backups = this.getBackups();
        const lastBackup = backups[backups.length - 1];
        const dataValid = this.validateStoredData();

        return {
            hasBackups: backups.length > 0,
            lastBackup: lastBackup?.timestamp,
            totalBackups: backups.length,
            dataIntegrity: dataValid,
            quickBackup: localStorage.getItem('last_quick_backup') !== null
        };
    }
}

if (typeof window !== 'undefined') {
    window.SystemRecovery = SystemRecovery;
}