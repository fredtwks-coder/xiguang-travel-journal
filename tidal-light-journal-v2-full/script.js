/* =========================================================
   汐光旅冊｜互動與粒子特效
   - 微粒子：星光、泡泡、微光點
   - 捲動淡入
   - 導覽列高亮
   - 圖片點擊放大
========================================================= */

(() => {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle() {
    const typeRand = Math.random();
    const type = typeRand > 0.78 ? 'star' : typeRand > 0.48 ? 'bubble' : 'spark';
    const sizeBase = type === 'star' ? 1.5 : type === 'bubble' ? 2.8 : 1.2;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: sizeBase + Math.random() * (type === 'bubble' ? 4.2 : 2.4),
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(0.08 + Math.random() * 0.22),
      alpha: 0.22 + Math.random() * 0.48,
      pulse: Math.random() * Math.PI * 2,
      type
    };
  }

  function initParticles() {
    const count = width < 700 ? 36 : width < 1100 ? 58 : 82;
    particles = Array.from({ length: count }, createParticle);
  }

  function drawStar(p, glow) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.pulse * 0.15);
    ctx.globalAlpha = p.alpha * glow;
    ctx.strokeStyle = 'rgba(35, 95, 183, 0.72)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-p.r * 2.1, 0);
    ctx.lineTo(p.r * 2.1, 0);
    ctx.moveTo(0, -p.r * 2.1);
    ctx.lineTo(0, p.r * 2.1);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 244, 213, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBubble(p, glow) {
    ctx.save();
    ctx.globalAlpha = p.alpha * glow;
    const grad = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r * 2.2);
    grad.addColorStop(0, 'rgba(255,255,255,0.80)');
    grad.addColorStop(0.45, 'rgba(115,201,255,0.22)');
    grad.addColorStop(1, 'rgba(115,201,255,0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawSpark(p, glow) {
    ctx.save();
    ctx.globalAlpha = p.alpha * glow;
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.8);
    grad.addColorStop(0, 'rgba(255,255,255,0.92)');
    grad.addColorStop(0.4, 'rgba(240,191,99,0.34)');
    grad.addColorStop(1, 'rgba(63,134,245,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.018;

      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      const glow = 0.72 + Math.sin(p.pulse) * 0.28;
      if (p.type === 'star') drawStar(p, glow);
      else if (p.type === 'bubble') drawBubble(p, glow);
      else drawSpark(p, glow);
    }

    animationId = requestAnimationFrame(animateParticles);
  }

  function setupParticles() {
    resizeCanvas();
    initParticles();
    if (!reduceMotion) animateParticles();
    else {
      ctx.clearRect(0, 0, width, height);
      particles.slice(0, 20).forEach((p) => drawSpark(p, 0.65));
    }
  }

  setupParticles();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  // Mobile nav
  const menuButton = document.getElementById('menuButton');
  const siteNav = document.getElementById('siteNav');

  menuButton?.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
    });
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el) => revealObserver.observe(el));

  // Active nav section
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.38 });

  sections.forEach((section) => sectionObserver.observe(section));

  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('show', window.scrollY > 640);
  }, { passive: true });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('[data-lightbox]').forEach((frame) => {
    frame.addEventListener('click', () => {
      const src = frame.getAttribute('data-lightbox');
      const img = frame.querySelector('img');
      if (!src || !lightbox || !lightboxImage) return;
      lightboxImage.src = src;
      lightboxImage.alt = img?.alt || '圖片預覽';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  // Image load fallback notice
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      const wrapper = img.closest('.visual-frame');
      if (!wrapper || wrapper.querySelector('.image-error')) return;
      const note = document.createElement('div');
      note.className = 'image-error';
      note.textContent = `找不到圖片：${img.getAttribute('src')}`;
      note.style.padding = '42px 18px';
      note.style.textAlign = 'center';
      note.style.color = '#1f5fb7';
      note.style.fontWeight = '900';
      note.style.background = 'rgba(255,255,255,0.72)';
      wrapper.appendChild(note);
      img.style.display = 'none';
    });
  });
})();
