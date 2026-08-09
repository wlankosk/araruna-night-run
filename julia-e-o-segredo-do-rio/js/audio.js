/* ===================================================
   audio.js — gerenciador de áudio tolerante a falhas.
   Se os arquivos em /assets/audio/ não existirem, o jogo
   continua funcionando normalmente, sem erros e sem som.
   =================================================== */

const AudioManager = (() => {
  // Aceita .wav (formato dos placeholders silenciosos incluídos no projeto)
  // ou .mp3 (se você substituir por trilhas reais nesse formato).
  const FILES = {
    music: 'assets/audio/ambiente.wav',
    river: 'assets/audio/rio.wav',
    birds: 'assets/audio/passaros.wav',
    wind: 'assets/audio/vento.wav',
    step: 'assets/audio/passo.wav',
    discover: 'assets/audio/descoberta.wav',
    interact: 'assets/audio/interagir.wav'
  };

  const sounds = {};
  let muted = false;
  let unlocked = false;

  function tryLoad(key, src) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.addEventListener('error', () => {
      sounds[key] = null; // marcado como indisponível, silenciosamente
    }, { once: true });
    audio.src = src;
    sounds[key] = audio;
  }

  function init() {
    Object.entries(FILES).forEach(([key, src]) => tryLoad(key, src));
  }

  function unlockOnFirstInput() {
    if (unlocked) return;
    unlocked = true;
    ['music', 'river', 'birds', 'wind'].forEach(key => playLoop(key, key === 'music' ? 0.35 : 0.18));
  }

  function playLoop(key, volume = 0.3) {
    const a = sounds[key];
    if (!a || muted) return;
    try {
      a.loop = true;
      a.volume = volume;
      const p = a.play();
      if (p && p.catch) p.catch(() => { /* autoplay bloqueado, ok */ });
    } catch (e) { /* ignore */ }
  }

  function playOnce(key, volume = 0.5) {
    const a = sounds[key];
    if (!a || muted) return;
    try {
      const clone = a.cloneNode();
      clone.volume = volume;
      const p = clone.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function setMuted(value) {
    muted = value;
    Object.values(sounds).forEach(a => { if (a) a.muted = muted; });
  }

  return { init, unlockOnFirstInput, playLoop, playOnce, setMuted };
})();

AudioManager.init();
