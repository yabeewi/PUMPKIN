(function () {
  const config = window.PUMPKIN_HUNT_CONFIG;
  const storage = window.PumpkinHuntStorage;
  if (!config || !storage) return;

  const countEl = document.querySelector('[data-progress-count]');
  const totalEl = document.querySelector('[data-progress-total]');
  const barEl = document.querySelector('[data-progress-bar]');
  const gridEl = document.querySelector('[data-mini-grid]');
  const teamInput = document.getElementById('teamName');
  const saveButton = document.getElementById('saveTeam');
  const teamLabel = document.querySelector('[data-team-label]');

  function renderTeam() {
    const teamName = storage.getTeamName();
    if (teamInput) teamInput.value = teamName;
    if (teamLabel) teamLabel.textContent = teamName ? `目前隊伍：${teamName}` : '尚未設定隊伍名稱';
  }

  function renderProgress() {
    const collected = storage.getCollected();
    const total = config.totalPumpkins;
    const progress = total ? (collected.length / total) * 100 : 0;

    if (countEl) countEl.textContent = String(collected.length);
    if (totalEl) totalEl.textContent = String(total);
    if (barEl) barEl.style.width = `${progress}%`;

    if (!gridEl) return;
    gridEl.innerHTML = '';
    config.pumpkins.forEach((pumpkin) => {
      const item = document.createElement('div');
      const found = collected.includes(pumpkin.id);
      item.className = `mini-slot ${found ? 'is-collected' : ''}`;
      item.style.background = found
        ? `linear-gradient(160deg, ${pumpkin.palette.shell}, ${pumpkin.palette.shell2})`
        : 'rgba(255,255,255,0.04)';
      item.style.borderColor = found ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)';
      item.innerHTML = `
        <div class="mini-icon">${found ? pumpkin.emoji : '❓'}</div>
        <strong>${found ? pumpkin.shortName : `#${pumpkin.id}`}</strong>
      `;
      gridEl.appendChild(item);
    });
  }

  if (saveButton) {
    saveButton.addEventListener('click', function () {
      storage.setTeamName(teamInput ? teamInput.value : '');
      renderTeam();
    });
  }

  if (teamInput) {
    teamInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        storage.setTeamName(teamInput.value);
        renderTeam();
      }
    });
  }

  renderTeam();
  renderProgress();
})();
