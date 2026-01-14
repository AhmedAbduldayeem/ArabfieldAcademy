// rate-limiter.js
class RateLimiter {
    constructor() {
        this.limits = new Map();
        setInterval(() => this.cleanup(), 60000);
    }
    
    check(ip, maxRequests = 100, windowMs = 900000) {
        const now = Date.now();
        const key = `rate_${ip}`;
        let requests = this.limits.get(key) || [];
        requests = requests.filter(time => now - time < windowMs);
        
        if (requests.length >= maxRequests) return false;
        
        requests.push(now);
        this.limits.set(key, requests);
        return true;
    }
}