export function initCursorFollower() {
  const follower = document.getElementById('cursorFollower');
  if (!follower) return;

  const followerImg = follower.querySelector('img');
  const defaultSrc = 'images/cursor_pet_1.png';
  const hoverSrc = 'images/cursor_pet_2.png';
  const shakeSrc = 'images/cursor_pet_3.png';

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let initialized = false;
  let lastMouseX = 0, lastMouseY = 0;
  let shakeTimer = null, shakeTriggered = false, isShakeActive = false;
  const shakeDuration = 1500;
  let lastAngle = null; let angleChangeHistory = [];

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX; targetY = e.clientY;
    const now = performance.now();
    const dx = e.clientX - lastMouseX; const dy = e.clientY - lastMouseY;
    const distance = Math.hypot(dx, dy);
    if (distance >= 40) {
      const angle = Math.atan2(dy, dx);
      if (lastAngle !== null) {
        let delta = Math.abs(angle - lastAngle);
        if (delta > Math.PI) delta = 2 * Math.PI - delta;
        angleChangeHistory.push({ time: now, delta });
        angleChangeHistory = angleChangeHistory.filter(a => now - a.time < 2000);
        const significant = angleChangeHistory.filter(a => a.delta > 0.6).length;
        if (!shakeTriggered && significant > 15) {
          shakeTriggered = true; isShakeActive = true; followerImg.src = shakeSrc;
          clearTimeout(shakeTimer);
          shakeTimer = setTimeout(() => { followerImg.src = defaultSrc; shakeTriggered = false; isShakeActive = false; }, shakeDuration);
        }
      }
      lastAngle = angle; lastMouseX = e.clientX; lastMouseY = e.clientY;
      if (!initialized) { currentX = targetX; currentY = targetY; follower.style.transform = `translate(${currentX}px, ${currentY}px)`; initialized = true; }
    }
  });

  function animateFollower() {
    const speed = 0.15;
    currentX += (targetX - currentX) * speed;
    currentY += (targetY - currentY) * speed;
    follower.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  function handleFirstMouseMove(e) {
    targetX = e.clientX; targetY = e.clientY; currentX = targetX; currentY = targetY;
    follower.style.transition = 'none';
    follower.style.transform = `translate(${currentX}px, ${currentY}px)`; follower.style.opacity = '0';
    void follower.offsetWidth;
    requestAnimationFrame(() => { follower.style.transition = 'transform 0.1s linear, opacity 0.3s ease'; follower.style.opacity = '1'; });
    initialized = true; document.removeEventListener('mousemove', handleFirstMouseMove);
  }
  document.addEventListener('mousemove', handleFirstMouseMove, { once: true });

  const hoverTargets = document.querySelectorAll('a[href], button, textarea, .button, .carousel-button, .youtube-thumbnail, .music-thumbnail');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => { if (!isShakeActive) followerImg.src = hoverSrc; });
    el.addEventListener('mouseleave', () => { if (!isShakeActive) followerImg.src = defaultSrc; });
  });

  const modal = document.getElementById('modal');
  if (modal) {
    const modalObserver = new MutationObserver(() => {
      const isVisible = modal.classList.contains('visible');
      follower.style.opacity = isVisible ? '0' : '1';
    });
    modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
}


