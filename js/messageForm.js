export function initMessageForm() {
  const form = document.getElementById('messageForm');
  if (!form) return;
  const msgInput = document.getElementById('msgContent');
  const sendBtn = document.getElementById('msgSendBtn');
  const descEl = document.querySelector('.section-header .desc');
  const defaultDesc = descEl ? descEl.textContent : '';
  let msgTimeout = null;
  let msgActive = false;

  function autoResizeTextarea() {
    msgInput.style.height = 'auto';
    msgInput.style.height = msgInput.scrollHeight + 'px';
  }
  msgInput.setAttribute('rows', '1');
  autoResizeTextarea();
  msgInput.addEventListener('input', autoResizeTextarea);

  function showMessage(msg, type = 'normal') {
    if (!descEl) return;
    if (msgActive && descEl.textContent === msg) return;
    if (msgTimeout) {
      clearTimeout(msgTimeout);
      msgTimeout = null;
    }
    msgActive = true;
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

  const WEBHOOK_PROXY_URL = 'https://webhook.0x0px.net';
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

  form.addEventListener('submit', (e) => {
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
    fetch(WEBHOOK_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
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
    .catch(() => showMessage('failed to send. please check your network.', 'error'))
    .finally(() => {
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'send <i class="fa-regular fa-paper-plane fa-sm"></i>';
    });
  });
}


