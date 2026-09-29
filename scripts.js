// Prevent browser from restoring scroll position on refresh
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);
window.addEventListener("load", () => { window.scrollTo(0, 0); });

// Navigation scroll effect
const nav = document.getElementById("nav");
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 80) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
  lastScroll = currentScroll;
});

// Mobile menu toggle
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");
let menuOpen = false;
navToggle.addEventListener("click", () => {
  menuOpen = !menuOpen;
  navMobile.classList.toggle("open", menuOpen);
  navToggle.setAttribute("aria-expanded", menuOpen);
  navToggle.setAttribute("aria-label", menuOpen ? "关闭菜单" : "打开菜单");
  const svg = navToggle.querySelector("svg");
  if (menuOpen) {
    svg.innerHTML = '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>';
  } else {
    svg.innerHTML = '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
  }
});
navMobile.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuOpen = false;
    navMobile.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
    navToggle.querySelector("svg").innerHTML = '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
  });
});

// Scroll reveal
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      const parent = entry.target.parentElement;
      if (parent && (parent.classList.contains("card-grid") || parent.classList.contains("gallery-grid"))) {
        const siblings = Array.from(parent.querySelectorAll(".reveal"));
        const index = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.1}s`;
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
revealElements.forEach((el) => revealObserver.observe(el));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const navHeight = document.getElementById("nav").offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  });
});

// ===== Preheat bar close =====
const preheatBar = document.getElementById("preheatBar");
const preheatClose = document.getElementById("preheatClose");
if (preheatClose && preheatBar) {
  preheatClose.addEventListener("click", () => { preheatBar.classList.add("hidden"); });
}

// ===== BGM Player =====
const bgmBtn = document.getElementById("bgmBtn");
const bgmPanel = document.getElementById("bgmPanel");
const bgmPanelClose = document.getElementById("bgmPanelClose");
const bgmPlay = document.getElementById("bgmPlay");
const bgmPrev = document.getElementById("bgmPrev");
const bgmNext = document.getElementById("bgmNext");
const bgmVolume = document.getElementById("bgmVolume");
const bgmTrackName = document.getElementById("bgmTrackName");
const bgmTrackArtist = document.getElementById("bgmTrackArtist");
let bgmOpen = false;
let bgmPlaying = false;

const playlist = [
  { name: "交错视界", artist: "Mikelangelo Loconte · 2.0 主题曲", src: "music/恋与深空-交错视界-_mqms2_.mp3" },
  { name: "不设防禁区", artist: "恋与深空 OST", src: "music/恋与深空-不设防禁区-_mqms2_.mp3" },
  { name: "炽光淋漓", artist: "恋与深空 OST", src: "music/恋与深空-炽光淋漓-_mqms2_.mp3" },
  { name: "即兴放逐", artist: "恋与深空 OST", src: "music/恋与深空-即兴放逐-_mqms2_.mp3" },
  { name: "久候狂欢之徒", artist: "恋与深空 OST", src: "music/恋与深空-久候狂欢之徒-_mqms2_.mp3" },
  { name: "龙谷咏叹", artist: "恋与深空 OST", src: "music/恋与深空-龙谷咏叹-_mqms2_.mp3" },
  { name: "无桎绿野", artist: "恋与深空 OST", src: "music/恋与深空-无桎绿野-_mqms2_.mp3" },
  { name: "银翼安魂地", artist: "恋与深空 OST · 日冕 2.0", src: "music/恋与深空-银翼安魂地-_mqms2_.mp3" },
  { name: "有形之锢", artist: "恋与深空 OST", src: "music/恋与深空-有形之锢-_mqms2_.mp3" },
];
let bgmIndex = 0;
let bgmAudio = null;

function initBGM() {
  if (!bgmAudio) bgmAudio = new Audio();
  bgmAudio.volume = parseFloat(bgmVolume.value) || 0.5;
  loadTrack(bgmIndex);
}
function loadTrack(i) {
  const t = playlist[i];
  bgmAudio.src = t.src;
  bgmTrackName.textContent = t.name;
  bgmTrackArtist.textContent = t.artist;
}
function toggleBGM() {
  if (!bgmAudio) initBGM();
  if (bgmPlaying) { bgmAudio.pause(); bgmPlay.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; }
  else { bgmAudio.play().catch(() => {}); bgmPlay.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'; }
  bgmPlaying = !bgmPlaying;
}

if (bgmBtn) bgmBtn.addEventListener("click", () => { bgmOpen = !bgmOpen; bgmPanel.style.display = bgmOpen ? "block" : "none"; });
if (bgmPanelClose) bgmPanelClose.addEventListener("click", () => { bgmOpen = false; bgmPanel.style.display = "none"; });
if (bgmPlay) bgmPlay.addEventListener("click", toggleBGM);
if (bgmPrev) bgmPrev.addEventListener("click", () => { if (!bgmAudio) initBGM(); bgmIndex = (bgmIndex - 1 + playlist.length) % playlist.length; loadTrack(bgmIndex); if (bgmPlaying) bgmAudio.play().catch(() => {}); });
if (bgmNext) bgmNext.addEventListener("click", () => { if (!bgmAudio) initBGM(); bgmIndex = (bgmIndex + 1) % playlist.length; loadTrack(bgmIndex); if (bgmPlaying) bgmAudio.play().catch(() => {}); });
if (bgmVolume) bgmVolume.addEventListener("input", () => { if (bgmAudio) bgmAudio.volume = parseFloat(bgmVolume.value); });

// ===== Global Scroll Background =====
(function(){
  const slides = document.querySelectorAll(".global-bg-slide");
  if (!slides.length) return;
  let current = 0;
  const sections = document.querySelectorAll("section[id]");
  const sectionBgMap = {};
  sections.forEach((s) => { if (s.dataset.bg !== undefined) sectionBgMap[s.id] = parseInt(s.dataset.bg); });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && sectionBgMap[entry.target.id] !== undefined) {
        const idx = sectionBgMap[entry.target.id];
        if (idx !== current && slides[idx]) {
          slides[current].classList.remove("active");
          slides[idx].classList.add("active");
          current = idx;
        }
      }
    });
  }, { threshold: 0.3 });
  sections.forEach((s) => { if (s.dataset.bg !== undefined) observer.observe(s); });
})();

// ===== 3D Card Tilt =====
(function(){
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.add("tilt-enabled");
    if (!card.querySelector(".card-glare")) {
      const glare = document.createElement("div"); glare.className = "card-glare"; card.appendChild(glare);
    }
    card.addEventListener("mousemove", function(e){
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const cx = rect.width/2, cy = rect.height/2;
      const rx = ((y-cy)/cy)*-8, ry = ((x-cx)/cx)*8;
      const imgWrapper = card.querySelector(".card-image-wrapper");
      if (imgWrapper) imgWrapper.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.classList.add("glare-active");
    });
    card.addEventListener("mouseleave", function(){
      const imgWrapper = card.querySelector(".card-image-wrapper");
      if (imgWrapper) imgWrapper.style.transform = "";
      card.classList.remove("glare-active");
    });
  });

  const cardGridEl = document.getElementById("cardGrid");
  if (cardGridEl) {
    cardGridEl.addEventListener("mousemove", (e) => {
      if (cardGridEl.classList.contains("stack-view")) return;
      cardGridEl.querySelectorAll(".card").forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const cx = rect.width/2, cy = rect.height/2;
        const rx = ((y-cy)/cy)*-5, ry = ((x-cx)/cx)*5;
        const imgWrapper = card.querySelector(".card-image-wrapper");
        if (imgWrapper) imgWrapper.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    });
    cardGridEl.addEventListener("mouseleave", () => {
      if (cardGridEl.classList.contains("stack-view")) return;
      cardGridEl.querySelectorAll(".card").forEach((card) => {
        const imgWrapper = card.querySelector(".card-image-wrapper");
        if (imgWrapper) imgWrapper.style.transform = "";
      });
    });
  }
})();

// ===== Card Sorting =====
const cardGrid = document.getElementById("cardGrid");
const sortBtns = document.querySelectorAll(".sort-btn");
function sortCards(criteria, dir) {
  const cards = Array.from(cardGrid.querySelectorAll(".card"));
  const isAsc = dir === "asc";
  cards.sort((a, b) => {
    if (criteria === "date") return isAsc ? a.dataset.release.localeCompare(b.dataset.release) : b.dataset.release.localeCompare(a.dataset.release);
    if (criteria === "rarity") return isAsc ? parseInt(a.dataset.rarity) - parseInt(b.dataset.rarity) : parseInt(b.dataset.rarity) - parseInt(a.dataset.rarity);
    return 0;
  });
  cards.forEach((card) => cardGrid.appendChild(card));
}
function updateArrow(btn, dir) {
  const arrow = btn.querySelector(".sort-dir");
  if (dir === "asc") arrow.classList.add("flip");
  else arrow.classList.remove("flip");
}

// ===== View Toggle (Grid / Stack Coverflow) =====
const viewGridBtn = document.getElementById("viewGrid");
const viewStackBtn = document.getElementById("viewStack");
const cardGridForView = document.getElementById("cardGrid");
let currentView = "grid";
let stackSwiper = null;

function switchView(view) {
  currentView = view;
  if (view === "stack") {
    viewGridBtn.classList.remove("active");
    viewStackBtn.classList.add("active");
    cardGridForView.classList.remove("bento-mode");
    cardGridForView.classList.remove("full-mode");
    cardGridForView.classList.add("stack-view");
    
    // Wrap cards in Swiper structure
    if (!cardGridForView.querySelector(".swiper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "swiper";
      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";
      const cards = cardGridForView.querySelectorAll(".card");
      cards.forEach(c => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.appendChild(c);
        swiperWrapper.appendChild(slide);
      });
      wrapper.appendChild(swiperWrapper);
      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      wrapper.appendChild(pagination);
      cardGridForView.appendChild(wrapper);
    }
    
    // Init Swiper
    setTimeout(() => {
      if (stackSwiper) stackSwiper.destroy(true, true);
      stackSwiper = new Swiper(cardGridForView.querySelector(".swiper"), {
        slidesPerView: "auto",
        centeredSlides: true,
        spaceBetween: 20,
        loop: false,
        pagination: { el: cardGridForView.querySelector(".swiper-pagination"), type: "progressbar" },
      });
    }, 50);
  } else {
    viewStackBtn.classList.remove("active");
    viewGridBtn.classList.add("active");
    
    if (stackSwiper) { stackSwiper.destroy(true, true); stackSwiper = null; }
    cardGridForView.classList.remove("stack-view");
    cardGridForView.classList.add("bento-mode");
    
    // Unwrap cards from Swiper
    const swiperEl = cardGridForView.querySelector(".swiper");
    if (swiperEl) {
      const slides = swiperEl.querySelectorAll(".swiper-slide");
      slides.forEach(s => {
        const card = s.querySelector(".card");
        if (card) cardGridForView.appendChild(card);
      });
      swiperEl.remove();
    }
  }
}

// Init
sortCards("date", "desc");
switchView("grid");

if (viewGridBtn) viewGridBtn.addEventListener("click", () => switchView("grid"));
if (viewStackBtn) viewStackBtn.addEventListener("click", () => switchView("stack"));

sortBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isAlreadyActive = btn.classList.contains("active");
    const criteria = btn.dataset.criteria;
    let dir = btn.dataset.dir;
    if (isAlreadyActive) { dir = dir === "desc" ? "asc" : "desc"; btn.dataset.dir = dir; }
    else {
      sortBtns.forEach((b) => { b.classList.remove("active"); b.dataset.dir = "desc"; updateArrow(b, "desc"); });
      btn.classList.add("active"); dir = "desc"; btn.dataset.dir = "desc";
    }
    updateArrow(btn, dir);
    sortCards(criteria, dir);
  });
});

// ===== View All Toggle =====
(function(){
  const grid = document.getElementById("cardGrid");
  const btn = document.getElementById("viewAllBtn");
  if (!grid || !btn) return;
  let isBento = true;
  btn.addEventListener("click", () => {
    isBento = !isBento;
    if (isBento) {
      grid.classList.add("bento-mode"); grid.classList.remove("full-mode");
      btn.innerHTML = '查看全部 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
      btn.classList.remove("open");
    } else {
      grid.classList.remove("bento-mode"); grid.classList.add("full-mode");
      btn.innerHTML = '收起 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
      btn.classList.add("open");
    }
  });
})();

// ===== Card Detail Modal =====
const cardModal = document.getElementById("cardModal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalRelease = document.getElementById("modalRelease");
const modalStars = document.getElementById("modalStars");
const modalRerun = document.getElementById("modalRerun");
const modalType = document.getElementById("modalType");
const modalStory = document.getElementById("modalStory");

function openModal(card) {
  if (!cardModal || !card) return;
  const name = card.dataset.cardName || "";
  const release = card.dataset.release || "";
  const rarity = parseInt(card.dataset.rarity) || 5;
  const rerun = card.dataset.rerun || "";
  const story = card.dataset.story || "";
  const image = card.dataset.image || "";
  if (modalTitle) modalTitle.textContent = name;
  if (modalRelease) modalRelease.textContent = release;
  if (modalRerun) {
    modalRerun.textContent = rerun;
    modalRerun.className = "modal-meta-value";
    if (rerun.includes("活动限定") || rerun.includes("限定")) modalRerun.classList.add("modal-rerun-no");
    else if (rerun.includes("复刻") || rerun.includes("常驻")) modalRerun.classList.add("modal-rerun-yes");
  }
  if (modalType) modalType.textContent = rarity >= 5 ? "五星思念" : rarity >= 4 ? "四星思念" : "三星思念";
  if (modalStars) {
    modalStars.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.classList.add("modal-star");
      if (i >= rarity) svg.classList.add("empty");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z");
      svg.appendChild(path);
      modalStars.appendChild(svg);
    }
  }
  if (modalStory) modalStory.textContent = story;
  if (modalImage) { modalImage.src = image; modalImage.alt = name; }
  if (cardModal) { cardModal.classList.add("active"); document.body.style.overflow = "hidden"; }
}

function closeModal() {
  if (!cardModal) return;
  cardModal.classList.remove("active");
  document.body.style.overflow = "";
}

if (modalClose) modalClose.addEventListener("click", closeModal);
if (cardModal) cardModal.addEventListener("click", (e) => { if (e.target === cardModal) closeModal(); });

// Card click — event delegation for grid + swiper
cardGridForView.addEventListener("click", function(e) {
  const card = e.target.closest(".card");
  if (card) openModal(card);
});

// ===== AI Carousel =====
const aiCarousel = document.getElementById("aiCarousel");
if (aiCarousel) {
  const track = document.getElementById("aiCarouselTrack");
  const items = track.querySelectorAll(".ai-item");
  const prevBtn = document.getElementById("aiCarouselPrev");
  const nextBtn = document.getElementById("aiCarouselNext");
  const dotsContainer = document.getElementById("aiCarouselDots");
  let aiIndex = 0;
  let aiDragging = false, aiStartX = 0, aiOffset = 0;

  function updateCarousel() {
    items.forEach((item, i) => {
      item.classList.remove("ai-active", "ai-near");
    });
    if (items[aiIndex]) items[aiIndex].classList.add("ai-active");
    if (items[aiIndex - 1]) items[aiIndex - 1].classList.add("ai-near");
    if (items[aiIndex + 1]) items[aiIndex + 1].classList.add("ai-near");
    
    // Move track to center active item
    const containerW = aiCarousel.offsetWidth;
    const activeItem = items[aiIndex];
    if (activeItem) {
      const itemLeft = activeItem.offsetLeft;
      const itemW = activeItem.offsetWidth;
      const offset = itemLeft - (containerW / 2) + (itemW / 2);
      track.style.transform = `translateX(${-offset}px)`;
    }

    if (dotsContainer) {
      dotsContainer.querySelectorAll(".ai-carousel-dot").forEach((d, i) => {
        d.classList.toggle("active", i === aiIndex);
      });
    }
  }
  function goTo(i) {
    if (i < 0 || i >= items.length) return;
    aiIndex = i;
    updateCarousel();
  }

  if (dotsContainer) {
    items.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "ai-carousel-dot";
      dot.setAttribute("aria-label", "第" + (i + 1) + "张");
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  track.addEventListener("mousedown", (e) => { aiDragging = true; aiStartX = e.clientX; aiOffset = 0; });
  window.addEventListener("mousemove", (e) => { if (!aiDragging) return; aiOffset = e.clientX - aiStartX; });
  window.addEventListener("mouseup", () => {
    if (!aiDragging) return;
    aiDragging = false;
    if (aiOffset < -40 && aiIndex < items.length - 1) goTo(aiIndex + 1);
    else if (aiOffset > 40 && aiIndex > 0) goTo(aiIndex - 1);
    aiOffset = 0;
  });

  track.addEventListener("touchstart", (e) => { aiDragging = true; aiStartX = e.touches[0].clientX; aiOffset = 0; }, { passive: true });
  window.addEventListener("touchmove", (e) => { if (!aiDragging) return; aiOffset = e.touches[0].clientX - aiStartX; }, { passive: true });
  window.addEventListener("touchend", () => {
    if (!aiDragging) return;
    aiDragging = false;
    if (aiOffset < -40 && aiIndex < items.length - 1) goTo(aiIndex + 1);
    else if (aiOffset > 40 && aiIndex > 0) goTo(aiIndex - 1);
    aiOffset = 0;
  });

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(aiIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(aiIndex + 1));
  updateCarousel();
}

// ===== Nav scroll progress + scrollspy =====
(function () {
  const bar = document.getElementById("navProgress");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const railLinks = Array.from(document.querySelectorAll(".sec-rail a[href^='#']"));
  const allLinks = navLinks.concat(railLinks);
  const sections = Array.from(document.querySelectorAll("section[id]"));

  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
  }

  function updateActive() {
    const navH = document.getElementById("nav") ? document.getElementById("nav").offsetHeight : 90;
    const line = window.scrollY + navH + window.innerHeight * 0.22;
    let currentId = sections.length ? sections[0].id : "";
    sections.forEach((s) => { if (s.offsetTop <= line) currentId = s.id; });
    allLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateProgress(); updateActive(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();
  updateActive();
})();

// ===== 活动详情标签页 (event tabs) =====
document.querySelectorAll(".event-card").forEach((card) => {
  const tabs = card.querySelectorAll(".event-tab");
  const panels = card.querySelectorAll(".event-panel");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const key = tab.dataset.evtab;
      panels.forEach((p) => p.classList.toggle("active", p.dataset.evpanel === key));
    });
  });
});

// ===== Mascot & Dialogue =====
const mascot = document.getElementById("mascot");
const mascotSpeech = document.getElementById("mascotSpeech");
const mascotIcon = document.getElementById("mascotIcon");

// Mascot follows cursor with delay, parks right when idle
let mascotTargetX = 0, mascotTargetY = 0;
let mascotX = 0, mascotY = 0;
let mascotIdleTimer = null;
let mascotParked = false;
const IDLE_TIME = 2500; // park after 2.5s of no mouse movement

document.addEventListener("mousemove", (e) => {
  mascotTargetX = e.clientX;
  mascotTargetY = e.clientY;
  
  // Wake up from parked state
  if (mascotParked) {
    mascotX = e.clientX;
    mascotY = e.clientY;
    mascotParked = false;
  }
  
  // Reset idle timer
  if (mascotIdleTimer) clearTimeout(mascotIdleTimer);
  mascotIdleTimer = setTimeout(() => {
    mascotParked = true;
  }, IDLE_TIME);
});

function animateMascot() {
  if (!mascot) return;
  
  if (mascotParked) {
    // Park on the right side
    const parkX = window.innerWidth - 80;
    const parkY = window.innerHeight * 0.5;
    mascotX += (parkX - mascotX) * 0.04;
    mascotY += (parkY - mascotY) * 0.04;
  } else {
    // Follow cursor
    mascotX += (mascotTargetX - mascotX) * 0.08;
    mascotY += (mascotTargetY - mascotY) * 0.08;
  }
  
  mascot.style.left = (mascotX + 30) + "px";
  mascot.style.top = (mascotY - 60) + "px";
  requestAnimationFrame(animateMascot);
}
if (mascot) {
  mascot.style.position = "fixed";
  mascot.style.zIndex = "997";
  mascot.style.pointerEvents = "auto";
  animateMascot();
}

const dialogueMap = {
  home: "嘎！欢迎来到 N109 区！9.22 五选三自选混池开启，老大的五星互动思念「华筵和奏」来了！",
  event: "嘎嘎！9.22~10.10 自选混池「如若午夜无眠」，9.28 起签到 10 天还能免费领四星「秋绘映眸」！",
  blend: "嘎？！这杯「酌光特调」闻着就上头……深红石榴、曼陀罗、肉桂，还有一点首领天赋！",
  cards: "嘎嘎！这里收录了老大从上线到现在的所有卡面！新来的「华筵和奏」帅翻了吧！",
  story: "嘎嘎！这是秦彻老大的故事！暗点首领可不是好惹的！",
  stories: "嘎！这些剧情每一段我都见证了，那天的风很大……",
  birthday: "嘎嘎！！老大的生日派对！蛋糕分我一块！",
  mephisto: "嘎？！这页写的不就是我吗！等等……还有那两个小鬼？！",
  fanart: "嘎嘎！有人在画老大！让我看看帅不帅！",
  schedule: "嘎嘎！9 月双活动：自选混池 + 累计签到，签到免费拿四星，记得每天上线！",
  diy: "嘎！拼豆、吧唧、痛包……小狸花们动起手来，本鸦给你们加油！",
  frontline: "嘎！前线速报！老大刚设宴宣布了新消息，本鸦全程在场！",
  discuss: "嘎！在聊什么？让本鸦也听听！",
};
let lastSection = "";
let speechTimer = null;

function showSpeech(text) {
  if (!text) return;
  mascotSpeech.textContent = text;
  mascotSpeech.classList.add("show");
  if (speechTimer) clearTimeout(speechTimer);
  speechTimer = setTimeout(() => { mascotSpeech.classList.remove("show"); }, 4000);
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    if (id && dialogueMap[id] && id !== lastSection) {
      lastSection = id;
      showSpeech(dialogueMap[id]);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll("section[id]").forEach((s) => { sectionObserver.observe(s); });

if (mascot) {
  mascot.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    showSpeech("嘎！回到顶部！");
  });
  showSpeech(dialogueMap.home);
}

// ===== Theme Toggle (inline already, but ensure compatibility) =====
(function(){
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  const iconDark = document.getElementById("themeIconDark");
  const iconLight = document.getElementById("themeIconLight");
  let isDark = true;
  toggle.addEventListener("click", () => {
    isDark = !isDark;
    if (isDark) {
      document.body.classList.remove("light-mode");
      iconDark.style.display = ""; iconLight.style.display = "none";
    } else {
      document.body.classList.add("light-mode");
      iconDark.style.display = "none"; iconLight.style.display = "";
    }
  });
})();

// ===== DIY Tabs =====
document.querySelectorAll(".diy-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".diy-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.diy;
    document.querySelectorAll(".diy-grid").forEach((g) => g.classList.remove("active"));
    const grid = document.getElementById("diy-" + target);
    if (grid) grid.classList.add("active");
  });
});
