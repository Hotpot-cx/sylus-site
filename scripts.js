        // Prevent browser from restoring scroll position on refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        // Force scroll to top immediately
        window.scrollTo(0, 0);
        // Also force after everything loads
        window.addEventListener('load', () => {
            window.scrollTo(0, 0);
        });

        // Navigation scroll effect
        const nav = document.getElementById('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMobile = document.getElementById('navMobile');
        let menuOpen = false;

        navToggle.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navMobile.classList.toggle('open', menuOpen);
            navToggle.setAttribute('aria-expanded', menuOpen);
            navToggle.setAttribute('aria-label', menuOpen ? '关闭菜单' : '打开菜单');
            // Change hamburger to X
            const svg = navToggle.querySelector('svg');
            if (menuOpen) {
                svg.innerHTML = '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>';
            } else {
                svg.innerHTML = '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
            }
        });

        // Close mobile menu on link click
        navMobile.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuOpen = false;
                navMobile.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', '打开菜单');
                const svg = navToggle.querySelector('svg');
                svg.innerHTML = '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
            });
        });

        // Scroll reveal with Intersection Observer
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Add stagger delay for cards in the same grid
                    const parent = entry.target.parentElement;
                    if (parent && (parent.classList.contains('card-grid') || parent.classList.contains('gallery-grid'))) {
                        const siblings = Array.from(parent.querySelectorAll('.reveal'));
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 0.1}s`;
                    }
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));

        // Smooth scroll offset for sticky nav
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navHeight = document.getElementById('nav').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        // ===== Global Scroll Background Transition =====
        // Background mapping: 0=bg_scroll_3(warm), 1=bg_scroll_4(cool), 2=bg_scroll_1, 3=bg_scroll_2
        const globalSlides = document.querySelectorAll('.global-bg-slide');
        const bgSections = document.querySelectorAll('section[data-bg]');

        // Track visibility ratio for each section
        const sectionVisibility = new Map();

        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const idx = parseInt(entry.target.dataset.bg);
                sectionVisibility.set(idx, entry.intersectionRatio);
            });

            // Find the most visible section
            let maxRatio = 0;
            let activeIdx = 0;
            sectionVisibility.forEach((ratio, idx) => {
                if (ratio > maxRatio) {
                    maxRatio = ratio;
                    activeIdx = idx;
                }
            });

            // Activate the corresponding global background slide
            globalSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === activeIdx);
            });
        }, {
            threshold: [0.2, 0.5, 0.8],
            rootMargin: '-15% 0px -15% 0px'
        });

        bgSections.forEach(section => bgObserver.observe(section));

        // ===== 3D Tilt + Glare + Floating Cards =====
        const cardGridEl = document.getElementById('cardGrid');
        let scrollOffset = 0;
        const cardRotations = new Map();

        if (cardGridEl) {
            // Inject glare overlay into each card
            cardGridEl.querySelectorAll('.card').forEach((card, i) => {
                const glare = document.createElement('div');
                glare.className = 'card-glare';
                card.appendChild(glare);
                const baseX = (Math.random() - 0.5) * 4;
                const baseY = (Math.random() - 0.5) * 4;
                cardRotations.set(card, { x: baseX, y: baseY, glareEl: glare });
            });

            // Apply floating rotation on scroll (grid view only)
            function updateCardFloat() {
                if (cardGridEl.classList.contains('stack-view')) return;
                cardGridEl.querySelectorAll('.card').forEach((card, i) => {
                    const base = cardRotations.get(card) || { x: 0, y: 0 };
                    const phase = scrollOffset * 0.3 + i * 0.5;
                    const floatX = Math.sin(phase) * 2;
                    const floatY = Math.cos(phase * 0.7) * 2;
                    card.style.transform = `perspective(900px) rotateX(${base.x + floatY}deg) rotateY(${base.y + floatX}deg)`;
                    card.classList.remove('glare-active');
                });
            }

            // Mouse tilt with glare tracking
            cardGridEl.addEventListener('mousemove', (e) => {
                const isStack = cardGridEl.classList.contains('stack-view');
                // In stack view: don't tilt during swipe, spring-back, or modal open
                if (isStack && (isSwiping || stackSpringLock || document.getElementById('cardModal').classList.contains('active'))) return;
                const cards = isStack
                    ? [cardGridEl.querySelector('.stack-active')].filter(Boolean)
                    : cardGridEl.querySelectorAll('.card');
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenterX = rect.left + rect.width / 2;
                    const cardCenterY = rect.top + rect.height / 2;
                    const mouseX = e.clientX - cardCenterX;
                    const mouseY = e.clientY - cardCenterY;
                    const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
                    const maxDistance = 400;

                    const data = cardRotations.get(card);
                    const base = data || { x: 0, y: 0 };
                    const glareEl = data ? data.glareEl : null;

                    // Stack view cards are positioned by CSS translate(-50%, -55%);
                    // inline transform must include this prefix to keep cards centered
                    const stackPrefix = isStack ? 'translate(-50%, -55%) ' : '';

                    if (distance < maxDistance) {
                        const intensity = Math.max(0, 1 - distance / maxDistance);
                        const tiltY = (mouseX / rect.width) * 16 * intensity;
                        const tiltX = -(mouseY / rect.height) * 14 * intensity;
                        const lift = -12 * intensity;
                        card.style.transform = `${stackPrefix}perspective(900px) rotateX(${base.x + tiltX}deg) rotateY(${base.y + tiltY}deg) translateY(${lift}px) translateZ(${8 * intensity}px)`;
                        card.classList.add('glare-active');

                        if (glareEl) {
                            const pctX = (e.clientX - rect.left) / rect.width * 100;
                            const pctY = (e.clientY - rect.top) / rect.height * 100;
                            glareEl.style.background = `radial-gradient(
                                ellipse at ${pctX}% ${pctY}%,
                                rgba(255, 255, 255, ${0.22 * intensity}) 0%,
                                rgba(255, 255, 255, ${0.08 * intensity}) 35%,
                                transparent 60%
                            )`;
                        }
                    } else {
                        const phase = scrollOffset * 0.3 + Array.from(cardGridEl.children).indexOf(card) * 0.5;
                        card.style.transform = `${stackPrefix}perspective(900px) rotateX(${base.x + Math.cos(phase * 0.7) * 2}deg) rotateY(${base.y + Math.sin(phase) * 2}deg)`;
                        card.classList.remove('glare-active');
                    }
                });
            });

            cardGridEl.addEventListener('mouseleave', () => {
                if (cardGridEl.classList.contains('stack-view')) {
                    const activeCard = cardGridEl.querySelector('.stack-active');
                    if (activeCard) {
                        activeCard.classList.remove('glare-active');
                        activeCard.style.removeProperty('transform');
                        void activeCard.offsetWidth;
                    }
                } else {
                    updateCardFloat();
                }
            });

            window.addEventListener('scroll', () => {
                scrollOffset = window.scrollY;
            }, { passive: true });

            if (!cardGridEl.classList.contains('stack-view')) {
                updateCardFloat();
            }
        }

        // ===== Stack View Toggle =====
        const viewGridBtn = document.getElementById('viewGrid');
        const viewStackBtn = document.getElementById('viewStack');
        const cardGridForView = document.getElementById('cardGrid');
        let currentView = 'grid';
        let stackIndex = 0;
        let isSwiping = false;
        let swipeStartX = 0, swipeStartY = 0, swipeCurrentX = 0;
        let stackSpringLock = false; // Prevents tilt from fighting spring-back

        function switchView(view) {
            currentView = view;
            if (view === 'stack') {
                viewGridBtn.classList.remove('active');
                viewStackBtn.classList.add('active');
                cardGridForView.classList.add('stack-view');
                stackIndex = 0;
                updateStack();
            } else {
                viewStackBtn.classList.remove('active');
                viewGridBtn.classList.add('active');
                cardGridForView.classList.remove('stack-view');
                // Reset all cards
                cardGridForView.querySelectorAll('.card').forEach(c => {
                    c.className = c.className.replace(/stack-\S+/g, '').trim();
                    if (!c.classList.contains('card')) c.classList.add('card');
                    c.style.transform = '';
                    c.style.opacity = '';
                    c.style.transition = '';
                });
                // Re-apply 3D float in grid view
                if (typeof updateCardFloat === 'function') {
                    setTimeout(() => updateCardFloat(), 50);
                }
            }
        }

        function updateStack() {
            const cards = cardGridForView.querySelectorAll('.card');
            cards.forEach(c => {
                c.className = c.className.replace(/stack-\S+/g, '').trim();
                if (!c.classList.contains('card')) c.classList.add('card');
                c.classList.add('stack-buried');
                c.style.removeProperty('transform');
                c.style.removeProperty('opacity');
                c.style.removeProperty('transition');
            });

            if (cards.length === 0 || stackIndex >= cards.length) return;

            // Defer class application to next frame so CSS resets properly
            requestAnimationFrame(() => {
                if (cards[stackIndex]) {
                    cards[stackIndex].classList.remove('stack-buried');
                    cards[stackIndex].classList.add('stack-active');
                }
                for (let i = 1; i <= 3; i++) {
                    if (cards[stackIndex + i]) {
                        cards[stackIndex + i].classList.remove('stack-buried');
                        cards[stackIndex + i].classList.add('stack-behind-' + i);
                    }
                }
                const progressEl = document.getElementById('stackProgress');
                if (progressEl) {
                    progressEl.textContent = (stackIndex + 1) + ' / ' + cards.length;
                }
            });
        }

        function swipeCard(direction) {
            const cards = cardGridForView.querySelectorAll('.card');
            if (stackIndex >= cards.length) return;
            const activeCard = cards[stackIndex];

            stackSpringLock = true;
            if (direction === 'left') {
                activeCard.classList.add('stack-swipe-left');
                setTimeout(() => {
                    activeCard.classList.remove('stack-swipe-left');
                    stackIndex++;
                    updateStack();
                    stackSpringLock = false;
                }, 350);
            } else if (direction === 'right') {
                activeCard.classList.add('stack-swipe-right');
                setTimeout(() => {
                    activeCard.classList.remove('stack-swipe-right');
                    // Open modal
                    if (typeof openModal === 'function') openModal(activeCard);
                    stackIndex++;
                    updateStack();
                    stackSpringLock = false;
                }, 350);
            }
        }

        // Touch/mouse events for stack view
        if (cardGridForView) {
            cardGridForView.addEventListener('mousedown', (e) => {
                if (currentView !== 'stack') return;
                isSwiping = true;
                swipeStartX = e.clientX;
                swipeStartY = e.clientY;
                swipeCurrentX = e.clientX;
                const activeCard = cardGridForView.querySelector('.stack-active');
                if (activeCard) {
                    activeCard.classList.add('stack-swiping');
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!isSwiping || currentView !== 'stack') return;
                swipeCurrentX = e.clientX;
                const dx = swipeCurrentX - swipeStartX;
                const activeCard = cardGridForView.querySelector('.stack-active');
                if (activeCard) {
                    const rotate = dx * 0.05;
                    const offsetX = dx;
                    activeCard.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-55% - ${Math.abs(dx) * 0.1}px)) rotate(${rotate}deg) scale(${Math.max(0.7, 1 - Math.abs(dx) * 0.001)})`;
                    activeCard.style.opacity = Math.max(0.3, 1 - Math.abs(dx) * 0.002);
                }
            });

            window.addEventListener('mouseup', () => {
                if (!isSwiping || currentView !== 'stack') return;
                isSwiping = false;
                const activeCard = cardGridForView.querySelector('.stack-active');
                if (activeCard) {
                    activeCard.classList.remove('stack-swiping');
                }
                const dx = swipeCurrentX - swipeStartX;
                if (dx < -60) {
                    swipeCard('left');
                } else if (dx > 60) {
                    swipeCard('right');
                } else {
                    // Smooth spring-back with transition
                    if (activeCard) {
                        stackSpringLock = true;
                        activeCard.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
                        activeCard.style.removeProperty('transform');
                        activeCard.style.removeProperty('opacity');
                        void activeCard.offsetWidth;
                        // Clean up transition and unlock after it completes
                        setTimeout(() => {
                            activeCard.style.removeProperty('transition');
                            stackSpringLock = false;
                        }, 320);
                    }
                }
            });

            // Touch support
            cardGridForView.addEventListener('touchstart', (e) => {
                if (currentView !== 'stack') return;
                isSwiping = true;
                swipeStartX = e.touches[0].clientX;
                swipeStartY = e.touches[0].clientY;
                swipeCurrentX = e.touches[0].clientX;
                const activeCard = cardGridForView.querySelector('.stack-active');
                if (activeCard) activeCard.classList.add('stack-swiping');
            }, { passive: true });

            cardGridForView.addEventListener('touchmove', (e) => {
                if (!isSwiping || currentView !== 'stack') return;
                swipeCurrentX = e.touches[0].clientX;
                const dx = swipeCurrentX - swipeStartX;
                const activeCard = cardGridForView.querySelector('.stack-active');
                if (activeCard) {
                    const rotate = dx * 0.05;
                    activeCard.style.transform = `translate(calc(-50% + ${dx}px), calc(-55% - ${Math.abs(dx) * 0.1}px)) rotate(${rotate}deg) scale(${Math.max(0.7, 1 - Math.abs(dx) * 0.001)})`;
                    activeCard.style.opacity = Math.max(0.3, 1 - Math.abs(dx) * 0.002);
                }
            }, { passive: true });

            cardGridForView.addEventListener('touchend', () => {
                if (!isSwiping || currentView !== 'stack') return;
                isSwiping = false;
                const activeCard = cardGridForView.querySelector('.stack-active');
                if (activeCard) activeCard.classList.remove('stack-swiping');
                const dx = swipeCurrentX - swipeStartX;
                if (dx < -50) {
                    swipeCard('left');
                } else if (dx > 50) {
                    swipeCard('right');
                } else {
                    if (activeCard) {
                        stackSpringLock = true;
                        activeCard.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
                        activeCard.style.removeProperty('transform');
                        activeCard.style.removeProperty('opacity');
                        void activeCard.offsetWidth;
                        setTimeout(() => {
                            activeCard.style.removeProperty('transition');
                            stackSpringLock = false;
                        }, 320);
                    }
                }
            });
        }

        viewGridBtn.addEventListener('click', () => switchView('grid'));
        viewStackBtn.addEventListener('click', () => switchView('stack'));

        // ===== Card Sorting =====
        const cardGrid = document.getElementById('cardGrid');
        const sortBtns = document.querySelectorAll('.sort-btn');

        function sortCards(criteria, dir) {
            const cards = Array.from(cardGrid.querySelectorAll('.card'));
            const isAsc = dir === 'asc';
            
            cards.sort((a, b) => {
                if (criteria === 'date') {
                    const dateA = a.dataset.release;
                    const dateB = b.dataset.release;
                    return isAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
                } else if (criteria === 'rarity') {
                    const rarityA = parseInt(a.dataset.rarity);
                    const rarityB = parseInt(b.dataset.rarity);
                    return isAsc ? rarityA - rarityB : rarityB - rarityA;
                }
                return 0;
            });

            cards.forEach(card => cardGrid.appendChild(card));
        }

        function updateArrow(btn, dir) {
            const arrow = btn.querySelector('.sort-dir');
            if (dir === 'asc') {
                arrow.classList.add('flip');
            } else {
                arrow.classList.remove('flip');
            }
        }

        // Sort newest first, then init stack view
        sortCards('date', 'desc');
        switchView('grid');

        // Add stack hint + progress to stack view
        const stackHintHTML = '<div class="stack-hint"><span class="stack-hint-item"><span class="stack-hint-arrow">◀</span> 左滑看下一张</span><span class="stack-hint-item">右滑看详情 <span class="stack-hint-arrow">▶</span></span></div>';
        const stackProgressHTML = '<div class="stack-progress" id="stackProgress"></div>';
        cardGridForView.insertAdjacentHTML('beforeend', stackHintHTML);
        cardGridForView.insertAdjacentHTML('beforeend', stackProgressHTML);

        sortBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const isAlreadyActive = btn.classList.contains('active');
                const criteria = btn.dataset.criteria;
                let dir = btn.dataset.dir;

                if (isAlreadyActive) {
                    // Toggle direction
                    dir = dir === 'desc' ? 'asc' : 'desc';
                    btn.dataset.dir = dir;
                } else {
                    // Switch to this button, reset to default desc
                    sortBtns.forEach(b => {
                        b.classList.remove('active');
                        b.dataset.dir = 'desc';
                        updateArrow(b, 'desc');
                    });
                    btn.classList.add('active');
                    dir = 'desc';
                    btn.dataset.dir = 'desc';
                }

                updateArrow(btn, dir);
                sortCards(criteria, dir);
                // Refresh stack view if in stack mode
                if (cardGridForView.classList.contains('stack-view')) {
                    stackIndex = 0;
                    updateStack();
                }
            });
        });

        // ===== AI Works Carousel =====
        const aiCarousel = document.getElementById('aiCarousel');
        if (aiCarousel) {
            const track = document.getElementById('aiCarouselTrack');
            const items = track.querySelectorAll('.ai-item');
            const prevBtn = document.getElementById('aiCarouselPrev');
            const nextBtn = document.getElementById('aiCarouselNext');
            const dotsContainer = document.getElementById('aiCarouselDots');
            let currentIndex = 0;
            let isDragging = false;
            let startX = 0;
            let dragOffset = 0;

            // Create dots
            items.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'ai-carousel-dot';
                dot.setAttribute('aria-label', '第' + (i + 1) + '张');
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
            const dots = dotsContainer.querySelectorAll('.ai-carousel-dot');

            function updateCarousel(animate = true) {
                if (!animate) track.classList.add('dragging');

                items.forEach((item, i) => {
                    item.classList.remove('ai-active', 'ai-near');
                    if (i === currentIndex) {
                        item.classList.add('ai-active');
                    } else if (i === currentIndex - 1 || i === currentIndex + 1) {
                        item.classList.add('ai-near');
                    }
                });

                // Calculate offset to center active card
                const containerWidth = aiCarousel.offsetWidth;
                const activeCard = items[currentIndex];
                const cardWidth = activeCard ? activeCard.offsetWidth : 340;
                const cardMargin = 16;
                const totalCardWidth = cardWidth + cardMargin * 2;

                const offset = containerWidth / 2 - totalCardWidth / 2 - (currentIndex * totalCardWidth) + dragOffset;

                track.style.transform = `translateX(${offset}px)`;

                // Update dots
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });

                if (!animate) {
                    void track.offsetWidth;
                    track.classList.remove('dragging');
                }
            }

            function goTo(index) {
                if (isDragging) return;
                currentIndex = Math.max(0, Math.min(index, items.length - 1));
                dragOffset = 0;
                updateCarousel();
            }

            function goPrev() { goTo(currentIndex - 1); }
            function goNext() { goTo(currentIndex + 1); }

            prevBtn.addEventListener('click', goPrev);
            nextBtn.addEventListener('click', goNext);

            // Mouse drag
            track.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                dragOffset = 0;
                track.classList.add('dragging');
                track.style.cursor = 'grabbing';
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                dragOffset = e.clientX - startX;
                updateCarousel(false);
            });

            window.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                track.style.cursor = '';

                const threshold = 80;
                if (dragOffset < -threshold) {
                    goTo(Math.min(currentIndex + 1, items.length - 1));
                } else if (dragOffset > threshold) {
                    goTo(Math.max(currentIndex - 1, 0));
                } else {
                    dragOffset = 0;
                    updateCarousel();
                }
            });

            // Touch support
            track.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = e.touches[0].clientX;
                dragOffset = 0;
                track.classList.add('dragging');
            }, { passive: true });

            track.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                dragOffset = e.touches[0].clientX - startX;
                updateCarousel(false);
            }, { passive: true });

            track.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                const threshold = 60;
                if (dragOffset < -threshold) {
                    goTo(Math.min(currentIndex + 1, items.length - 1));
                } else if (dragOffset > threshold) {
                    goTo(Math.max(currentIndex - 1, 0));
                } else {
                    dragOffset = 0;
                    updateCarousel();
                }
            });

            // Scroll wheel
            aiCarousel.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.deltaX > 30 || e.deltaY > 30) {
                    goNext();
                } else if (e.deltaX < -30 || e.deltaY < -30) {
                    goPrev();
                }
            }, { passive: false });

            // Keyboard navigation
            aiCarousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') goPrev();
                if (e.key === 'ArrowRight') goNext();
            });

            // Make carousel focusable for keyboard nav
            aiCarousel.setAttribute('tabindex', '0');

            // Initial setup
            requestAnimationFrame(() => {
                updateCarousel();
            });

            // Recalculate when carousel enters viewport
            const carouselObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        dragOffset = 0;
                        updateCarousel();
                    }
                });
            }, { threshold: 0.2 });
            carouselObserver.observe(aiCarousel);

            // Recalculate on resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    dragOffset = 0;
                    updateCarousel();
                }, 150);
            });
        }

        // ===== Card Modal =====
        const cardModal = document.getElementById('cardModal');
        const modalClose = document.getElementById('modalClose');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalRelease = document.getElementById('modalRelease');
        const modalStars = document.getElementById('modalStars');
        const modalRerun = document.getElementById('modalRerun');
        const modalType = document.getElementById('modalType');
        const modalStory = document.getElementById('modalStory');

        function openModal(card) {
            const name = card.dataset.cardName;
            const release = card.dataset.release;
            const rarity = parseInt(card.dataset.rarity);
            const rerun = card.dataset.rerun;
            const story = card.dataset.story;
            const image = card.dataset.image;

            // Determine card type from tags
            const tagEl = card.querySelector('.card-tag');
            const typeText = tagEl ? tagEl.textContent : '-';

            modalImage.src = image;
            modalImage.alt = name;
            modalTitle.textContent = name;
            modalRelease.textContent = release;
            modalRerun.textContent = rerun;
            modalType.textContent = typeText;
            modalStory.textContent = story;

            // Generate stars
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rarity) {
                    starsHtml += '<svg class="modal-star" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>';
                } else {
                    starsHtml += '<svg class="modal-star empty" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>';
                }
            }
            modalStars.innerHTML = starsHtml;

            // Rerun styling
            if (rerun.includes('复刻') || rerun.includes('常驻')) {
                modalRerun.className = 'modal-meta-value modal-rerun-yes';
            } else {
                modalRerun.className = 'modal-meta-value modal-rerun-no';
            }

            cardModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            cardModal.classList.remove('active');
            document.body.style.overflow = '';
            stackSpringLock = false; // Unlock tilt after modal closes
        }

        // Attach click listeners to all cards with data attributes
        document.querySelectorAll('.card[data-card-name]').forEach(card => {
            card.addEventListener('click', () => openModal(card));
        });

        modalClose.addEventListener('click', closeModal);

        cardModal.addEventListener('click', (e) => {
            if (e.target === cardModal) {
                closeModal();
            }
        });

        // Keyboard: Enter to open card modal, Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cardModal.classList.contains('active')) {
                closeModal();
            }
            // Enter on focused card opens modal (grid view)
            if (e.key === 'Enter' && !cardModal.classList.contains('active')) {
                const focused = document.activeElement;
                if (focused && focused.classList.contains('card') && focused.dataset.cardName) {
                    openModal(focused);
                }
            }
        });

        // Make cards focusable for keyboard navigation
        document.querySelectorAll('.card[data-card-name]').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', '查看 ' + card.dataset.cardName + ' 详情');
        });

        // ===== Mephisto Mascot =====
        const mascot = document.getElementById('mascot');
        const mascotIcon = document.getElementById('mascotIcon');
        const mascotSpeech = document.getElementById('mascotSpeech');

        // Target position (mouse)
        let targetX = window.innerWidth - 100;
        let targetY = window.innerHeight - 100;
        // Current smoothed position
        let currentX = targetX;
        let currentY = targetY;
        // Show mascot after first interaction
        let mascotVisible = false;

        // Section dialogue map
        const dialogueMap = {
            home: '嘎！欢迎来到 N109 区！我是梅菲斯特～',
            cards: '嘎嘎！这里收录了老大从上线到现在的所有卡面！',
            story: '嘎嘎！这是秦彻老大的故事！暗点首领可不是好惹的！',
            stories: '嘎！这些剧情每一段我都见证了，那天的风很大……',
            birthday: '嘎嘎！！老大的生日派对！蛋糕分我一块！',
            mephisto: '嘎？！这页写的不就是我吗！等等…还有那两个小鬼？！',
            fanart: '嘎嘎！有人在画老大！让我看看帅不帅！',
            schedule: '嘎嘎！新卡池预测来了！猎人，你的钻石准备好了吗？',
            diy: '嘎！拼豆、吧唧、痛包……小狸花们动起手来，本鸦给你们加油！',
            frontline: '嘎！前线速报！让本鸦看看老大又有什么新动向！',
            discuss: '嘎！在聊什么？让本鸦也听听！'
        };

        let lastSection = '';
        let speechTimer = null;

        function showSpeech(text) {
            if (!text) return;
            mascotSpeech.textContent = text;
            mascotSpeech.classList.add('show');
            // Auto-hide after 4.5 seconds
            if (speechTimer) clearTimeout(speechTimer);
            speechTimer = setTimeout(() => {
                mascotSpeech.classList.remove('show');
            }, 4500);
        }

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            if (!mascotVisible) {
                mascotVisible = true;
                mascot.style.opacity = '1';
                currentX = e.clientX;
                currentY = e.clientY;
            }
            targetX = e.clientX;
            targetY = e.clientY;
        });

        // Show mascot on touch too
        document.addEventListener('touchmove', (e) => {
            if (!mascotVisible) {
                mascotVisible = true;
                mascot.style.opacity = '1';
            }
            targetX = e.touches[0].clientX;
            targetY = e.touches[0].clientY;
        }, { passive: true });

        // Detect section changes via scroll
        let scrollDebounceTimer = null;
        function detectCurrentSection() {
            let bestSection = '';
            let bestRatio = 0;

            document.querySelectorAll('section[id]').forEach(section => {
                if (!dialogueMap[section.id]) return;
                const rect = section.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                // Calculate how much of the section is in the viewport
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(viewHeight, rect.bottom);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                const sectionHeight = rect.height;
                const ratio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;

                // Prefer section that occupies significant portion of viewport
                if (ratio > bestRatio && visibleHeight > 100) {
                    bestRatio = ratio;
                    bestSection = section.id;
                }
            });

            if (bestSection && bestSection !== lastSection) {
                lastSection = bestSection;
                showSpeech(dialogueMap[bestSection]);
            }
        }

        // Initial detection after page load
        setTimeout(detectCurrentSection, 500);

        // Scroll-based detection with debounce
        window.addEventListener('scroll', () => {
            if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
            scrollDebounceTimer = setTimeout(detectCurrentSection, 300);
        }, { passive: true });

        // Initial state: faintly visible, becomes fully visible on mouse move
        mascot.style.opacity = '0.85';
        mascot.style.left = targetX + 'px';
        mascot.style.top = targetY + 'px';

        // Smooth follow animation loop — pauses when page is hidden, clamps to edges
        function animateMascot() {
            if (mascotVisible && !document.hidden) {
                const ease = 0.08;
                currentX += (targetX - currentX) * ease;
                currentY += (targetY - currentY) * ease;
                // Clamp to keep mascot on screen and away from BGM button
                const iconSize = window.innerWidth < 640 ? 40 : 56;
                const marginX = iconSize + 16;
                const marginTop = 80;
                const marginBottom = window.innerWidth < 640 ? 140 : 120;
                const clampedX = Math.min(Math.max(currentX, marginX), window.innerWidth - marginX);
                const clampedY = Math.min(Math.max(currentY, marginTop), window.innerHeight - marginBottom);
                mascot.style.left = (clampedX + 16) + 'px';
                mascot.style.top = (clampedY - 80) + 'px';
            }
            requestAnimationFrame(animateMascot);
        }

        // Pause mascot when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                mascotVisible = false;
            }
        });

        // Click mascot → scroll to top
        mascot.addEventListener('click', (e) => {
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show back-to-top indicator when scrolled down
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                mascot.classList.add('back-to-top');
            } else {
                mascot.classList.remove('back-to-top');
            }
        }, { passive: true });

        // Mobile: hide mascot to avoid clutter
        if (window.innerWidth < 640) {
            mascotIcon.style.width = '40px';
            mascotIcon.style.height = '40px';
        }

        // ===== Preheat Bar (inside nav) =====
        const preheatBar = document.getElementById('preheatBar');
        const preheatClose = document.getElementById('preheatClose');

        if (preheatClose && preheatBar) {
            const dismissed = localStorage.getItem('preheatDismissed');
            if (dismissed && (Date.now() - parseInt(dismissed)) < 12 * 60 * 60 * 1000) {
                preheatBar.classList.add('hidden');
            }
            preheatClose.addEventListener('click', () => {
                preheatBar.classList.add('hidden');
                localStorage.setItem('preheatDismissed', Date.now().toString());
            });
        }

        animateMascot();

        // ===== BGM Player =====
        const bgmBtn = document.getElementById('bgmBtn');
        const bgmPanel = document.getElementById('bgmPanel');
        const bgmPanelClose = document.getElementById('bgmPanelClose');
        const bgmPlay = document.getElementById('bgmPlay');
        const bgmPrev = document.getElementById('bgmPrev');
        const bgmNext = document.getElementById('bgmNext');
        const bgmVolume = document.getElementById('bgmVolume');
        const bgmTrackName = document.getElementById('bgmTrackName');
        const bgmTrackArtist = document.getElementById('bgmTrackArtist');

        // Playlist – replace with your actual .mp3 files in /music/ folder
        const playlist = [
            { name: '有形之锢', artist: '恋与深空 OST', src: 'music/恋与深空-有形之锢-_mqms2_.mp3' },
            { name: '交错视界', artist: 'Mikelangelo Loconte · 2.0 主题曲', src: 'music/恋与深空-交错视界-_mqms2_.mp3' },
            { name: '不设防禁区', artist: '恋与深空 OST', src: 'music/恋与深空-不设防禁区-_mqms2_.mp3' },
            { name: '炽光淋漓', artist: '恋与深空 OST', src: 'music/恋与深空-炽光淋漓-_mqms2_.mp3' },
            { name: '即兴放逐', artist: '恋与深空 OST', src: 'music/恋与深空-即兴放逐-_mqms2_.mp3' },
            { name: '久候狂欢之徒', artist: '恋与深空 OST', src: 'music/恋与深空-久候狂欢之徒-_mqms2_.mp3' },
            { name: '龙谷咏叹', artist: '恋与深空 OST', src: 'music/恋与深空-龙谷咏叹-_mqms2_.mp3' },
            { name: '无桎绿野', artist: '恋与深空 OST', src: 'music/恋与深空-无桎绿野-_mqms2_.mp3' },
            { name: '银翼安魂地', artist: '恋与深空 OST', src: 'music/恋与深空-银翼安魂地-_mqms2_.mp3' }
        ];

        let currentTrack = 0;
        let isPlaying = false;
        const audio = new Audio();
        audio.volume = 0.5;

        // Auto-play on first user interaction (no overlay, no muted trick)
        let autoPlayAttempted = false;
        function tryAutoPlay() {
            if (autoPlayAttempted) return;
            autoPlayAttempted = true;
            if (playlist[currentTrack].src && !isPlaying) {
                audio.play().then(() => {
                    // Successfully started
                }).catch(() => {
                    // Autoplay blocked, user can manually click play button
                });
            }
            document.removeEventListener('click', tryAutoPlay);
            document.removeEventListener('touchstart', tryAutoPlay);
            document.removeEventListener('keydown', tryAutoPlay);
        }
        document.addEventListener('click', tryAutoPlay);
        document.addEventListener('touchstart', tryAutoPlay);
        document.addEventListener('keydown', tryAutoPlay);

        function loadTrack(index) {
            if (index < 0) index = playlist.length - 1;
            if (index >= playlist.length) index = 0;
            currentTrack = index;
            const track = playlist[currentTrack];
            bgmTrackName.textContent = track.name || '未选择曲目';
            bgmTrackArtist.textContent = track.artist || '';
            if (track.src) {
                audio.src = track.src;
                audio.load();
                if (isPlaying) audio.play().catch(() => {});
            } else {
                bgmTrackName.textContent = '音乐文件待添加';
                bgmTrackArtist.textContent = '请在 music/ 目录放入 .mp3 文件';
            }
        }

        function togglePlay() {
            if (!playlist[currentTrack].src) return;
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play().catch(() => {});
            }
        }

        audio.addEventListener('play', () => {
            isPlaying = true;
            bgmPlay.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            bgmBtn.classList.add('playing');
        });

        audio.addEventListener('pause', () => {
            isPlaying = false;
            bgmPlay.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            bgmBtn.classList.remove('playing');
        });

        audio.addEventListener('ended', () => {
            loadTrack(currentTrack + 1);
            if (playlist[currentTrack].src) audio.play().catch(() => {});
        });

        bgmBtn.addEventListener('click', () => {
            bgmPanel.classList.toggle('open');
        });

        bgmPanelClose.addEventListener('click', () => {
            bgmPanel.classList.remove('open');
        });

        bgmPlay.addEventListener('click', togglePlay);

        bgmPrev.addEventListener('click', () => {
            loadTrack(currentTrack - 1);
            if (playlist[currentTrack].src && isPlaying) audio.play().catch(() => {});
        });

        bgmNext.addEventListener('click', () => {
            loadTrack(currentTrack + 1);
            if (playlist[currentTrack].src && isPlaying) audio.play().catch(() => {});
        });

        bgmVolume.addEventListener('input', () => {
            audio.volume = parseFloat(bgmVolume.value);
        });

        // Close panel on outside click
        document.addEventListener('click', (e) => {
            if (!bgmPanel.contains(e.target) && e.target !== bgmBtn && !bgmBtn.contains(e.target)) {
                bgmPanel.classList.remove('open');
            }
        });

        // Load first track; auto-plays on first user interaction
        loadTrack(0);

        // ===== DIY Tab Switching =====
        const diyTabs = document.querySelectorAll('.diy-tab');
        const diyGrids = document.querySelectorAll('.diy-grid');

        diyTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.diy;
                // Update active tab
                diyTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Show matching grid
                diyGrids.forEach(grid => {
                    grid.classList.toggle('active', grid.id === 'diy-' + category);
                });
            });
        });
