/* ===================================================
   dialogues2.js — textos do Capítulo 2 (A Gruta Adormecida)
   Mesmo formato de dialogues.js: { speaker, text, mood?, visualStage? }
   =================================================== */

const DIALOGUES2 = {

  chapter2Intro: [
    { speaker: 'pedra', text: '...o mapa... aponta pra montanha agora...' },
    { speaker: 'julia', text: 'Uma gruta? Sério?' },
    { speaker: 'pedra', text: '...na escuridão... só encontra o caminho... quem primeiro encontrar a luz...' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Traduzindo do idioma das pedras: provavelmente vamos precisar de uma lanterna.' },
    { speaker: 'julia', text: 'Então vamos procurar uma antes de entrar aí.' }
  ],

  wagner2First: [
    { speaker: 'wagner', text: 'Uma gruta, hein. Eu fico por aqui fora — prefiro o sol.' },
    { speaker: 'wagner', text: 'Vai com cuidado. Qualquer coisa, acena bem grande.' }
  ],
  wagner2Repeat: [
    { speaker: 'wagner', text: 'Essa entrada da gruta parece bem escura mesmo.' }
  ],

  lia2First: [
    { speaker: 'lia', text: 'Reparei uns rastros estranhos vindo dessa direção. E uma sombra passou voando rapidinho.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Ótimo. Sombras voadoras. Exatamente o que eu queria ouvir hoje.' }
  ],
  lia2Repeat: [
    { speaker: 'lia', text: 'Fica esperta por aqui. Alguma coisa — ou alguém — anda observando.' }
  ],

  jasmim2First: [
    { speaker: 'jasmim', text: 'Olha essas florzinhas perto da gruta! Uma delas até brilha um pouquinho.' },
    { speaker: 'julia', text: 'Brilha? Vou dar uma olhada nisso.' }
  ],
  jasmim2Repeat: [
    { speaker: 'jasmim', text: 'Eu fico esperando vocês aqui fora, tá? Gruta escura não é muito comigo.' }
  ],

  pedra2Repeat: [
    { speaker: 'pedra', text: '...continue... a luz é a chave...' }
  ],

  // ---- Tigroso: primeiro encontro ----
  tigrosoEncounter: [
    { speaker: 'julia', text: 'Espera... o que é aquilo voando ali?' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Definição de "não é passarinho".' },
    { speaker: 'julia', text: 'Ei! Essa lanterna é nossa!' },
    { speaker: 'tigroso', text: 'Era.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Tecnicamente esse argumento não é muito convincente.' },
    { speaker: 'tigroso', text: 'Quer de volta? Vem pegar, humaninha.' },
    { speaker: 'julia', text: 'Ele nem fica parado direito!' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Talvez a gente precise de outra estratégia. Esse lugar tem flores, pedras e um cipó suspeitosamente convenientes...' }
  ],

  tigrosoHint1: [
    { speaker: 'chatgpt', mood: 'curioso', text: 'Dica: aquela flor brilhante ali parece chamar atenção. De quem, eu não sei ainda.' }
  ],
  tigrosoHint2: [
    { speaker: 'chatgpt', mood: 'curioso', text: 'Segunda dica: um barulho bem alto costuma fazer qualquer bicho voador mudar de lugar.' }
  ],
  tigrosoHint3: [
    { speaker: 'chatgpt', mood: 'curioso', text: 'Terceira dica: esse cipó parece só esperando alguém pra soltar de repente.' }
  ],

  tigrosoStepFlower: [
    { speaker: 'julia', text: 'A flor brilhou forte por um instante... e o Tigroso olhou pra cá!' }
  ],
  tigrosoStepNoise: [
    { speaker: 'julia', text: 'Esse barulho foi bem alto! Ele saiu voando de susto.' }
  ],
  tigrosoOutOfOrder: [
    { speaker: 'chatgpt', mood: 'curioso', text: 'Hmm, ainda não é a hora certa pra isso. Talvez começar por outra coisa ajude.' }
  ],

  tigrosoSolved: [
    { speaker: 'julia', text: 'Cipó! AGORA!' },
    { speaker: 'tigroso', text: 'AAAH! Isso não vale!' },
    { speaker: 'tigroso', text: 'Isso ainda não acabou!' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Excelente. Agora temos tecnologia de ponta: uma lâmpada com alça.' },
    { speaker: 'julia', text: 'Vamos usar direitinho, então.' }
  ],

  caveNoLight: [
    { speaker: 'julia', text: 'Eu não consigo enxergar nada!' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Então descobrimos uma importante propriedade das cavernas: elas são escuras.' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Vamos precisar de uma fonte de luz antes de continuar.' }
  ],

  caveEnterWithLight: [
    { speaker: 'chatgpt', mood: 'curioso', text: 'Luz acesa, coragem em dia. Vamos com calma — e de olho em qualquer coisa que se mexa.' }
  ],

  caveEnd: [
    { speaker: 'julia', text: 'Essas pegadas são de quê?' },
    { speaker: 'macaquildo', text: '...eu preferia... não descobrir...' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Considerando nosso histórico recente, provavelmente vamos descobrir.' }
  ],

  chapter2EndNarration: [
    { speaker: 'chatgpt', mood: 'feliz', text: 'E assim, com uma lanterna conquistada e uma aranha gigante evitada por pouco, Júlia atravessou a Gruta Adormecida inteira.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Só que aquela sombra lá longe... com certeza não terminou de aparecer.' }
  ]
};
