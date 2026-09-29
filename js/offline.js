(function () {
  const statusEls = Array.from(document.querySelectorAll('[data-offline-status]'));
  const detailEls = Array.from(document.querySelectorAll('[data-offline-detail]'));
  const checkButtons = Array.from(document.querySelectorAll('[data-offline-check]'));

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
      const timer = setTimeout(() => resolve(null), 3000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        resolve(event.data || null);
      };
      registration.active.postMessage({ type: 'CHECK_OFFLINE_CACHE' }, [channel.port2]);
    });
  }

  async function setup() {
    if (!('serviceWorker' in navigator)) {
      setStatus('⚠️ 此瀏覽器不支援離線快取', 'error', '請改用最新版 Safari。');
      return;
    }

    if (!isSecureEnough()) {
      setStatus('⚠️ 正式離線模式需要 HTTPS', 'warn', '電腦可用 localhost 測試；iPad 正式使用請部署到 HTTPS 網址。');
      return;
    }

    try {
      setStatus('準備離線資料中…', 'loading', '第一次開啟時請保持網路連線。');
      const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      await navigator.serviceWorker.ready;
      const result = await checkCache(registration);
      if (result && result.complete) {
        setStatus('✅ 離線模式準備完成', 'ready', `已快取 ${result.cached}/${result.total} 個必要檔案。現在可以關閉 Wi‑Fi 測試。`);
      } else {
        setStatus('✅ 離線服務已啟用', 'ready', '建議重新整理一次，再關閉 Wi‑Fi 測試其中一顆南瓜。');
      }
    } catch (error) {
      console.error(error);
      setStatus('⚠️ 離線資料準備失敗', 'error', '請確認目前有網路、網站使用 HTTPS，然後重新整理。');
    }
  }

  checkButtons.forEach(button => {
    button.addEventListener('click', () => setup());
  });

  setup();
})();
