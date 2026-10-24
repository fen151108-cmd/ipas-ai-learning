(() => {
  'use strict';
  const allowedRates = new Set([0.8, 1, 1.2, 1.5]);
  const allAudio = () => [...document.querySelectorAll('audio')];
  document.querySelectorAll('a[href="#day1-day2-listening"]').forEach(link => link.addEventListener('click', () => { const audio=document.querySelector('#combined-podcast-audio'); if(audio) audio.play().catch(()=>audio.focus()); }));
  allAudio().forEach(audio => {
    audio.addEventListener('play', () => {
      allAudio().forEach(other => { if (other !== audio && !other.paused) other.pause(); });
    });
  });
  document.querySelectorAll('.case-podcast').forEach(section => {
    const audio = section.querySelector('audio');
    const rate = section.querySelector('[data-podcast-rate]');
    if (!audio) return;
    if (rate) rate.addEventListener('change', () => {
      const value = Number(rate.value);
      if (allowedRates.has(value)) audio.playbackRate = value;
    });
    section.querySelectorAll('[data-podcast-seek]').forEach(button => {
      button.addEventListener('click', async () => {
        const seek = Number(button.dataset.podcastSeek);
        if (!Number.isFinite(seek) || seek < 0) return;
        try {
          if (audio.readyState < 1) {
            await new Promise((resolve, reject) => {
              audio.addEventListener('loadedmetadata', resolve, {once: true});
              audio.addEventListener('error', reject, {once: true});
              audio.load();
            });
          }
          audio.currentTime = Math.min(seek, Math.max(0, (audio.duration || seek) - 0.05));
          await audio.play();
        } catch (_) {
          audio.focus();
        }
      });
    });
  });
})();
