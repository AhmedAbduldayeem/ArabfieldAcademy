document.addEventListener("DOMContentLoaded", function() {
    // --- 1. CONFIGURATION ---
    const config = {
        logoImage: "images/Logo.jpg",
        logoText: "Arabfield Academy",
        navLinks: [
            { href: "about.html", text: "About Us" },
            { href: "partners-in-success.html", text: "Partners in Success" },
            { href: "programs.html", text: "Our Programs" },
            { href: "pricing.html", text: "Pricing" },
            { href: "blog.html", text: "Blog" },
            { href: "contact.html", text: "Contact" }
        ],
        footerText: "&copy; 2025 Arabfield Academy. All Rights Reserved.",
    };

    // --- 2. HELPER FUNCTION ---
    const isPostPage = window.location.pathname.includes('/posts/');
    function resolvePath(path) {
        if (!path || path.startsWith('http') || path.startsWith('#') || path.startsWith('mailto:')) {
            return path;
        }
        return isPostPage ? `../${path}` : path;
    }

    // --- 3. TEMPLATE INJECTION ---
    async function fetchAndInject(placeholderId, templatePath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;
        try {
            const correctTemplatePath = resolvePath(templatePath);
            const response = await fetch(correctTemplatePath);
            if (!response.ok) {
                console.error(`Failed to fetch template: ${correctTemplatePath}`);
                return;
            }
            placeholder.innerHTML = await response.text();
        } catch (error) {
            console.error(`Failed to load template for #${placeholderId}:`, error);
        }
    }

    // --- 4. PAGE-SPECIFIC LOGIC ---
    function executePageSpecificScripts() {
        const countersSection = document.querySelector('.counters-section');
        if (countersSection && !countersSection.querySelector('.counter.animated')) {
            const counters = countersSection.querySelectorAll('.counter');
            const speed = 200;
            const animateCounters = () => {
                counters.forEach(counter => {
                    if (counter.classList.contains('animated')) return;
                    
                    // استخدام الأرقام الثابتة بدلاً من العشوائية
                    let target;
                    if (counter.parentElement.querySelector('h4').textContent.includes('Teaching Hours')) {
                        target = 7000; // +7000 ساعة
                    } else if (counter.parentElement.querySelector('h4').textContent.includes('Success Stories')) {
                        target = 100; // +100 قصة نجاح
                    } else if (counter.parentElement.querySelector('h4').textContent.includes('Countries Reached')) {
                        target = 50; // +50 دولة
                    } else {
                        target = 98; // نسبة الرضا
                    }
                    
                    let count = 0;
                    const updateCount = () => {
                        const inc = Math.ceil(target / speed);
                        if (count < target) {
                            count = Math.min(count + inc, target);
                            counter.innerText = count.toLocaleString();
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = target.toLocaleString();
                            counter.classList.add('animated');
                        }
                    };
                    updateCount();
                });
            };
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(countersSection);
        }

        // Form validation enhancement
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = '#dc3545';
                    } else {
                        field.style.borderColor = '';
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    alert('Please fill in all required fields.');
                }
            });
        });
    }

    // --- 5. GLOBAL BEHAVIORS SETUP ---
    function setupGlobalBehaviors() {
        const templatePlaceholders = ['#main-header-placeholder', '#main-footer-placeholder', '#fabs-placeholder', '#modal-placeholder'];
        templatePlaceholders.forEach(selector => {
            const container = document.querySelector(selector);
            if (!container) return;
            container.querySelectorAll('a').forEach(el => {
                const originalHref = el.getAttribute('href');
                if (originalHref) {
                    el.href = resolvePath(originalHref);
                }
            });
            container.querySelectorAll('img').forEach(el => {
                const originalSrc = el.getAttribute('src');
                if (originalSrc) {
                    el.src = resolvePath(originalSrc);
                }
                // Add lazy loading to template images
                if (!el.hasAttribute('loading')) {
                    el.setAttribute('loading', 'lazy');
                }
            });
        });

        const navList = document.querySelector('.main-nav ul');
        if (navList) {
            navList.innerHTML = config.navLinks.map(link => {
                const href = resolvePath(link.href);
                const currentPath = window.location.pathname.split('/').pop();
                const linkPath = link.href.split('/').pop();
                const isActive = currentPath === linkPath || (currentPath === '' && linkPath === 'index.html');
                return `<li><a href="${href}" class="${isActive ? 'active' : ''}">${link.text}</a></li>`;
            }).join('');
        }
        const footerText = document.querySelector("#footer-text");
        if (footerText) footerText.innerHTML = config.footerText;

        document.addEventListener('click', function(event) {
            const target = event.target;
            if (target.closest('.mobile-nav-toggle')) {
                document.querySelector('.mobile-nav-toggle')?.classList.toggle('active');
                document.querySelector('.header-right-content')?.classList.toggle('active');
            }
            if (target.closest('#contact-us-link')) {
                event.preventDefault();
                document.getElementById('contact-modal')?.classList.add('active');
            }
            if (target.closest('.modal-close-btn') || target.matches('.contact-modal')) {
                document.getElementById('contact-modal')?.classList.remove('active');
            }
            if (target.closest('#scroll-to-top')) {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        const scrollTopBtn = document.getElementById('scroll-to-top');
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
            });
        }

        // Performance optimization: Preload critical resources
        const criticalLinks = [
            'style.css',
            'app.js',
            'images/Logo.jpg'
        ];
        criticalLinks.forEach(link => {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.href = resolvePath(link);
            preloadLink.as = link.includes('.css') ? 'style' : link.includes('.js') ? 'script' : 'image';
            document.head.appendChild(preloadLink);
        });
    }

    // --- 6. INITIALIZATION ---
    async function initialize() {
        await Promise.all([
            fetchAndInject('main-header-placeholder', 'templates/header.html'),
            fetchAndInject('main-footer-placeholder', 'templates/footer.html'),
            fetchAndInject('fabs-placeholder', 'templates/fabs.html'),
            fetchAndInject('modal-placeholder', 'templates/contact-modal.html')
        ]);
        
        setupGlobalBehaviors();
        executePageSpecificScripts();

        // Dispatch app loaded event
        document.dispatchEvent(new CustomEvent('app-loaded'));
    }

    // --- START THE APP ---
    initialize();
});
