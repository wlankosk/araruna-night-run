/* ===================================================
   game.js — motor principal do jogo
   =================================================== */

(function () {
  'use strict';

  /* ---------------- utilidades ---------------- */
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  /* ---------------- referências DOM ---------------- */
  const el = id => document.getElementById(id);
  const screens = {
    menu: el('screen-menu'), howto: el('screen-howto'), game: el('screen-game')
  };
  const canvas = el('game-canvas');
  const ctx = canvas.getContext('2d');
  const portraitCanvas = el('portrait-canvas');
  const portraitCtx = portraitCanvas.getContext('2d');

  const hud = {
    pause: el('btn-pause'), map: el('btn-map'), fullscreen: el('btn-fullscreen'),
    questBanner: el('quest-banner'), interactPrompt: el('interact-prompt'),
    toast: el('toast'), rotateHint: el('rotate-hint')
  };
  const dlg = {
    box: el('dialogue-box'), name: el('dialogue-name'), text: el('dialogue-text')
  };
  const overlays = {
    map: el('map-overlay'), pause: el('pause-overlay'), end: el('chapter-end-overlay')
  };

  const PLAYER_RADIUS = 12;
  const INTERACT_RADIUS = 58;
  const PLAYER_SPEED = 175; // px/s

  /* ---------------- estado do jogo ---------------- */
  const Game = {
    state: 'menu', // menu | howto | playing | dialogue | paused | mapoverlay | cutscene | chapterend
    stateBeforeOverlay: 'playing',
    flags: null,
    inventory: [],
    player: { x: WORLD.spawn.x, y: WORLD.spawn.y, facing: 'down', walking: false, walkPhase: 0 },
    camera: { x: 0, y: 0 },
    keys: new Set(),
    touchVector: { x: 0, y: 0 },
    dialogue: { queue: [], index: -1, charIndex: 0, typing: false, onComplete: null, speedCharsPerSec: 45, timer: 0 },
    cutscene: { active: false, macaquildoStage: 'hidden' },
    toastTimer: null,
    lastTime: 0,
    time: 0
  };

  function getInteractables() {
    const w = WORLD;
    const list = [
      { id: 'wagner', x: w.npcSpawns.wagner.x, y: w.npcSpawns.wagner.y, r: INTERACT_RADIUS, marker: '💬', handler: talkWagner },
      { id: 'lia', x: w.npcSpawns.lia.x, y: w.npcSpawns.lia.y, r: INTERACT_RADIUS, marker: '💬', handler: talkLia },
      { id: 'jasmim', x: w.npcSpawns.jasmim.x, y: w.npcSpawns.jasmim.y, r: INTERACT_RADIUS, marker: '💬', handler: talkJasmim },
      { id: 'chatgpt', x: w.npcSpawns.chatgpt.x, y: w.npcSpawns.chatgpt.y, r: INTERACT_RADIUS, marker: '💬', handler: talkChatGPT },
      {
        id: 'pedra', x: w.npcSpawns.pedra.x, y: w.npcSpawns.pedra.y, r: INTERACT_RADIUS,
        marker: () => (Game.flags.hasMap ? null : '💬'), handler: talkPedra
      }
    ];
    w.flowerPatch.flowers.forEach((f, i) => {
      const isSpecial = f.x === w.flowerPatch.special.x && f.y === w.flowerPatch.special.y;
      list.push({
        id: 'flower' + i, x: f.x, y: f.y, r: 30,
        marker: () => (isSpecial && !Game.flags.symbolFlor ? '✨' : null),
        handler: () => interactFlower(isSpecial)
      });
    });
    list.push({
      id: 'pawspot', x: w.pawTrail.hiddenSpot.x, y: w.pawTrail.hiddenSpot.y, r: 42,
      marker: () => (Game.flags.symbolPatas ? null : '✨'), handler: interactPaw
    });
    list.push({
      id: 'starspot', x: w.starSpot.x, y: w.starSpot.y, r: 46,
      marker: () => (Game.flags.symbolEstrela ? null : '✨'), handler: interactStar
    });
    list.push({
      id: 'bigtree', x: w.bigTree.x, y: w.bigTree.y + 20, r: w.bigTree.triggerR,
      marker: () => (Game.flags.mapReacted && !Game.flags.metMacaquildo ? '❓' : null),
      handler: interactBigTree,
      onlyActive: () => Game.flags.mapReacted
    });
    return list;
  }

  function nearestInteractable() {
    const p = Game.player;
    let best = null, bestD = Infinity;
    for (const it of getInteractables()) {
      if (it.onlyActive && !it.onlyActive()) continue;
      const d = dist(p.x, p.y, it.x, it.y);
      if (d <= it.r && d < bestD) { best = it; bestD = d; }
    }
    return best;
  }

  /* ---------------- diálogo ---------------- */
  function speakerDisplayName(key) { return SPEAKER_NAMES[key] || key; }

  function playDialogue(key, onComplete) {
    const queue = DIALOGUES[key];
    if (!queue || !queue.length) { if (onComplete) onComplete(); return; }
    if (Game.state !== 'cutscene') Game.stateBeforeOverlay = Game.state;
    Game.state = 'dialogue';
    Game.dialogue.queue = queue;
    Game.dialogue.index = -1;
    Game.dialogue.onComplete = onComplete || null;
    dlg.box.hidden = false;
    hud.interactPrompt.hidden = true;
    advanceDialogue();
  }

  function renderDialogueLine() {
    const line = Game.dialogue.queue[Game.dialogue.index];
    dlg.name.textContent = speakerDisplayName(line.speaker);
    Game.dialogue.fullText = line.text;
    Game.dialogue.charIndex = 0;
    Game.dialogue.typing = true;
    Game.dialogue.timer = 0;
    dlg.text.textContent = '';
    drawPortrait(portraitCtx, line.speaker, portraitCanvas.width, portraitCanvas.height,
      { mood: line.mood || 'feliz', talking: true, stage: line.speaker === 'macaquildo' ? (Game.cutscene.macaquildoStage === 'hidden' ? 'full' : Game.cutscene.macaquildoStage) : undefined });
    if (line.visualStage) Game.cutscene.macaquildoStage = line.visualStage;
    AudioManager.playOnce('interact', 0.25);
  }

  function advanceDialogue() {
    const d = Game.dialogue;
    if (d.index >= 0 && d.typing) {
      // completa a linha instantaneamente
      d.typing = false;
      dlg.text.textContent = d.fullText;
      return;
    }
    d.index++;
    if (d.index >= d.queue.length) {
      closeDialogue();
      return;
    }
    renderDialogueLine();
  }

  function closeDialogue() {
    dlg.box.hidden = true;
    const cb = Game.dialogue.onComplete;
    Game.dialogue.onComplete = null;
    Game.dialogue.queue = [];
    Game.dialogue.index = -1;
    Game.state = Game.stateBeforeOverlay === 'dialogue' ? 'playing' : Game.stateBeforeOverlay;
    if (cb) cb();
  }

  /* ---------------- interações ---------------- */
  function fullSave() {
    SaveSystem.save({
      chapter: 1,
      playerPos: { x: Game.player.x, y: Game.player.y },
      flags: Game.flags,
      inventory: Game.inventory
    });
  }

  function showToast(text, duration = 2400) {
    hud.toast.textContent = text;
    hud.toast.hidden = false;
    if (Game.toastTimer) clearTimeout(Game.toastTimer);
    Game.toastTimer = setTimeout(() => { hud.toast.hidden = true; }, duration);
  }

  function updateQuestBanner() {
    const f = Game.flags;
    let text = '';
    if (!f.hasMap) {
      text = f.metPedraFirst
        ? 'Volte a falar com a pedra — tem algo escondido embaixo dela.'
        : 'Explore o vale. Converse com quem encontrar pelo caminho.';
    } else if (!f.mapReacted) {
      const missing = [];
      if (!f.symbolEstrela) missing.push('⭐ Estrela');
      if (!f.symbolFlor) missing.push('🌼 Flor');
      if (!f.symbolPatas) missing.push('🐾 Patas');
      text = 'Encontre os símbolos do mapa: ' + missing.join(' · ');
    } else if (!f.metMacaquildo) {
      text = 'Siga a trilha brilhante até a grande árvore.';
    } else if (!f.chapterComplete) {
      text = 'Capítulo concluído!';
    } else {
      text = 'Fim do Capítulo 1. Mais aventuras em breve!';
    }
    hud.questBanner.textContent = text;
    hud.questBanner.classList.add('show');
  }

  function markSymbolSlot(id) {
    const slot = el('slot-' + id);
    if (slot) slot.classList.add('found');
  }

  function checkAllSymbols() {
    const f = Game.flags;
    if (f.symbolEstrela && f.symbolFlor && f.symbolPatas && !f.mapReacted) {
      setTimeout(() => {
        playDialogue('mapReacted', () => {
          Game.flags.mapReacted = true;
          fullSave();
          updateQuestBanner();
          showToast('Uma trilha brilhante surgiu perto da árvore grande! ✨');
        });
      }, 400);
    }
  }

  function talkWagner() {
    if (!Game.flags.metWagner) {
      playDialogue('wagnerFirst', () => { Game.flags.metWagner = true; fullSave(); updateQuestBanner(); });
    } else playDialogue('wagnerRepeat');
  }
  function talkLia() {
    if (!Game.flags.metLia) {
      playDialogue('liaFirst', () => { Game.flags.metLia = true; fullSave(); updateQuestBanner(); });
      return;
    }
    if (Game.flags.symbolEstrela && Game.flags.symbolFlor && Game.flags.symbolPatas) playDialogue('liaRepeat_allFound');
    else if (Game.flags.hasMap) playDialogue('liaRepeat_hasMap');
    else playDialogue('liaRepeat_noMap');
  }
  function talkJasmim() {
    if (!Game.flags.metJasmim) {
      playDialogue('jasmimFirst', () => { Game.flags.metJasmim = true; fullSave(); updateQuestBanner(); });
    } else playDialogue('jasmimRepeat');
  }
  function talkChatGPT() {
    if (!Game.flags.introDone) { playDialogue('intro', () => { Game.flags.introDone = true; fullSave(); updateQuestBanner(); }); return; }
    playDialogue('chatgptIdle');
  }
  function talkPedra() {
    if (!Game.flags.metPedraFirst) {
      playDialogue('pedraFirst', () => { Game.flags.metPedraFirst = true; fullSave(); updateQuestBanner(); });
    } else if (!Game.flags.hasMap) {
      playDialogue('pedraReveal', () => {
        Game.flags.hasMap = true;
        Game.inventory.push('mapa');
        fullSave();
        updateQuestBanner();
        showToast('🗺️ Mapa adicionado! Toque no ícone do mapa para ver os símbolos.');
      });
    } else {
      playDialogue('pedraRepeat');
    }
  }

  function interactFlower(isSpecial) {
    if (isSpecial) {
      if (!Game.flags.symbolFlor) {
        playDialogue('flowerSpecialFound', () => {
          Game.flags.symbolFlor = true;
          fullSave();
          markSymbolSlot('flor');
          updateQuestBanner();
          AudioManager.playOnce('discover', 0.5);
          checkAllSymbols();
        });
      } else {
        showToast('Você já reconhece essa flor especial. 🌼');
      }
    } else {
      playDialogue('flowerCommon');
    }
  }

  function interactPaw() {
    if (!Game.flags.symbolPatas) {
      playDialogue('pawFound', () => {
        Game.flags.symbolPatas = true;
        fullSave();
        markSymbolSlot('patas');
        updateQuestBanner();
        AudioManager.playOnce('discover', 0.5);
        checkAllSymbols();
      });
    } else {
      showToast('As pegadas levam de volta a esse esconderijo. 🐾');
    }
  }

  function isStarBright() {
    return (Game.time * 1000) % WORLD.starSpot.period < WORLD.starSpot.brightWindow;
  }

  function interactStar() {
    if (Game.flags.symbolEstrela) { showToast('O reflexo continua brilhando de vez em quando. ⭐'); return; }
    if (isStarBright()) {
      playDialogue('starFound', () => {
        Game.flags.symbolEstrela = true;
        fullSave();
        markSymbolSlot('estrela');
        updateQuestBanner();
        AudioManager.playOnce('discover', 0.5);
        checkAllSymbols();
      });
    } else {
      playDialogue('starTooSoon');
    }
  }

  function interactBigTree() {
    if (!Game.flags.mapReacted) return;
    if (Game.flags.metMacaquildo) { playDialogue('macaquildoRepeat'); return; }
    Game.state = 'cutscene';
    Game.cutscene.active = true;
    Game.cutscene.macaquildoStage = 'tail';
    playDialogue('macaquildoCutscene', () => {
      Game.flags.metMacaquildo = true;
      fullSave();
      updateQuestBanner();
      setTimeout(() => {
        playDialogue('chapterEndNarration', () => {
          Game.flags.chapterComplete = true;
          fullSave();
          showChapterEnd();
        });
      }, 300);
    });
  }

  function tryInteract() {
    if (Game.state === 'dialogue') { advanceDialogue(); return; }
    if (Game.state !== 'playing') return;
    const target = nearestInteractable();
    if (target) { AudioManager.unlockOnFirstInput(); target.handler(); }
  }

  /* ---------------- movimento / colisão ---------------- */
  function inputVector() {
    let x = 0, y = 0;
    if (Game.keys.has('arrowleft') || Game.keys.has('a')) x -= 1;
    if (Game.keys.has('arrowright') || Game.keys.has('d')) x += 1;
    if (Game.keys.has('arrowup') || Game.keys.has('w')) y -= 1;
    if (Game.keys.has('arrowdown') || Game.keys.has('s')) y += 1;
    x += Game.touchVector.x;
    y += Game.touchVector.y;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y };
  }

  function updatePlayer(dt) {
    const v = inputVector();
    const moving = Math.abs(v.x) > 0.05 || Math.abs(v.y) > 0.05;
    Game.player.walking = moving;
    if (moving) {
      Game.player.walkPhase += dt;
      if (Math.abs(v.x) > Math.abs(v.y)) Game.player.facing = v.x < 0 ? 'left' : 'right';
      else Game.player.facing = v.y < 0 ? 'up' : 'down';

      const dx = v.x * PLAYER_SPEED * dt;
      const dy = v.y * PLAYER_SPEED * dt;
      const nx = Game.player.x + dx;
      if (!Collision.blocked(nx, Game.player.y, PLAYER_RADIUS)) Game.player.x = nx;
      const ny = Game.player.y + dy;
      if (!Collision.blocked(Game.player.x, ny, PLAYER_RADIUS)) Game.player.y = ny;
    } else {
      Game.player.walkPhase = 0;
    }
  }

  function updateCamera() {
    const vw = canvas.clientWidth, vh = canvas.clientHeight;
    let cx = Game.player.x - vw / 2;
    let cy = Game.player.y - vh / 2;
    cx = clamp(cx, 0, Math.max(0, WORLD.width - vw));
    cy = clamp(cy, 0, Math.max(0, WORLD.height - vh));
    if (WORLD.width < vw) cx = (WORLD.width - vw) / 2;
    if (WORLD.height < vh) cy = (WORLD.height - vh) / 2;
    Game.camera.x = cx; Game.camera.y = cy;
  }

  /* ---------------- render ---------------- */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBackground() {
    const vw = canvas.clientWidth, vh = canvas.clientHeight;
    const grad = ctx.createLinearGradient(0, Game.camera.y, 0, Game.camera.y + vh);
    grad.addColorStop(0, '#bfe0a6');
    grad.addColorStop(1, '#8fc27f');
    ctx.fillStyle = grad;
    ctx.fillRect(Game.camera.x, Game.camera.y, vw, vh);

    // pontos de grama decorativos, só os visíveis
    const left = Game.camera.x - 20, right = Game.camera.x + vw + 20;
    const top = Game.camera.y - 20, bottom = Game.camera.y + vh + 20;
    ctx.fillStyle = 'rgba(60,100,40,0.18)';
    for (const g of WORLD.grassDots) {
      if (g.x < left || g.x > right || g.y < top || g.y > bottom) continue;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, 2 + g.tone * 2, 1 + g.tone, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPath() {
    const pts = WORLD.pathPoints;
    ctx.strokeStyle = 'rgba(216,193,140,0.55)';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  function drawRiver() {
    const r = WORLD.river;
    const grad = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    grad.addColorStop(0, '#5aa3c9');
    grad.addColorStop(1, '#3d7fa8');
    ctx.fillStyle = grad;
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // ondulações animadas
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    const t = Game.time;
    for (let i = 0; i < 6; i++) {
      const yy = r.y + 14 + i * (r.h - 28) / 5;
      ctx.beginPath();
      for (let x = r.x; x < r.x + r.w; x += 18) {
        const wave = Math.sin(x * 0.02 + t * 1.6 + i) * 4;
        if (x === r.x) ctx.moveTo(x, yy + wave); else ctx.lineTo(x, yy + wave);
      }
      ctx.stroke();
    }
  }

  function drawStarSpot() {
    const s = WORLD.starSpot;
    const bright = isStarBright();
    const phase = (Game.time * 1000) % s.period;
    const glow = bright ? 1 - Math.abs(phase - s.brightWindow / 2) / (s.brightWindow / 2) : 0.15;
    ctx.save();
    ctx.globalAlpha = Game.flags.symbolEstrela ? 0.9 : clamp(glow, 0.15, 1);
    const r = Game.flags.symbolEstrela ? 22 : 14 + glow * 10;
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
    grad.addColorStop(0, '#fff9d6');
    grad.addColorStop(1, 'rgba(255,249,214,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fill();
    if (bright || Game.flags.symbolEstrela) {
      ctx.fillStyle = '#fff9d6';
      drawStarShape(s.x, s.y, 8, 3.2);
    }
    ctx.restore();
  }
  function drawStarShape(cx, cy, outerR, innerR) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawBridge() {
    const b = WORLD.bridge;
    ctx.fillStyle = '#a9814f';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#7a5a35';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      const yy = b.y + (i / 8) * b.h;
      ctx.beginPath(); ctx.moveTo(b.x, yy); ctx.lineTo(b.x + b.w, yy); ctx.stroke();
    }
    ctx.fillStyle = '#8a6a45';
    ctx.fillRect(b.x - 4, b.y - 6, 6, b.h + 12);
    ctx.fillRect(b.x + b.w - 2, b.y - 6, 6, b.h + 12);
  }

  function drawFlower(x, y, isSpecial, t) {
    const bob = Math.sin(t * 2 + x) * 2;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.strokeStyle = '#5c8a52'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 0); ctx.stroke();
    const petalColor = isSpecial ? '#f4e04d' : ['#f2a5c1', '#f7d774', '#c88fe0', '#f2a5c1'][Math.floor(x) % 4];
    ctx.fillStyle = petalColor;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 4, Math.sin(a) * 4, 3.4, 2.2, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = isSpecial ? '#e8622f' : '#e0a83f';
    ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI * 2); ctx.fill();
    if (isSpecial) {
      ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.3;
      ctx.strokeStyle = '#fff9d6'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 9 + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawFlowerPatch() {
    const fp = WORLD.flowerPatch;
    for (const f of fp.flowers) {
      const isSpecial = f.x === fp.special.x && f.y === fp.special.y;
      drawFlower(f.x, f.y, isSpecial, Game.time);
    }
    if (!Game.flags.symbolFlor) {
      // partículas sutis flutuando perto da flor especial
      ctx.save();
      ctx.fillStyle = 'rgba(255,249,214,0.8)';
      for (let i = 0; i < 5; i++) {
        const a = Game.time * 1.3 + i * 1.3;
        const px = fp.special.x + Math.cos(a) * (10 + i * 2);
        const py = fp.special.y - 6 + Math.sin(a * 1.4) * (8 + i);
        ctx.beginPath(); ctx.arc(px, py, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawPawPrint(x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#5a4630';
    ctx.beginPath(); ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = -0.9 + i * 0.6;
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * 5, -5 + Math.sin(a) * 2, 1.6, 2, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawPawTrail() {
    for (const p of WORLD.pawTrail.prints) drawPawPrint(p.x, p.y, Game.time);
    if (!Game.flags.symbolPatas) {
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(Game.time * 3) * 0.3;
      ctx.fillStyle = '#fff9d6';
      ctx.beginPath();
      ctx.arc(WORLD.pawTrail.hiddenSpot.x, WORLD.pawTrail.hiddenSpot.y - 14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBush(b) {
    ctx.save();
    ctx.fillStyle = '#4f7f4a';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(b.x + Math.cos(a) * b.r * 0.4, b.y + Math.sin(a) * b.r * 0.3, b.r * 0.5, b.r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5c8a52';
    ctx.beginPath(); ctx.ellipse(b.x, b.y - b.r * 0.15, b.r * 0.62, b.r * 0.46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawTree(t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    // tronco
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(-t.r * 0.22, -6, t.r * 0.44, 22);
    // copa (3 blobs sobrepostos, leve balanço)
    const sway = Math.sin(Game.time * 0.8 + t.x * 0.02) * 2;
    const green1 = t.tone > 0.5 ? '#4f7f4a' : '#5c8a52';
    const green2 = t.tone > 0.5 ? '#3f6b3a' : '#4a7443';
    ctx.fillStyle = green2;
    ctx.beginPath(); ctx.ellipse(sway, -t.canopy * 0.55, t.canopy * 0.7, t.canopy * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = green1;
    ctx.beginPath(); ctx.ellipse(-t.canopy * 0.35 + sway, -t.canopy * 0.9, t.canopy * 0.55, t.canopy * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(t.canopy * 0.4 + sway, -t.canopy * 0.85, t.canopy * 0.5, t.canopy * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawRock(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.fillStyle = '#9c93a8';
    ctx.beginPath(); ctx.ellipse(0, 0, r.r, r.r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(-r.r * 0.3, -r.r * 0.25, r.r * 0.3, r.r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawBigTree() {
    const bt = WORLD.bigTree;
    ctx.save();
    ctx.translate(bt.x, bt.y);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(-bt.r * 0.3, -10, bt.r * 0.6, 60);
    const sway = Math.sin(Game.time * 0.6) * 3;
    ctx.fillStyle = '#3f6b3a';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * bt.r * 0.7 + sway, -bt.r * 1.1 + Math.sin(a) * bt.r * 0.4, bt.r * 0.9, bt.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#4f7f4a';
    ctx.beginPath(); ctx.ellipse(sway, -bt.r * 1.3, bt.r * 1.15, bt.r * 0.85, 0, 0, Math.PI * 2); ctx.fill();

    if (Game.flags.mapReacted && !Game.flags.metMacaquildo) {
      ctx.globalAlpha = 0.55 + Math.sin(Game.time * 2.4) * 0.25;
      ctx.fillStyle = '#fff9d6';
      ctx.beginPath(); ctx.arc(0, -bt.r * 1.5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawMagicTrail() {
    if (!Game.flags.mapReacted || Game.flags.metMacaquildo) return;
    const pts = WORLD.pathPoints.slice(6); // trecho final até a árvore
    ctx.save();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const twinkle = 0.4 + 0.4 * Math.sin(Game.time * 2 + i);
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#fff9d6';
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawCritters() {
    ctx.save();
    for (const c of WORLD.critters) {
      const t = Game.time;
      if (c.type === 'bird') {
        const x = c.x + Math.sin(t * 0.6 + c.x) * 30;
        const y = c.y + Math.sin(t * 1.4 + c.x) * 6 - 30;
        ctx.strokeStyle = '#3d2f22'; ctx.lineWidth = 1.6;
        const wing = Math.sin(t * 8) * 4;
        ctx.beginPath(); ctx.moveTo(x - 6, y - wing); ctx.lineTo(x, y); ctx.lineTo(x + 6, y - wing); ctx.stroke();
      } else {
        const x = c.x + Math.sin(t * 1.1 + c.x) * 18;
        const y = c.y + Math.cos(t * 1.7 + c.x) * 12;
        ctx.fillStyle = '#f2a5c1';
        ctx.beginPath(); ctx.ellipse(x - 3, y, 3, 4, Math.sin(t * 6) * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 3, y, 3, 4, -Math.sin(t * 6) * 0.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawMarkers() {
    for (const it of getInteractables()) {
      if (it.onlyActive && !it.onlyActive()) continue;
      const m = typeof it.marker === 'function' ? it.marker() : it.marker;
      if (!m) continue;
      const bob = Math.sin(Game.time * 3 + it.x) * 3;
      ctx.save();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.85;
      ctx.fillText(m, it.x, it.y - 46 + bob);
      ctx.restore();
    }
  }

  function drawEntities() {
    const t = Game.time;
    const entries = [];
    for (const tr of WORLD.trees) entries.push({ y: tr.y, draw: () => drawTree(tr) });
    for (const r of WORLD.rocks) entries.push({ y: r.y, draw: () => drawRock(r) });
    for (const b of WORLD.pawTrail.bushes) entries.push({ y: b.y, draw: () => drawBush(b) });

    if (!(Game.state === 'cutscene' && Game.cutscene.macaquildoStage !== 'hidden')) {
      entries.push({ y: WORLD.npcSpawns.wagner.y, draw: () => drawCharacter(ctx, 'wagner', WORLD.npcSpawns.wagner.x, WORLD.npcSpawns.wagner.y, { scale: 1 }) });
      entries.push({ y: WORLD.npcSpawns.lia.y, draw: () => drawCharacter(ctx, 'lia', WORLD.npcSpawns.lia.x, WORLD.npcSpawns.lia.y, { scale: 1 }) });
      entries.push({ y: WORLD.npcSpawns.jasmim.y, draw: () => drawCharacter(ctx, 'jasmim', WORLD.npcSpawns.jasmim.x, WORLD.npcSpawns.jasmim.y, { scale: 1 }) });
    }
    entries.push({
      y: WORLD.npcSpawns.chatgpt.y,
      draw: () => drawChatGPTPlaceholder(ctx, WORLD.npcSpawns.chatgpt.x, WORLD.npcSpawns.chatgpt.y, { scale: 1, mood: 'feliz', bob: t * 2 })
    });
    entries.push({
      y: WORLD.npcSpawns.pedra.y,
      draw: () => drawPedraPlaceholder(ctx, WORLD.npcSpawns.pedra.x, WORLD.npcSpawns.pedra.y, { scale: 1 })
    });

    entries.push({
      y: Game.player.y,
      draw: () => drawCharacter(ctx, 'julia', Game.player.x, Game.player.y, {
        scale: 1, facing: Game.player.facing, walkPhase: Game.player.walking ? Game.player.walkPhase : 0
      })
    });

    if (Game.cutscene.macaquildoStage !== 'hidden') {
      const bt = WORLD.bigTree;
      entries.push({
        y: bt.y + 40,
        draw: () => drawMacaquildoPlaceholder(ctx, bt.x - 10, bt.y + 10, {
          scale: 1.3, stage: Game.cutscene.macaquildoStage, tailPhase: t * 1.4, wingPhase: t * 2.2
        })
      });
    }

    entries.sort((a, b) => a.y - b.y);
    for (const e of entries) e.draw();
  }

  function render() {
    const vw = canvas.clientWidth, vh = canvas.clientHeight;
    ctx.clearRect(0, 0, vw, vh);
    ctx.save();
    ctx.translate(-Game.camera.x, -Game.camera.y);

    drawBackground();
    drawPath();
    drawMagicTrail();
    drawRiver();
    drawBridge();
    drawStarSpot();
    drawFlowerPatch();
    drawPawTrail();
    drawBigTree();
    drawEntities();
    drawCritters();
    drawMarkers();

    ctx.restore();
  }

  /* ---------------- loop principal ---------------- */
  function loop(now) {
    const dt = Math.min(0.05, (now - Game.lastTime) / 1000 || 0);
    Game.lastTime = now;
    Game.time += dt;

    if (Game.state === 'playing') {
      updatePlayer(dt);
    }
    updateCamera();

    if (screens.game.classList.contains('active')) render();

    // prompt de interação
    if (Game.state === 'playing') {
      const target = nearestInteractable();
      hud.interactPrompt.hidden = !target;
    } else {
      hud.interactPrompt.hidden = true;
    }

    // efeito de digitação do diálogo
    if (Game.state === 'dialogue' && Game.dialogue.typing) {
      const d = Game.dialogue;
      d.timer += dt;
      const chars = Math.floor(d.timer * d.speedCharsPerSec);
      if (chars >= d.fullText.length) {
        dlg.text.textContent = d.fullText;
        d.typing = false;
      } else {
        dlg.text.textContent = d.fullText.slice(0, chars);
      }
    }

    requestAnimationFrame(loop);
  }

  /* ---------------- telas / menu ---------------- */
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    checkOrientation();
  }

  function newGame() {
    SaveSystem.clear();
    Game.flags = SaveSystem.defaultData().flags;
    Game.inventory = [];
    Game.player.x = WORLD.spawn.x;
    Game.player.y = WORLD.spawn.y;
    startPlaying();
    setTimeout(() => talkChatGPT(), 500);
  }

  function continueGame() {
    const data = SaveSystem.load();
    Game.flags = data.flags;
    Game.inventory = data.inventory || [];
    Game.player.x = data.playerPos.x;
    Game.player.y = data.playerPos.y;
    if (Collision.blocked(Game.player.x, Game.player.y, PLAYER_RADIUS)) {
      Game.player.x = WORLD.spawn.x; Game.player.y = WORLD.spawn.y;
    }
    startPlaying();
  }

  function startPlaying() {
    showScreen('game');
    Game.state = 'playing';
    resizeCanvas();
    updateQuestBanner();
    document.querySelectorAll('.symbol-slot').forEach(s => s.classList.remove('found'));
    if (Game.flags.symbolEstrela) markSymbolSlot('estrela');
    if (Game.flags.symbolFlor) markSymbolSlot('flor');
    if (Game.flags.symbolPatas) markSymbolSlot('patas');
    if (Game.flags.metMacaquildo) Game.cutscene.macaquildoStage = 'full';
  }

  function showChapterEnd() {
    Game.state = 'chapterend';
    el('end-text').textContent = 'Júlia descobriu um mapa secreto, encontrou os três símbolos escondidos perto do rio ' +
      'e conheceu Macaquildo — guardião alado e um pouco misterioso. Mas o mapa era só uma pequena parte de algo bem maior...';
    overlays.end.hidden = false;
  }

  /* ---------------- overlays ---------------- */
  function openMap() {
    if (!Game.flags.hasMap) { showToast('Você ainda não tem nenhum mapa para consultar.'); return; }
    Game.stateBeforeOverlay = Game.state === 'mapoverlay' ? Game.stateBeforeOverlay : Game.state;
    Game.state = 'mapoverlay';
    let hint = 'Explore o vale perto do rio para encontrar cada símbolo.';
    const f = Game.flags;
    if (f.symbolEstrela && f.symbolFlor && f.symbolPatas) {
      hint = f.mapReacted ? 'Siga a trilha brilhante até a árvore grande.' : 'Os três símbolos brilham juntos... alguma coisa vai acontecer!';
    } else {
      const missing = [];
      if (!f.symbolEstrela) missing.push('o brilho de uma estrela refletida na água');
      if (!f.symbolFlor) missing.push('uma flor diferente das outras');
      if (!f.symbolPatas) missing.push('pegadas que levam a um esconderijo');
      hint = 'Ainda falta encontrar: ' + missing.join('; ') + '.';
    }
    el('map-hint').textContent = hint;
    overlays.map.hidden = false;
  }
  function closeMap() {
    overlays.map.hidden = true;
    Game.state = Game.stateBeforeOverlay;
  }

  function openPause() {
    if (Game.state === 'menu' || Game.state === 'howto' || Game.state === 'paused' || Game.state === 'chapterend') return;
    Game.stateBeforeOverlay = Game.state;
    Game.state = 'paused';
    overlays.pause.hidden = false;
  }
  function closePause() {
    overlays.pause.hidden = true;
    Game.state = Game.stateBeforeOverlay;
  }

  /* ---------------- input: teclado ---------------- */
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    Game.keys.add(k);
    if (k === ' ' || k === 'e') tryInteract();
    if (k === 'escape') {
      if (Game.state === 'paused') closePause();
      else if (Game.state === 'mapoverlay') closeMap();
      else openPause();
    }
  });
  window.addEventListener('keyup', e => Game.keys.delete(e.key.toLowerCase()));

  /* ---------------- input: toque ---------------- */
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouchDevice) document.body.classList.add('touch-mode');

  const joyZone = el('joystick-zone'), joyBase = el('joystick-base'), joyStick = el('joystick-stick');
  let joyActive = false, joyId = null, joyOrigin = { x: 0, y: 0 };
  const JOY_RADIUS = 55;

  joyZone.addEventListener('touchstart', e => {
    if (joyActive) return;
    const touch = e.changedTouches[0];
    joyActive = true; joyId = touch.identifier;
    joyOrigin = { x: touch.clientX, y: touch.clientY };
    joyBase.style.left = (touch.clientX - joyZone.getBoundingClientRect().left - 55) + 'px';
    joyBase.style.top = (touch.clientY - joyZone.getBoundingClientRect().top - 55) + 'px';
    joyBase.style.display = 'block';
    AudioManager.unlockOnFirstInput();
    e.preventDefault();
  }, { passive: false });

  joyZone.addEventListener('touchmove', e => {
    for (const touch of e.changedTouches) {
      if (touch.identifier !== joyId) continue;
      let dx = touch.clientX - joyOrigin.x, dy = touch.clientY - joyOrigin.y;
      const len = Math.hypot(dx, dy);
      if (len > JOY_RADIUS) { dx = dx / len * JOY_RADIUS; dy = dy / len * JOY_RADIUS; }
      joyStick.style.left = (31 + dx) + 'px';
      joyStick.style.top = (31 + dy) + 'px';
      Game.touchVector.x = dx / JOY_RADIUS;
      Game.touchVector.y = dy / JOY_RADIUS;
    }
    e.preventDefault();
  }, { passive: false });

  function endJoystick(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier !== joyId) continue;
      joyActive = false; joyId = null;
      joyBase.style.display = 'none';
      joyStick.style.left = '31px'; joyStick.style.top = '31px';
      Game.touchVector.x = 0; Game.touchVector.y = 0;
    }
  }
  joyZone.addEventListener('touchend', endJoystick);
  joyZone.addEventListener('touchcancel', endJoystick);

  el('btn-interact-touch').addEventListener('touchstart', e => {
    e.preventDefault();
    AudioManager.unlockOnFirstInput();
    tryInteract();
  }, { passive: false });

  /* diálogo: tocar/clicar avança */
  dlg.box.addEventListener('click', () => { if (Game.state === 'dialogue') advanceDialogue(); });

  /* ---------------- botões de UI ---------------- */
  el('btn-play').addEventListener('click', () => { AudioManager.unlockOnFirstInput(); newGame(); });
  el('btn-continue').addEventListener('click', () => { AudioManager.unlockOnFirstInput(); continueGame(); });
  el('btn-howto').addEventListener('click', () => showScreen('howto'));
  el('btn-howto-back').addEventListener('click', () => showScreen('menu'));

  hud.pause.addEventListener('click', openPause);
  hud.map.addEventListener('click', openMap);
  el('btn-map-close').addEventListener('click', closeMap);

  el('btn-resume').addEventListener('click', closePause);
  el('btn-save').addEventListener('click', () => { fullSave(); showToast('Jogo salvo! 💾'); });
  el('btn-howto-2').addEventListener('click', () => showScreen('howto'));
  el('btn-exit').addEventListener('click', () => {
    fullSave();
    overlays.pause.hidden = true;
    Game.state = 'menu';
    showScreen('menu');
    refreshContinueButton();
  });
  el('btn-end-menu').addEventListener('click', () => {
    overlays.end.hidden = true;
    Game.state = 'menu';
    showScreen('menu');
    refreshContinueButton();
  });

  hud.fullscreen.addEventListener('click', () => {
    const container = el('game-container');
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) container.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  });

  function refreshContinueButton() {
    el('btn-continue').hidden = !SaveSystem.hasSave();
  }

  /* ---------------- orientação / resize ---------------- */
  function checkOrientation() {
    if (!document.body.classList.contains('touch-mode')) { hud.rotateHint.hidden = true; return; }
    const portrait = window.innerHeight > window.innerWidth;
    const inGame = screens.game.classList.contains('active');
    hud.rotateHint.hidden = !(portrait && inGame);
  }
  window.addEventListener('resize', () => { resizeCanvas(); checkOrientation(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { resizeCanvas(); checkOrientation(); }, 200));

  /* ---------------- inicialização ---------------- */
  function init() {
    refreshContinueButton();
    resizeCanvas();
    checkOrientation();
    Game.flags = SaveSystem.defaultData().flags;
    requestAnimationFrame(t => { Game.lastTime = t; requestAnimationFrame(loop); });
  }

  init();

  // exposto apenas para depuração/testes manuais no console do navegador.
  window.JuliaGame = Game;
})();
