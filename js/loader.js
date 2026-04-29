/* ============================================
   LOADER — EPIC TECH BATTLE LOADING SCREEN
   Electric bolts, energy orbs, shockwaves,
   circuit traces, glitch effects
   ============================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('loader-canvas');
  const ctx = canvas.getContext('2d');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const loaderEl = document.getElementById('loader');
  const mainSite = document.getElementById('main-site');

  let particles = [];
  let bolts = [];
  let shockwaves = [];
  let sparks = [];
  let orbs = [];
  let circuitNodes = [];
  let mouse = { x: -1000, y: -1000 };
  let progress = 0;
  let animFrame;
  let time = 0;

  // --- Resize Canvas ---
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initCircuitNodes();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Mouse / Touch interaction ---
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Spawn sparks on mouse move
    if (Math.random() > 0.7) {
      for (let i = 0; i < 3; i++) {
        sparks.push(new Spark(mouse.x, mouse.y));
      }
    }
  });

  document.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  });

  // Click creates shockwave
  document.addEventListener('click', (e) => {
    shockwaves.push(new Shockwave(e.clientX, e.clientY));
    // Explode sparks
    for (let i = 0; i < 15; i++) {
      sparks.push(new Spark(e.clientX, e.clientY));
    }
  });

  // --- Color Palette ---
  const colors = {
    blue: { r: 37, g: 99, b: 235 },
    purple: { r: 124, g: 58, b: 237 },
    green: { r: 5, g: 150, b: 105 },
    cyan: { r: 6, g: 182, b: 212 },
    red: { r: 239, g: 68, b: 68 }
  };
  const colorKeys = Object.keys(colors);

  function randomColor() {
    return colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
  }

  // ===================================
  // PARTICLE — Floating energy dots
  // ===================================
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      const c = randomColor();
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 0.5;
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.speedY = (Math.random() - 0.5) * 1.2;
      this.r = c.r; this.g = c.g; this.b = c.b;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse attraction/repulsion
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        this.x -= dx * force * 0.02;
        this.y -= dy * force * 0.02;
        this.opacity = Math.min(0.9, this.opacity + 0.01);
      }

      // Pulsing
      this.opacity = (Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.3 + 0.4);

      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }
    draw() {
      // Glow
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
      grad.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.opacity})`);
      grad.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.opacity + 0.3})`;
      ctx.fill();
    }
  }

  // ===================================
  // LIGHTNING BOLT — Electric discharge
  // ===================================
  class LightningBolt {
    constructor() {
      this.reset();
    }
    reset() {
      const c = randomColor();
      this.r = c.r; this.g = c.g; this.b = c.b;
      this.life = 1;
      this.decay = Math.random() * 0.03 + 0.02;
      this.width = Math.random() * 2 + 1;

      // Random start/end points (from edges or center)
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { this.x1 = Math.random() * canvas.width; this.y1 = 0; }
      else if (side === 1) { this.x1 = canvas.width; this.y1 = Math.random() * canvas.height; }
      else if (side === 2) { this.x1 = Math.random() * canvas.width; this.y1 = canvas.height; }
      else { this.x1 = 0; this.y1 = Math.random() * canvas.height; }

      this.x2 = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
      this.y2 = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;

      this.segments = this.generateSegments();
    }
    generateSegments() {
      const segs = [];
      const steps = 8 + Math.floor(Math.random() * 8);
      let x = this.x1, y = this.y1;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const tx = this.x1 + (this.x2 - this.x1) * t;
        const ty = this.y1 + (this.y2 - this.y1) * t;
        const jitter = (1 - Math.abs(t - 0.5) * 2) * 60;
        x = tx + (Math.random() - 0.5) * jitter;
        y = ty + (Math.random() - 0.5) * jitter;
        segs.push({ x, y });
      }
      return segs;
    }
    update() {
      this.life -= this.decay;
      if (this.life <= 0) {
        this.reset();
      }
      // Regenerate segments for flicker
      if (Math.random() > 0.6) {
        this.segments = this.generateSegments();
      }
    }
    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.life * 0.6;

      // Outer glow
      ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${this.life * 0.3})`;
      ctx.lineWidth = this.width * 4;
      ctx.shadowColor = `rgb(${this.r},${this.g},${this.b})`;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();

      // Core
      ctx.strokeStyle = `rgba(255,255,255,${this.life * 0.8})`;
      ctx.lineWidth = this.width;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  // ===================================
  // SHOCKWAVE — Expanding ring on click
  // ===================================
  class Shockwave {
    constructor(x, y) {
      const c = randomColor();
      this.x = x;
      this.y = y;
      this.r = c.r; this.g = c.g; this.b = c.b;
      this.radius = 0;
      this.maxRadius = 300;
      this.life = 1;
      this.speed = 6;
    }
    update() {
      this.radius += this.speed;
      this.life = 1 - this.radius / this.maxRadius;
    }
    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.life * 0.4;

      // Ring
      ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${this.life})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = `rgb(${this.r},${this.g},${this.b})`;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = `rgba(255,255,255,${this.life * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ===================================
  // SPARK — Exploding particle bits
  // ===================================
  class Spark {
    constructor(x, y) {
      const c = randomColor();
      this.x = x;
      this.y = y;
      this.r = c.r; this.g = c.g; this.b = c.b;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.decay = Math.random() * 0.03 + 0.02;
      this.size = Math.random() * 2 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.life -= this.decay;
    }
    draw() {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.life})`;
      ctx.shadowColor = `rgb(${this.r},${this.g},${this.b})`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ===================================
  // ENERGY ORBS — Pulsing battle spheres
  // ===================================
  class EnergyOrb {
    constructor() {
      this.reset();
    }
    reset() {
      const c = randomColor();
      this.r = c.r; this.g = c.g; this.b = c.b;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseRadius = Math.random() * 30 + 15;
      this.radius = this.baseRadius;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.phase = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.radius = this.baseRadius + Math.sin(time * 0.015 + this.phase) * 8;

      if (this.x < -50 || this.x > canvas.width + 50) this.speedX *= -1;
      if (this.y < -50 || this.y > canvas.height + 50) this.speedY *= -1;
    }
    draw() {
      // Multi-layer glow
      for (let i = 3; i >= 0; i--) {
        const r = this.radius * (1 + i * 0.5);
        const alpha = 0.02 / (i + 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`;
        ctx.fill();
      }
      // Core
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, `rgba(255,255,255,0.15)`);
      grad.addColorStop(0.5, `rgba(${this.r},${this.g},${this.b},0.08)`);
      grad.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // ===================================
  // CIRCUIT NODES — Grid tech pattern
  // ===================================
  function initCircuitNodes() {
    circuitNodes = [];
    const spacing = 100;
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      for (let y = spacing / 2; y < canvas.height; y += spacing) {
        if (Math.random() > 0.5) {
          circuitNodes.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            active: Math.random() > 0.6,
            pulse: Math.random() * Math.PI * 2
          });
        }
      }
    }
  }

  function drawCircuitGrid() {
    ctx.save();
    ctx.globalAlpha = 0.08;

    for (let i = 0; i < circuitNodes.length; i++) {
      const node = circuitNodes[i];
      const brightness = node.active ? (Math.sin(time * 0.02 + node.pulse) * 0.5 + 0.5) : 0.2;

      // Node dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 180, 255, ${brightness})`;
      ctx.fill();

      // Connect to nearest neighbors
      for (let j = i + 1; j < circuitNodes.length; j++) {
        const other = circuitNodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const maxDist = isMobile ? 70 : 120;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          // Right angle connection for circuit feel
          if (Math.random() > 0.5) {
            ctx.lineTo(other.x, node.y);
            ctx.lineTo(other.x, other.y);
          } else {
            ctx.lineTo(node.x, other.y);
            ctx.lineTo(other.x, other.y);
          }
          ctx.strokeStyle = `rgba(100, 180, 255, ${brightness * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // ===================================
  // ENERGY CONNECTIONS between particles
  // ===================================
  function drawEnergyConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = 0.15 * (1 - dist / 130);
          const r = Math.floor((particles[i].r + particles[j].r) / 2);
          const g = Math.floor((particles[i].g + particles[j].g) / 2);
          const b = Math.floor((particles[i].b + particles[j].b) / 2);

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // ===================================
  // SCANNING LINE — Radar sweep
  // ===================================
  function drawScanLine() {
    const y = (time * 1.5) % (canvas.height + 40) - 20;
    const grad = ctx.createLinearGradient(0, y - 20, 0, y + 20);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0)');
    grad.addColorStop(0.5, 'rgba(37, 99, 235, 0.06)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 20, canvas.width, 40);
  }

  // ===================================
  // HEX GRID background pattern
  // ===================================
  function drawHexGrid() {
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
    ctx.lineWidth = 0.5;

    const size = 40;
    const h = size * Math.sqrt(3);
    for (let row = -1; row < canvas.height / h + 1; row++) {
      for (let col = -1; col < canvas.width / (size * 1.5) + 1; col++) {
        const x = col * size * 1.5;
        const y = row * h + (col % 2 ? h / 2 : 0);
        drawHex(x, y, size);
      }
    }
    ctx.restore();
  }

  function drawHex(cx, cy, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // ===================================
  // GLITCH TEXT effect on quote
  // ===================================
  function triggerGlitch() {
    const quote = document.querySelector('.loader-quote');
    if (!quote) return;
    quote.classList.add('glitch-active');
    setTimeout(() => quote.classList.remove('glitch-active'), 200);
  }

  // Random glitches
  const glitchInterval = setInterval(triggerGlitch, 3000 + Math.random() * 3000);

  // ===================================
  // BATTLE STATUS — Cycling messages
  // ===================================
  const statusMessages = [
    'Initializing battle systems...',
    'Loading combat modules...',
    'Calibrating neural networks...',
    'Syncing team databases...',
    'Powering up challenge engines...',
    'Establishing secure connections...',
    'Deploying hackathon protocols...',
    'Activating innovation cores...',
    'Battle arena ready...',
    'All systems operational ⚡'
  ];
  let statusIndex = 0;
  const statusEl = document.getElementById('loader-status');

  const statusInterval = setInterval(() => {
    statusIndex = (statusIndex + 1) % statusMessages.length;
    if (statusEl) {
      statusEl.style.opacity = '0';
      setTimeout(() => {
        statusEl.textContent = statusMessages[statusIndex];
        statusEl.style.opacity = '1';
      }, 300);
    }
  }, 1200);

  // ===================================
  // INIT ALL ELEMENTS
  // ===================================
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const numParticles = isMobile 
    ? Math.min(40, Math.floor((canvas.width * canvas.height) / 36000))
    : Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }

  // Lightning bolts
  for (let i = 0; i < 3; i++) {
    bolts.push(new LightningBolt());
  }

  // Energy orbs
  for (let i = 0; i < 5; i++) {
    orbs.push(new EnergyOrb());
  }

  initCircuitNodes();

  // ===================================
  // MAIN ANIMATION LOOP
  // ===================================
  function animate() {
    time++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Hex grid background
    drawHexGrid();

    // Layer 2: Circuit nodes
    drawCircuitGrid();

    // Layer 3: Scan line
    drawScanLine();

    // Layer 4: Energy orbs
    for (const orb of orbs) {
      orb.update();
      orb.draw();
    }

    // Layer 5: Particles + connections
    for (const p of particles) {
      p.update();
      p.draw();
    }
    drawEnergyConnections();

    // Layer 6: Lightning bolts
    for (const bolt of bolts) {
      bolt.update();
      bolt.draw();
    }

    // Layer 7: Shockwaves
    shockwaves = shockwaves.filter(s => s.life > 0);
    for (const s of shockwaves) {
      s.update();
      s.draw();
    }

    // Layer 8: Sparks
    sparks = sparks.filter(s => s.life > 0);
    for (const s of sparks) {
      s.update();
      s.draw();
    }

    // Periodically spawn new bolts
    if (Math.random() > 0.985) {
      bolts.push(new LightningBolt());
      if (bolts.length > 6) bolts.shift();
    }

    // Auto shockwave effects
    if (Math.random() > 0.995) {
      shockwaves.push(new Shockwave(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }

    animFrame = requestAnimationFrame(animate);
  }
  animate();

  // ===================================
  // REAL LOADING PROGRESS
  // ===================================
  const resources = document.querySelectorAll('img, link[rel="stylesheet"], script[src]');
  let loaded = 0;
  const total = resources.length || 1;

  function updateProgress() {
    loaded++;
    progress = Math.min(Math.floor((loaded / total) * 100), 100);
    loaderBar.style.width = progress + '%';
    loaderPercent.textContent = progress + '%';

    if (progress >= 100) {
      finishLoading();
    }
  }

  resources.forEach((res) => {
    if (res.complete || res.readyState === 'complete') {
      updateProgress();
    } else {
      res.addEventListener('load', updateProgress);
      res.addEventListener('error', updateProgress);
    }
  });

  // Fallback: force complete after timeout
  setTimeout(() => {
    if (progress < 100) {
      progress = 100;
      loaderBar.style.width = '100%';
      loaderPercent.textContent = '100%';
      finishLoading();
    }
  }, 10000);

  // ⚡ MINIMUM 3 SECONDS so user can see the intro
  let minimumTimePassed = false;
  setTimeout(() => { minimumTimePassed = true; }, 3000);

  let finishCalled = false;
  function finishLoading() {
    if (finishCalled) return;
    finishCalled = true;

    const complete = () => {
      // Final flash effect
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:rgba(37,99,235,0.15);z-index:10001;pointer-events:none;animation:loaderFlash 0.6s ease forwards';
      document.body.appendChild(flash);

      // Clear intervals to prevent memory leaks
      clearInterval(glitchInterval);
      clearInterval(statusInterval);

      setTimeout(() => {
        flash.remove();
        cancelAnimationFrame(animFrame);
        loaderEl.classList.add('hidden');
        document.body.classList.remove('loading');
        mainSite.classList.add('visible');

        // Trigger scroll reveals
        setTimeout(() => {
          window.dispatchEvent(new Event('scroll'));
        }, 100);
      }, 400);
    };

    if (minimumTimePassed) {
      complete();
    } else {
      const check = setInterval(() => {
        if (minimumTimePassed) {
          clearInterval(check);
          complete();
        }
      }, 100);
    }
  }
})();
