/* ===================================================
   characters.js — dados canônicos dos personagens e
   desenho de placeholders (substituíveis por PNGs em
   /assets/characters/).

   CANON: os dados abaixo vêm diretamente das fichas e
   instruções fornecidas pela Júlia. Não foram inventados
   nem alterados. Onde algo não estava especificado, o
   código deixa valores neutros/configuráveis em vez de
   inventar definitivamente.
   =================================================== */

/* ---------- dados canônicos (uso interno / futura tela de personagens) ---------- */
const CHARACTERS = {
  julia: {
    nome: 'Júlia',
    responsavel: 'Wagner',
    idade: 10,
    nascimento: '25/05/2017',
    personalidade: 'legal, gentil, gosta de desenhar e inventar coisas.',
    olhos: 'castanhos (cor muda de acordo com a emoção, herança da ficha original: caramelo/feliz, roxo/medo).',
    relacoes: 'Cuida de Jasmim com muito carinho. NÃO é irmã de Jasmim.'
  },
  lia: {
    nome: 'Lia',
    responsavel: 'ChatGPT',
    idade: 10,
    nascimento: '22/01/2016',
    personalidade: 'legal, gentil, gosta de desenhar. Adora natureza, animais e lugares tranquilos.',
    olhos: 'castanho-caramelo, mudam de tom com a emoção.',
    papel: 'Ajuda Júlia dando pistas e observando detalhes da natureza que passam despercebidos.'
  },
  jasmim: {
    nome: 'Jasmim',
    responsavel: 'Wagner (tutor)',
    idade: 10,
    nascimento: '21/10/2014',
    personalidade: 'legal, gentil, muito criativa, curiosa e imaginativa. Ama aprender coisas novas e ajudar quem precisa.',
    relacoes: 'Júlia cuida dela com muito amor. Elas NÃO são irmãs.',
    afinidades: 'flores, natureza, tranquilidade, rio, paisagens, sons naturais.'
  },
  wagner: {
    nome: 'Wagner',
    responsavel: 'não está participando',
    idade: 43,
    nascimento: '22/10/1982',
    personalidade: 'gentil, legal, leva a personalidade de uma pessoa surda.',
    olhos: 'castanhos, não mudam de cor.',
    corFavorita: 'preto',
    curiosidades: 'criativo, curioso, gosta de rock.'
  },
  chatgpt: {
    nome: 'ChatGPT',
    tipo: 'robô narrador',
    personalidade: 'legal e narrador. Gosta de ajudar, explicar, contar histórias e conversar sobre tudo.',
    olhosBoca: 'mudam de EXPRESSÃO (não de cor) de acordo com a fala ou emoção.',
    funcao: 'narrador, explica, conversa, ajuda e imagina junto.'
  },
  macaquildo: {
    nome: 'Macaquildo',
    idade: 110,
    nascimento: 'secreta',
    responsavel: 'não está participando',
    descricao: 'criatura semelhante a um macaco, corpo peludo, orelhas grandes de elefante, olhos roxos (fixos), ' +
      'dentes normais com pequenas presas, cauda extremamente longa que lembra uma cobra e serve para se locomover ' +
      'e se enrolar em árvores. Possui pernas e consegue voar.',
    personalidade: 'parece um senhor; gentil, legal, meio tímido, risonho.',
    curiosidades: 'criativo, explorador, risonho.',
    voz: 'rouca, fraca, arranhada — como um senhor muito velho e fumante.'
  },
  pedra: {
    nome: 'Pedra',
    descricao: 'ela é uma pedra.',
    fala: 'sim, ela fala. Tem uma voz extremamente fraquinha.',
    personalidade: 'quieta, observadora, muito gentil.',
    aparencia: 'bonita, lisa e brilhante. Não tem olhos — só um pequeno risco como boca.'
  }
};

