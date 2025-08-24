// Centralized modal controls (video + music)
// Lazy-load AudioController only when needed

let audioControllerInstance = null;

export function initModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const modalPlayer = document.getElementById('modalPlayer');
  const modalBackdrop = modal.querySelector('.modal-backdrop');

  const close = async () => {
    // Pause and reset music modal audio if present
    const modalAudio = document.getElementById('musicModalAudio');
    if (modalAudio) {
      modalAudio.pause();
      modalAudio.currentTime = 0;
    }
    modal.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.style.display = 'none';
      if (modalPlayer) modalPlayer.innerHTML = '';
      // Hide both modal-content.music and modal-content.video for reset
      const modalVideoDiv = modal.querySelector('.modal-content.video');
      const modalMusicDiv = modal.querySelector('.modal-content.music');
      if (modalVideoDiv) modalVideoDiv.classList.add('hidden');
      if (modalMusicDiv) modalMusicDiv.classList.add('hidden');
      // Hide audio player if present
      const audioPlayerContainer = document.querySelector('.modal-content.music .audio-player');
      if (audioPlayerContainer) audioPlayerContainer.classList.add('hidden');
      // Delegate UI reset AFTER fade-out completes to avoid flicker
      (async () => {
        try {
          const mod = await import('./audioController.js');
          if (typeof mod.resetModalAudio === 'function') mod.resetModalAudio();
        } catch (_) {}
      })();
    }, 300);
  };

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', close);
    modalBackdrop.setAttribute('tabindex', '0');
    modalBackdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') close();
    });
  }
}

export function openVideoModal(youtubeId) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const modalPlayer = document.getElementById('modalPlayer');
  const videoDiv = modal.querySelector('.modal-content.video');
  const musicDiv = modal.querySelector('.modal-content.music');
  videoDiv?.classList.remove('hidden');
  musicDiv?.classList.add('hidden');
  if (modalPlayer && youtubeId) {
    modalPlayer.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&color=white" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Force reflow to ensure first-time transition
  void modal.offsetWidth;
  requestAnimationFrame(() => modal.classList.add('visible'));
}

export async function openMusicModal({ title = '', desc = '', imageSrc = '', youtubeId, soundcloudTrack, audioSrc, releaseDate }) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const modalImage = document.getElementById('musicModalImage');
  const modalTitle = document.getElementById('musicModalTitle');
  const modalDesc = document.getElementById('musicModalDesc');
  const modalYoutube = document.getElementById('musicModalYoutube');
  const modalSoundcloud = document.getElementById('musicModalSoundcloud');
  const modalAudio = document.getElementById('musicModalAudio');
  const seekBar = document.getElementById('seekBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const videoDiv = modal.querySelector('.modal-content.video');
  const musicDiv = modal.querySelector('.modal-content.music');

  musicDiv?.classList.remove('hidden');
  videoDiv?.classList.add('hidden');

  if (modalImage) modalImage.src = imageSrc;
  if (modalTitle) modalTitle.textContent = title;
  // Description and release date display
  if (modalDesc) {
    if (releaseDate) {
      const date = new Date(releaseDate);
      if (!isNaN(date)) {
        const yy = String(date.getFullYear()).slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yy}.${mm}.${dd}`;
        modalDesc.textContent = `${desc} / ${formattedDate}`;
      } else {
        modalDesc.textContent = desc;
      }
    } else {
      modalDesc.textContent = desc;
    }
  }

  if (modalYoutube) {
    if (youtubeId) {
      modalYoutube.href = `https://www.youtube.com/watch?v=${youtubeId}`;
      modalYoutube.classList.remove('hidden');
    } else {
      modalYoutube.classList.add('hidden');
    }
  }

  if (modalSoundcloud) {
    if (soundcloudTrack) {
      modalSoundcloud.href = `https://soundcloud.com/${soundcloudTrack}`;
      modalSoundcloud.classList.remove('hidden');
    } else {
      modalSoundcloud.classList.add('hidden');
    }
  }

  // Audio (optional) — delegate all audio UI/logic to audioController.js
  if (modalAudio) {
    try {
      const mod = await import('./audioController.js');
      const playPause = document.getElementById('playPause');
      const volumeBtn = document.getElementById('volumeBtn');
      const volumeBar = document.getElementById('volumeBar');
      const playerUI = musicDiv?.querySelector('.audio-player') || null;
      audioControllerInstance = mod.initModalAudio({
        audioEl: modalAudio,
        playPause,
        seekBar,
        volumeBtn,
        volumeBar,
        currentTimeEl,
        durationEl,
        playerUI,
        audioSrc
      });
    } catch (_) {}
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Force reflow to ensure first-time transition
  void modal.offsetWidth;
  requestAnimationFrame(() => modal.classList.add('visible'));
}


