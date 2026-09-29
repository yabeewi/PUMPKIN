(function () {
  const pumpkins = [
    {
      id: 1,
      code: 'moon-a7f3',
      name: '橘子隊長',
      shortName: '隊長',
      emoji: '🎃',
      subtitle: '經典橘色、最愛帶隊衝第一。',
      personality: '熱血、外向、很會帶氣氛',
      accessory: 'cape',
      palette: { shell: '#ff7b1f', shell2: '#ffb24a', stem: '#70552d', accent: '#8e44ad', eye: '#171117' }
    },
    {
      id: 2,
      code: 'mist-b29d',
      name: '薄荷小幽',
      shortName: '小幽',
      emoji: '👻',
      subtitle: '淡綠色的害羞南瓜，走路像小精靈。',
      personality: '害羞、安靜、超會躲藏',
      accessory: 'leaf',
      palette: { shell: '#74d39a', shell2: '#baf3d0', stem: '#53763a', accent: '#2ecc71', eye: '#13211c' }
    },
    {
      id: 3,
      code: 'wink-c41h',
      name: '星星眨眼',
      shortName: '眨眼',
      emoji: '✨',
      subtitle: '粉橘色南瓜，超喜歡偷偷眨眼。',
      personality: '俏皮、愛惡作劇、鬼點子多',
      accessory: 'star',
      palette: { shell: '#ff9b6f', shell2: '#ffd0bf', stem: '#6b4d2d', accent: '#ffd54f', eye: '#221516' }
    },
    {
      id: 4,
      code: 'crown-d52k',
      name: '糖果女王',
      shortName: '女王',
      emoji: '👑',
      subtitle: '紫色系南瓜，最喜歡華麗登場。',
      personality: '自信、優雅、喜歡被注目',
      accessory: 'crown',
      palette: { shell: '#b06cff', shell2: '#dbbbff', stem: '#6d5b2b', accent: '#ffd700', eye: '#1d1230' }
    },
    {
      id: 5,
      code: 'glow-e63m',
      name: '夜光博士',
      shortName: '博士',
      emoji: '🧪',
      subtitle: '戴著眼鏡的南瓜，總是在研究神祕配方。',
      personality: '聰明、冷靜、好奇心超強',
      accessory: 'glasses',
      palette: { shell: '#f39c12', shell2: '#ffd277', stem: '#6b572e', accent: '#7f8c8d', eye: '#181513' }
    },
    {
      id: 6,
      code: 'bat-f74q',
      name: '蝙蝠騎士',
      shortName: '騎士',
      emoji: '🦇',
      subtitle: '深紅南瓜，有一對帥氣蝙蝠翅膀。',
      personality: '勇敢、守護型、動作很快',
      accessory: 'batwings',
      palette: { shell: '#d94f45', shell2: '#ff9d88', stem: '#6b4c2e', accent: '#2c213b', eye: '#180f12' }
    },
    {
      id: 7,
      code: 'bow-g85u',
      name: '蝴蝶結小姐',
      shortName: '小姐',
      emoji: '🎀',
      subtitle: '蜜桃色南瓜，出門一定要打扮漂亮。',
      personality: '可愛、溫柔、很會鼓勵人',
      accessory: 'bow',
      palette: { shell: '#ffa365', shell2: '#ffd4b3', stem: '#775533', accent: '#ff5fa2', eye: '#221514' }
    },
    {
      id: 8,
      code: 'sleep-h96x',
      name: '瞌睡泡泡',
      shortName: '泡泡',
      emoji: '💤',
      subtitle: '奶油黃南瓜，常常邊走邊打瞌睡。',
      personality: '慵懶、和平主義、慢吞吞',
      accessory: 'sleepcap',
      palette: { shell: '#f4c542', shell2: '#ffe49a', stem: '#776225', accent: '#5dade2', eye: '#261d11' }
    },
    {
      id: 9,
      code: 'rune-i07z',
      name: '魔法學徒',
      shortName: '學徒',
      emoji: '🪄',
      subtitle: '深藍南瓜，喜歡偷偷練習魔法。',
      personality: '神秘、專心、偶爾會出包',
      accessory: 'witchhat',
      palette: { shell: '#4f78d9', shell2: '#9dc1ff', stem: '#5f5b2d', accent: '#7d3cff', eye: '#101727' }
    },
    {
      id: 10,
      code: 'halo-j18v',
      name: '天使糖霜',
      shortName: '糖霜',
      emoji: '😇',
      subtitle: '白金色南瓜，總是笑咪咪地替大家加油。',
      personality: '善良、樂觀、超會安慰人',
      accessory: 'halo',
      palette: { shell: '#f6efe2', shell2: '#fffaf2', stem: '#9a8f62', accent: '#ffd95b', eye: '#40342a' }
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
