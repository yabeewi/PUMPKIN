(function () {
  const config = window.PUMPKIN_HUNT_CONFIG;
  if (!config) return;

  function normalizeCollected(value) {
    return Array.from(new Set((Array.isArray(value) ? value : []).map(Number).filter(Boolean)));
  }

  function getCollected() {
    try {
      const raw = localStorage.getItem(config.storageKeys.collected);
      return normalizeCollected(raw ? JSON.parse(raw) : []);
    } catch (err) {
      return [];
    }
  }

  function setCollected(ids) {
    const normalized = normalizeCollected(ids);
    localStorage.setItem(config.storageKeys.collected, JSON.stringify(normalized));
    return normalized;
  }

  function addCollected(id) {
    const numericId = Number(id);
    const before = getCollected();
    const wasPresent = before.includes(numericId);
    if (!wasPresent) before.push(numericId);
    const after = setCollected(before);
    return { collected: after, added: !wasPresent };
  }

  function clearAll() {
    localStorage.removeItem(config.storageKeys.collected);
    localStorage.removeItem(config.storageKeys.teamName);
  }

  function getTeamName() {
    return (localStorage.getItem(config.storageKeys.teamName) || '').trim();
  }

  function setTeamName(name) {
    const cleaned = (name || '').trim();
    localStorage.setItem(config.storageKeys.teamName, cleaned);
    return cleaned;
  }

  function getPumpkinByCode(code) {
    const clean = String(code || '').trim();
    if (!clean) return null;
    return config.pumpkins.find(item => item.code === clean) || null;
  }

  function getPumpkinById(id) {
    return config.pumpkins.find(item => Number(item.id) === Number(id)) || null;
  }

  function resolvePumpkin(value) {
    const clean = String(value || '').trim();
    if (!clean) return null;
    return getPumpkinByCode(clean) || (/^\d+$/.test(clean) ? getPumpkinById(clean) : null);
  }

  window.PumpkinHuntStorage = {
    getCollected,
    setCollected,
    addCollected,
    clearAll,
    getTeamName,
    setTeamName,
    getPumpkinByCode,
    getPumpkinById,
    resolvePumpkin
  };
})();
