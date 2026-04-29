/* ============================================
   THEME ENGINE — Dynamic Hackathon Switching
   ============================================ */

(function () {
  'use strict';

  // --- Hackathon Content Data ---
  const hackathons = {
    solidwork: {
      theme: 'solidwork',
      badge: 'Hackathon #1',
      title: 'Solid Work',
      tagline: 'Build robust solutions. Ship real products. Prove your engineering excellence.',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      about: [
        'Solid Work is a 24-hour hackathon focused on building production-ready solutions to real-world challenges. No half-measures — participants are judged on code quality, architecture, scalability, and real impact.',
        'Whether you\'re a backend wizard, frontend artist, or full-stack warrior — this is your arena. Teams of up to 5 will compete to build the most solid, deployable solution within the time limit.'
      ],
      stats: [
        { number: '7H', label: 'Non-Stop' },
        { number: '15', label: 'Participants' },
        { number: 'to set later', label: 'Prize Pool' }
      ],
      motivation: 'The only way to do great work is to love what you do. This hackathon isn\'t just about winning — it\'s about pushing your limits, learning from brilliant peers, and building something you\'re genuinely proud of. Every line of code you write here is a step towards becoming the engineer you aspire to be.',
      prizes: [
        { rank: '1st Place', amount: 'to set later', desc: 'Trophy + Certificate + Mentorship opportunity', icon: '🏆' },
        { rank: '2nd Place', amount: 'to set later', desc: 'Trophy + Certificate + Tech gadgets', icon: '🥈' },
        { rank: '3rd Place', amount: 'to set later', desc: 'Certificate + Tech accessories', icon: '🥉' }
      ]
    },
    problemsolving: {
      theme: 'problemsolving',
      badge: 'Hackathon #2',
      title: 'Problem Solving',
      tagline: 'Think critically. Crack complex puzzles. Outsmart the competition.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
      about: [
        'Problem Solving is an intense algorithmic and analytical hackathon where teams tackle a series of increasingly difficult challenges. From data structures to optimization puzzles — only the sharpest minds survive.',
        'This isn\'t about pretty UIs — it\'s about raw brainpower. You\'ll face challenges in algorithms, mathematics, logic, and creative problem-solving that will test every ounce of your analytical ability.'
      ],
      stats: [
        { number: '12H', label: 'Challenge' },
        { number: '20+', label: 'Problems' },
        { number: 'to set later', label: 'Prize Pool' }
      ],
      motivation: 'Every expert was once a beginner. Every complex problem can be broken down into simpler pieces. In this hackathon, you\'ll discover that the greatest obstacle isn\'t the problem itself — it\'s the belief that you can\'t solve it. Step up, break through your mental barriers, and amaze yourself.',
      prizes: [
        { rank: '1st Place', amount: 'to set later', desc: 'Trophy + Certificate + Coding bootcamp access', icon: '🏆' },
        { rank: '2nd Place', amount: 'to set later', desc: 'Trophy + Certificate + Online course bundle', icon: '🥈' },
        { rank: '3rd Place', amount: 'to set later', desc: 'Certificate + Programming books', icon: '🥉' }
      ]
    },
    green: {
      theme: 'green',
      badge: 'Hackathon #3',
      title: 'Green Entrepreneurial',
      tagline: 'Innovate sustainably. Build green businesses. Change the world.',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80',
      about: [
        'Green Entrepreneurial challenges teams to develop sustainable business ideas powered by technology. From renewable energy solutions to eco-friendly apps — innovation meets environmental responsibility.',
        'This hackathon goes beyond code. Teams will pitch complete business plans with viable go-to-market strategies, sustainability metrics, and technology prototypes that address real environmental challenges.'
      ],
      stats: [
        { number: '48H', label: 'Duration' },
        { number: '15+', label: 'Teams' },
        { number: 'to set later', label: 'Prize Pool' }
      ],
      motivation: 'The future belongs to those who dare to dream green. Technology has the power to heal our planet — and YOU have the power to wield that technology. This hackathon isn\'t just a competition; it\'s a movement. Join us, and let your innovation become the seed of a sustainable tomorrow.',
      prizes: [
        { rank: '1st Place', amount: 'to set later', desc: 'Trophy + Incubator access + Seed funding', icon: '🏆' },
        { rank: '2nd Place', amount: 'to set later', desc: 'Trophy + Certificate + Mentorship program', icon: '🥈' },
        { rank: '3rd Place', amount: 'to set later', desc: 'Certificate + Business development resources', icon: '🥉' }
      ]
    }
  };

  // --- DOM References ---
  const body = document.body;
  const navBtns = document.querySelectorAll('.nav-btn');
  const heroContent = document.getElementById('hero-content');
  const aboutContent = document.getElementById('about-content');
  const motivationContent = document.getElementById('motivation-content');
  const prizesContent = document.getElementById('prizes-content');
  const themeCanvas = document.getElementById('theme-canvas');
  const themeCtx = themeCanvas.getContext('2d');

  let currentTheme = 'solidwork';
  let bgParticles = [];
  let bgAnimFrame;

  // --- Resize Theme Canvas ---
  function resizeThemeCanvas() {
    themeCanvas.width = window.innerWidth;
    themeCanvas.height = window.innerHeight;
  }
  resizeThemeCanvas();
  window.addEventListener('resize', resizeThemeCanvas);

  // --- Background Particle System (per theme) ---
  const themeColors = {
    solidwork: { h: 220, s: 80, l: 55 },
    problemsolving: { h: 265, s: 75, l: 58 },
    green: { h: 160, s: 95, l: 32 }
  };

  class BgParticle {
    constructor(theme) {
      this.reset(theme);
    }
    reset(theme) {
      const c = themeColors[theme] || themeColors.solidwork;
      this.x = Math.random() * themeCanvas.width;
      this.y = Math.random() * themeCanvas.height;
      this.size = Math.random() * 4 + 1;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.hue = c.h + (Math.random() - 0.5) * 30;
      this.sat = c.s;
      this.light = c.l + (Math.random() - 0.5) * 20;
      this.opacity = Math.random() * 0.3 + 0.05;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0) this.x = themeCanvas.width;
      if (this.x > themeCanvas.width) this.x = 0;
      if (this.y < 0) this.y = themeCanvas.height;
      if (this.y > themeCanvas.height) this.y = 0;
    }
    draw() {
      themeCtx.beginPath();
      themeCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      themeCtx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.opacity})`;
      themeCtx.fill();
    }
  }

  function initBgParticles(theme) {
    bgParticles = [];
    const count = Math.min(60, Math.floor((themeCanvas.width * themeCanvas.height) / 25000));
    for (let i = 0; i < count; i++) {
      bgParticles.push(new BgParticle(theme));
    }
  }

  function animateBg() {
    themeCtx.clearRect(0, 0, themeCanvas.width, themeCanvas.height);
    for (const p of bgParticles) {
      p.update();
      p.draw();
    }
    // Draw subtle connections
    for (let i = 0; i < bgParticles.length; i++) {
      for (let j = i + 1; j < bgParticles.length; j++) {
        const dx = bgParticles[i].x - bgParticles[j].x;
        const dy = bgParticles[i].y - bgParticles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          themeCtx.beginPath();
          themeCtx.moveTo(bgParticles[i].x, bgParticles[i].y);
          themeCtx.lineTo(bgParticles[j].x, bgParticles[j].y);
          const c = themeColors[currentTheme] || themeColors.solidwork;
          themeCtx.strokeStyle = `hsla(${c.h}, ${c.s}%, ${c.l}%, ${0.04 * (1 - dist / 150)})`;
          themeCtx.lineWidth = 0.5;
          themeCtx.stroke();
        }
      }
    }
    bgAnimFrame = requestAnimationFrame(animateBg);
  }

  // --- Render Content ---
  function renderHero(data) {
    heroContent.innerHTML = `
      <span class="hero-badge">${data.badge}</span>
      <h1>${data.title}</h1>
      <p>${data.tagline}</p>
      <a href="#registration" class="hero-cta">
        Register Now
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
      </a>
    `;
    heroContent.style.animation = 'none';
    heroContent.offsetHeight; // force reflow
    heroContent.style.animation = 'fadeUp 0.8s ease forwards';
  }

  function renderAbout(data) {
    let paragraphs = data.about.map(p => `<p>${p}</p>`).join('');
    let stats = data.stats.map(s => `
      <div class="stat-card">
        <div class="stat-number">${s.number}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');

    aboutContent.innerHTML = `
      <div class="about-grid">
        <div class="about-image">
          <img src="${data.image}" alt="${data.title} hackathon" loading="lazy">
        </div>
        <div class="about-text">
          <span class="section-label">About the Hackathon</span>
          <h2 class="section-title">${data.title}</h2>
          ${paragraphs}
          <div class="about-stats">${stats}</div>
        </div>
      </div>
    `;
  }

  function renderMotivation(data) {
    motivationContent.innerHTML = `
      <span class="section-label">Why Participate?</span>
      <h2 class="section-title">Fuel Your Passion</h2>
      <div class="motivation-card">
        <p>${data.motivation}</p>
        <div class="author">— ${data.title} Team</div>
      </div>
    `;
  }

  function renderPrizes(data) {
    let cards = data.prizes.map((p, i) => `
      <div class="prize-card ${i === 0 ? 'featured' : ''}">
        <div class="prize-icon">${p.icon}</div>
        <div class="prize-rank">${p.rank}</div>
        <div class="prize-amount">${p.amount}</div>
        <p class="prize-desc">${p.desc}</p>
      </div>
    `).join('');

    prizesContent.innerHTML = `
      <span class="section-label">Rewards</span>
      <h2 class="section-title">Prizes & Recognition</h2>
      <div class="prizes-grid">${cards}</div>
    `;
  }

  // --- Switch Theme ---
  function switchTheme(themeName) {
    if (themeName === currentTheme) return;
    currentTheme = themeName;

    const data = hackathons[themeName];
    if (!data) return;

    // Update data-theme on body
    body.setAttribute('data-theme', data.theme);

    // Update nav buttons
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeName);
    });

    // Render content with animation
    renderHero(data);
    renderAbout(data);
    renderMotivation(data);
    renderPrizes(data);

    // Restart background particles
    cancelAnimationFrame(bgAnimFrame);
    initBgParticles(themeName);
    animateBg();

    // Re-trigger scroll reveals
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
      });
      window.dispatchEvent(new Event('scroll'));
    }, 50);
  }

  // --- Nav Button Click Handlers ---
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTheme(btn.dataset.theme);
    });
  });

  // --- Scroll Reveal ---
  function handleScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', handleScrollReveal, { passive: true });

  // --- Init ---
  function init() {
    const defaultData = hackathons.solidwork;
    body.setAttribute('data-theme', 'solidwork');
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === 'solidwork');
    });
    renderHero(defaultData);
    renderAbout(defaultData);
    renderMotivation(defaultData);
    renderPrizes(defaultData);
    initBgParticles('solidwork');
    animateBg();

    // Initial scroll reveal
    setTimeout(handleScrollReveal, 200);
  }

  // Wait for main site to be visible
  const observer = new MutationObserver(() => {
    if (document.getElementById('main-site').classList.contains('visible')) {
      init();
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('main-site'), { attributes: true, attributeFilter: ['class'] });

  // Fallback init
  setTimeout(init, 7000);
})();
