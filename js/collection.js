(function () {
  const config = window.PUMPKIN_HUNT_CONFIG;
  const storage = window.PumpkinHuntStorage;
  if (!config || !storage) return;

  const countEl = document.querySelector('[data-progress-count]');
  const totalEl = document.querySelector('[data-progress-total]');
  const barEl = document.querySelector('[data-progress-bar]');
  const teamLabel = document.querySelector('[data-team-label]');
  const gridEl = document.querySelector('[data-collection-grid]');
  const completionEl = document.querySelector('[data-completion]');
  const resetBtn = document.getElementById('resetGame');

  function render() {
    const collected = storage.getCollected();
    const total = config.totalPumpkins;
    const teamName = storage.getTeamName();

    if (countEl) countEl.textContent = String(collected.length);
    if (totalEl) totalEl.textContent = String(total);
    if (barEl) barEl.style.width = `${(collected.length / total) * 100}%`;
    if (teamLabel) teamLabel.textContent = teamName || 'Your Team';
    if (completionEl) completionEl.hidden = collected.length !== total;

    if (!gridEl) return;
    gridEl.innerHTML = '';

    config.pumpkins.forEach((pumpkin) => {
      const found = collected.includes(pumpkin.id);
      const card = document.createElement('article');
      card.className = `collection-card ${found ? 'is-found' : 'is-locked'}`;
      if (found) {
        card.style.background = `linear-gradient(160deg, ${pumpkin.palette.shell}, ${pumpkin.palette.shell2})`;
      }
      card.innerHTML = found
        ? `
          <div class="collection-card-header">
            <div>
              <p class="eyebrow" style="color: rgba(255,255,255,0.84)">Pumpkin #${pumpkin.id}</p>
              <h3>${pumpkin.name}</h3>
            </div>
            <span class="tag">${pumpkin.emoji} Found</span>
          </div>
          <div class="collection-emoji">${pumpkin.emoji}</div>
          <div class="meta-line"><strong>Accessory:</strong> ${accessoryLabel(pumpkin.accessory)}<br><strong>About:</strong> ${pumpkin.subtitle}</div>
          <div class="personality-line">Personality: ${pumpkin.personality}</div>
        `
        : `
          <div class="collection-card-header">
            <div>
              <p class="eyebrow">Pumpkin #${pumpkin.id}</p>
              <h3>???</h3>
            </div>
            <span class="tag">🔒 Not Found</span>
          </div>
          <div class="collection-emoji">❓</div>
          <div class="meta-line locked-label">Find and scan this pumpkin's QR Code to reveal its color, accessory, and personality.</div>
        `;
      gridEl.appendChild(card);
    });
  }

  function accessoryLabel(key) {
    const map = {
      cape: 'Cape',
      leaf: 'Leaf Hat',
      star: 'Star Pin',
      crown: 'Crown',
      glasses: 'Glasses',
      batwings: 'Bat Wings',
      bow: 'Bow',
      sleepcap: 'Sleep Cap',
      witchhat: 'Witch Hat',
      halo: 'Halo'
    };
    return map[key] || key;
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (window.confirm('Clear the team name and all pumpkin collection progress stored on this iPad?')) {
        storage.clearAll();
        render();
      }
    });
  }

  render();
})();
