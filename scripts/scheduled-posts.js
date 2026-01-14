// scripts/scheduled-posts.js
// نظام الجدولة التلقائي للمقالات

class PostScheduler {
    constructor() {
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth() + 1;
    }
    
    // تحقق إذا كان المقال مجدول للنشر
    isPostScheduled(postDate) {
        const post = new Date(postDate);
        const today = new Date();
        
        // المقالات الماضية تعرض مباشرة
        if (post <= today) {
            return true;
        }
        
        // المقالات المستقبلية تخفي
        return false;
    }
    
    // عرض المقالات المجدولة فقط
    displayScheduledPosts() {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) return;
        
        const visiblePosts = allPosts.filter(post => this.isPostScheduled(post.date));
        
        if (visiblePosts.length === 0) {
            blogGrid.innerHTML = '<p class="no-posts">No published articles yet. Check back soon!</p>';
            return;
        }
        
        // ترتيب من الأحدث إلى الأقدم
        visiblePosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const postsHTML = visiblePosts.map(post => `
            <article class="blog-post-card">
                <a href="${post.link}"><img loading="lazy" src="${post.image}" alt="${post.alt}" class="blog-post-image"></a>
                <div class="blog-post-info">
                    <span class="blog-category">${post.category}</span>
                    <h2><a href="${post.link}">${post.title}</a></h2>
                    <p>${post.excerpt}</p>
                    <span class="blog-date">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </article>
        `).join('');
        
        blogGrid.innerHTML = `<div class="latest-posts-grid">${postsHTML}</div>`;
    }
    
    // تحقق من المقالات المجدولة للنشر اليوم
    checkForScheduledPosts() {
        const today = new Date().toISOString().split('T')[0];
        const scheduledPosts = allPosts.filter(post => {
            const postDate = new Date(post.date).toISOString().split('T')[0];
            return postDate === today;
        });
        
        if (scheduledPosts.length > 0) {
            console.log(`🎉 Today's scheduled posts published: ${scheduledPosts.length} article(s)`);
            this.displayNotification(scheduledPosts);
        }
    }
    
    // إشعار بالمقالات الجديدة
    displayNotification(posts) {
        const notification = document.createElement('div');
        notification.className = 'schedule-notification';
        notification.innerHTML = `
            <strong>New Article${posts.length > 1 ? 's' : ''} Published!</strong>
            <p>${posts.map(p => p.title).join(', ')}</p>
            <button onclick="this.parentElement.remove()">✕</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// استخدام النظام
document.addEventListener('DOMContentLoaded', function() {
    const scheduler = new PostScheduler();
    
    // عرض المقالات المجدولة
    scheduler.displayScheduledPosts();
    
    // تحقق يومياً (يمكن إضافة إلى service worker)
    scheduler.checkForScheduledPosts();
    
    // تحديث تلقائي كل ساعة
    setInterval(() => {
        scheduler.displayScheduledPosts();
    }, 3600000); // كل ساعة
});

// CSS للإشعارات
const style = document.createElement('style');
style.textContent = `
    .schedule-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-blue);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }
    
    .schedule-notification button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        position: absolute;
        top: 5px;
        right: 5px;
        font-size: 16px;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .no-posts {
        text-align: center;
        padding: 50px;
        color: #666;
        font-size: 1.2rem;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);