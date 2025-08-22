// Modal is split into its own module
import { initModal } from './js/modal.js';
import { initMessageForm } from './js/messageForm.js';
import { initCursorFollower } from './js/cursorFollower.js';
// Disable scroll restoration and force scroll to top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Force scroll to top
window.scrollTo(0, 0);

// Background Fade-in
function initBackground() {
  const background = document.getElementById('background');

  requestAnimationFrame(() => {
    background.classList.add('loaded');
  });

  // Mouse movement based background animation - only on larger screens
  if (window.innerWidth > 640) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const maxMove = 15; // Maximum movement in pixels
    const smoothFactor = 0.05; // Lower value = smoother movement

    document.addEventListener('mousemove', (e) => {
      // Calculate mouse position relative to center (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      // Invert the direction (multiply by -1)
      targetX = -x * maxMove;
      targetY = -y * maxMove;
    });

    function animateBackground() {
      // Smooth interpolation between current and target position
      currentX += (targetX - currentX) * smoothFactor;
      currentY += (targetY - currentY) * smoothFactor;
      background.style.transform = `translate(${currentX}px, ${currentY}px)`;
      requestAnimationFrame(animateBackground);
    }
    animateBackground();
  }
}

// Container Animation
function initContainer() {
  const container = document.getElementById('container');
  requestAnimationFrame(() => {
    container.classList.add('show');
  });
}



// Typing Animation
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const text = '<span aria-hidden="true">✧˖°.</span>   internet exclusive   <span aria-hidden="true">.°˖✧</span>';
  const typingSpeed = 80;
  const erasingSpeed = 40;
  const delayAfterTyping = 2000;
  const delayAfterErasing = 0;

  el.innerHTML = text.replace(/<[^>]*>|[^<]/g, (match) => {
    if (match.startsWith('<')) return match; // Keep HTML tags (e.g. <span aria-hidden="true">)
    const isSpace = match === ' ';
    return `<span style="opacity:${isSpace ? 1 : 0};">${isSpace ? '&nbsp;' : match}</span>`;
  });
  const charSpans = Array.from(el.querySelectorAll('span')).filter(span => span.innerHTML !== '&nbsp;');

  let i = 0;
  let isErasing = false;

  function type() {
    if (!isErasing) {
      if (i < charSpans.length) {
        charSpans[i].style.transition = 'opacity 0.3s';
        charSpans[i].style.opacity = '1';
        i++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(() => { isErasing = true; i = 0; type(); }, delayAfterTyping);
      }
    } else {
      if (i < charSpans.length) {
        charSpans[i].style.transition = 'opacity 0.8s';
        charSpans[i].style.opacity = '0';
        i++;
        setTimeout(type, erasingSpeed);
      } else {
        isErasing = false;
        i = 0;
        setTimeout(type, delayAfterErasing);
      }
    }
  }
  type();
}

// Copy Button Initialization
function initCopyButton(buttonId, textToCopy, defaultText, copiedText) {
  const copyBtn = document.getElementById(buttonId);
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        copyBtn.innerHTML = copiedText;
        setTimeout(() => {
          copyBtn.innerHTML = defaultText;
        }, 1500);
      })
      .catch(err => {
        console.error('failed to copy: ', err);
      });
  });
}
function initCopyMail() {
  initCopyButton(
    'copyMailBtn',
    '0x0px0x0@gmail.com',
    'copy mail <i class="fa-regular fa-copy fa-sm"></i>',
    'copied! <i class="fa-solid fa-check fa-sm"></i>'
  );
  initCopyButton(
    'copyDiscordBtn',
    '0x0x0px',
    '0x0x0px <i class="fa-brands fa-discord fa-sm"></i>',
    'copied! <i class="fa-solid fa-check fa-sm"></i>'
  );
}


// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  // Import Carousel and initialize carousels
  const { Carousel } = await import('./js/carousel.js');

  // Initialize all carousel containers on the page
  document.querySelectorAll('.carousel-container').forEach(container => {
    new Carousel(container);
  });

  // Audio controller setup is handled inside modal.js when opening music modal

  initBackground();
  initContainer();
  initModal();
  initTypingEffect();
  initCopyMail();
  initMessageForm();
  initCursorFollower();
});