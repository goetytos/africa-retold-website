/* ===== Deferred Video Posters ===== */
(function initDeferredVideoPosters() {
  const loadPosters = () => {
    const videos = document.querySelectorAll('video[data-poster]');
    if (!('IntersectionObserver' in window)) {
      videos.forEach(video => { video.poster = video.dataset.poster; });
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.poster = entry.target.dataset.poster;
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px' });
    videos.forEach(video => observer.observe(video));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosters, { once: true });
  } else {
    loadPosters();
  }
})();

/* ===== Announcement Bar (driven by events.json) ===== */
(async function initAnnounceBar() {
  const bar = document.getElementById('announceBar');
  if (!bar) return;

  // Path to events.json — works from root and from /pages/*
  const inSubdir = window.location.pathname.includes('/pages/');
  const eventsUrl = (inSubdir ? '../' : './') + 'events.json';

  let events;
  try {
    const res = await fetch(eventsUrl, { cache: 'no-cache' });
    if (!res.ok) return;
    events = await res.json();
  } catch (e) { return; }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => !isNaN(e.dateObj) && e.dateObj >= today)
    .sort((a, b) => a.dateObj - b.dateObj)[0];
  if (!upcoming) return;

  // Per-event dismiss key so a new event always re-shows even if a prior one was dismissed
  const dismissKey = 'announce-dismissed-' + upcoming.date;
  if (sessionStorage.getItem(dismissKey) === '1') return;

  // Format date: "Sun 24 May"
  const dateLabel = upcoming.dateObj.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  // Resolve link relative to current page depth
  let link = upcoming.link || '#';
  if (inSubdir && link && !/^https?:|^\//.test(link)) {
    link = link.replace(/^pages\//, '');
  }

  const textEl = bar.querySelector('.announce-text');
  const linkEl = bar.querySelector('#announceLink');
  const cta = upcoming.cta ? ' · ' + upcoming.cta : '';
  textEl.textContent = dateLabel + ' · ' + upcoming.title + cta;
  linkEl.href = link;

  bar.hidden = false;
  requestAnimationFrame(() => {
    document.body.classList.add('has-announce');
    bar.classList.add('visible');
  });

  const closeBtn = document.getElementById('announceClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sessionStorage.setItem(dismissKey, '1');
      bar.classList.remove('visible');
      document.body.classList.remove('has-announce');
      // Match transform duration so layout settles cleanly
      setTimeout(() => { bar.hidden = true; }, 550);
    });
  }
})();

/* ===== Mobile Navigation ===== */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

function setMobileNav(open) {
  if (!hamburger || !navLinks) return;
  navLinks.classList.toggle('active', open);
  if (navOverlay) navOverlay.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  document.body.classList.toggle('nav-open', open);
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
  spans[1].style.opacity = open ? '0' : '1';
  spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    setMobileNav(!navLinks.classList.contains('active'));
  });
}

if (navOverlay) {
  navOverlay.addEventListener('click', () => {
    setMobileNav(false);
  });
}

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    setMobileNav(false);
  });
});

/* ===== Scroll Top Button ===== */
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== Navbar Transparent → Solid on Scroll ===== */
const navbar = document.querySelector('.navbar');
if (navbar) {
  let navbarFramePending = false;
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    navbarFramePending = false;
  }
  // On subpages (no hero), always show solid navbar
  if (!document.querySelector('.hero')) {
    navbar.classList.add('scrolled');
  } else {
    window.addEventListener('scroll', () => {
      if (!navbarFramePending) {
        navbarFramePending = true;
        requestAnimationFrame(updateNavbar);
      }
    }, { passive: true });
  }
}

