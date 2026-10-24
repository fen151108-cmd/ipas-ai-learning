(() => {
  'use strict';
  document.querySelectorAll('.case-podcast').forEach(section => {
    const audio = section.querySelector('audio');
    const rate = section.querySelector('[data-podcast-rate]');
    if (!audio) return;
    if (rate) rate.addEventListener('change', () => {
      const value = Number(rate.value);
      if ([0.8, 1, 1.2, 1.5].includes(value)) audio.playbackRate = value;
    });
    section.querySelectorAll('[data-podcast-seek]').forEach(button => {
      button.addEventListener('click', async () => {
        const seek = Number(button.dataset.podcastSeek);
        if (!Number.isFinite(seek) || seek < 0) return;
        try {
          if (audio.readyState < 1) {
            await new Promise((resolve, reject) => {
              audio.addEventListener('loadedmetadata', resolve, {once:true});
              audio.addEventListener('error', reject, {once:true});
              audio.load();
            });
          }
          audio.currentTime = Math.min(seek, audio.duration || seek);
          await audio.play();
        } catch (_) {
          audio.focus();
        }
      });
    });
  });
})();
