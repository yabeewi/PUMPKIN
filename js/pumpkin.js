(function () {
  const config = window.PUMPKIN_HUNT_CONFIG;
  const storage = window.PumpkinHuntStorage;
  if (!config || !storage) return;

  const validSection = document.querySelector('[data-valid-pumpkin]');
  const invalidSection = document.querySelector('[data-invalid-pumpkin]');
  const titleEl = document.querySelector('[data-pumpkin-title]');
  const subtitleEl = document.querySelector('[data-pumpkin-subtitle]');
  const progressBar = document.querySelector('[data-progress-bar]');
  const progressText = document.querySelector('[data-progress-text]');
  const allCompleteBanner = document.querySelector('[data-all-complete]');
  const confettiWrap = document.querySelector('[data-confetti]');

  const params = new URLSearchParams(window.location.search);
  const candidates = [
    params.get('code'),
    params.get('p'),
    params.get('id'),
    params.get('pumpkin')
  ].filter(Boolean);

  if (window.location.hash) candidates.push(window.location.hash.replace(/^#/, ''));

  let pumpkin = null;
  for (const candidate of candidates) {
    pumpkin = storage.resolvePumpkin(candidate);
    if (pumpkin) break;
  }

  function showInvalid() {
    if (validSection) validSection.hidden = true;
    if (invalidSection) invalidSection.hidden = false;
  }

  function renderConfetti(color) {
    if (!confettiWrap) return;
    confettiWrap.innerHTML = '';
    const palette = [color, '#ffd54f', '#ff8a00', '#ffffff', '#a569bd'];
    for (let i = 0; i < 26; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = palette[i % palette.length];
      piece.style.animationDuration = `${3 + Math.random() * 2.2}s`;
      piece.style.animationDelay = `${Math.random() * 0.7}s`;
      confettiWrap.appendChild(piece);
    }
  }

  if (!pumpkin) {
    showInvalid();
    return;
  }

  const before = storage.getCollected();
  const wasAlreadyCollected = before.includes(pumpkin.id);
  const result = storage.addCollected(pumpkin.id);
  const collected = result.collected;
  window.__CURRENT_PUMPKIN = pumpkin;

  const fallbackEl = document.getElementById('pumpkinFallback');
  if (fallbackEl) {
    const accessoryEl = fallbackEl.querySelector('[data-fallback-accessory]');
    const accessoryMap = {
      cape: '🦸',
      leaf: '🍃',
      star: '⭐',
      crown: '👑',
      glasses: '👓',
      batwings: '🦇',
      bow: '🎀',
      sleepcap: '💤',
      witchhat: '🧙',
      halo: '😇'
    };
    fallbackEl.style.setProperty('--pumpkin-shell', pumpkin.palette.shell);
    fallbackEl.style.setProperty('--pumpkin-shell-2', pumpkin.palette.shell2);
    fallbackEl.style.setProperty('--pumpkin-stem', pumpkin.palette.stem);
    fallbackEl.style.setProperty('--pumpkin-accent', pumpkin.palette.accent);
    fallbackEl.style.setProperty('--pumpkin-eye', pumpkin.palette.eye);
    fallbackEl.dataset.pumpkinId = String(pumpkin.id);
    if (accessoryEl) accessoryEl.textContent = accessoryMap[pumpkin.accessory] || pumpkin.emoji;
  }

  if (titleEl) titleEl.textContent = wasAlreadyCollected ? `You found ${pumpkin.name} again!` : `${pumpkin.name} joined your collection!`;
  if (subtitleEl) {
    subtitleEl.textContent = wasAlreadyCollected
      ? `${pumpkin.name} is already in your pumpkin basket. Personality: ${pumpkin.personality}`
      : `${pumpkin.subtitle} Personality: ${pumpkin.personality}`;
  }

  if (progressBar) progressBar.style.width = `${(collected.length / config.totalPumpkins) * 100}%`;
  if (progressText) progressText.textContent = `${collected.length} / ${config.totalPumpkins}`;
  if (allCompleteBanner) allCompleteBanner.hidden = collected.length !== config.totalPumpkins;

  renderConfetti(pumpkin.palette.shell);
})();
