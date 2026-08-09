/* ===================================================
   world2.js — layout do Capítulo 2 (A Gruta Adormecida)

   Dois mapas, no mesmo formato usado por WORLD (world.js),
   para reaproveitar Collision e os desenhadores de cenário:

   - WORLD2: área externa antes/depois da gruta (Tigroso vive aqui)
   - CAVE:   interior da gruta (aranha, escuridão, lanterna)
   =================================================== */

const WORLD2 = {
  width: 2000,
  height: 1100,
  spawn: { x: 160, y: 560 },

  pathPoints: [
    { x: 160, y: 560 }, { x: 420, y: 560 }, { x: 700, y: 600 },
    { x: 950, y: 610 }, { x: 1150, y: 560 }, { x: 1350, y: 560 },
    { x: 1500, y: 555 }
  ],

  npcSpawns: {
    wagner: { x: 150, y: 470 },
    lia: { x: 260, y: 500 },
    jasmim: { x: 300, y: 520 },
    pedra2: { x: 430, y: 570 }
  },

  // ---- Tigroso: pontos de voo e desafio ----
  tigroso: {
    anchors: [
      { x: 1120, y: 400 }, { x: 1300, y: 360 }, { x: 1180, y: 470 }
    ],
    flashlightDrop: { x: 1200, y: 520 },
    puzzle: {
      flower: { x: 1080, y: 610 },
      noiseRock: { x: 1230, y: 650 },
      vine: { x: 1340, y: 560 }
    },
    // sequência esperada: flor -> barulho -> cipó (com dicas progressivas se o jogador travar)
    order: ['flower', 'noiseRock', 'vine']
  },

  // ---- entrada da gruta ----
  caveMouth: { x: 1500, y: 555, r: 80 },

  // ---- clareira depois da gruta ----
  afterCave: {
    pawMarks: { x: 1750, y: 560 },
    macaquildoSpot: { x: 1850, y: 520 },
    tigrosoShadowSpot: { x: 1950, y: 420 }
  },

  critters: [
    { x: 700, y: 520, type: 'bird' }, { x: 1650, y: 620, type: 'butterfly' }
  ]
};

WORLD2.trees = [];
WORLD2.rocks = [];
(function generateDecor2() {
  const rand = mulberry32(20260212);
  const reserved = [
    { x: 60, y: 400, w: 400, h: 260 },       // clareira inicial
    { x: 1000, y: 350, w: 420, h: 380 },     // zona do Tigroso
    { x: WORLD2.caveMouth.x - 120, y: WORLD2.caveMouth.y - 160, w: 240, h: 320 }, // boca da gruta
    { x: 1650, y: 400, w: 350, h: 320 }      // clareira pós-gruta
  ];
  function inReserved(x, y, pad) {
    return reserved.some(r => x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad);
  }
  let attempts = 0;
  while (WORLD2.trees.length < 46 && attempts < 4000) {
    attempts++;
    const x = 40 + rand() * (WORLD2.width - 80);
    const y = 40 + rand() * (WORLD2.height - 120);
    if (inReserved(x, y, 26)) continue;
    WORLD2.trees.push({ x, y, r: 16 + rand() * 10, canopy: 30 + rand() * 16, tone: rand() });
  }
  attempts = 0;
  while (WORLD2.rocks.length < 16 && attempts < 1000) {
    attempts++;
    const x = 40 + rand() * (WORLD2.width - 80);
    const y = 40 + rand() * (WORLD2.height - 120);
    if (inReserved(x, y, 18)) continue;
    WORLD2.rocks.push({ x, y, r: 8 + rand() * 8 });
  }
  WORLD2.grassDots = [];
  for (let i = 0; i < 700; i++) {
    WORLD2.grassDots.push({ x: rand() * WORLD2.width, y: rand() * WORLD2.height, tone: rand() });
  }
  // pequeno campo de flores decorativo perto do início
  WORLD2.flowers = [];
  for (let i = 0; i < 10; i++) {
    WORLD2.flowers.push({ x: 500 + rand() * 220, y: 700 + rand() * 140 });
  }
})();

/* ===================================================
   CAVE — interior da gruta
   Corredor simples (sem obstáculos internos de colisão) para manter
   a travessia justa: o desafio real é a mecânica de furtividade com a
   aranha, não a navegação às cegas.
   =================================================== */
const CAVE = {
  width: 2100,
  height: 320,
  spawn: { x: 110, y: 160 },

  mushrooms: (function () {
    const rand = mulberry32(777);
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push({ x: 60 + rand() * 1980, y: 60 + rand() * 200, size: 3 + rand() * 4 });
    }
    return list;
  })(),

  drips: (function () {
    const rand = mulberry32(888);
    const list = [];
    for (let i = 0; i < 14; i++) {
      list.push({ x: 100 + rand() * 1900, phase: rand() * 10 });
    }
    return list;
  })(),

  decorRocks: (function () {
    const rand = mulberry32(999);
    const list = [];
    for (let i = 0; i < 20; i++) {
      list.push({ x: 60 + rand() * 1980, y: 40 + rand() * 240, r: 6 + rand() * 10 });
    }
    return list;
  })(),

  spider: {
    x: 1150, y: 160,
    dangerRadius: 620, // distância (em x) a partir da qual o ciclo da aranha fica "ativo"
    sleepMin: 2.5, sleepMax: 4,       // segundos de luz acesa até começar a acordar
    reactionMin: 0.8, reactionMax: 1.0, // janela para reagir
    searchDuration: 2.0                // tempo acordada procurando antes de voltar a dormir
  },

  exitZone: { x: 2020, y: 160, r: 90 }
};
