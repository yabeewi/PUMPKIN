(function () {
  'use strict';

  const APP_VERSION = 'v5.0-en-30';
  const statusEls = Array.from(document.querySelectorAll('[data-offline-status]'));
  const detailEls = Array.from(document.querySelectorAll('[data-offline-detail]'));
  const checkButtons = Array.from(document.querySelectorAll('[data-offline-check]'));
  const forceButtons = Array.from(document.querySelectorAll('[data-offline-force-update]'));

  window.PUMPKIN_HUNT_APP_VERSION = APP_VERSION;

  function setStatus(text, state, detail) {
    statusEls.forEach(el => {
      el.textContent = text;
      el.dataset.state = state || '';
    });
    if (detail) detailEls.forEach(el => { el.textContent = detail; });
  }

  function isSecureEnough() {
    return location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  }

  async function checkCache(registration) {
    if (!registration || !registration.active) return null;
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => resolve(null), 3500);
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        resolve(event.data || null);
      };
      registration.active.postMessage({ type: 'CHECK_OFFLINE_CACHE' }, [channel.port2]);
    });
  }

  async function forceFreshInstall() {
    try {
      setStatus('Clearing old offline data…', 'loading', 'Stay online. The page will refresh automatically when the update is ready.');
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith('pumpkin-hunt-')).map(name => caches.delete(name)));
      }
      location.replace(location.pathname + '?fresh=' + Date.now());
    } catch (error) {
      console.error(error);
      setStatus('⚠️ Update failed', 'error', 'Close this tab and reopen the website.');
    }
  }

  async function setup() {
    if (!('serviceWorker' in navigator)) {
      setStatus('⚠️ This browser does not support offline caching', 'error', `Version ${APP_VERSION}. Please use the latest Safari.`);
      return;
    }

    if (!isSecureEnough()) {
      setStatus('⚠️ Offline mode requires HTTPS', 'warn', `Version ${APP_VERSION}. Use localhost for computer testing; deploy with HTTPS for iPad use.`);
      return;
    }

    try {
      setStatus('Preparing offline data…', 'loading', `Version ${APP_VERSION}. Stay online the first time you open the site.`);
      const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
      try { await registration.update(); } catch (_) {}
      await navigator.serviceWorker.ready;
      const activeRegistration = await navigator.serviceWorker.getRegistration('./');
      const result = await checkCache(activeRegistration || registration);
      if (result && result.complete) {
        setStatus('✅ Offline mode is ready', 'ready', `Version ${APP_VERSION} | Cached ${result.cached}/${result.total} required files.`);
      } else {
        setStatus('✅ Offline service is active', 'ready', `Version ${APP_VERSION} | Refresh once, then turn off Wi-Fi to test.`);
      }
    } catch (error) {
      console.error(error);
      setStatus('⚠️ Offline setup failed', 'error', `Version ${APP_VERSION} | Check your internet connection and make sure the site uses HTTPS.`);
    }
  }

  checkButtons.forEach(button => button.addEventListener('click', setup));
  forceButtons.forEach(button => button.addEventListener('click', forceFreshInstall));

  // Remove the one-shot query added by the current service worker without reloading again.
  try {
    const url = new URL(location.href);
    if (url.searchParams.has('__swv5')) {
      url.searchParams.delete('__swv5');
      history.replaceState(null, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash);
    }
  } catch (_) {}

  setup();
})();
