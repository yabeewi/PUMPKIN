(function () {
  const config = window.PUMPKIN_HUNT_CONFIG;
  if (!config) return;

  const baseUrlInput = document.getElementById('baseUrl');
  const generateBtn = document.getElementById('generateQr');
  const printBtn = document.getElementById('printQr');
  const output = document.querySelector('[data-qr-output]');
  const status = document.querySelector('[data-qr-status]');

  function normalizeBaseUrl(input) {
    const value = (input || '').trim().replace(/\/+$/, '');
    return value;
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

  function createQrCard(pumpkin, url) {
    const card = document.createElement('article');
    card.className = 'qr-card';
    card.innerHTML = `
      <p class="eyebrow" style="color:#ff8a00">Pumpkin #${pumpkin.id}</p>
      <h3>${pumpkin.name}</h3>
      <div class="qr-meta">顏色／角色各不相同<br>配飾：${accessoryLabel(pumpkin.accessory)}<br>個性：${pumpkin.personality}</div>
      <div class="qr-box"></div>
      <div class="qr-link">${url}</div>
    `;

    const qrTarget = card.querySelector('.qr-box');
    new QRCode(qrTarget, {
      text: url,
      width: 130,
      height: 130,
      correctLevel: QRCode.CorrectLevel.M
    });

    return card;
  }

  function generate() {
    const base = normalizeBaseUrl(baseUrlInput.value);
    if (!base) {
      status.textContent = '請先輸入正式網站網址，例如 https://example.com/HalloweenPumpkinHunt';
      output.innerHTML = '';
      return;
    }

    output.innerHTML = '';
    config.pumpkins.forEach((pumpkin) => {
      const url = `${base}/pumpkin.html?code=${encodeURIComponent(pumpkin.code)}&p=${encodeURIComponent(pumpkin.code)}`;
      output.appendChild(createQrCard(pumpkin, url));
    });
    status.textContent = `已產生 ${config.totalPumpkins} 張 QR Code，可直接列印。`;
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (printBtn) printBtn.addEventListener('click', () => window.print());
})();