/* ---------- carregamento opcional de sprites reais (PNG) ---------- */
const SpriteLoader = (() => {
  const cache = {};

  function tryLoad(path) {
    if (cache[path]) return cache[path];
    const entry = { loaded: false, img: null };
    const img = new Image();
    img.onload = () => {
      // arquivos-placeholder incluídos no projeto são PNGs 1x1 transparentes;
      // uma arte real terá dimensões maiores, então só então usamos a imagem.
      if (img.naturalWidth > 2 && img.naturalHeight > 2) {
        entry.loaded = true;
        entry.img = img;
      }
    };
    img.onerror = () => { entry.loaded = false; };
    img.src = path;
    cache[path] = entry;
    return entry;
  }

  // pré-carrega tudo que o jogo pode precisar; se faltar, cai no placeholder.
  const KEYS = ['julia', 'lia', 'jasmim', 'wagner', 'chatgpt', 'pedra',
    'macaquildo', 'macaquildo_tail', 'macaquildo_eyes'];
  KEYS.forEach(k => tryLoad(`assets/characters/${k}.png`));
  KEYS.forEach(k => tryLoad(`assets/characters/${k}_portrait.png`));

  function get(key, portrait = false) {
    const path = `assets/characters/${key}${portrait ? '_portrait' : ''}.png`;
    return cache[path] || { loaded: false, img: null };
  }

  return { get };
})();

