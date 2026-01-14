// permissions.js - نظام إدارة الصلاحيات
class PermissionManager {
    constructor() {
        this.roles = {
            guest: ['read_public', 'view_programs', 'contact_support'],
            student: ['read_public', 'view_programs', 'book_lessons', 'access_materials', 'contact_support'],
            teacher: ['read_public', 'view_programs', 'manage_lessons', 'access_teacher_portal', 'view_students'],
            admin: ['all']
        };
        this.currentUser = this.getCurrentUser();
    }

    getCurrentUser() {
        // في تطبيق حقيقي، يتم جلب بيانات المستخدم من السيرفر
        return {
            role: 'guest',
            id: null,
            permissions: this.roles.guest
        };
    }

    hasPermission(permission) {
        return this.currentUser.permissions.includes('all') || 
               this.currentUser.permissions.includes(permission);
    }

    requirePermission(permission, redirectUrl = 'index.html') {
        if (!this.hasPermission(permission)) {
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            return false;
        }
        return true;
    }

    protectElements() {
        // إخفاء العناصر بناءً على الصلاحيات
        const protectedElements = document.querySelectorAll('[data-require-permission]');
        protectedElements.forEach(element => {
            const requiredPermission = element.getAttribute('data-require-permission');
            if (!this.hasPermission(requiredPermission)) {
                element.style.display = 'none';
            }
        });
    }

    // حماية صفحات المعلمين
    protectTeacherPages() {
        if (window.location.pathname.includes('teacher') && 
            !window.location.pathname.includes('teacher-login')) {
            this.requirePermission('access_teacher_portal', 'teacher-login.html');
        }
    }

    init() {
        this.protectTeacherPages();
        this.protectElements();
    }
}

if (typeof window !== 'undefined') {
    window.PermissionManager = PermissionManager;
}