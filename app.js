(() => {
  const DESIGN_W = 1440;
  const DESIGN_H = 3120;
  const DESIGN_RATIO = DESIGN_W / DESIGN_H;
  const stage = document.getElementById('design-stage');
  const homeScreen = document.getElementById('screen-home');
  const settingsScreen = document.getElementById('screen-settings');

  function fitStage() {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const scale = Math.min(vw / DESIGN_W, vh / DESIGN_H);
    stage.style.setProperty('--stage-scale', String(scale));
  }

  function showScreen(name, updateHistory = true) {
    const isSettings = name === 'settings';
    homeScreen.classList.toggle('is-active', !isSettings);
    settingsScreen.classList.toggle('is-active', isSettings);
    document.documentElement.dataset.screen = isSettings ? 'settings' : 'home';

    if (updateHistory) {
      const nextHash = isSettings ? '#ustawienia' : '#pulpit';
      if (location.hash !== nextHash) history.pushState({ screen: name }, '', nextHash);
    }
  }

  function validateHomeMaster(img) {
    const valid = img.naturalWidth === DESIGN_W && img.naturalHeight === DESIGN_H;
    img.dataset.geometry = valid ? 'valid' : 'invalid';
    if (!valid) {
      console.error(`[GEOMETRY LOCK] MASTER Pulpitu ma ${img.naturalWidth}x${img.naturalHeight}, wymagane ${DESIGN_W}x${DESIGN_H}.`);
    }
    return valid;
  }

  function validateSettingsSet() {
    const layers = [...document.querySelectorAll('.settings-layer')];
    let valid = true;

    for (const img of layers) {
      if (!img.naturalWidth || !img.naturalHeight) {
        valid = false;
        continue;
      }

      const ratio = img.naturalWidth / img.naturalHeight;
      const ratioOk = Math.abs(ratio - DESIGN_RATIO) < 0.001;
      img.dataset.geometry = ratioOk ? 'mapped-0-0' : 'invalid';
      if (!ratioOk) valid = false;
    }

    settingsScreen.classList.toggle('use-fallback', !valid);
    document.documentElement.dataset.settingsLayers = valid ? 'ready' : 'fallback';
    return valid;
  }

  function waitForImage(img) {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve(img);
    return new Promise((resolve, reject) => {
      img.addEventListener('load', () => resolve(img), { once: true });
      img.addEventListener('error', () => reject(new Error(`Nie można wczytać: ${img.src}`)), { once: true });
    });
  }

  fitStage();
  window.addEventListener('resize', fitStage, { passive: true });
  window.addEventListener('orientationchange', fitStage, { passive: true });

  const homeMaster = document.querySelector('#screen-home .master-reference');
  const settingsLayers = [...document.querySelectorAll('.settings-layer')];

  Promise.all([waitForImage(homeMaster), ...settingsLayers.map(waitForImage)])
    .then(() => {
      validateHomeMaster(homeMaster);
      validateSettingsSet();
      document.documentElement.dataset.origin = '0,0';
      document.documentElement.dataset.design = `${DESIGN_W}x${DESIGN_H}`;
      document.documentElement.dataset.layers = 'ready';
    })
    .catch((error) => {
      console.error(error);
      settingsScreen.classList.add('use-fallback');
      document.documentElement.dataset.settingsLayers = 'fallback';
    });

  document.getElementById('open-settings').addEventListener('click', () => showScreen('settings'));
  document.getElementById('settings-back').addEventListener('click', () => showScreen('home'));
  document.getElementById('settings-home').addEventListener('click', () => showScreen('home'));
  document.getElementById('settings-sync').addEventListener('click', () => location.reload());

  window.addEventListener('popstate', () => {
    showScreen(location.hash === '#ustawienia' ? 'settings' : 'home', false);
  });

  if (location.hash === '#ustawienia') showScreen('settings', false);
  else showScreen('home', false);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(console.error);
    });
  }
})();
