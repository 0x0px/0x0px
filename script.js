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

// Carousel
function initCarousel() {
  const carousel = document.querySelector('.carousel');
  const prevButton = document.querySelector('.carousel-button.prev');
  const nextButton = document.querySelector('.carousel-button.next');
  const thumbnails = document.querySelectorAll('.youtube-thumbnail');

  // Show/hide buttons based on scroll position
  function updateButtonVisibility() {
    const isAtStart = carousel.scrollLeft === 0;
    const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth;
    prevButton.classList.toggle('hidden', isAtStart);
    nextButton.classList.toggle('hidden', isAtEnd);
  }

  // Scroll event listener
  carousel.addEventListener('scroll', updateButtonVisibility);

  // Initial button state
  updateButtonVisibility();

  // Button click scroll
  prevButton.addEventListener('click', () => {
    carousel.scrollBy({ left: -336, behavior: 'smooth' });
  });
  nextButton.addEventListener('click', () => {
    carousel.scrollBy({ left: 336, behavior: 'smooth' });
  });

  // Load YouTube Thumbnail
  thumbnails.forEach(el => {
    const id = el.dataset.id;
    const img = el.querySelector('img');
    img.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    el.addEventListener('click', () => {
      const modal = document.getElementById('videoModal');
      const modalPlayer = document.getElementById('modalPlayer');
      modalPlayer.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&color=white" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      document.body.style.overflow = 'hidden';
      modal.style.display = 'flex';
      requestAnimationFrame(() => {
        modal.classList.add('visible');
      });
    });
  });
}

// Modal
function initModal() {
  const modal = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('modalPlayer');
  const modalBackdrop = modal.querySelector('.modal-backdrop');

  modalBackdrop.addEventListener('click', () => {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.style.display = 'none';
      modalPlayer.innerHTML = '';
    }, 300);
  });
}

// Typing Animation
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const text = "✧˖°.   internet exclusive   .°˖✧";
  const typingSpeed = 80;
  const erasingSpeed = 40;
  const delayAfterTyping = 2000;
  const delayAfterErasing = 0;

  el.innerHTML = text.split('').map(char => {
    const isSpace = char === ' ';
    return `<span style="opacity:${isSpace ? 1 : 0};">${isSpace ? '&nbsp;' : char}</span>`;
  }).join('');
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

// Copy Mail
function initCopyMail() {
  const copyBtn = document.getElementById('copyMailBtn');
  if (!copyBtn) return;

  const mailAddress = '0x0px0x0@gmail.com';

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(mailAddress)
      .then(() => {
        copyBtn.innerHTML = 'copied! <i class="fa-solid fa-check fa-sm"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = 'copy mail <i class="fa-regular fa-copy fa-sm"></i>';
        }, 1500);
      })
      .catch(err => {
        console.error('failed to copy: ', err);
      });
  });
}

// Message Form: Discord Webhook integration & rate limit
function initMessageForm() {
  const form = document.getElementById('messageForm');
  if (!form) return;
  const msgInput = document.getElementById('msgContent');
  const sendBtn = document.getElementById('msgSendBtn');
  const descEl = document.querySelector('.section-header .desc');
  const defaultDesc = descEl ? descEl.textContent : '';
  let msgTimeout = null;
  let msgActive = false;
  let pendingMsg = null;

  // Auto-resize textarea (fix initial and input height)
  function autoResizeTextarea() {
    msgInput.style.height = 'auto';
    msgInput.style.height = msgInput.scrollHeight + 'px';
  }
  msgInput.setAttribute('rows', '1');
  autoResizeTextarea();
  msgInput.addEventListener('input', autoResizeTextarea);

  // Unified message display (success, error, normal)
  function showMessage(msg, type = 'normal') {
    if (!descEl) return;
    // If the same message is already active, ignore
    if (msgActive && descEl.textContent === msg) return;
    // If a new message is received, stop the current animation/timer and start immediately
    if (msgTimeout) {
      clearTimeout(msgTimeout);
      msgTimeout = null;
    }
    msgActive = true;
    pendingMsg = null;
    descEl.textContent = msg;
    descEl.classList.remove('fadeout', 'fadein', 'error', 'success', 'success-anim', 'shake');
    if (type === 'error') descEl.classList.add('error', 'shake');
    if (type === 'success') descEl.classList.add('success');
    setTimeout(() => {
      if (type === 'error') descEl.classList.remove('shake');
      msgTimeout = setTimeout(() => {
        descEl.classList.add('fadeout');
        setTimeout(() => {
          descEl.classList.remove('fadeout', 'error', 'success');
          descEl.textContent = defaultDesc;
          descEl.classList.add('fadein');
          setTimeout(() => {
            descEl.classList.remove('fadein');
            msgActive = false;
          }, 400);
          msgTimeout = null;
        }, 400);
      }, 1000);
    }, type === 'error' ? 500 : 0);
  }

  // Webhook URL
  const WEBHOOK_PROXY_URL = 'https://webhook.0x0px.net';

  // Only allow one message per 10 seconds
  const LIMIT_SECONDS = 10;
  const STORAGE_KEY = 'msgLastSent';

  function canSend() {
    const last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const now = Date.now();
    return (now - last) > LIMIT_SECONDS * 1000;
  }

  function updateLastSent() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }



  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!canSend()) {
      showMessage('you can only send one message every 10 seconds.', 'error');
      return;
    }
    const message = msgInput.value.trim();
    if (!message) {
      showMessage('please enter a message.', 'error');
      return;
    }
    sendBtn.disabled = true;
    sendBtn.innerHTML = 'sending... <i class="fa-solid fa-spinner fa-spin fa-sm"></i>';
    // Send only the raw message. Formatting/timestamp is handled by the Cloudflare Worker.
    const content = message;
    fetch(WEBHOOK_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    .then(res => {
      if (res.ok) {
        updateLastSent();
        form.reset();
        autoResizeTextarea();
        showMessage('message sent successfully!', 'success');
      } else {
        showMessage('failed to send. please try again later.', 'error');
      }
    })
    .catch(() => {
      showMessage('failed to send. please check your network.', 'error');
    })
    .finally(() => {
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'send <i class="fa-regular fa-paper-plane fa-sm"></i>';
    });
  });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  initBackground();
  initContainer();
  initCarousel();
  initModal();
  initTypingEffect();
  initCopyMail();
  initMessageForm();
});