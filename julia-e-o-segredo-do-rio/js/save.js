/* ===================================================
   save.js — leitura/escrita de progresso em localStorage
   =================================================== */

const SaveSystem = (() => {
  const KEY = 'julia-rio-save-v1';

  function defaultData() {
    return {
      chapter: 1,
      zone: 'outdoor',
      playerPos: { x: 300, y: 860 },
      flags: {
        introDone: false,
        metWagner: false,
        metLia: false,
        metJasmim: false,
        metPedraFirst: false,
        hasMap: false,
        symbolEstrela: false,
        symbolFlor: false,
        symbolPatas: false,
        mapReacted: false,
        metMacaquildo: false,
        chapterComplete: false,

        // ---- Capítulo 2: A Gruta Adormecida ----
        chapter2Started: false,
        chapter2IntroDone: false,
        metWagner2: false,
        metLia2: false,
        metJasmim2: false,
        tigrosoMet: false,
        tigrosoPuzzleSolved: false,
        hasFlashlight: false,
        caveEntered: false,
        caveCompleted: false,
        chapter2Complete: false
      },
      inventory: []
    };
  }

  function hasSave() {
    try {
      return localStorage.getItem(KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      // mescla com default para suportar novos campos em versões futuras
      const base = defaultData();
      return {
        ...base,
        ...parsed,
        flags: { ...base.flags, ...(parsed.flags || {}) },
        playerPos: { ...base.playerPos, ...(parsed.playerPos || {}) }
      };
    } catch (e) {
      console.warn('[SaveSystem] falha ao carregar save, usando novo jogo.', e);
      return defaultData();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[SaveSystem] falha ao salvar (localStorage indisponível).', e);
      return false;
    }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  return { hasSave, load, save, clear, defaultData };
})();
