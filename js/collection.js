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
    if (teamLabel) teamLabel.textContent = teamName || '你的隊伍';
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
            <span class="tag">${pumpkin.emoji} 已找到</span>
          </div>
          <div class="collection-emoji">${pumpkin.emoji}</div>
          <div class="meta-line"><strong>配飾：</strong>${accessoryLabel(pumpkin.accessory)}<br><strong>特色：</strong>${pumpkin.subtitle}</div>
          <div class="personality-line">個性：${pumpkin.personality}</div>
        `
        : `
          <div class="collection-card-header">
            <div>
              <p class="eyebrow">Pumpkin #${pumpkin.id}</p>
              <h3>？？？</h3>
            </div>
            <span class="tag">🔒 未找到</span>
          </div>
          <div class="collection-emoji">❓</div>
          <div class="meta-line locked-label">找到 QR Code 後，這顆南瓜的顏色、配飾與個性才會揭曉。</div>
        `;
      gridEl.appendChild(card);
    });
  }

  function accessoryLabel(key) {
    const map = {
      cape: '披風',
      leaf: '葉片帽',
      star: '星星別針',
      crown: '皇冠',
      glasses: '眼鏡',
      batwings: '蝙蝠翅膀',
      bow: '蝴蝶結',
      sleepcap: '睡帽',
      witchhat: '魔法帽',
      halo: '天使光環'
    };
    return map[key] || key;
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (window.confirm('確定要清除這台 iPad 的隊伍名稱與所有南瓜蒐集紀錄嗎？')) {
        storage.clearAll();
        render();
      }
    });
  }

  render();
})();