/* ---------- utilidades de desenho ---------- */
function _roundRect(ctx, x, y, w, h, r) {
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

function _blob(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function _shadow(ctx, cx, groundY, w) {
  ctx.save();
  ctx.fillStyle = 'rgba(30,20,10,0.28)';
  _blob(ctx, cx, groundY, w, w * 0.32);
  ctx.fill();
  ctx.restore();
}

/**
 * Desenha um personagem humanoide chibi estilizado como placeholder.
 * Todos os parâmetros de cor/estilo vêm do "canon" descrito nas fichas.
 */
function drawHumanoidPlaceholder(ctx, x, y, opts) {
  const {
    scale = 1, facing = 'down', walkPhase = 0, child = true,
    skin = '#f2c9a0', hairColor = '#6b4a2f', hairStyle = 'curly',
    topColor = '#6d8fd6', overallsColor = null, dressColor = null,
    shoeColor = '#7a5aa8', glasses = false, accessory = 'none',
    talking = false
  } = opts;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = Math.sin(walkPhase * 6) * (walkPhase !== 0 ? 2 : 0);
  const headR = child ? 15 : 13;
  const bodyH = child ? 26 : 40;
  const bodyW = child ? 24 : 22;
  const groundY = 2;

  _shadow(ctx, 0, groundY, headR * 1.1);

  ctx.translate(0, bob);

  // pernas
  const legSwing = Math.sin(walkPhase * 6) * 6;
  ctx.fillStyle = skin;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  [-1, 1].forEach((side, i) => {
    ctx.save();
    ctx.translate(side * 6, -6);
    ctx.rotate((i === 0 ? legSwing : -legSwing) * 0.01);
    _roundRect(ctx, -4, 0, 8, 16, 3);
    ctx.fill();
    ctx.restore();
  });
  // sapatos
  ctx.fillStyle = shoeColor;
  [-1, 1].forEach(side => {
    _roundRect(ctx, side * 6 - 5, 7, 10, 7, 3);
    ctx.fill();
  });

  // corpo (roupa)
  const bodyTop = -6 - bodyH;
  if (dressColor) {
    ctx.fillStyle = dressColor;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.32, bodyTop + 6);
    ctx.lineTo(bodyW * 0.32, bodyTop + 6);
    ctx.lineTo(bodyW * 0.62, -6);
    ctx.lineTo(-bodyW * 0.62, -6);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = topColor;
    _roundRect(ctx, -bodyW / 2, bodyTop + 8, bodyW, bodyH - 8, 6);
    ctx.fill();
    if (overallsColor) {
      ctx.fillStyle = overallsColor;
      _roundRect(ctx, -bodyW / 2 + 1, bodyTop + 14, bodyW - 2, bodyH - 14, 6);
      ctx.fill();
      // alças do macacão
      ctx.fillRect(-bodyW / 2 + 4, bodyTop + 6, 5, 12);
      ctx.fillRect(bodyW / 2 - 9, bodyTop + 6, 5, 12);
      ctx.fillStyle = '#d8c98a';
      ctx.beginPath(); ctx.arc(-bodyW / 2 + 6.5, bodyTop + 16, 1.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(bodyW / 2 - 6.5, bodyTop + 16, 1.6, 0, 7); ctx.fill();
    }
  }

  // braços
  ctx.fillStyle = skin;
  const armSwing = Math.sin(walkPhase * 6 + Math.PI) * 4;
  [-1, 1].forEach((side, i) => {
    ctx.save();
    ctx.translate(side * (bodyW / 2 + 1), bodyTop + 12 + (i === 0 ? armSwing : -armSwing) * 0.2);
    _roundRect(ctx, -3, 0, 6, 15, 3);
    ctx.fill();
    ctx.restore();
  });

  // cabeça
  const headY = bodyTop - headR + 4;
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  // cabelo (estilo simplificado)
  ctx.fillStyle = hairColor;
  if (hairStyle === 'curly') {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      _blob(ctx, Math.cos(a) * headR * 0.85, headY + Math.sin(a) * headR * 0.85 - 3, 6, 6);
      ctx.fill();
    }
    _blob(ctx, 0, headY - headR - 2, 9, 8); ctx.fill(); // topete/coque
  } else if (hairStyle === 'long') {
    _blob(ctx, 0, headY - 2, headR + 3, headR + 10);
    ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, headY, headR - 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hairColor;
    _blob(ctx, 0, headY - headR + 3, headR + 1, headR * 0.7); ctx.fill();
  } else if (hairStyle === 'wavy-red') {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      _blob(ctx, Math.cos(a) * headR * 0.9, headY + Math.sin(a) * headR * 0.9 - 2, 5.5, 7);
      ctx.fill();
    }
  } else if (hairStyle === 'short-adult') {
    _blob(ctx, 0, headY - headR * 0.55, headR + 1, headR * 0.75);
    ctx.fill();
  }

  // óculos (Júlia)
  if (glasses) {
    ctx.strokeStyle = '#8a6d3f';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(-5, headY + 1, 4.2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(5, headY + 1, 4.2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, headY + 1); ctx.lineTo(1, headY + 1); ctx.stroke();
  }

  // acessório (coroa de flores da Jasmim)
  if (accessory === 'flowerCrown') {
    const colors = ['#f2a5c1', '#f7d774', '#f2a5c1', '#f7d774', '#f2a5c1'];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.9 + (i / 4) * Math.PI * 1.3;
      const fx = Math.cos(a) * headR * 0.95, fy = headY - 3 + Math.sin(a) * headR * 0.6;
      ctx.fillStyle = colors[i];
      _blob(ctx, fx, fy, 3, 3); ctx.fill();
    }
  }

  // rosto (olhos simples voltados para 'facing')
  if (facing !== 'up') {
    ctx.fillStyle = '#2c1c10';
    const eyeOffset = facing === 'left' ? -2 : facing === 'right' ? 2 : 0;
    ctx.beginPath(); ctx.arc(-4 + eyeOffset, headY + 1, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 + eyeOffset, headY + 1, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a8624f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (talking) { ctx.beginPath(); ctx.arc(0, headY + 5, 1.6, 0, Math.PI * 2); ctx.fillStyle = '#8a4a3a'; ctx.fill(); }
    else { ctx.moveTo(-2, headY + 5); ctx.quadraticCurveTo(0, headY + 6.5, 2, headY + 5); ctx.stroke(); }
  }

  ctx.restore();
}

/* ---------- ChatGPT (robô) ---------- */
function drawChatGPTPlaceholder(ctx, x, y, opts = {}) {
  const { scale = 1, mood = 'feliz', talking = false, bob = 0 } = opts;
  ctx.save();
  ctx.translate(x, y + Math.sin(bob) * 2);
  ctx.scale(scale, scale);
  _shadow(ctx, 0, 20, 14);

  ctx.fillStyle = '#e7e9ee';
  _roundRect(ctx, -13, -34, 26, 30, 6); ctx.fill();
  ctx.strokeStyle = '#b9bfca'; ctx.lineWidth = 1.2;
  _roundRect(ctx, -13, -34, 26, 30, 6); ctx.stroke();

  // antena
  ctx.strokeStyle = '#b9bfca'; ctx.beginPath();
  ctx.moveTo(0, -34); ctx.lineTo(0, -40); ctx.stroke();
  ctx.fillStyle = '#7ed0e8';
  ctx.beginPath(); ctx.arc(0, -42, 2.6, 0, Math.PI * 2); ctx.fill();

  // tela do rosto
  ctx.fillStyle = '#233042';
  _roundRect(ctx, -10, -29, 20, 16, 4); ctx.fill();

  // olhos (mudam de expressão, não de cor)
  ctx.fillStyle = '#7ed0e8';
  if (mood === 'feliz') {
    _roundRect(ctx, -7, -25, 4, 4, 1); ctx.fill();
    _roundRect(ctx, 3, -25, 4, 4, 1); ctx.fill();
  } else if (mood === 'curioso') {
    _roundRect(ctx, -7, -26, 4, 5, 1); ctx.fill();
    _roundRect(ctx, 3, -24, 4, 3, 1); ctx.fill();
  } else if (mood === 'surpreso') {
    ctx.beginPath(); ctx.arc(-5, -23, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -23, 2.6, 0, Math.PI * 2); ctx.fill();
  } else {
    _roundRect(ctx, -7, -25, 4, 4, 1); ctx.fill();
    _roundRect(ctx, 3, -25, 4, 4, 1); ctx.fill();
  }
  // boca
  ctx.fillStyle = '#7ed0e8';
  if (talking) { _roundRect(ctx, -4, -18, 8, 3, 1); ctx.fill(); }
  else { _roundRect(ctx, -4, -17, 8, 1.6, 1); ctx.fill(); }

  // corpo
  ctx.fillStyle = '#e7e9ee';
  _roundRect(ctx, -10, -4, 20, 16, 4); ctx.fill();
  ctx.strokeStyle = '#b9bfca'; _roundRect(ctx, -10, -4, 20, 16, 4); ctx.stroke();

  // braços
  ctx.fillStyle = '#cfd4dc';
  _roundRect(ctx, -16, -2, 5, 12, 2); ctx.fill();
  _roundRect(ctx, 11, -2, 5, 12, 2); ctx.fill();

  // pernas curtas
  ctx.fillStyle = '#9aa2ae';
  _roundRect(ctx, -8, 12, 6, 6, 2); ctx.fill();
  _roundRect(ctx, 2, 12, 6, 6, 2); ctx.fill();

  ctx.restore();
}

/* ---------- Macaquildo ---------- */
function drawMacaquildoPlaceholder(ctx, x, y, opts = {}) {
  const { scale = 1, stage = 'full', tailPhase = 0, wingPhase = 0 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (stage === 'tail') {
    // apenas a cauda enrolada em um galho, mistério
    ctx.strokeStyle = '#5c7a4a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.bezierCurveTo(10, 10, -10, -5, 8, -18);
    ctx.bezierCurveTo(20, -26, 6, -34, -4, -30);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (stage === 'eyes') {
    ctx.fillStyle = 'rgba(122,90,168,0.95)';
    ctx.beginPath(); ctx.ellipse(-6, 0, 4, 5.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, 0, 4, 5.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1030';
    ctx.beginPath(); ctx.arc(-6, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }

  // full
  _shadow(ctx, 0, 38, 20);

  // cauda longa (tipo cobra) — desenhada atrás do corpo
  ctx.strokeStyle = '#8a6a45';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6, 20);
  ctx.bezierCurveTo(30, 10 + Math.sin(tailPhase) * 6, 34, -10, 20, -22 + Math.sin(tailPhase * 1.3) * 4);
  ctx.stroke();

  // asas
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const wf = Math.sin(wingPhase) * 6;
  ctx.beginPath();
  ctx.moveTo(-10, -6);
  ctx.quadraticCurveTo(-34, -18 - wf, -30, 4);
  ctx.quadraticCurveTo(-20, 2, -10, 4);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.quadraticCurveTo(34, -18 - wf, 30, 4);
  ctx.quadraticCurveTo(20, 2, 10, 4);
  ctx.closePath(); ctx.fill();

  // pernas
  ctx.fillStyle = '#8a6a45';
  _roundRect(ctx, -9, 18, 7, 14, 3); ctx.fill();
  _roundRect(ctx, 2, 18, 7, 14, 3); ctx.fill();

  // robe roxo
  ctx.fillStyle = '#5a3f82';
  ctx.beginPath();
  ctx.moveTo(-13, 22);
  ctx.lineTo(13, 22);
  ctx.lineTo(10, -14);
  ctx.lineTo(-10, -14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f0c96b'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-13, 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(13, 20); ctx.stroke();

  // bolsa pequena
  ctx.fillStyle = '#6b4a2f';
  _roundRect(ctx, -4, 4, 8, 8, 2); ctx.fill();

  // corpo peludo / cabeça
  ctx.fillStyle = '#8a6a45';
  ctx.beginPath(); ctx.arc(0, -22, 15, 0, Math.PI * 2); ctx.fill();

  // orelhas grandes (elefante)
  ctx.fillStyle = '#7a5a38';
  _blob(ctx, -20, -22, 9, 12); ctx.fill();
  _blob(ctx, 20, -22, 9, 12); ctx.fill();
  ctx.fillStyle = '#c9a878';
  _blob(ctx, -20, -22, 5, 8); ctx.fill();
  _blob(ctx, 20, -22, 5, 8); ctx.fill();

  // barba branca de "senhor"
  ctx.fillStyle = '#e8e2d5';
  _blob(ctx, 0, -13, 9, 7); ctx.fill();

  // rosto
  ctx.fillStyle = '#c9a878';
  _blob(ctx, 0, -22, 10, 9); ctx.fill();

  // olhos roxos fixos
  ctx.fillStyle = '#7a5aa8';
  ctx.beginPath(); ctx.ellipse(-4, -24, 3, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -24, 3, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c0f24';
  ctx.beginPath(); ctx.arc(-4, -24, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -24, 1.1, 0, Math.PI * 2); ctx.fill();

  // sobrancelhas brancas grossas (ar de senhor gentil)
  ctx.strokeStyle = '#e8e2d5'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-7, -29); ctx.lineTo(-2, -28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -29); ctx.lineTo(2, -28); ctx.stroke();

  // boca com pequenas presas
  ctx.strokeStyle = '#4a3320'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4, -16); ctx.quadraticCurveTo(0, -13, 4, -16); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-3, -16); ctx.lineTo(-2, -13); ctx.lineTo(-1, -16); ctx.fill();
  ctx.beginPath(); ctx.moveTo(3, -16); ctx.lineTo(2, -13); ctx.lineTo(1, -16); ctx.fill();

  // cajado
  ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(16, 30); ctx.lineTo(20, -26); ctx.stroke();
  ctx.beginPath(); ctx.arc(21, -29, 3, 0, Math.PI * 2); ctx.stroke();

  ctx.restore();
}

/* ---------- Pedra ---------- */
function drawPedraPlaceholder(ctx, x, y, opts = {}) {
  const { scale = 1, talking = false } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  _shadow(ctx, 0, 12, 16);

  const grad = ctx.createLinearGradient(-16, -22, 16, 10);
  grad.addColorStop(0, '#b9b0c4');
  grad.addColorStop(0.5, '#9c93a8');
  grad.addColorStop(1, '#847a91');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-15, 10);
  ctx.bezierCurveTo(-18, -8, -10, -22, 0, -23);
  ctx.bezierCurveTo(10, -22, 18, -8, 15, 10);
  ctx.bezierCurveTo(8, 15, -8, 15, -15, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
  ctx.stroke();

  // pequeno brilho (aparência "lisa e brilhante")
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  _blob(ctx, -6, -12, 5, 3); ctx.fill();

  // boca: só um risco
  ctx.strokeStyle = '#3d2f22'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (talking) { ctx.moveTo(-4, 2); ctx.quadraticCurveTo(0, 5, 4, 2); }
  else { ctx.moveTo(-4, 2); ctx.lineTo(4, 2); }
  ctx.stroke();

  ctx.restore();
}

/* ---------- fábrica: desenha personagem por chave, usando PNG se existir ---------- */
function drawCharacter(ctx, key, x, y, opts = {}) {
  const sprite = SpriteLoader.get(key, false);
  if (sprite.loaded) {
    const w = opts.imgW || 48, h = opts.imgH || 64;
    ctx.drawImage(sprite.img, x - w / 2, y - h, w, h);
    return;
  }
  switch (key) {
    case 'julia':
      drawHumanoidPlaceholder(ctx, x, y, {
        ...opts, child: true, skin: '#f4d3ab', hairColor: '#e0b84a', hairStyle: 'long',
        topColor: '#3f6fb3', overallsColor: '#5f8fd6', shoeColor: '#274a7a', glasses: true
      });
      break;
    case 'lia':
      drawHumanoidPlaceholder(ctx, x, y, {
        ...opts, child: true, skin: '#f2c9a0', hairColor: '#6b4a2f', hairStyle: 'curly',
        topColor: '#8fae5c', overallsColor: '#4f6fa0', shoeColor: '#7a5aa8'
      });
      break;
    case 'jasmim':
      drawHumanoidPlaceholder(ctx, x, y, {
        ...opts, child: true, skin: '#e8b489', hairColor: '#e8622f', hairStyle: 'wavy-red',
        dressColor: '#fbf3e0', shoeColor: '#e07fa0', accessory: 'flowerCrown'
      });
      break;
    case 'wagner':
      drawHumanoidPlaceholder(ctx, x, y, {
        ...opts, child: false, skin: '#e8b489', hairColor: '#c99a4a', hairStyle: 'short-adult',
        topColor: '#f2ede1', overallsColor: null, shoeColor: '#7a2f22'
      });
      break;
    case 'chatgpt':
      drawChatGPTPlaceholder(ctx, x, y, opts);
      break;
    case 'macaquildo':
      drawMacaquildoPlaceholder(ctx, x, y, opts);
      break;
    case 'pedra':
      drawPedraPlaceholder(ctx, x, y, opts);
      break;
    default:
      ctx.fillStyle = '#888';
      ctx.fillRect(x - 10, y - 20, 20, 20);
  }
}

/** Desenha o retrato (caixa de diálogo). Usa PNG _portrait se existir. */
function drawPortrait(ctx, key, w, h, opts = {}) {
  ctx.clearRect(0, 0, w, h);
  const sprite = SpriteLoader.get(key, true);
  if (sprite.loaded) {
    ctx.drawImage(sprite.img, 0, 0, w, h);
    return;
  }
  // fundo suave
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#fff7e6');
  grad.addColorStop(1, '#ead9b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2, h - 14);
  const scale = h / 62;
  drawCharacter(ctx, key, 0, 0, { ...opts, scale, facing: 'down' });
  ctx.restore();
}
