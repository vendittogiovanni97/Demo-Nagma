/* ─── CUSTOM CURSOR ──────────────────────────────────────────────────────────*/
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

// ring segue con lag fluido
function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// hover su elementi interattivi
const hoverTargets = document.querySelectorAll('a, button, .gallery-item, .service-card, .nav-hamburger');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ─── NAVBAR SCROLL ──────────────────────────────────────────────────────────*/
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── HERO PARALLAX ──────────────────────────────────────────────────────────*/
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroBg && y < window.innerHeight) {
    heroBg.style.transform = `translateY(${y * 0.35}px)`;
  }
});

/* ─── HERO TITLE — TEXT SPLIT ANIMATION ─────────────────────────────────────*/
function splitAndAnimate(el) {
  const text = el.innerHTML;
  // split solo sui nodi testo, preserva i tag <em> e <br>
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  function processNode(node, out) {
    if (node.nodeType === Node.TEXT_NODE) {
      const chars = node.textContent.split('');
      chars.forEach(ch => {
        if (ch === ' ') {
          out.push('<span class="char" style="display:inline-block;width:0.3em"> </span>');
        } else if (ch.trim()) {
          out.push(`<span class="char">${ch}</span>`);
        }
      });
    } else if (node.nodeName === 'EM') {
      out.push('<em>');
      node.childNodes.forEach(c => processNode(c, out));
      out.push('</em>');
    } else if (node.nodeName === 'BR') {
      out.push('<br/>');
    } else {
      node.childNodes.forEach(c => processNode(c, out));
    }
  }

  const parts = [];
  doc.body.childNodes.forEach(n => processNode(n, parts));
  el.innerHTML = parts.join('');

  const chars = el.querySelectorAll('.char');
  chars.forEach((ch, i) => {
    setTimeout(() => ch.classList.add('visible'), 100 + i * 35);
  });
}

const heroTitle = document.querySelector('.hero-title');
if (heroTitle) splitAndAnimate(heroTitle);

/* ─── FADE-UP ON SCROLL ──────────────────────────────────────────────────────*/
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ─── GALLERY — scroll reveal a cascata (fallback per browser senza animation-timeline) ─── */
const supportsViewTimeline = CSS.supports && CSS.supports('animation-timeline: view()');
if (!supportsViewTimeline) {
  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.gallery-reveal').forEach(el => galleryObserver.observe(el));
} else {
  // Browser moderno: rimuoviamo i transform iniziali così l'animation-timeline CSS fa tutto
  document.querySelectorAll('.gallery-reveal').forEach(el => el.classList.add('visible'));
}

/* ─── COUNTER ANIMATION ──────────────────────────────────────────────────────*/
function animateCount(el, target, suffix = '') {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current) + suffix;
  }, 20);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => {
        animateCount(el, parseInt(el.dataset.target), el.dataset.suffix || '');
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);

/* ─── GALLERY 3D TILT ────────────────────────────────────────────────────────*/
document.querySelectorAll('.gallery-item').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
  });
});

/* ─── MAGNETIC BUTTONS ───────────────────────────────────────────────────────*/
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.25;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
});

/* ─── LIGHTBOX ───────────────────────────────────────────────────────────────*/
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    lightboxImg.src = item.querySelector('img').src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

document.querySelector('.lb-close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

/* ─── MOBILE NAV ─────────────────────────────────────────────────────────────*/
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');
let navOpen = false;

hamburger?.addEventListener('click', () => {
  navOpen = !navOpen;
  Object.assign(navLinks.style, navOpen ? {
    display: 'flex', flexDirection: 'column', position: 'absolute',
    top: '100%', left: '0', right: '0', background: 'rgba(10,10,10,0.98)',
    padding: '2rem', gap: '1.5rem', borderBottom: '1px solid #333'
  } : { display: 'none' });
});

/* ─── SMOOTH ANCHOR ──────────────────────────────────────────────────────────*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (navOpen) { navLinks.style.display = 'none'; navOpen = false; }
  });
});
