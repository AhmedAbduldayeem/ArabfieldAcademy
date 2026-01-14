// logger.js - نظام السجلات الأمنية
class SecurityLogger {
    constructor() {
        this.logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SECURITY'];
        this.maxLogEntries = 1000;
        this.logs = [];
        this.init();
    }

    init() {
        this.loadLogs();
        this.setupGlobalErrorHandling();
        this.setupUnhandledRejectionHandler();
    }

    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            level,
            message,
            data,
            timestamp,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: sessionStorage.getItem('session_id')
        };

        this.logs.push(logEntry);
        
        // الحفاظ على الحد الأقصى للسجلات
        if (this.logs.length > this.maxLogEntries) {
            this.logs.shift();
        }

        this.saveLogs();
        this.consoleOutput(logEntry);
        
        // إرسال سجلات الأمان للسيرفر
        if (level === 'SECURITY' || level === 'ERROR') {
            this.sendToServer(logEntry);
        }
    }

    consoleOutput(entry) {
        const colors = {
            DEBUG: 'color: gray',
            INFO: 'color: blue',
            WARN: 'color: orange',
            ERROR: 'color: red',
            SECURITY: 'color: purple; font-weight: bold'
        };

        console.log(
            `%c[${entry.level}] ${entry.timestamp}: ${entry.message}`,
            colors[entry.level] || 'color: black',
            entry.data
        );
    }

    debug(message, data = {}) {
        this.log('DEBUG', message, data);
    }

    info(message, data = {}) {
        this.log('INFO', message, data);
    }

    warn(message, data = {}) {
        this.log('WARN', message, data);
    }

    error(message, data = {}) {
        this.log('ERROR', message, data);
    }

    security(message, data = {}) {
        this.log('SECURITY', message, data);
    }

    saveLogs() {
        try {
            localStorage.setItem('security_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.warn('Failed to save logs to localStorage:', error);
        }
    }

    loadLogs() {
        try {
            const saved = localStorage.getItem('security_logs');
            if (saved) {
                this.logs = JSON.parse(saved).slice(-this.maxLogEntries);
            }
        } catch (error) {
            console.warn('Failed to load logs from localStorage:', error);
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.error('Global error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.toString()
            });
        });
    }

    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled promise rejection', {
                reason: event.reason?.toString()
            });
        });
    }

    sendToServer(logEntry) {
        // في بيئة الإنتاج، إرسال السجلات للسيرفر
        if (window.ENVIRONMENT === 'production') {
            fetch('/api/security/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            }).catch(error => {
                console.warn('Failed to send log to server:', error);
            });
        }
    }

    getLogs(level = null, limit = 50) {
        let filteredLogs = this.logs;
        
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }
        
        return filteredLogs.slice(-limit);
    }

    clearOldLogs(days = 7) {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        this.logs = this.logs.filter(log => 
            new Date(log.timestamp).getTime() > cutoffTime
        );
        this.saveLogs();
    }

    generateSecurityReport() {
        const recentLogs = this.getLogs(null, 1000);
        const securityEvents = recentLogs.filter(log => log.level === 'SECURITY');
        const errorEvents = recentLogs.filter(log => log.level === 'ERROR');
        
        return {
            totalEvents: recentLogs.length,
            securityEvents: securityEvents.length,
            errorEvents: errorEvents.length,
            recentSecurityEvents: securityEvents.slice(-10),
            sessionCount: new Set(recentLogs.map(log => log.sessionId)).size,
            timeRange: {
                start: recentLogs[0]?.timestamp,
                end: recentLogs[recentLogs.length - 1]?.timestamp
            }
        };
    }
}

if (typeof window !== 'undefined') {
    window.SecurityLogger = SecurityLogger;
    window.logger = new SecurityLogger();
}