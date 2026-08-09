# Júlia e o Segredo do Rio

Um jogo 2D leve, feito em HTML5 + CSS3 + JavaScript puro (sem frameworks, sem
build, sem dependências), baseado no universo e nos personagens criados pela
Júlia.

- **Capítulo 1 — O Mapa Sob a Pedra**: Júlia explora o vale, conhece Wagner,
  Lia, Jasmim, ChatGPT (narrador) e uma pedra falante, encontra um mapa
  escondido, coleta três símbolos e conhece Macaquildo.
- **Capítulo 2 — A Gruta Adormecida**: Júlia enfrenta o vilão Tigroso num
  quebra-cabeça de distração para conseguir uma lanterna, e atravessa uma
  gruta escura furtivamente para não acordar uma aranha gigante.

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
│   │                      placeholders (e carregamento de PNGs reais)
│   ├── world.js           # mapa do Capítulo 1 + Collision (genérica, reusada
│   │                      pelo Capítulo 2) + gerador de cenário decorativo
│   ├── world2.js           # mapas do Capítulo 2: WORLD2 (área externa, com o
│   │                        desafio do Tigroso) e CAVE (interior da gruta)
│   ├── dialogues.js       # falas do Capítulo 1
│   ├── dialogues2.js       # falas do Capítulo 2
│   └── game.js            # motor do jogo: loop, input, câmera, estados,
│                            interações, salvamento, cutscenes — os dois
│                            capítulos compartilham o mesmo motor
└── assets/
    ├── characters/        # PNGs dos personagens (ver abaixo)
    ├── scenery/            # fundos ilustrados (gruta) — ver seção da gruta abaixo
    └── audio/              # sons opcionais (placeholders silenciosos incluídos)
