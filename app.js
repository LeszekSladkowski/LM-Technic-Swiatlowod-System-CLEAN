(() => {
  const DESIGN_W = 1440;
  const DESIGN_H = 3120;
  const stage = document.getElementById('design-stage');

  function fitStage() {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const scale = Math.min(vw / DESIGN_W, vh / DESIGN_H);
    stage.style.setProperty('--stage-scale', String(scale));
  }

  function validateLayerGeometry(img) {
    const valid = img.naturalWidth === DESIGN_W && img.naturalHeight === DESIGN_H;
    img.dataset.geometry = valid ? 'valid' : 'invalid';

    if (!valid) {
      console.error(
        `[GEOMETRY LOCK] Odrzucono warstwę ${img.src}. ` +
        `Wymagane ${DESIGN_W}x${DESIGN_H}, otrzymano ${img.naturalWidth}x${img.naturalHeight}.`
      );
    }

    return valid;
  }

  fitStage();
  window.addEventListener('resize', fitStage, { passive: true });
  window.addEventListener('orientationchange', fitStage, { passive: true });

  const layers = [...document.querySelectorAll('.layer')];
  Promise.all(layers.map((img) => {
    if (img.complete && img.naturalWidth > 0) {
      validateLayerGeometry(img);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      img.addEventListener('load', () => {
        validateLayerGeometry(img);
        resolve();
      }, { once: true });
      img.addEventListener('error', () => reject(new Error(`Nie można wczytać: ${img.src}`)), { once: true });
    });
  }))
    .then(() => {
      document.documentElement.dataset.layers = 'ready';
      document.documentElement.dataset.origin = '0,0';
    })
    .catch((error) => {
      console.error(error);
      document.documentElement.dataset.layers = 'error';
    });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(console.error);
    });
  }
})();
