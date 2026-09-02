(function () {
    'use strict';

    /* =========================
       DARK MODE
    ========================== */
    const html = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.setAttribute('data-theme', 'dark');
    }

    function toggleDarkMode() {
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        updateDarkIcon();
    }

    function initDarkMode() {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline dark-toggle';
        btn.setAttribute('aria-label', 'Toggle dark mode');
        btn.title = 'Toggle dark mode';
        btn.addEventListener('click', toggleDarkMode);
        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            navButtons.insertBefore(btn, navButtons.firstChild);
        }
        updateDarkIcon();
    }

    function updateDarkIcon() {
        const btn = document.querySelector('.dark-toggle');
        if (!btn) return;
        btn.textContent = html.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    }

    /* =========================
       FORM VALIDATION
    ========================== */
    function initFormValidation() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            let valid = true;

            const nameInput = form.querySelector('input[type="text"]');
            const emailInput = form.querySelector('input[type="email"]');
            const subjectInput = form.querySelectorAll('input[type="text"]')[1];
            const messageInput = form.querySelector('textarea');

            function showError(input, msg) {
                let err = input.parentElement.querySelector('.error-msg');
                if (!err) {
                    err = document.createElement('span');
                    err.className = 'error-msg';
                    input.parentElement.appendChild(err);
                }
                err.textContent = msg;
                input.style.borderColor = '#ef4444';
                valid = false;
            }

            function clearError(input) {
                const err = input.parentElement.querySelector('.error-msg');
                if (err) err.remove();
                input.style.borderColor = '';
            }

            clearError(nameInput);
            clearError(emailInput);
            if (subjectInput) clearError(subjectInput);
            clearError(messageInput);

            if (!nameInput.value.trim()) {
                showError(nameInput, 'Name is required.');
            }
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Email is required.');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
                showError(emailInput, 'Enter a valid email.');
            }
            if (subjectInput && !subjectInput.value.trim()) {
                showError(subjectInput, 'Subject is required.');
            }
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Message is required.');
            }

            if (valid) {
                const btn = form.querySelector('button[type="submit"]');
                btn.textContent = '✓ Message Sent!';
                btn.style.background = '#16a34a';
                form.reset();
                setTimeout(function () {
                    btn.textContent = 'Send Message';
                    btn.style.background = '';
                }, 3000);
            }
        });

        form.querySelectorAll('input, textarea').forEach(function (input) {
            input.addEventListener('input', function () {
                clearError(input);
            });
        });
    }

    /* =========================
       SCROLL REVEAL
    ========================== */
    function initScrollReveal() {
        const targets = document.querySelectorAll(
            '.feature-card, .video-card, .why-card, .testimonial-card, ' +
            '.course-card, .stat-card, .lesson, .course-hero'
        );
        targets.forEach(function (el) {
            el.classList.add('scroll-reveal');
        });

        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* =========================
       ACTIVE NAV LINK
    ========================== */
    function initActiveNav() {
        const links = document.querySelectorAll('.nav-links a');
        if (!links.length) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const linkPage = href.split('/').pop() || href;
            if (linkPage === currentPage || href === currentPage) {
                link.style.color = '#2563EB';
                link.style.fontWeight = '600';
            }
        });
    }

    /* =========================
       SMOOTH SCROLL FOR ANCHORS
    ========================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                    history.pushState(null, null, href);
                }
            });
        });
    }

    /* =========================
       LESSON PROGRESS TRACKER
    ========================== */
    function initLessonProgress() {
        const lessons = document.querySelectorAll('.lesson');
        if (lessons.length === 0) return;

        const coursePage = window.location.pathname.split('/').pop() || 'index.html';
        const storageKey = 'progress_' + coursePage;
        let progress = JSON.parse(localStorage.getItem(storageKey) || '{}');

        const sidebar = document.querySelector('.course-sidebar ul');
        if (sidebar) {
            const count = document.createElement('li');
            count.style.cssText = 'margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;color:#64748B;font-size:.9rem;';
            count.className = 'progress-info';
            sidebar.appendChild(count);
        }

        function updateProgress() {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    const id = entry.target.id;
                    progress[id] = entry.isIntersecting;
                    localStorage.setItem(storageKey, JSON.stringify(progress));
                    updateUI();
                });
            }, { threshold: 0.5 });

            lessons.forEach(function (lesson) {
                observer.observe(lesson);
            });
        }

        function updateUI() {
            const completed = Object.values(progress).filter(Boolean).length;
            const info = document.querySelector('.progress-info');
            if (info) {
                info.textContent = 'Progress: ' + completed + ' / ' + lessons.length + ' lessons';
            }
            document.querySelectorAll('.course-sidebar a').forEach(function (a) {
                const href = a.getAttribute('href');
                if (href && progress[href.substring(1)]) {
                    a.style.color = '#16a34a';
                    a.style.fontWeight = '600';
                }
            });
        }

        if ('IntersectionObserver' in window) {
            updateProgress();
        } else {
            const info = document.querySelector('.progress-info');
            if (info) info.textContent = lessons.length + ' lessons';
        }
    }

    /* =========================
       INIT
    ========================== */
    function init() {
        initDarkMode();
        initFormValidation();
        initScrollReveal();
        initActiveNav();
        initSmoothScroll();
        initLessonProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();