/* ===== Mobile Navigation ===== */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
}

if (navOverlay) {
  navOverlay.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
  });
}

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
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
  function updateNavbar() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbar);
  // On subpages (no hero), always show solid navbar
  if (!document.querySelector('.hero')) {
    navbar.classList.add('scrolled');
  }
  updateNavbar();
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

/* ===== Newsletter Form ===== */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      alert('Thank you for subscribing! We will keep you updated.');
      input.value = '';
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

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    if (lightbox) {
      const content = lightbox.querySelector('.lightbox-content');
      const img = item.querySelector('img');
      if (content && img) {
        content.innerHTML = '<img src="' + img.src + '" alt="' + (img.alt || '') + '">';
      } else if (content) {
        content.textContent = item.textContent;
      }
      lightbox.classList.add('active');
    }
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
}
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.classList.remove('active');
  });
}

/* ===== Tabs ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabGroup = btn.closest('.section');
    if (!tabGroup) return;
    tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    tabGroup.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* ===== Active Nav Link ===== */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPage) link.classList.add('active');
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
