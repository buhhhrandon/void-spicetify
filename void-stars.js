(function void_stars() {
  // wait for Spotify to finish loading
  if (!document.querySelector('.Root__main-view')) {
    setTimeout(void_stars, 500);
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'metros-starfield';
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 0;
    opacity: 0.55;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
  });

  // ── static stars ──
  const STAR_COUNT = 180;
  const stars = [];

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        o: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  initStars();

  // ── shooting stars ──
  const shooters = [];

  function spawnShooter() {
    const angle = (Math.random() * 20 + 10) * (Math.PI / 180);
    const speed = Math.random() * 6 + 8;
    shooters.push({
      x: Math.random() * W * 0.6,
      y: Math.random() * H * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: Math.random() * 120 + 60,
      life: 1.0,
      decay: Math.random() * 0.012 + 0.008,
      width: Math.random() * 1.2 + 0.4,
    });
  }

  // spawn a shooter every 2.5-6 seconds
  function scheduleShooter() {
    spawnShooter();
    setTimeout(scheduleShooter, Math.random() * 3500 + 2500);
  }
  scheduleShooter();

  // ── nebula pockets ──
  const nebulas = [
    { x: W * 0.2, y: H * 0.25, rx: 160, ry: 120, color: '80,20,180' },
    { x: W * 0.75, y: H * 0.6,  rx: 180, ry: 140, color: '20,40,140' },
    { x: W * 0.55, y: H * 0.15, rx: 120, ry: 90,  color: '60,10,120' },
  ];

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;

    // nebula glow
    nebulas.forEach(n => {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
      grad.addColorStop(0,   `rgba(${n.color}, 0.07)`);
      grad.addColorStop(0.5, `rgba(${n.color}, 0.03)`);
      grad.addColorStop(1,   `rgba(${n.color}, 0)`);
      ctx.save();
      ctx.scale(n.rx / Math.max(n.rx, n.ry), n.ry / Math.max(n.rx, n.ry));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(
        n.x / (n.rx / Math.max(n.rx, n.ry)),
        n.y / (n.ry / Math.max(n.rx, n.ry)),
        Math.max(n.rx, n.ry), 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });

    // static stars with twinkle
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.o * twinkle})`;
      ctx.fill();
    });

    // shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      const tailX = s.x - s.vx * (s.len / Math.sqrt(s.vx*s.vx + s.vy*s.vy));
      const tailY = s.y - s.vy * (s.len / Math.sqrt(s.vx*s.vx + s.vy*s.vy));

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0,   `rgba(255,255,255,0)`);
      grad.addColorStop(0.6, `rgba(200,180,255,${s.life * 0.4})`);
      grad.addColorStop(1,   `rgba(255,255,255,${s.life})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      // head glow
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
      glow.addColorStop(0, `rgba(255,255,255,${s.life * 0.8})`);
      glow.addColorStop(1, `rgba(180,150,255,0)`);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0 || s.x > W || s.y > H) {
        shooters.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
  // fix progress bar — sliderArea keeps getting reset to white by Spotify's renderer
  function fixProgressBar() {
    document.querySelectorAll('.x-progressBar-sliderArea').forEach(el => {
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
    });
    document.querySelectorAll('.x-progressBar-fillColor').forEach(el => {
      el.style.setProperty('background', '#ffffff', 'important');
      el.style.setProperty('background-color', '#ffffff', 'important');
    });
    document.querySelectorAll('.x-progressBar-progressBarBg').forEach(el => {
      el.style.setProperty('background-color', '#4a1fa8', 'important');
      el.style.setProperty('--bg-color', '#4a1fa8', 'important');
    });
  }

  // MutationObserver catches every re-render instantly
  const progressObserver = new MutationObserver(() => fixProgressBar());
  progressObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // also run on rAF loop to catch any missed frames
  function progressLoop() {
    fixProgressBar();
    requestAnimationFrame(progressLoop);
  }
  progressLoop();

})();
