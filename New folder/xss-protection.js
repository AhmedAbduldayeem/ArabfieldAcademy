// xss-protection.js - الحماية من هجمات XSS
class XSSProtection {
    constructor() {
        this.allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div'];
        this.allowedAttributes = {
            'a': ['href', 'title', 'target'],
            'span': ['class'],
            'div': ['class']
        };
        this.init();
    }

    init() {
        this.sanitizeDynamicContent();
        this.setupContentSecurityPolicy();
        this.protectAgainstDOMXSS();
    }

    sanitizeInput(input) {
        if (input == null) return '';
        if (typeof input !== 'string') {
            input = String(input);
        }

        // إزالة tags خطيرة
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/expression\(/gi, '')
            .replace(/eval\(/gi, '');

        // السماح ببعض tags الآمنة فقط
        sanitized = this.sanitizeHTML(sanitized);

        return sanitized.trim();
    }

    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // إزالة العناصر غير المسموح بها
        const elements = temp.querySelectorAll('*');
        elements.forEach(element => {
            // إزالة إذا لم يكن من tags المسموح بها
            if (!this.allowedTags.includes(element.tagName.toLowerCase())) {
                element.parentNode.removeChild(element);
                return;
            }

            // إزالة attributes غير مسموح بها
            const allowedAttrs = this.allowedAttributes[element.tagName.toLowerCase()] || [];
            for (let i = element.attributes.length - 1; i >= 0; i--) {
                const attr = element.attributes[i];
                if (!allowedAttrs.includes(attr.name.toLowerCase())) {
                    element.removeAttribute(attr.name);
                }
            }

            // تأمين روابط href
            if (element.tagName.toLowerCase() === 'a' && element.href) {
                if (!this.isSafeURL(element.href)) {
                    element.removeAttribute('href');
                }
            }
        });

        return temp.innerHTML;
    }

    isSafeURL(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
            return allowedProtocols.includes(parsed.protocol) && 
                   !parsed.href.toLowerCase().includes('javascript:') &&
                   !parsed.href.toLowerCase().includes('vbscript:');
        } catch {
            return false;
        }
    }

    sanitizeDynamicContent() {
        // مراقبة إضافة محتوى ديناميكي
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        this.sanitizeNode(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    sanitizeNode(node) {
        if (node.innerHTML) {
            node.innerHTML = this.sanitizeInput(node.innerHTML);
        }

        // تأمين attributes
        for (let i = node.attributes.length - 1; i >= 0; i--) {
            const attr = node.attributes[i];
            if (attr.name.startsWith('on') || attr.value.includes('javascript:')) {
                node.removeAttribute(attr.name);
            }
        }

        // معالجة الأطفال
        node.childNodes.forEach(child => {
            if (child.nodeType === 1) {
                this.sanitizeNode(child);
            }
        });
    }

    setupContentSecurityPolicy() {
        // في تطبيق حقيقي، يتم إضافة CSP عبر meta tag أو header
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' https://unpkg.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            img-src 'self' data: https:;
            font-src 'self' https://fonts.gstatic.com;
            connect-src 'self';
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self' https://formsubmit.co;
        `.replace(/\s+/g, ' ').trim();

        document.head.appendChild(cspMeta);
    }

    protectAgainstDOMXSS() {
        // حماية ضد هجمات DOM-based XSS
        const sensitiveSinks = [
            'innerHTML',
            'outerHTML',
            'insertAdjacentHTML',
            'document.write',
            'document.writeln'
        ];

        sensitiveSinks.forEach(sink => {
            this.overrideSensitiveMethod(sink);
        });
    }

    overrideSensitiveMethod(methodName) {
        const originalMethod = Element.prototype[methodName];
        if (originalMethod) {
            Element.prototype[methodName] = function(...args) {
                // تطبيق التنقية على الوسائط
                const sanitizedArgs = args.map(arg => {
                    if (typeof arg === 'string') {
                        const xss = new XSSProtection();
                        return xss.sanitizeInput(arg);
                    }
                    return arg;
                });
                return originalMethod.apply(this, sanitizedArgs);
            };
        }
    }

    validateUserInput(input, type = 'text') {
        const validators = {
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254,
            phone: (value) => /^\+[1-9]\d{1,14}$/.test(value.trim()),
            name: (value) => {
                const sanitized = this.sanitizeInput(value);
                return sanitized.length >= 2 && 
                       sanitized.length <= 100 &&
                       /^[a-zA-Z\u0600-\u06FF\s\-'.]+$/.test(sanitized);
            },
            text: (value) => {
                const sanitized = this.sanitizeInput(value);
                return sanitized.length > 0 && sanitized.length <= 1000;
            }
        };

        const validator = validators[type] || validators.text;
        return validator(input);
    }
}

if (typeof window !== 'undefined') {
    window.XSSProtection = XSSProtection;
}