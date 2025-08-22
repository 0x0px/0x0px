// Keep a single audio controller instance for the music modal
let audioControllerInstance = null;

export class Carousel {
    constructor(containerOrSelector) {
      // Allow passing either a selector string or a DOM element
      this.container =
        typeof containerOrSelector === 'string'
          ? document.querySelector(containerOrSelector)
          : containerOrSelector;
      if (!this.container) return;
  
      // Elements
      this.viewport = this.container.querySelector('.carousel');
      this.track = this.container.querySelector('.carousel-track');
      this.prevButton = this.container.querySelector('.carousel-button.prev');
      this.nextButton = this.container.querySelector('.carousel-button.next');
      this.youtubeThumbnails = this.container.querySelectorAll('.youtube-thumbnail');
      this.musicThumbnails = this.container.querySelectorAll('.music-thumbnail');

      // Config
      this.SCROLL_STEP = 336;
      this.EPS = 2; // rounding tolerance
  
      this.init();
    }
  
    init() {
      if (!this.viewport || !this.track) return;
      // Button visibility
      const updateButtonVisibility = () => {
        const sl = this.viewport.scrollLeft;
        const cw = this.viewport.clientWidth;
        const sw = this.viewport.scrollWidth;
        const isAtStart = sl <= this.EPS;
        const isAtEnd = sl + cw >= sw - this.EPS;
        this.prevButton?.classList.toggle('hidden', isAtStart);
        this.nextButton?.classList.toggle('hidden', isAtEnd);
      };
      this.viewport.addEventListener('scroll', updateButtonVisibility);
      updateButtonVisibility();

      // Button click scroll
      this.prevButton?.addEventListener('click', () => {
        this.viewport.scrollBy({ left: -this.SCROLL_STEP, behavior: 'smooth' });
      });
      this.nextButton?.addEventListener('click', () => {
        this.viewport.scrollBy({ left: this.SCROLL_STEP, behavior: 'smooth' });
      });

      // Helpers: delegate to modal.js
      const openVideo = (id) => import('./modal.js').then(m => m.openVideoModal(id));
      const openMusic = (el) => {
        const payload = {
          title: el.querySelector('.project-title')?.textContent || '',
          desc: el.querySelector('.desc')?.textContent || '',
          imageSrc: el.querySelector('img')?.src || '',
          youtubeId: el.dataset.youtube,
          soundcloudTrack: el.dataset.soundcloudTrack,
          audioSrc: el.dataset.audio
        };
        import('./modal.js').then(m => m.openMusicModal(payload));
      };

      // YouTube thumbnails: set image & click
      this.youtubeThumbnails.forEach(el => {
        const id = el.dataset.id;
        const img = el.querySelector('img');
        if (id && img) img.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        el.addEventListener('click', () => id && openVideo(id));
      });

      // Music thumbnails: click to open music modal
      this.musicThumbnails.forEach(el => {
        el.addEventListener('click', () => openMusic(el));
      });
    }
  }