/* ═══════════════════════════════════════════════════════════
   Reader's Haven — Home Page JavaScript
   home-page.js
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. DROPDOWN INTERACTIVITY ───

    function setupDropdown(btnId, dropdownId) {
        const btn = document.getElementById(btnId);
        const dropdown = document.getElementById(dropdownId);
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('opacity-100');

            // Close all dropdowns first
            document.querySelectorAll('[id^="dropdown-"]').forEach(el => {
                el.classList.remove('opacity-100', 'visible', 'translate-y-0');
                el.classList.add('opacity-0', 'invisible', 'translate-y-2');
            });

            if (!isOpen) {
                dropdown.classList.remove('opacity-0', 'invisible', 'translate-y-2');
                dropdown.classList.add('opacity-100', 'visible', 'translate-y-0');
            }
        });
    }

    setupDropdown('btn-history', 'dropdown-history');
    setupDropdown('btn-genres', 'dropdown-genres');
    setupDropdown('btn-browse', 'dropdown-browse');

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('[id^="dropdown-"]').forEach(el => {
            el.classList.remove('opacity-100', 'visible', 'translate-y-0');
            el.classList.add('opacity-0', 'invisible', 'translate-y-2');
        });
    });


    // ─── 2. SIDEBAR DRAWER TOGGLE ───

    const btnHamburger = document.getElementById('btn-hamburger');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleSidebar(show) {
        if (show) {
            sidebarDrawer.style.right = '0';
            sidebarOverlay.classList.remove('opacity-0', 'invisible');
            sidebarOverlay.classList.add('opacity-100', 'visible');
            document.body.style.overflow = 'hidden';
        } else {
            sidebarDrawer.style.right = '-350px';
            sidebarOverlay.classList.remove('opacity-100', 'visible');
            sidebarOverlay.classList.add('opacity-0', 'invisible');
            document.body.style.overflow = '';
        }
    }

    if (btnHamburger) btnHamburger.addEventListener('click', () => toggleSidebar(true));
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', () => toggleSidebar(false));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    // Close sidebar with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleSidebar(false);
    });


    // --- 3. FILTER TABS ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });


    // ─── 4. HERO CAROUSEL ───

    const carouselData = [
        {
            title: "ATTACK ON TITAN",
            chapter: "Chapter 139: Toward the Tree on That Hill",
            desc: "The final, world-shaking battle reaches its definitive conclusion. A world without walls awaits in the epic finale to Hajime Isayama's masterpiece.",
            status: "COMPLETED",
            genres: ["Action", "Drama", "Mystery"],
            img: "./assets/img/manga/attack_on_titan.jpg"
        },
        {
            title: "SOLO LEVELING",
            chapter: "Chapter 179 (COMPLETED)",
            desc: "The final battle against the Monarchs.<br><br>Sung Jinwoo faces his greatest challenge yet in this epic conclusion.",
            status: "COMPLETED",
            genres: ["Action", "Fantasy", "System"],
            img: "./assets/img/manga/solo_leveling.jpg"
        },
        {
            title: "CHAINSAW MAN",
            chapter: "Chapter 131",
            desc: "Denji's chaotic life continues as new devils appear in the city. High-octane action and dark comedy awaits.",
            status: "ONGOING",
            genres: ["Action", "Supernatural", "Gore"],
            img: "./assets/img/manga/chainsaw_man.jpg"
        }
    ];

    let currentSlide = 0;
    const heroTitle = document.getElementById('hero-title');
    const heroChapter = document.getElementById('hero-chapter');
    const heroDesc = document.getElementById('hero-desc');
    const heroStatus = document.getElementById('hero-status');
    const heroGenres = document.getElementById('hero-genres');
    const heroImage = document.getElementById('hero-image');
    const heroContent = document.getElementById('hero-content');
    const dotsContainer = document.getElementById('hero-dots');
    const dotsMobileContainer = document.getElementById('hero-dots-mobile');

    // Create indicator dots for both desktop and mobile
    [dotsContainer, dotsMobileContainer].forEach(container => {
        if (!container) return;
        carouselData.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${idx === 0 ? 'bg-accent w-5' : 'bg-gray-600 hover:bg-gray-500'}`;
            dot.addEventListener('click', () => goToSlide(idx));
            container.appendChild(dot);
        });
    });

    let fadeTimeout;
    function updateSlideUI() {
        const data = carouselData[currentSlide];

        // Fade out
        if (heroContent) heroContent.style.opacity = '0';
        if (heroImage) heroImage.style.opacity = '0.4';

        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(() => {
            if (heroTitle) heroTitle.textContent = data.title;
            if (heroChapter) {
                heroChapter.innerHTML = `<span class="w-3 h-3 rounded-full bg-accent animate-pulse"></span> ${data.chapter}`;
            }
            if (heroDesc) heroDesc.innerHTML = data.desc;
            if (heroStatus) heroStatus.textContent = data.status;
            if (heroImage) heroImage.src = data.img;
            if (heroImage) heroImage.alt = data.title + ' Cover';

            if (heroGenres) {
                heroGenres.innerHTML = data.genres.map(g =>
                    `<span class="hero-genre-tag px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-300">${g}</span>`
                ).join('');
            }

            // Update dots (both desktop and mobile)
            [dotsContainer, dotsMobileContainer].forEach(container => {
                if (!container) return;
                Array.from(container.children).forEach((dot, idx) => {
                    if (idx === currentSlide) {
                        dot.className = 'w-5 h-2 rounded-full cursor-pointer transition-all duration-300 bg-accent';
                    } else {
                        dot.className = 'w-2 h-2 rounded-full cursor-pointer transition-all duration-300 bg-gray-600 hover:bg-gray-500';
                    }
                });
            });

            // Fade back in
            if (heroContent) heroContent.style.opacity = '1';
            if (heroImage) heroImage.style.opacity = '1';
        }, 220);
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlideUI();
    }

    // Wire up all prev/next buttons (desktop + mobile)
    const prevBtns = [document.getElementById('carousel-prev'), document.getElementById('carousel-prev-mobile')];
    const nextBtns = [document.getElementById('carousel-next'), document.getElementById('carousel-next-mobile')];

    prevBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : carouselData.length - 1;
            updateSlideUI();
        });
    });

    nextBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            currentSlide = currentSlide < carouselData.length - 1 ? currentSlide + 1 : 0;
            updateSlideUI();
        });
    });


    updateSlideUI();


    // ─── 5. MANGA GRID GENERATION ───

    const gridData = [
        { title: "Attack on Titan", ch: "Ch. 139", rating: 5.0, views: "25.5k", isNew: false, img: "./assets/img/manga/attack_on_titan.jpg" },
        { title: "Solo Leveling", ch: "Ch. 179", rating: 4.9, views: "18.2k", isNew: false, img: "./assets/img/manga/solo_leveling.jpg" },
        { title: "Chainsaw Man", ch: "Ch. 131", rating: 4.8, views: "13.1k", isNew: true, img: "./assets/img/manga/chainsaw_man.jpg" },
        { title: "One Piece", ch: "Ch. 1084", rating: 4.5, views: "15.5k", isNew: true, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Jujutsu Kaisen", ch: "Ch. 221", rating: 4.9, views: "12.2k", isNew: false, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Demon Slayer", ch: "Ch. 205", rating: 5.0, views: "22.0k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Blue Lock", ch: "Ch. 215", rating: 4.7, views: "9.2k", isNew: true, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Oshi No Ko", ch: "Ch. 118", rating: 4.9, views: "14.5k", isNew: true, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Spy x Family", ch: "Ch. 81", rating: 4.8, views: "20.1k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Black Clover", ch: "Ch. 358", rating: 4.1, views: "7.8k", isNew: false, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Naruto", ch: "Ch. 700", rating: 4.6, views: "50.1k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Dragon Ball", ch: "Ch. 519", rating: 4.7, views: "45.5k", isNew: false, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Tokyo Ghoul", ch: "Ch. 143", rating: 4.8, views: "12.2k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Death Note", ch: "Ch. 108", rating: 4.9, views: "30.5k", isNew: false, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Haikyuu!!", ch: "Ch. 402", rating: 4.8, views: "11.5k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Boruto", ch: "Ch. 80", rating: 3.5, views: "6.2k", isNew: true, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Black Butler", ch: "Ch. 196", rating: 4.4, views: "4.2k", isNew: true, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Vinland Saga", ch: "Ch. 202", rating: 4.9, views: "8.5k", isNew: false, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Vagabond", ch: "Ch. 327", rating: 5.0, views: "7.1k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Berserk", ch: "Ch. 373", rating: 5.0, views: "25.2k", isNew: true, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "One Punch Man", ch: "Ch. 184", rating: 4.8, views: "22.5k", isNew: true, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Slam Dunk", ch: "Ch. 276", rating: 4.9, views: "10.1k", isNew: false, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Monster", ch: "Ch. 162", rating: 4.9, views: "5.5k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" },
        { title: "Kingdom", ch: "Ch. 758", rating: 4.9, views: "9.2k", isNew: true, img: "./assets/img/manga/manga_cover_fantasy.png" },
        { title: "Hunter x Hunter", ch: "Ch. 400", rating: 4.9, views: "18.8k", isNew: false, img: "./assets/img/manga/manga_cover_action.png" }
    ];

    const gridContainer = document.getElementById('manga-grid');

    function generateStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) html += '<i class="fa-solid fa-star"></i>';
            else if (rating >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
            else html += '<i class="fa-regular fa-star"></i>';
        }
        return html;
    }

    if (gridContainer) {
        gridData.forEach((manga, index) => {
            const newBadge = manga.isNew
                ? `<span class="badge-new absolute top-1.5 right-1.5 text-dark text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow tracking-wide">NEW</span>`
                : '';

            const cardHtml = `
                <div class="manga-card bg-card rounded-lg overflow-hidden cursor-pointer flex flex-col animate-fade-in-up" style="animation-delay: ${index * 80}ms;">
                    <div class="relative w-full aspect-[2/3] overflow-hidden">
                        <img src="${manga.img}" alt="${manga.title}" class="card-img w-full h-full object-cover">
                        ${newBadge}
                    </div>
                    <div class="p-3 sm:p-4 flex flex-col gap-2 flex-grow justify-between">
                        <div>
                            <h4 class="card-title font-bold text-white text-sm truncate transition-colors duration-300">${manga.title}</h4>
                            <span class="text-xs text-muted font-semibold">${manga.ch}</span>
                        </div>
                        <div class="flex justify-between items-center mt-1">
                            <div class="flex items-center gap-1.5">
                                <div class="stars-row flex gap-[1.5px]">
                                    ${generateStars(manga.rating)}
                                </div>
                                <span class="text-white font-bold text-[11px]">${manga.rating.toFixed(1)}</span>
                            </div>
                            <div class="flex items-center gap-1 text-muted text-[10px] font-medium">
                                <i class="fa-regular fa-eye text-[9px]"></i>${manga.views}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            gridContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }



    // --- 6. AUTH & THEME LOGIC ---
    const headerAuthContainer = document.getElementById('header-auth-container');
    const sidebarAuthBtn = document.getElementById('sidebar-auth-btn');
    const authText = document.getElementById('auth-text');
    const authIcon = document.getElementById('auth-icon');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    function updateAuthState() {
        const isLoggedIn = localStorage.getItem('rh_logged_in') === 'true';
        if (isLoggedIn) {
            if (headerAuthContainer) {
                headerAuthContainer.innerHTML = `<a href="#" id="header-logout-btn" class="text-[11px] font-black text-red-400 hover:text-red-500 transition-colors duration-300 tracking-tighter">LOG OUT</a>`;
                const logoutBtn = document.getElementById('header-logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('rh_logged_in');
                        updateAuthState();
                        window.location.reload();
                    });
                }
            }
            if (authText) authText.textContent = 'Log Out';
            if (authIcon) authIcon.className = 'fa-solid fa-right-from-bracket w-5 text-center';
            if (sidebarAuthBtn) {
                sidebarAuthBtn.href = '#';
                sidebarAuthBtn.classList.remove('text-accent', 'hover:bg-accent/10', 'hover:text-accent');
                sidebarAuthBtn.classList.add('text-red-400', 'hover:bg-red-500/10', 'hover:text-red-500');
            }
        } else {
            if (headerAuthContainer) {
                headerAuthContainer.innerHTML = `
                    <a href="login.html" class="text-[11px] font-black text-muted hover:text-accent transition-colors duration-300 tracking-tighter">LOG IN</a>
                    <div class="h-3 w-[1px] bg-gray-800/80"></div>
                    <a href="signup.html" class="text-[11px] font-black text-muted hover:text-accent transition-colors duration-300 tracking-tighter">SIGN UP</a>
                `;
            }
            if (authText) authText.textContent = 'Login / Sign Up';
            if (authIcon) authIcon.className = 'fa-solid fa-user-plus w-5 text-center';
            if (sidebarAuthBtn) {
                sidebarAuthBtn.href = 'login.html';
                sidebarAuthBtn.classList.remove('text-red-400', 'hover:bg-red-500/10', 'hover:text-red-500');
                sidebarAuthBtn.classList.add('text-accent', 'hover:bg-accent/10', 'hover:text-accent');
            }
        }
    }

    if (sidebarAuthBtn) {
        sidebarAuthBtn.addEventListener('click', (e) => {
            const isLoggedIn = localStorage.getItem('rh_logged_in') === 'true';
            if (isLoggedIn) {
                e.preventDefault();
                localStorage.removeItem('rh_logged_in');
                updateAuthState();
                window.location.reload();
            }
        });
    }

    function updateThemeUI(isLight) {
        if (isLight) {
            document.documentElement.classList.add('light-mode');
            if (themeIcon) themeIcon.className = 'fa-solid fa-sun w-5 text-center text-accent';
            if (themeText) themeText.textContent = 'Light Mode Active';
        } else {
            document.documentElement.classList.remove('light-mode');
            if (themeIcon) themeIcon.className = 'fa-solid fa-moon w-5 text-center text-muted';
            if (themeText) themeText.textContent = 'Dark Mode Active';
        }
    }

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isLight = document.documentElement.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeUI(isLight);
        });
    }

    updateAuthState();
    const savedTheme = localStorage.getItem('theme');
    updateThemeUI(savedTheme === 'light');
    // --- 7. PAGE TRANSITIONS ---
    document.body.classList.add('loaded');

    // --- 8. SCROLL INTERACTIONS ---
    const header = document.getElementById('main-header');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 60;

        // Header polish on scroll
        if (header) {
            if (scrolled) {
                header.classList.add('py-2', 'bg-darker/98', 'shadow-2xl', 'border-accent/10');
                header.classList.remove('py-3', 'bg-darker/95', 'border-gray-800/60');
            } else {
                header.classList.add('py-3', 'bg-darker/95', 'border-gray-800/60');
                header.classList.remove('py-2', 'bg-darker/98', 'shadow-2xl', 'border-accent/10');
            }
        }

        // Back to top button visibility
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                backToTop.classList.add('opacity-100', 'translate-y-0');
            } else {
                backToTop.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                backToTop.classList.remove('opacity-100', 'translate-y-0');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) document.body.classList.remove('fade-out');
    });

    document.querySelectorAll('a').forEach(link => {
        const isInternal = link.hostname === window.location.hostname || !link.hostname;
        const isSamePage = link.getAttribute('href')?.startsWith('#');
        const isTargetBlank = link.target === '_blank';

        if (isInternal && !isSamePage && !isTargetBlank) {
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                const destination = link.href;
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = destination; }, 400);
            });
        }
    });

    // --- 4.5 CAROUSEL AUTO-PLAY ---
    let autoPlayInterval = setInterval(() => {
        currentSlide = currentSlide < carouselData.length - 1 ? currentSlide + 1 : 0;
        updateSlideUI();
    }, 5000);

    // Pause auto-play on interaction
    const carouselContainer = document.querySelector('.carousel-inner')?.parentElement;
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(() => {
                currentSlide = currentSlide < carouselData.length - 1 ? currentSlide + 1 : 0;
                updateSlideUI();
            }, 5000);
        });
    }

    // ─── 9. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER) ───
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

    if (scrollRevealElements.length > 0) {
        const revealObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing the target element once it is revealed to optimize performance
                    observer.unobserve(entry.target);
                }
            });
        };

        const revealObserverOptions = {
            root: null, // Default viewport
            threshold: 0.08, // Element will trigger when 8% is visible
            rootMargin: '0px 0px -40px 0px' // Offset bottom trigger for cleaner transition flow
        };

        const revealObserver = new IntersectionObserver(revealObserverCallback, revealObserverOptions);

        scrollRevealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }
});
