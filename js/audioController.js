export class AudioController {
    constructor(audioEl, playBtn, seekBar, volumeBtn, volumeBar, currentTimeEl, durationEl) {
      this.audio = audioEl;
      this.playBtn = playBtn;
      this.seekBar = seekBar;
      this.volumeBtn = volumeBtn;
      this.volumeBar = volumeBar;
      this.currentTimeEl = currentTimeEl;
      this.durationEl = durationEl;
      this.previousVolume = audioEl.volume ?? 1;
      this.seekBarAnimationFrame = null;
      this.triedInfinityFix = false;
  
      this.init();
    }
  
    init() {
      if (!this.audio) return;
      const updateDurationUI = () => {
        let dur = this.audio.duration;
        if (!isFinite(dur) || dur <= 0) {
          if (this.audio.seekable && this.audio.seekable.length > 0) {
            dur = this.audio.seekable.end(this.audio.seekable.length - 1);
          }
        }
        if (isFinite(dur) && dur > 0) {
          const max = Math.ceil(dur);
          this.seekBar.max = max;
          this.durationEl.textContent = this.formatTime(max);
        }
      };

      this.repeatBtn = document.getElementById("repeatBtn");
      if (this.repeatBtn) {
        this.repeatBtn.addEventListener("click", () => {
          this.audio.loop = !this.audio.loop;
          this.repeatBtn.classList.toggle("active", this.audio.loop);
        });
      }

      // Play/pause button
      this.playBtn.addEventListener("click", () => {
        if (this.audio.paused) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      });

      // Seek bar input
      this.seekBar.addEventListener("input", () => {
        const val = Number(this.seekBar.value) || 0;
        this.audio.currentTime = val;
        this.updateSeekBar();
      });

      // Volume slider input
      this.volumeBar.addEventListener("input", () => {
        this.audio.volume = this.volumeBar.value;
        this.updateVolumeUI();
        if (this.audio.volume > 0) this.previousVolume = this.audio.volume;
      });

      // Volume button mute/unmute
      this.volumeBtn.addEventListener("click", (e) => {
        if (e.target === this.volumeBtn || e.target.tagName === "I") {
          if (this.audio.volume === 0) {
            this.audio.volume = this.previousVolume;
          } else {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
          }
          this.volumeBar.value = this.audio.volume;
          this.updateVolumeUI();
        }
      });

      // Audio events
      this.audio.addEventListener("loadedmetadata", () => {
        if (!isFinite(this.audio.duration) && !this.triedInfinityFix) {
          this.triedInfinityFix = true;
          const onFix = () => {
            this.audio.currentTime = 0;
            this.audio.removeEventListener('timeupdate', onFix);
            updateDurationUI();
          };
          this.audio.addEventListener('timeupdate', onFix);
          this.audio.currentTime = 1e9; // jump far to get duration
        }
        updateDurationUI();
        this.seekBar.style.background = `linear-gradient(to right, var(--color-surface-2) 0%, var(--color-surface-2) 100%)`;
        this.currentTimeEl.textContent = this.formatTime(0);
      });
      this.audio.addEventListener("durationchange", updateDurationUI);

      this.audio.addEventListener("play", () => {
        this.startSeekUpdate();
        // Change play button icon to pause
        const icon = this.playBtn.querySelector("i");
        if (icon) icon.className = "fa-solid fa-pause";
      });
      this.audio.addEventListener("pause", () => {
        this.stopSeekUpdate();
        // Change play button icon to play
        const icon = this.playBtn.querySelector("i");
        if (icon) icon.className = "fa-solid fa-play";
      });
      this.audio.addEventListener("ended", () => this.resetPlayer());

      // Ensure the volume bar UI is initialized on page load
      this.updateVolumeUI();
    }
  
    startSeekUpdate() {
      const update = () => {
        if (!this.audio.paused && !this.audio.ended) {
          const cur = Math.floor(this.audio.currentTime) || 0;
          const max = Number(this.seekBar.max) || Math.max(1, Math.floor(this.audio.duration) || 1);
          this.seekBar.value = cur;
          this.currentTimeEl.textContent = this.formatTime(cur);
          const percent = Math.min(100, Math.max(0, (cur / max) * 100));
          this.seekBar.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percent}%, var(--color-surface-2) ${percent}%, var(--color-surface-2) 100%)`;
          const realDur = Math.floor(this.audio.duration);
          if (isFinite(realDur) && realDur > max) {
            this.seekBar.max = realDur;
            this.durationEl.textContent = this.formatTime(realDur);
          }
          this.seekBarAnimationFrame = requestAnimationFrame(update);
        }
      };
      cancelAnimationFrame(this.seekBarAnimationFrame);
      update();
    }
  
    stopSeekUpdate() {
      cancelAnimationFrame(this.seekBarAnimationFrame);
    }
  
    resetPlayer() {
      this.stopSeekUpdate();
      this.audio.currentTime = 0;
      this.seekBar.value = 0;
      this.currentTimeEl.textContent = "0:00";
      this.seekBar.style.background = `linear-gradient(to right, var(--color-surface-2) 0%, var(--color-surface-2) 100%)`;
      // Set play icon on reset
      const icon = this.playBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-play";
      } else {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    }
  
    updateVolumeUI() {
      const icon = this.volumeBtn.querySelector("i");
      if (!icon) return;
      if (this.audio.volume === 0) {
        this.volumeBtn.classList.add("muted");
        icon.className = "fa-solid fa-volume-xmark";
      } else {
        this.volumeBtn.classList.remove("muted");
        icon.className = "fa-solid fa-volume-high";
      }
      const percent = this.audio.volume * 100;
      this.volumeBar.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percent}%, var(--color-surface-2) ${percent}%, var(--color-surface-2) 100%)`;
    }
  
    formatTime(sec) {
      if (isNaN(sec)) return "0:00";
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    }
  
    updateSeekBar() {
      const max = Number(this.seekBar.max) || Math.max(1, Math.floor(this.audio.duration) || 1);
      const val = Number(this.seekBar.value) || 0;
      const percent = Math.min(100, Math.max(0, (val / max) * 100));
      this.seekBar.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percent}%, var(--color-surface-2) ${percent}%, var(--color-surface-2) 100%)`;
      this.currentTimeEl.textContent = this.formatTime(val);
    }
  }

// ---- Modal integration helpers (single source of truth for audio UI) ----
let modalController = null;
let modalRefs = { audioEl: null, seekBar: null, currentTimeEl: null, playerUI: null };

export function resetModalAudio() {
  const { audioEl, seekBar, currentTimeEl, playerUI } = modalRefs;
  if (audioEl) {
    try { audioEl.pause(); } catch(_) {}
    audioEl.currentTime = 0;
  }
  if (seekBar) {
    seekBar.disabled = true;
    seekBar.value = 0;
    seekBar.style.background = `linear-gradient(to right, var(--color-surface-2) 0%, var(--color-surface-2) 100%)`;
  }
  if (currentTimeEl) currentTimeEl.textContent = '0:00';
  if (playerUI) playerUI.classList.add('hidden');
  // Do not nullify modalController or modalRefs to allow reuse
}

export function initModalAudio({ audioEl, playPause, seekBar, volumeBtn, volumeBar, currentTimeEl, durationEl, playerUI, audioSrc }) {
  modalRefs = { audioEl, seekBar, currentTimeEl, playerUI };
  if (!audioSrc || !audioSrc.trim()) {
    resetModalAudio();
    return null;
  }
  if (modalController) {
    // Reuse existing controller
    const srcEl = audioEl?.querySelector('source');
    if (srcEl) {
      srcEl.src = audioSrc;
      audioEl.load();
    }
    if (playerUI) playerUI.classList.remove('hidden');
    modalController.resetPlayer();
    if (seekBar) seekBar.disabled = false;
    return modalController;
  }
  if (playerUI) playerUI.classList.remove('hidden');
  if (seekBar) {
    seekBar.disabled = true;
    seekBar.value = 0;
    seekBar.style.background = `linear-gradient(to right, var(--color-surface-2) 0%, var(--color-surface-2) 100%)`;
  }
  if (currentTimeEl) currentTimeEl.textContent = '0:00';
  const srcEl = audioEl?.querySelector('source');
  if (audioEl && srcEl) { srcEl.src = audioSrc; audioEl.load(); }
  if (audioEl && playPause && seekBar && volumeBtn && volumeBar && currentTimeEl && durationEl) {
    modalController = new AudioController(audioEl, playPause, seekBar, volumeBtn, volumeBar, currentTimeEl, durationEl);
    const enableSeek = () => { if (seekBar) seekBar.disabled = false; };
    audioEl.addEventListener('loadedmetadata', enableSeek, { once: true });
    audioEl.addEventListener('durationchange', enableSeek, { once: true });
  }
  return modalController;
}