/* ===== Scroll Reveal Animation (with auto-stagger for grid siblings) ===== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  // Auto-stagger reveal siblings sharing the same parent (cards in a grid, etc.)
  const groups = new Map();
  reveals.forEach(el => {
    const parent = el.parentElement;
    if (!parent) return;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(siblings => {
    if (siblings.length > 1) {
      siblings.forEach((el, i) => {
        // cap delay so very large grids don't drag on
        el.style.transitionDelay = (Math.min(i, 7) * 0.08) + 's';
      });
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}
initScrollReveal();

/* ===== Impact Counter Animation (easeOutQuart, rAF) ===== */
function animateCounters() {
  const counters = document.querySelectorAll('.impact-stat .number');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  counters.forEach(counter => {
    if (counter.dataset.animated) return;
    const target = parseInt(counter.dataset.target) || parseInt(counter.textContent.replace(/\D/g, ''));
    if (!target) return;
    const suffix = counter.textContent.replace(/[\d,]/g, '');
    counter.dataset.animated = 'true';
    if (reduceMotion) {
      counter.textContent = target.toLocaleString() + suffix;
      return;
    }
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(target * eased);
      counter.textContent = value.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(tick);
  });
}

const impactSection = document.querySelector('.impact-section');
if (impactSection) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(impactSection);
}

/* ===== Lazy Loading Images ===== */
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});

/* ===== Newsletter Form (FormSubmit AJAX) ===== */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const result = form.parentElement.querySelector('.newsletter-result');
    if (!input || !input.value || !form.reportValidity()) return;

    button.disabled = true;
    button.textContent = 'Subscribing...';
    if (result) result.textContent = '';

    try {
      const response = await fetch('https://formsubmit.co/ajax/ubunturetold@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: input.value,
          _subject: 'New Newsletter Subscription - Ubuntu Retold',
          _template: 'table'
        })
      });
      if (!response.ok) throw new Error('Subscription failed');
      input.value = '';
      if (result) result.textContent = 'Thank you. You are now subscribed.';
    } catch (error) {
      if (result) result.textContent = 'We could not subscribe you right now. Please try again or email us.';
    } finally {
      button.disabled = false;
      button.textContent = 'Subscribe';
    }
  });
});

/* ===== Contact Form (FormSubmit) ===== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  // Show success message if redirected back after submission
  if (window.location.search.includes('sent=true')) {
    const result = document.getElementById('contactResult');
    if (result) {
      result.style.display = 'block';
      result.style.background = '#d4edda';
      result.style.color = '#155724';
      result.textContent = 'Thank you! Your message has been sent. We will get back to you shortly.';
    }
  }

  contactForm.addEventListener('submit', () => {
    const btn = document.getElementById('contactBtn');
    btn.disabled = true;
    btn.textContent = 'Sending...';
  });
}

/* ===== Volunteer Form (FormSubmit) ===== */
const volunteerForm = document.getElementById('volunteerForm');
if (volunteerForm) {
  if (window.location.search.includes('applied=true')) {
    const result = document.getElementById('volunteerResult');
    if (result) {
      result.style.display = 'block';
      result.style.background = '#d4edda';
      result.style.color = '#155724';
      result.textContent = 'Thank you for your application! We will be in touch soon.';
    }
  }

  volunteerForm.addEventListener('submit', () => {
    const btn = volunteerForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';
  });
}

/* ===== Gallery Lightbox ===== */
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxClose = document.querySelector('.lightbox-close');
let lightboxTrigger = null;

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  if (lightboxTrigger) lightboxTrigger.focus();
}

galleryItems.forEach(item => {
  function openLightbox() {
    if (lightbox) {
      const content = lightbox.querySelector('.lightbox-content');
      const img = item.querySelector('img');
      if (content && img) {
        content.innerHTML = '<img src="' + img.src + '" alt="' + (img.alt || '') + '">';
      } else if (content) {
        content.textContent = item.textContent;
      }
      lightbox.hidden = false;
      lightbox.classList.add('active');
      document.body.classList.add('lightbox-open');
      lightboxTrigger = item;
      if (lightboxClose) lightboxClose.focus();
    }
  }
  item.addEventListener('click', openLightbox);
});

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
}

/* ===== Gallery Filters ===== */
document.querySelectorAll('.gallery-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.closest('.section');
    if (!section) return;
    section.querySelectorAll('.gallery-filter').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const filter = btn.dataset.filter;
    section.querySelectorAll('.gallery-item').forEach(item => {
      const categories = (item.dataset.category || '').split(' ');
      item.hidden = filter !== 'all' && !categories.includes(filter);
    });
  });
});

/* ===== Active Nav Link ===== */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

/* ===== Smooth scroll for anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
