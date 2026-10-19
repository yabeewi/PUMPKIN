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

  function createQrCard(pumpkin, url) {
    const card = document.createElement('article');
    card.className = 'qr-card';
    card.innerHTML = `
      <p class="eyebrow" style="color:#ff8a00">Pumpkin #${pumpkin.id}</p>
      <h3>${pumpkin.name}</h3>
      <div class="qr-meta">Each character is unique<br>Accessory: ${accessoryLabel(pumpkin.accessory)}<br>Personality: ${pumpkin.personality}</div>
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
      status.textContent = 'Enter the deployed website URL, for example https://example.com/PUMPKIN';
      output.innerHTML = '';
      return;
    }

    output.innerHTML = '';
    config.pumpkins.forEach((pumpkin) => {
      const url = `${base}/pumpkin.html?code=${encodeURIComponent(pumpkin.code)}&p=${encodeURIComponent(pumpkin.code)}`;
      output.appendChild(createQrCard(pumpkin, url));
    });
    status.textContent = `Generated ${config.totalPumpkins} QR Codes. They are ready to print.`;
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (printBtn) printBtn.addEventListener('click', () => window.print());
})();
