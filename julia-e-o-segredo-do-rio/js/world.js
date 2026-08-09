/* ===================================================
   world.js — layout do mapa do Capítulo 1 (vale do rio)
   Coordenadas em "unidades de mundo" (pixels lógicos).
   =================================================== */

// PRNG determinístico simples (mulberry32) — mantém o cenário
// decorativo estável entre sessões, sem depender de assets externos.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORLD = {
  width: 2700,
  height: 1500,
  spawn: { x: 300, y: 900 },

  // rio: faixa horizontal com uma ponte atravessável
  river: { x: -50, y: 990, w: 2800, h: 120 },
  bridge: { x: 1130, y: 965, w: 170, h: 170 },

  // clareira inicial / caminho (apenas visual)
  pathPoints: [
    { x: 260, y: 900 }, { x: 640, y: 880 }, { x: 900, y: 760 },
    { x: 1050, y: 620 }, { x: 1150, y: 800 }, { x: 1200, y: 1000 },
    { x: 1300, y: 1150 }, { x: 1600, y: 1230 }, { x: 2000, y: 1150 },
    { x: 2300, y: 950 }, { x: 2380, y: 780 }
  ],

  // ---- NPCs (posições iniciais) ----
  npcSpawns: {
    wagner: { x: 300, y: 790 },
    lia: { x: 470, y: 840 },
    jasmim: { x: 520, y: 870 },
    chatgpt: { x: 220, y: 760 },
    pedra: { x: 660, y: 900 }
  },

  // ---- Símbolo: FLOR ----
  flowerPatch: {
    center: { x: 1040, y: 600 },
    special: { x: 1085, y: 585 }, // a flor "diferente"
    flowers: [
      { x: 970, y: 560 }, { x: 1000, y: 620 }, { x: 1040, y: 545 },
      { x: 1085, y: 585 }, { x: 1110, y: 630 }, { x: 960, y: 615 },
      { x: 1020, y: 660 }, { x: 1070, y: 660 }, { x: 940, y: 580 },
      { x: 1120, y: 560 }, { x: 1000, y: 500 }, { x: 1060, y: 505 },
      { x: 900, y: 630 }, { x: 1140, y: 610 }
    ]
  },

  // ---- Símbolo: PATAS ----
  pawTrail: {
    prints: [
      { x: 1740, y: 1120 }, { x: 1775, y: 1150 }, { x: 1815, y: 1170 },
      { x: 1860, y: 1180 }, { x: 1905, y: 1195 }, { x: 1945, y: 1225 }
    ],
    hiddenSpot: { x: 1975, y: 1255 },
    bushes: [
      { x: 1930, y: 1210, r: 34 }, { x: 2010, y: 1230, r: 30 },
      { x: 1975, y: 1290, r: 32 }, { x: 1900, y: 1270, r: 26 }
    ]
  },

  // ---- Símbolo: ESTRELA (reflexo no rio) ----
  starSpot: { x: 980, y: 1030, period: 4000, brightWindow: 1200 },

  // ---- árvore grande e misteriosa (Macaquildo) ----
  bigTree: { x: 2380, y: 760, r: 46, triggerR: 150 },

  // ---- animaizinhos decorativos ----
  critters: [
    { x: 760, y: 940, type: 'bird' }, { x: 1850, y: 1000, type: 'bird' },
    { x: 1350, y: 1080, type: 'butterfly' }, { x: 1000, y: 640, type: 'butterfly' }
  ]
};

/* ---- geração determinística de árvores/pedras decorativas ---- */
WORLD.trees = [];
WORLD.rocks = [];
(function generateDecor() {
  const rand = mulberry32(20260122);
  const reserved = [
    { x: 150, y: 700, w: 500, h: 300 },      // clareira inicial
    { x: 900, y: 480, w: 300, h: 260 },      // campo de flores
    { x: WORLD.bridge.x - 40, y: WORLD.bridge.y - 40, w: WORLD.bridge.w + 80, h: WORLD.bridge.h + 80 },
    { x: 1650, y: 1050, w: 450, h: 300 },    // trilha de patas
    { x: WORLD.bigTree.x - 160, y: WORLD.bigTree.y - 160, w: 320, h: 320 }, // árvore grande
    { x: WORLD.starSpot.x - 80, y: WORLD.starSpot.y - 80, w: 160, h: 160 }
  ];
  function inReserved(x, y, pad) {
    return reserved.some(r => x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad);
  }
  let attempts = 0;
  while (WORLD.trees.length < 55 && attempts < 4000) {
    attempts++;
    const x = 40 + rand() * (WORLD.width - 80);
    const y = 40 + rand() * (WORLD.height - 200);
    if (y > WORLD.river.y - 20 && y < WORLD.river.y + WORLD.river.h + 20) continue; // não plantar dentro do rio
    if (inReserved(x, y, 30)) continue;
    WORLD.trees.push({ x, y, r: 16 + rand() * 10, canopy: 30 + rand() * 16, tone: rand() });
  }
  WORLD.grassDots = [];
  for (let i = 0; i < 900; i++) {
    const x = rand() * WORLD.width;
    const y = rand() * WORLD.height;
    if (y > WORLD.river.y - 10 && y < WORLD.river.y + WORLD.river.h + 10) continue;
    WORLD.grassDots.push({ x, y, tone: rand() });
  }

  attempts = 0;
  while (WORLD.rocks.length < 14 && attempts < 1000) {
    attempts++;
    const x = 40 + rand() * (WORLD.width - 80);
    const y = 40 + rand() * (WORLD.height - 200);
    if (y > WORLD.river.y - 10 && y < WORLD.river.y + WORLD.river.h + 10) continue;
    if (inReserved(x, y, 20)) continue;
    WORLD.rocks.push({ x, y, r: 8 + rand() * 8 });
  }
})();

/* ---------------- colisão ---------------- */
const Collision = {
  inRiver(x, y) {
    const r = WORLD.river;
    if (x < r.x || x > r.x + r.w || y < r.y || y > r.y + r.h) return false;
    const b = WORLD.bridge;
    if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return false; // ponte é segura
    return true;
  },
  hitsTree(x, y, radius) {
    for (const t of WORLD.trees) {
      const dx = x - t.x, dy = y - (t.y + 6);
      if (dx * dx + dy * dy < (t.r * 0.6 + radius) * (t.r * 0.6 + radius)) return true;
    }
    for (const t of WORLD.rocks) {
      const dx = x - t.x, dy = y - t.y;
      if (dx * dx + dy * dy < (t.r + radius) * (t.r + radius)) return true;
    }
    for (const b of WORLD.pawTrail.bushes) {
      const dx = x - b.x, dy = y - b.y;
      if (dx * dx + dy * dy < (b.r * 0.55 + radius) * (b.r * 0.55 + radius)) return true;
    }
    const bt = WORLD.bigTree;
    const dbx = x - bt.x, dby = y - (bt.y + 10);
    if (dbx * dbx + dby * dby < (bt.r * 0.7 + radius) * (bt.r * 0.7 + radius)) return true;
    return false;
  },
  blocked(x, y, radius) {
    if (x < radius || x > WORLD.width - radius || y < radius + 40 || y > WORLD.height - radius) return true;
    if (this.inRiver(x, y)) return true;
    if (this.hitsTree(x, y, radius)) return true;
    return false;
  }
};
