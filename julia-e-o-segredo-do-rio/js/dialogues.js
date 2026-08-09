/* ===================================================
   dialogues.js — todos os textos do Capítulo 1.
   Cada fala: { speaker, text, mood?, visualStage? }
   speaker: 'julia' | 'lia' | 'jasmim' | 'wagner' | 'chatgpt' | 'macaquildo' | 'pedra'
   =================================================== */

const SPEAKER_NAMES = {
  julia: 'Júlia', lia: 'Lia', jasmim: 'Jasmim', wagner: 'Wagner',
  chatgpt: 'ChatGPT', macaquildo: 'Macaquildo', pedra: 'Pedra'
};

const DIALOGUES = {

  // ---- introdução / tutorial de controles ----
  intro: [
    { speaker: 'chatgpt', mood: 'feliz', text: 'Oi, oi! Eu sou o ChatGPT — hoje eu vou narrar essa aventura. E olha, dessa vez eu nem inventei nada, foi tudo ideia da Júlia!' },
    { speaker: 'julia', text: 'Bom dia! Hoje o Wagner disse que a gente podia passear até o rio antes do almoço.' },
    { speaker: 'wagner', text: 'Vai com calma, mocinha. E fica de olho na Jasmim, tá?' },
    { speaker: 'julia', text: 'Pode deixar! Eu sempre cuido dela.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Enquanto ela caminha, uma dica rapidinha: no computador é WASD ou as setinhas para andar, e Espaço ou E para interagir. No celular, use o joystick e o botão de mão. Bora?' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Explore o vale, converse com todo mundo, e... preste atenção nos detalhes. Esse lugar guarda mais segredos do que parece.' }
  ],

  wagnerFirst: [
    { speaker: 'julia', text: 'Wagner, vamos até o rio!' },
    { speaker: 'wagner', text: 'Vão com cuidado perto da água. Eu fico por aqui de olho em vocês.' },
    { speaker: 'wagner', text: 'Se acontecer alguma coisa, é só acenar bem grande que eu vejo. Fico mais de olho do que de ouvido, você sabe.' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Wagner sempre repara em cada detalhezinho ao redor. Parece até que ele enxerga o dobro, ó.' }
  ],
  wagnerRepeat: [
    { speaker: 'wagner', text: 'Achou alguma coisa interessante por aí? Pelo seu olhar, parece que sim.' },
    { speaker: 'wagner', text: 'Gosto desse vale. É tranquilo... e tem um quê de mistério, também.' }
  ],

  liaFirst: [
    { speaker: 'lia', text: 'Oi, Júlia! Que dia bonito para explorar, né?' },
    { speaker: 'julia', text: 'Muito! Vamos ver o que a gente encontra por aí.' },
    { speaker: 'lia', text: 'Eu adoro esse lugar. Os passarinhos, as flores, o barulhinho do rio... Se você prestar bem atenção, a natureza sempre entrega umas pistas.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Anota aí: a Lia reparou coisas que a gente nem tinha visto ainda. Vale a pena voltar para conversar com ela de vez em quando.' }
  ],
  liaRepeat_noMap: [
    { speaker: 'lia', text: 'Ainda não vi nada estranho por aqui... mas esse lugar tem cara de esconder coisas.' }
  ],
  liaRepeat_hasMap: [
    { speaker: 'lia', text: 'Um mapa? Que emocionante! Estrela, flor e patas... isso parece um convite para explorar cada cantinho.' },
    { speaker: 'lia', text: 'Dica de quem observa a natureza: nem toda flor é igual às outras. E reflexos na água têm hora certa para brilhar.' }
  ],
  liaRepeat_allFound: [
    { speaker: 'lia', text: 'Uau, você encontrou os três! Sabia que tinha algo especial escondido por aqui.' }
  ],

  jasmimFirst: [
    { speaker: 'jasmim', text: 'Júlia! Olha quantas flores! Posso ficar aqui pertinho olhando elas o dia inteiro.' },
    { speaker: 'julia', text: 'Pode sim, Jas. Só não vai muito longe sozinha, tá bom?' },
    { speaker: 'jasmim', text: 'Prometo! Vou inventar um nome novo pra cada flor que eu ver.' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'A Jasmim tem esse dom: transforma qualquer passeio em uma aventura enorme cheia de imaginação.' }
  ],
  jasmimRepeat: [
    { speaker: 'jasmim', text: 'Já inventei sete nomes de flor. O meu favorito até agora é "Flor-que-brilha-de-manhã".' },
    { speaker: 'jasmim', text: 'Se você achar uma flor diferente das outras, me conta! Eu quero saber tudo.' }
  ],

  // ---- Pedra ----
  pedraFirst: [
    { speaker: 'julia', text: 'Que pedra bonita... lisa desse jeito. Quase parece polida de propósito.' },
    { speaker: 'pedra', text: '...oi...' },
    { speaker: 'julia', text: 'Você falou?' },
    { speaker: 'pedra', text: '...falei...' },
    { speaker: 'julia', text: 'VOCÊ É UMA PEDRA!' },
    { speaker: 'pedra', text: '...eu sei...' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Tecnicamente, Ju, ela apresentou um argumento irrefutável.' },
    { speaker: 'julia', text: 'Tá bom, tá bom. Quem é você? O que faz aqui?' },
    { speaker: 'pedra', text: '...só fico... observando...' },
    { speaker: 'pedra', text: '...tem uma coisa... embaixo de mim...' },
    { speaker: 'julia', text: 'Embaixo de você? Posso dar uma olhada?' },
    { speaker: 'pedra', text: '...pode...' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Ju, acho que é hora de examinar embaixo dela de novo. Fala com ela outra vez, bem de perto.' }
  ],
  pedraReveal: [
    { speaker: 'julia', text: 'Deixa eu ver o que tem aqui embaixo...' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Isso é... um mapa?! Ju, olha só o que estava escondido!' },
    { speaker: 'julia', text: 'Tem três símbolos desenhados aqui: uma estrela, uma flor e umas patinhas.' },
    { speaker: 'pedra', text: '...achei... bonito... guardar...' },
    { speaker: 'julia', text: 'Obrigada por guardar isso, Pedra. Vou descobrir o que esses símbolos significam!' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'O mapa foi para o seu inventário. Explore o vale e encontre os três lugares marcados.' }
  ],
  pedraRepeat: [
    { speaker: 'pedra', text: '...oi de novo...' },
    { speaker: 'pedra', text: '...continue... procurando...' }
  ],

  // ---- Flor ----
  flowerSpecialFound: [
    { speaker: 'julia', text: 'Espera... essa flor aqui é diferente das outras. As pétalas brilham de um jeito estranho.' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Boa observação! Essa é ela — o símbolo da Flor acabou de aparecer no seu mapa.' },
    { speaker: 'julia', text: 'O mapa está reagindo!' }
  ],
  flowerCommon: [
    { speaker: 'julia', text: 'Uma flor bonita, mas parece igualzinha às outras.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Continue olhando com atenção. Alguma ali deve destoar das demais.' }
  ],

  // ---- Patas ----
  pawFound: [
    { speaker: 'julia', text: 'Essas pegadas seguem em fila... alguma coisa pequena passou por aqui e se escondeu.' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Achou o esconderijo! O símbolo das Patas apareceu no mapa.' },
    { speaker: 'julia', text: 'Quem será que deixou esse rastro...' }
  ],

  // ---- Estrela ----
  starTooSoon: [
    { speaker: 'chatgpt', mood: 'curioso', text: 'Quase! O reflexo ainda não está no ponto certo. Espera brilhar de novo e tenta interagir na hora certa.' }
  ],
  starFound: [
    { speaker: 'julia', text: 'Agora! O reflexo do sol na água ficou brilhante feito uma estrela de verdade!' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Perfeito! Símbolo da Estrela encontrado. Faltava só esse.' }
  ],

  // ---- mapa reage após os 3 símbolos ----
  mapReacted: [
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Ju... os três símbolos estão brilhando ao mesmo tempo! Olha o mapa!' },
    { speaker: 'julia', text: 'Uma trilha de luz está aparecendo... vai na direção daquela árvore enorme.' },
    { speaker: 'lia', text: 'Aquela árvore sempre me deu um arrepio bom, tipo "tem uma história aí". Vamos ver?' },
    { speaker: 'julia', text: 'Vamos.' }
  ],

  // ---- Macaquildo — cena de revelação ----
  macaquildoCutscene: [
    { speaker: 'julia', text: 'Essa árvore é enorme... nunca tinha reparado o quanto.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Ju... aquela sombra ali no galho está se mexendo meio devagar demais para ser só vento.', visualStage: 'tail' },
    { speaker: 'julia', text: 'Isso é... uma cauda? Parece uma cobra enorme enrolada no tronco!' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Ou eu estou ficando maluco, ou tem alguma coisa nos observando bem ali de cima.', visualStage: 'eyes' },
    { speaker: 'julia', text: 'Tem... tem dois olhos roxos brilhando entre as folhas!' },
    { speaker: 'lia', text: 'Fica calma, Ju. Vamos com cuidado.' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Preparados... porque isso não é sombra nenhuma.', visualStage: 'full' },
    { speaker: 'macaquildo', text: '...então... você encontrou o mapa...' },
    { speaker: 'julia', text: 'V-você fala! O que é você? Uma cobra? Um macaco? Você TEM ASAS?!' },
    { speaker: 'macaquildo', text: '...calma... pequena... eu não mordo... quase nunca...' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Definitivamente não é uma ameaça iminente. Só... uma criatura com um senso de humor duvidoso.' },
    { speaker: 'macaquildo', text: '...meu nome é Macaquildo... guardo esse rio... faz muito tempo...' },
    { speaker: 'julia', text: 'Quanto tempo, exatamente?' },
    { speaker: 'macaquildo', text: '...isso... é segredo...' },
    { speaker: 'macaquildo', text: '...vocês acharam a estrela... a flor... e as patas... bem feito...' },
    { speaker: 'macaquildo', text: '...mas esse mapa... é só um pedacinho... de algo bem maior...' },
    { speaker: 'julia', text: 'Maior como assim?' },
    { speaker: 'macaquildo', text: '...isso...' },
    { speaker: 'chatgpt', mood: 'surpreso', text: 'Espera, esse símbolo aí na sua pata... eu nunca vi um parecido antes!' },
    { speaker: 'julia', text: 'O que é isso, Macaquildo?' },
    { speaker: 'macaquildo', text: '...isso, pequena... é uma história... para o próximo passeio...' },
    { speaker: 'lia', text: 'Ele com certeza sabe deixar a gente curiosa.' }
  ],

  chatgptIdle: [
    { speaker: 'chatgpt', mood: 'feliz', text: 'Pssst. Repara nas coisas pequenas do cenário. É aí que mora a diversão.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Sabia que eu sou o narrador dessa história? Prometo não estragar as surpresas... muito.' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Se travar em algo, volta e conversa com a Lia. Ela sempre repara em algo que a gente não vê.' }
  ],

  macaquildoRepeat: [
    { speaker: 'macaquildo', text: '...aquele símbolo... ainda é segredo... por enquanto...' },
    { speaker: 'macaquildo', text: '...volte outro dia, pequena... o rio guarda mais histórias...' }
  ],

  chapterEndNarration: [
    { speaker: 'chatgpt', mood: 'feliz', text: 'E foi assim que aquilo que deveria ser apenas um passeio perto do rio virou uma coisa consideravelmente mais complicada.' },
    { speaker: 'chatgpt', mood: 'curioso', text: 'Um mapa embaixo de uma pedra falante, três símbolos escondidos, e agora um guardião alado com uma cauda de cobra e um segredo maior guardado na pata.' },
    { speaker: 'chatgpt', mood: 'feliz', text: 'Mas isso, Ju... é uma história para o próximo capítulo.' }
  ]
};
