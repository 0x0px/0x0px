import { initModal } from './js/modal.js';
import { initMessageForm } from './js/messageForm.js';
import { initCursorFollower } from './js/cursorFollower.js';

// Disable scroll restoration and force scroll to top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
let bgTargetX = 0, bgTargetY = 0, bgCurrentX = 0, bgCurrentY = 0;
const smoothFactor = 0.05;
const followerSpeed = 0.15;
const maxMove = 15;

function initBackgroundAndFollower() {
  const background = document.getElementById('background');
  const follower = document.getElementById('cursorFollower');

  // Background Fade-In
  requestAnimationFrame(() => {
    if (background) background.classList.add('loaded');
  });

  document.addEventListener('mousemove', (e) => {
    // Cursor Follower
    targetX = e.clientX;
    targetY = e.clientY;

    // Background Fade-In
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    bgTargetX = -x * maxMove;
    bgTargetY = -y * maxMove;
  });

  function animate() {
    // Background Fade-In
    bgCurrentX += (bgTargetX - bgCurrentX) * smoothFactor;
    bgCurrentY += (bgTargetY - bgCurrentY) * smoothFactor;
    background.style.transform = `translate(${bgCurrentX}px, ${bgCurrentY}px)`;

    // Cursor Follower
    currentX += (targetX - currentX) * followerSpeed;
    currentY += (targetY - currentY) * followerSpeed;
    follower.style.transform = `translate(${currentX}px, ${currentY}px)`;

    requestAnimationFrame(animate);
  }

  animate();
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

// Format release date to yy.MM.dd in user's local timezone
function formatReleaseDateLocal(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

// Set release date text for target element
function setReleaseDate(targetElement, dateStr) {
  if (!targetElement) return;
  const formatted = formatReleaseDateLocal(dateStr);
  if (formatted) {
    targetElement.textContent = `${formatted}`;
  } else {
    targetElement.textContent = ''; // hide if no date
  }
}


// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  // Import Carousel and initialize carousels
  const { Carousel } = await import('./js/carousel.js');

  // Initialize all carousel containers on the page
  document.querySelectorAll('.carousel-container').forEach(container => {
    new Carousel(container);
  });

  initBackgroundAndFollower();
  initContainer();
  initModal();
  initTypingEffect();
  initCopyMail();
  initMessageForm();
  initCursorFollower();

  // Add release dates to each music thumbnail's .project-info .release-date element
  document.querySelectorAll('.music-thumbnail').forEach(el => {
    const releaseEl = el.querySelector('.project-info .release-date');
    if (!releaseEl) return;
    const dateStr = el.dataset.releaseDate || '';
    setReleaseDate(releaseEl, dateStr);
    // Modal trigger
    el.addEventListener('click', () => {
      const title = el.querySelector('.project-title')?.textContent || '';
      const desc = el.querySelector('.desc:not(.release-date)')?.textContent || '';
      const imageSrc = el.querySelector('img')?.src || '';
      const youtubeId = el.dataset.youtube || '';
      const soundcloudTrack = el.dataset.soundcloudTrack || '';
      const audioSrc = el.dataset.audio || '';
      const releaseDate = el.dataset.releaseDate || '';
      import('./js/modal.js').then(mod => {
        mod.openMusicModal({
          title,
          desc,
          imageSrc,
          youtubeId,
          soundcloudTrack,
          audioSrc,
          releaseDate
        });
      });
    });
  });

// Visitor Counter
const visitorCounterEl = document.getElementById('visitorCount');

if (visitorCounterEl) {
  visitorCounterEl.textContent = '(„• ֊ •„)'; // Loading
}

function getOrdinalSuffix(n) {
  const j = n % 10,
        k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

fetch("https://count.0x0px.net/visitor", { cache: "no-store" })
  .then(res => res.json())
  .then(data => {
    if(visitorCounterEl) {
      const count = data.value;
      visitorCounterEl.textContent = `you are the ${count}${getOrdinalSuffix(count)} visitor ⸜(｡˃ ᵕ ˂ )⸝♡`;
    }
  })
  .catch(err => console.error("visitor counter error:", err));
});