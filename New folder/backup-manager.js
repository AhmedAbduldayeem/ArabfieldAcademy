// backup-manager.js - نظام النسخ الاحتياطي والاستعادة
class BackupManager {
    constructor() {
        this.backupKey = 'ara_backup_data';
        this.maxBackups = 5;
        this.autoBackupInterval = 24 * 60 * 60 * 1000; // 24 ساعة
        this.init();
    }

    init() {
        this.setupAutoBackup();
        this.cleanupOldBackups();
    }

    createBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                bookings: this.getBookingsData(),
                chatHistory: this.getChatHistory(),
                userPreferences: this.getUserPreferences(),
                analytics: this.getAnalyticsData()
            }
        };

        this.saveBackup(backupData);
        console.log('📦 Backup created:', backupData.timestamp);
        
        if (window.logger) {
            window.logger.info('Backup created', { timestamp: backupData.timestamp });
        }

        return backupData;
    }

    getBookingsData() {
        try {
            return JSON.parse(localStorage.getItem('ara_bookings') || '[]');
        } catch {
            return [];
        }
    }

    getChatHistory() {
        try {
            return JSON.parse(localStorage.getItem('ara_chat_history') || '[]');
        } catch {
            return [];
        }
    }

    getUserPreferences() {
        return {
            theme: localStorage.getItem('ara_theme') || 'light',
            language: localStorage.getItem('ara_language') || 'en',
            notifications: localStorage.getItem('ara_notifications') || 'enabled'
        };
    }

    getAnalyticsData() {
        try {
            return JSON.parse(localStorage.getItem('ara_analytics') || '{}');
        } catch {
            return {};
        }
    }

    saveBackup(backupData) {
        const backups = this.getBackups();
        backups.push(backupData);
        
        // الحفاظ على الحد الأقصى للنسخ
        if (backups.length > this.maxBackups) {
            backups.shift();
        }
        
        localStorage.setItem(this.backupKey, JSON.stringify(backups));
    }

    getBackups() {
        try {
            return JSON.parse(localStorage.getItem(this.backupKey) || '[]');
        } catch {
            return [];
        }
    }

    restoreBackup(timestamp) {
        const backups = this.getBackups();
        const backup = backups.find(b => b.timestamp === timestamp);
        
        if (!backup) {
            throw new Error('Backup not found');
        }

        // استعادة البيانات
        if (backup.data.bookings) {
            localStorage.setItem('ara_bookings', JSON.stringify(backup.data.bookings));
        }
        
        if (backup.data.chatHistory) {
            localStorage.setItem('ara_chat_history', JSON.stringify(backup.data.chatHistory));
        }
        
        if (backup.data.userPreferences) {
            Object.keys(backup.data.userPreferences).forEach(key => {
                localStorage.setItem(`ara_${key}`, backup.data.userPreferences[key]);
            });
        }

        console.log('🔄 Backup restored:', timestamp);
        
        if (window.logger) {
            window.logger.info('Backup restored', { timestamp });
        }

        return backup;
    }

    setupAutoBackup() {
        setInterval(() => {
            this.createBackup();
        }, this.autoBackupInterval);
    }

    cleanupOldBackups() {
        const backups = this.getBackups();
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        const recentBackups = backups.filter(backup => 
            new Date(backup.timestamp).getTime() > oneWeekAgo
        );
        
        if (recentBackups.length !== backups.length) {
            localStorage.setItem(this.backupKey, JSON.stringify(recentBackups));
        }
    }

    exportBackup() {
        const backup = this.createBackup();
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ara_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    this.saveBackup(backupData);
                    resolve(backupData);
                } catch (error) {
                    reject(new Error('Invalid backup file'));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    getBackupInfo() {
        const backups = this.getBackups();
        return {
            totalBackups: backups.length,
            latestBackup: backups[backups.length - 1]?.timestamp,
            oldestBackup: backups[0]?.timestamp,
            totalSize: JSON.stringify(backups).length
        };
    }
}

if (typeof window !== 'undefined') {
    window.BackupManager = BackupManager;
}