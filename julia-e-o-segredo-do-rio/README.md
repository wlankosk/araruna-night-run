# Júlia e o Segredo do Rio — Capítulo 1: O Mapa Sob a Pedra

Um jogo 2D leve, feito em HTML5 + CSS3 + JavaScript puro (sem frameworks, sem
build, sem dependências), baseado no universo e nos personagens criados pela
Júlia.

## Como executar

Não precisa instalar nada. Só precisa de um servidor estático simples porque
o jogo carrega arquivos `.js`/`.png`/`.wav` via `fetch`/`<img>`/`<audio>`, o
que os navegadores bloqueiam se você abrir o `index.html` direto do disco
(`file://`).

```bash
cd julia-e-o-segredo-do-rio
python3 -m http.server 8000
# depois abra http://localhost:8000 no navegador
```

Qualquer servidor estático funciona (ex.: `npx serve`, extensão "Live
Server" do VS Code, etc). Funciona em desktop e celular (toque), em modo
retrato e paisagem (recomenda-se paisagem no celular).

## Estrutura do projeto

```
julia-e-o-segredo-do-rio/
├── index.html            # telas (menu, como jogar, jogo, overlays) e HUD
├── css/style.css         # todo o estilo visual e responsividade
├── js/
│   ├── save.js           # leitura/escrita de progresso em localStorage
│   ├── audio.js          # gerenciador de áudio tolerante a arquivos ausentes
│   ├── characters.js     # dados "canônicos" dos personagens + desenho dos
│   │                      placeholders (e carregamento de PNGs reais, se existirem)
│   ├── world.js           # layout do mapa: rio, ponte, árvores, flores,
│   │                      pegadas, ponto da estrela, árvore grande, colisão
│   ├── dialogues.js       # todos os textos/falas do Capítulo 1
│   └── game.js            # motor do jogo: loop, input, câmera, estados,
│                            interações, salvamento, cutscenes
└── assets/
    ├── characters/        # PNGs dos personagens (ver abaixo)
    ├── scenery/            # reservado para cenário em PNG, se um dia quiser
    └── audio/              # sons opcionais (placeholders silenciosos incluídos)
```

Não há build step. Os arquivos `.js` são carregados diretamente pelo
`index.html`, na ordem: `save.js` → `audio.js` → `characters.js` →
`world.js` → `dialogues.js` → `game.js`.

## Onde substituir as artes dos personagens

A pasta `assets/characters/` já contém um PNG "placeholder" (1×1 transparente)
para cada personagem, para a estrutura ficar pronta desde já. Quando você
tiver a arte de verdade, é só **substituir o arquivo pelo mesmo nome**:

| Personagem | Sprite no cenário          | Retrato no diálogo                  |
|---|---|---|
| Júlia      | `assets/characters/julia.png`      | `assets/characters/julia_portrait.png` |
| Lia        | `assets/characters/lia.png`        | `assets/characters/lia_portrait.png` |
| Jasmim     | `assets/characters/jasmim.png`     | `assets/characters/jasmim_portrait.png` |
| Wagner     | `assets/characters/wagner.png`     | `assets/characters/wagner_portrait.png` |
| ChatGPT    | `assets/characters/chatgpt.png`    | `assets/characters/chatgpt_portrait.png` |
| Pedra      | `assets/characters/pedra.png`      | `assets/characters/pedra_portrait.png` |
| Macaquildo (completo) | `assets/characters/macaquildo.png` | `assets/characters/macaquildo_portrait.png` |
| Macaquildo (só a cauda, cena de revelação) | `assets/characters/macaquildo_tail.png` | — |
| Macaquildo (só os olhos, cena de revelação) | `assets/characters/macaquildo_eyes.png` | — |

O jogo detecta automaticamente: se o PNG tiver mais que 1×1 pixel (ou seja,
se for uma arte de verdade), ele passa a ser usado no lugar do placeholder
desenhado em `characters.js`. Não precisa mexer em nenhum código — nenhuma
característica dos personagens (roupas, cores, comportamento) foi
redesenhada silenciosamente; os placeholders só existem para o jogo ficar
"caprichado" enquanto a arte final não chega.

Recomendo sprites de corpo inteiro com fundo transparente,
aproximadamente 200×280px para o sprite do cenário e 300×340px para o
retrato do diálogo (a proporção é ajustada automaticamente, mas essas
dimensões dão o melhor resultado visual).

## Como adicionar novos mapas / missões (Capítulo 2, 3...)

O jogo foi propositalmente estruturado para isso:

1. **Novo layout de mundo:** duplique o padrão de `world.js` — pode criar um
   `js/world_capitulo2.js` com seu próprio `WORLD`, árvores, rio, pontos de
   interesse, etc.
2. **Novos diálogos:** adicione novas chaves em `dialogues.js` (ou um novo
   arquivo `dialogues_capitulo2.js`) seguindo o formato
   `{ speaker, text, mood?, visualStage? }`.
3. **Novas interações:** em `game.js`, a função `getInteractables()` monta a
   lista de tudo que pode ser examinado no mapa atual. Para uma nova missão,
   adicione novos itens a essa lista (ou troque a lista quando o capítulo
   mudar) e escreva o "handler" correspondente, do mesmo jeito que
   `interactFlower`, `interactPaw` e `interactStar` foram escritos.
4. **Novas flags de progresso:** acrescente campos em
   `SaveSystem.defaultData().flags` (em `save.js`) para guardar o progresso
   do novo capítulo. O sistema de save já faz merge com versões antigas, então
   saves antigos continuam funcionando.
5. **Transição de capítulo:** hoje `Game.flags.chapter` já existe no save;
   dá para usar esse número para decidir qual `WORLD`/`DIALOGUES` carregar
   ao iniciar o jogo.

A ideia é que cada capítulo seja "plugável": o motor (`game.js`) não tem
nada specific do Capítulo 1 embutido de forma difícil de mudar — os textos,
o mapa e as regras dos símbolos estão todos em arquivos de dados separados.

## Melhorias ideais para a versão 1.2

- Trocar os placeholders em `assets/characters/` pelas artes reais da Júlia.
- Adicionar música ambiente e efeitos sonoros reais em `assets/audio/`
  (o jogo já está preparado — é só substituir os `.wav` silenciosos, ou
  trocar as extensões para `.mp3` em `js/audio.js`).
- Tela de "personagens"/diário, usando os dados que já existem em
  `CHARACTERS` (`characters.js`) — hoje eles só existem como dados internos.
- Indicador de direção (seta) apontando para o próximo objetivo quando o
  jogador estiver muito longe, para mapas maiores.
- Suporte a múltiplos slots de save (hoje é só um slot).
- Pequenos minigames por trás dos símbolos (ex.: sequência de cliques no
  reflexo da estrela, ao invés de só acertar a janela de tempo).
- Efeitos sonoros de passos sincronizados com a animação de caminhada.
- Tela de créditos e ficha dos personagens no menu, usando as fichas
  originais da Júlia como referência visual.
- Localizar o texto (hoje é só em português) caso o projeto cresça.

## Canon dos personagens

Os dados de cada personagem (idade, nascimento, responsável, personalidade,
etc.) estão centralizados em `js/characters.js`, no objeto `CHARACTERS`, e
foram tirados diretamente das fichas e instruções da Júlia — nada foi
inventado. Onde uma informação não estava especificada, o código deixou o
valor neutro/configurável (por exemplo, cores de roupas dos placeholders)
em vez de estabelecer algo como definitivo.
