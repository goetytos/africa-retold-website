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

/* ===== Scroll Reveal Animation ===== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

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

/* ===== Impact Counter Animation ===== */
function animateCounters() {
  const counters = document.querySelectorAll('.impact-stat .number');
  counters.forEach(counter => {
    if (counter.dataset.animated) return;
    const target = parseInt(counter.dataset.target) || parseInt(counter.textContent.replace(/\D/g, ''));
    if (!target) return;
    const suffix = counter.textContent.replace(/[\d,]/g, '');
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current.toLocaleString() + suffix;
    }, 30);
    counter.dataset.animated = 'true';
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