```

Não há build step. Os arquivos `.js` são carregados diretamente pelo
`index.html`, na ordem: `save.js` → `audio.js` → `characters.js` →
`world.js` → `world2.js` → `dialogues.js` → `dialogues2.js` → `game.js`.

### Como o motor foi generalizado para dois capítulos

`Game.world` aponta para o mapa ativo (`WORLD`, `WORLD2` ou `CAVE`) e
`Collision.blocked(x, y, raio, world)` recebe esse mapa como parâmetro — por
isso o mesmo código de colisão, câmera e loop principal funciona nos três
mapas sem duplicação. O que muda por capítulo são as funções de desenho
(`renderChapter1`/`renderOutdoor2`/`renderCave`) e a lista de interações
(`getInteractablesChapter1`/`Outdoor2`/`Cave`), que ficam isoladas e são
fáceis de estender para um Capítulo 3.

## Onde substituir/adicionar as artes dos personagens

A pasta `assets/characters/` já contém as artes reais fornecidas para os
personagens principais, mais placeholders (PNG 1×1 transparente) só para os
estágios que ainda não têm arte dedicada. Para trocar qualquer uma, é só
**substituir o arquivo pelo mesmo nome**:

| Personagem | Sprite no cenário | Retrato no diálogo | Status |
|---|---|---|---|
| Júlia | `julia.png` | `julia_portrait.png` | ✅ arte real |
| Lia | `lia.png` | `lia_portrait.png` | ✅ arte real |
| Jasmim | `jasmim.png` | `jasmim_portrait.png` | ✅ arte real |
| Wagner | `wagner.png` | `wagner_portrait.png` | ✅ arte real |
| ChatGPT | `chatgpt.png` | `chatgpt_portrait.png` | ✅ arte real |
| Pedra | `pedra.png` | `pedra_portrait.png` | ✅ arte real |
| Macaquildo (completo) | `macaquildo.png` | `macaquildo_portrait.png` | ✅ arte real |
| Macaquildo (só a cauda, cena de revelação) | `macaquildo_tail.png` | `macaquildo_tail_portrait.png`* | placeholder |
| Macaquildo (só os olhos, cena de revelação) | `macaquildo_eyes.png` | `macaquildo_eyes_portrait.png`* | placeholder |
| Tigroso | `tigroso.png` | `tigroso_portrait.png` | ✅ arte real |
| Aranha dormindo | `aranha-dormindo.png` | `aranha-dormindo_portrait.png`* | ✅ arte real |
| Aranha acordada/atacando | `aranha-acordada.png` | `aranha-acordada_portrait.png`* | ✅ arte real |
| Lanterna (ícone) | `lanterna.png` | `lanterna_portrait.png`* | placeholder |

\* esses `_portrait.png` não são usados por nenhuma tela hoje (só o retrato
`macaquildo_portrait.png`/`aranha-*.png` sem sufixo é exibido em diálogo);
existem apenas para manter o padrão de nomes caso um dia sejam necessários.

(Caminhos completos: `assets/characters/<nome>.png`, todos dentro de
`julia-e-o-segredo-do-rio/`.)

O jogo detecta automaticamente: se o PNG tiver mais que 1×1 pixel (ou seja,
se for uma arte de verdade), ele passa a ser usado no lugar do placeholder
desenhado em `characters.js`, **preservando a proporção original da
imagem** (o motor nunca estica/achata a arte — a altura é fixada e a
largura é calculada a partir do aspecto real do PNG). Não precisa mexer em
nenhum código — nenhuma característica dos personagens (roupas, cores,
comportamento) foi redesenhada silenciosamente.

## Como adicionar novos mapas / missões (Capítulo 3...)

1. **Novo layout de mundo:** crie um `js/world3.js` com um objeto no mesmo
   formato de `WORLD`/`WORLD2`/`CAVE` (veja `world2.js` como exemplo mais
   simples que `world.js`).
2. **Novos diálogos:** crie um `js/dialogues3.js` seguindo o formato
   `{ speaker, text, mood?, visualStage? }`. `playDialogue()` já procura a
   chave em `DIALOGUES` e depois em `DIALOGUES2` — some seu novo objeto a
   essa cadeia de busca (ou renomeie para reaproveitar).
3. **Novas interações:** siga o padrão de `getInteractablesOutdoor2()`/
   `getInteractablesCave()` em `game.js` — cada item é
   `{ id, x, y, r, marker, handler }`.
4. **Novas flags de progresso:** acrescente campos em
   `SaveSystem.defaultData().flags` (em `save.js`). O sistema de save faz
   merge com versões antigas, então saves existentes continuam funcionando
   sem migração manual.
5. **Transição de capítulo:** siga o padrão de `startChapter2()` em
   `game.js` (tela de transição com título/subtítulo, depois diálogo de
   abertura).

## Mecânica da gruta (Capítulo 2) — referência rápida

- **Lanterna:** tecla `L` no teclado, ou o botão 🔦 (só aparece dentro da
  gruta, posicionado para nunca sobrepor o joystick nem o botão de
  interação no celular).
- **Aranha:** estados `sleeping` → `waking` → `searching` → `attacking`,
  implementados em `updateSpider()` (`game.js`). Ela só começa a acordar se
  Júlia estiver dentro do raio de perigo (`CAVE.spider.dangerRadius`) **e**
  com a lanterna acesa. Reagir corretamente (apagar a luz e parar de andar)
  durante a janela de reação a manda de volta a dormir.
- **Checkpoint:** morrer para a aranha (`GAME OVER`) só devolve Júlia para
  a entrada da gruta — a lanterna e todo o resto do progresso são mantidos.
  O save também nunca grava a posição *dentro* da gruta: salvar/recarregar
  sempre retoma na área externa, na frente da entrada.
- **Ajuste de dificuldade:** os tempos-limite ficam em
  `WORLD2.CAVE.spider` (`sleepMin/sleepMax`, `reactionMin/reactionMax`,
  `searchDuration`, `dangerRadius`) — ajuste ali se quiser a gruta mais
  fácil ou mais difícil.
- **Fundo ilustrado:** `assets/scenery/cave-interior.jpg` é desenhado como
  um "parallax" (cobre a tela inteira e desliza mais devagar que a câmera),
  já que é uma única imagem panorâmica, não um ladrilho que se repete sem
  emenda. `assets/scenery/cave-mouth.png` é a arte da entrada da gruta,
  desenhada na posição de `WORLD2.caveMouth`. Se algum dia esses arquivos
  não existirem, o jogo cai de volta no cenário desenhado por código em
  `drawCaveBackground()`/`drawCaveMouthVisual()` — sem quebrar.

## Melhorias ideais para a próxima versão

- Arte dedicada para os estágios "só cauda"/"só olhos" do Macaquildo e para
  o ícone da lanterna (hoje usam o placeholder procedural).
- Adicionar música ambiente e efeitos sonoros reais em `assets/audio/`
  (o jogo já está preparado — é só substituir os `.wav` silenciosos, ou
  trocar as extensões para `.mp3` em `js/audio.js`).
- Tela de "personagens"/diário, usando os dados que já existem em
  `CHARACTERS` (`characters.js`) — hoje eles só existem como dados internos.
- Persistir o progresso parcial do quebra-cabeça do Tigroso (hoje, se você
  sair no meio, ao voltar precisa refazer os passos já certos — rápido,
  mas não é salvo passo a passo).
- Suporte a múltiplos slots de save (hoje é só um slot).
- Indicador de direção (seta) apontando para o próximo objetivo quando o
  jogador estiver muito longe, em mapas maiores.
- Tela de créditos e ficha dos personagens no menu.
- Localizar o texto (hoje é só em português) caso o projeto cresça.

## Canon dos personagens

Os dados de cada personagem (idade, nascimento, responsável, personalidade,
etc.) estão centralizados em `js/characters.js`, no objeto `CHARACTERS`, e
foram tirados diretamente das fichas e instruções da Júlia — nada foi
inventado. O nome do vilão do Capítulo 2 é **Tigroso** (nunca "Tigrinho").
Onde uma informação não estava especificada, o código deixou o valor
neutro/configurável em vez de estabelecer algo como definitivo.
