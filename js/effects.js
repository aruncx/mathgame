/* ==========================================================================
   PARTICLE PHYSICS & VISUAL EFFECTS ENGINE (HTML5 Canvas)
   ========================================================================== */

const EffectsEngine = (function () {
  "use strict";

  let canvas = null;
  let ctx = null;
  let particles = [];
  let animId = null;

  const COLORS = ['#FFD166', '#FF6B6B', '#52B788', '#70D6FF', '#9D4EDD', '#FF85A1', '#FF9F1C'];

  function init() {
    canvas = document.getElementById('fxCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle(x, y, type = 'confetti') {
    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'firework' ? Math.random() * 8 + 4 : Math.random() * 6 + 2;
    return {
      x: x !== undefined ? x : Math.random() * canvas.width,
      y: y !== undefined ? y : (type === 'confetti' ? -20 : canvas.height / 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'firework' ? 2 : 0),
      size: Math.random() * 10 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      gravity: type === 'firework' ? 0.15 : 0.08,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008,
      type: type
    };
  }

  function spawnConfetti(count = 40) {
    if (!canvas || !ctx) init();
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(undefined, undefined, 'confetti'));
    }
    startLoop();
  }

  function spawnFireworks(count = 60) {
    if (!canvas || !ctx) init();
    const centerX = canvas.width * (0.3 + Math.random() * 0.4);
    const centerY = canvas.height * (0.2 + Math.random() * 0.3);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(centerX, centerY, 'firework'));
    }
    startLoop();
  }

  function spawnSparkles(x, y, count = 25) {
    if (!canvas || !ctx) init();
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(x, y, 'sparkle'));
    }
    startLoop();
  }

  function startLoop() {
    if (!animId) {
      animId = requestAnimationFrame(update);
    }
  }

  function update() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.type === 'sparkle') {
        // Draw star sparkle shape
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw confetti rectangle
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(update);
    } else {
      animId = null;
    }
  }

  return {
    init,
    spawnConfetti,
    spawnFireworks,
    spawnSparkles
  };
})();
