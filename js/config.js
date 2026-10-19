(function () {
  const pumpkins = [
    {
      id: 1,
      code: 'moon-a7f3',
      name: 'Orange Captain',
      shortName: 'Captain',
      emoji: '🎃',
      subtitle: 'A classic orange pumpkin who always charges into the adventure first.',
      personality: 'Brave, outgoing, and great at rallying the team',
      accessory: 'cape',
      palette: { shell: '#ff7b1f', shell2: '#ffb24a', stem: '#70552d', accent: '#8e44ad', eye: '#171117' }
    },
    {
      id: 2,
      code: 'mist-b29d',
      name: 'Minty Ghost',
      shortName: 'Minty',
      emoji: '👻',
      subtitle: 'A shy mint-green pumpkin who moves as quietly as a tiny spirit.',
      personality: 'Shy, calm, and excellent at hiding',
      accessory: 'leaf',
      palette: { shell: '#74d39a', shell2: '#baf3d0', stem: '#53763a', accent: '#2ecc71', eye: '#13211c' }
    },
    {
      id: 3,
      code: 'wink-c41h',
      name: 'Star Wink',
      shortName: 'Wink',
      emoji: '✨',
      subtitle: 'A peachy-pink pumpkin who loves giving secret little winks.',
      personality: 'Playful, mischievous, and full of clever ideas',
      accessory: 'star',
      palette: { shell: '#ff9b6f', shell2: '#ffd0bf', stem: '#6b4d2d', accent: '#ffd54f', eye: '#221516' }
    },
    {
      id: 4,
      code: 'crown-d52k',
      name: 'Candy Queen',
      shortName: 'Queen',
      emoji: '👑',
      subtitle: 'A purple pumpkin who never misses a chance to make a grand entrance.',
      personality: 'Confident, elegant, and loves the spotlight',
      accessory: 'crown',
      palette: { shell: '#b06cff', shell2: '#dbbbff', stem: '#6d5b2b', accent: '#ffd700', eye: '#1d1230' }
    },
    {
      id: 5,
      code: 'glow-e63m',
      name: 'Glow Doctor',
      shortName: 'Doctor',
      emoji: '🧪',
      subtitle: 'A bespectacled pumpkin who is always experimenting with mysterious formulas.',
      personality: 'Smart, calm, and endlessly curious',
      accessory: 'glasses',
      palette: { shell: '#f39c12', shell2: '#ffd277', stem: '#6b572e', accent: '#7f8c8d', eye: '#181513' }
    },
    {
      id: 6,
      code: 'bat-f74q',
      name: 'Bat Knight',
      shortName: 'Knight',
      emoji: '🦇',
      subtitle: 'A deep-red pumpkin with a pair of dramatic bat wings.',
      personality: 'Brave, protective, and quick on the move',
      accessory: 'batwings',
      palette: { shell: '#d94f45', shell2: '#ff9d88', stem: '#6b4c2e', accent: '#2c213b', eye: '#180f12' }
    },
    {
      id: 7,
      code: 'bow-g85u',
      name: 'Bow Belle',
      shortName: 'Belle',
      emoji: '🎀',
      subtitle: 'A peach-colored pumpkin who never leaves home without dressing up.',
      personality: 'Sweet, gentle, and always encouraging',
      accessory: 'bow',
      palette: { shell: '#ffa365', shell2: '#ffd4b3', stem: '#775533', accent: '#ff5fa2', eye: '#221514' }
    },
    {
      id: 8,
      code: 'sleep-h96x',
      name: 'Sleepy Bubble',
      shortName: 'Bubble',
      emoji: '💤',
      subtitle: 'A creamy-yellow pumpkin who can almost fall asleep while walking.',
      personality: 'Laid-back, peaceful, and delightfully slow',
      accessory: 'sleepcap',
      palette: { shell: '#f4c542', shell2: '#ffe49a', stem: '#776225', accent: '#5dade2', eye: '#261d11' }
    },
    {
      id: 9,
      code: 'rune-i07z',
      name: 'Magic Apprentice',
      shortName: 'Magic',
      emoji: '🪄',
      subtitle: 'A deep-blue pumpkin who secretly practices new spells whenever possible.',
      personality: 'Mysterious, focused, and occasionally a little clumsy',
      accessory: 'witchhat',
      palette: { shell: '#4f78d9', shell2: '#9dc1ff', stem: '#5f5b2d', accent: '#7d3cff', eye: '#101727' }
    },
    {
      id: 10,
      code: 'halo-j18v',
      name: 'Angel Frosting',
      shortName: 'Frosting',
      emoji: '😇',
      subtitle: 'A pearl-white pumpkin who is always smiling and cheering everyone on.',
      personality: 'Kind, optimistic, and wonderfully comforting',
      accessory: 'halo',
      palette: { shell: '#f6efe2', shell2: '#fffaf2', stem: '#9a8f62', accent: '#ffd95b', eye: '#40342a' }
    },
    {
      id: 11,
      code: 'ember-k29q',
      name: 'Ember Scout',
      shortName: 'Ember',
      emoji: '🔥',
      subtitle: 'A fiery orange-red pumpkin who is always ready to scout the next path.',
      personality: 'Bold, alert, and adventurous',
      accessory: 'cape',
      palette: { shell: '#e85d24', shell2: '#ff9f43', stem: '#67472a', accent: '#6c3aa8', eye: '#25120d' }
    },
    {
      id: 12,
      code: 'moss-l31r',
      name: 'Moss Sprite',
      shortName: 'Moss',
      emoji: '🌿',
      subtitle: 'A moss-green pumpkin who seems happiest hiding near leaves and trees.',
      personality: 'Gentle, patient, and quietly curious',
      accessory: 'leaf',
      palette: { shell: '#5fa867', shell2: '#a9db8e', stem: '#4c6733', accent: '#76c442', eye: '#102116' }
    },
    {
      id: 13,
      code: 'nova-m42s',
      name: 'Nova Spark',
      shortName: 'Nova',
      emoji: '⭐',
      subtitle: 'A bright coral pumpkin that sparkles whenever something exciting happens.',
      personality: 'Energetic, cheerful, and impossible to ignore',
      accessory: 'star',
      palette: { shell: '#ff6f61', shell2: '#ffc2a8', stem: '#74522f', accent: '#ffe066', eye: '#261316' }
    },
    {
      id: 14,
      code: 'plum-n53t',
      name: 'Plum Duchess',
      shortName: 'Duchess',
      emoji: '👑',
      subtitle: 'A rich plum-colored pumpkin with impeccable royal manners.',
      personality: 'Poised, thoughtful, and a little dramatic',
      accessory: 'crown',
      palette: { shell: '#7e57c2', shell2: '#c5a3ff', stem: '#66542d', accent: '#f7d154', eye: '#1b1028' }
    },
    {
      id: 15,
      code: 'sage-o64u',
      name: 'Silver Sage',
      shortName: 'Sage',
      emoji: '🤓',
      subtitle: 'A silvery pumpkin who loves observing tiny clues through round glasses.',
      personality: 'Wise, analytical, and wonderfully observant',
      accessory: 'glasses',
      palette: { shell: '#9aa5b1', shell2: '#d9e2ec', stem: '#60634a', accent: '#34495e', eye: '#18202a' }
    },
    {
      id: 16,
      code: 'wing-p75v',
      name: 'Crimson Wing',
      shortName: 'Crimson',
      emoji: '🦇',
      subtitle: 'A crimson pumpkin who swoops through the night with fearless bat wings.',
      personality: 'Fast, fearless, and fiercely loyal',
      accessory: 'batwings',
      palette: { shell: '#b83b5e', shell2: '#ed8a9e', stem: '#61402f', accent: '#28223d', eye: '#190d14' }
    },
    {
      id: 17,
      code: 'ribbon-q86w',
      name: 'Peach Ribbon',
      shortName: 'Ribbon',
      emoji: '🎀',
      subtitle: 'A soft peach pumpkin with a bright ribbon and impeccable style.',
      personality: 'Friendly, upbeat, and loves helping friends',
      accessory: 'bow',
      palette: { shell: '#ffb07c', shell2: '#ffe0c7', stem: '#745135', accent: '#f05aa6', eye: '#271710' }
    },
    {
      id: 18,
      code: 'dream-r97x',
      name: 'Dreamy Moon',
      shortName: 'Dreamy',
      emoji: '🌙',
      subtitle: 'A pale golden pumpkin who is always halfway into a pleasant dream.',
      personality: 'Dreamy, mellow, and never in a hurry',
      accessory: 'sleepcap',
      palette: { shell: '#e6c45a', shell2: '#fff0ae', stem: '#6d5a2d', accent: '#5b8def', eye: '#261f13' }
    },
    {
      id: 19,
      code: 'mage-s08y',
      name: 'Midnight Mage',
      shortName: 'Mage',
      emoji: '🔮',
      subtitle: 'A midnight-blue pumpkin who collects strange spells under a pointed hat.',
      personality: 'Clever, mysterious, and intensely focused',
      accessory: 'witchhat',
      palette: { shell: '#2f4f8f', shell2: '#7096d1', stem: '#55512f', accent: '#5f3dc4', eye: '#0b1220' }
    },
    {
      id: 20,
      code: 'gold-t19z',
      name: 'Golden Halo',
      shortName: 'Golden',
      emoji: '😇',
      subtitle: 'A warm ivory pumpkin surrounded by a soft golden glow.',
      personality: 'Patient, generous, and reassuring',
      accessory: 'halo',
      palette: { shell: '#f0dfb5', shell2: '#fff7dc', stem: '#8a7a4c', accent: '#f4c542', eye: '#3a3023' }
    },
    {
      id: 21,
      code: 'cocoa-u20a',
      name: 'Cocoa Ranger',
      shortName: 'Cocoa',
      emoji: '🧭',
      subtitle: 'A cocoa-brown pumpkin who treats every hidden corner like a new expedition.',
      personality: 'Reliable, curious, and always prepared',
      accessory: 'cape',
      palette: { shell: '#9b643f', shell2: '#d8a47f', stem: '#58402f', accent: '#8e5cc2', eye: '#1c120d' }
    },
    {
      id: 22,
      code: 'forest-v31b',
      name: 'Forest Whisper',
      shortName: 'Whisper',
      emoji: '🍃',
      subtitle: 'A forest-green pumpkin who seems to know every secret path in the garden.',
      personality: 'Quiet, observant, and deeply patient',
      accessory: 'leaf',
      palette: { shell: '#3d8b5f', shell2: '#82c99a', stem: '#445f35', accent: '#55b86d', eye: '#0e1d15' }
    },
    {
      id: 23,
      code: 'comet-w42c',
      name: 'Comet Pop',
      shortName: 'Comet',
      emoji: '☄️',
      subtitle: 'A bright tangerine pumpkin that arrives with the energy of a tiny comet.',
      personality: 'Excited, spontaneous, and full of surprises',
      accessory: 'star',
      palette: { shell: '#ff884d', shell2: '#ffd08a', stem: '#6a4d2c', accent: '#ffe45e', eye: '#25140e' }
    },
    {
      id: 24,
      code: 'berry-x53d',
      name: 'Berry Crown',
      shortName: 'Berry',
      emoji: '💜',
      subtitle: 'A berry-purple pumpkin who wears a crown as if every day were a celebration.',
      personality: 'Charming, proud, and delightfully theatrical',
      accessory: 'crown',
      palette: { shell: '#9c4dcc', shell2: '#d7a8ef', stem: '#67522f', accent: '#f5cc52', eye: '#1c1025' }
    },
    {
      id: 25,
      code: 'pixel-y64e',
      name: 'Pixel Professor',
      shortName: 'Pixel',
      emoji: '🔬',
      subtitle: 'A cool gray-blue pumpkin who examines every clue with scientific precision.',
      personality: 'Logical, inventive, and endlessly curious',
      accessory: 'glasses',
      palette: { shell: '#6d8ea0', shell2: '#b9ced8', stem: '#5a5942', accent: '#3f5362', eye: '#142028' }
    },
    {
      id: 26,
      code: 'night-z75f',
      name: 'Night Flier',
      shortName: 'Flier',
      emoji: '🦇',
      subtitle: 'A dark indigo pumpkin who loves gliding through the quietest part of the night.',
      personality: 'Steady, daring, and a little mysterious',
      accessory: 'batwings',
      palette: { shell: '#41436a', shell2: '#7f83b7', stem: '#554a36', accent: '#201c35', eye: '#0c0b13' }
    },
    {
      id: 27,
      code: 'cherry-a86g',
      name: 'Cherry Bow',
      shortName: 'Cherry',
      emoji: '🍒',
      subtitle: 'A cherry-red pumpkin with a playful bow and a bright smile.',
      personality: 'Bubbly, affectionate, and always optimistic',
      accessory: 'bow',
      palette: { shell: '#d94a64', shell2: '#ff9caf', stem: '#694434', accent: '#ff6fae', eye: '#221015' }
    },
    {
      id: 28,
      code: 'cloud-b97h',
      name: 'Cloud Napper',
      shortName: 'Cloud',
      emoji: '☁️',
      subtitle: 'A pale blue pumpkin who would happily nap on a cloud all afternoon.',
      personality: 'Soft-spoken, relaxed, and very easygoing',
      accessory: 'sleepcap',
      palette: { shell: '#8fbdd3', shell2: '#d8edf5', stem: '#65705a', accent: '#668fd8', eye: '#172127' }
    },
    {
      id: 29,
      code: 'spell-c08i',
      name: 'Spellberry',
      shortName: 'Spell',
      emoji: '🪄',
      subtitle: 'A violet pumpkin who is always testing one more spell before bedtime.',
      personality: 'Creative, focused, and mischievously magical',
      accessory: 'witchhat',
      palette: { shell: '#7048a8', shell2: '#b995e0', stem: '#555130', accent: '#4f2ca8', eye: '#120d1d' }
    },
    {
      id: 30,
      code: 'sun-d19j',
      name: 'Sunbeam Angel',
      shortName: 'Sunbeam',
      emoji: '☀️',
      subtitle: 'A soft yellow pumpkin whose warm halo makes every corner feel brighter.',
      personality: 'Sunny, caring, and endlessly encouraging',
      accessory: 'halo',
      palette: { shell: '#f2d06b', shell2: '#fff1b0', stem: '#817140', accent: '#ffd447', eye: '#342a16' }
    }
  ];

  window.PUMPKIN_HUNT_CONFIG = {
    storageKeys: {
      teamName: 'pumpkin-hunt-team-name',
      collected: 'pumpkin-hunt-collected-v1'
    },
    pumpkins,
    totalPumpkins: pumpkins.length
  };
})();
