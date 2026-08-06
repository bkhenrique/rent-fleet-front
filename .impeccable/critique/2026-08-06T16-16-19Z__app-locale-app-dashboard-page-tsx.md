---
target: dashboard (app/[locale]/(app)/dashboard/page.tsx)
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-06T16-16-19Z
slug: app-locale-app-dashboard-page-tsx
---
Method: dual-agent (A: aace2c87a1db0b62d · B: a970de837f44b6079)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Sem skeleton de loading — antes do `Promise.all` resolver, os 6 cards mostram zeros reais, indistinguível de uma frota vazia. |
| 2 | Match System / Real World | 3 | Vocabulário correto (ITV, seguro, licenciamento) mas zero metáfora visual — nenhum ícone de veículo em `overview-cards.tsx` ou `alerts-list.tsx`. |
| 3 | User Control and Freedom | 2 | Sem filtro, ordenação ou "marcar como visto" nos alertas; os 6 cards não têm nenhuma interação além do `<details>` por veículo. |
| 4 | Consistency and Standards | 2 | Três âmbares diferentes na mesma tela (`--accent #ffb020`, `amber-700/400` dos alertas, `#f59e0b` do mapa) com significados diferentes; links do nav não têm estado ativo. |
| 5 | Error Prevention | 2 | Superfície somente-leitura reduz o risco, mas o "flash de zero" no carregamento convida a leitura errada de "sem dados" como "sem alertas". |
| 6 | Recognition Rather Than Recall | 3 | Labels dos cards são curtos e legíveis; detalhe do alerta exige abrir `<details>` por veículo. |
| 7 | Flexibility and Efficiency | 1 | Os 6 cards são `<div>`s inertes — clicar em "Em manutenção" não leva a `/vehicles?status=manutencao`, embora esse filtro já exista. |
| 8 | Aesthetic and Minimalist Design | 2 | Minimalista, mas lê como *não desenhado* — nenhum ícone, nenhuma cor de status, nada que diferencie visualmente do resto do app. |
| 9 | Error Recovery | 1 | Uma mensagem genérica cobre 3 chamadas paralelas, sem retry; a busca de nomes de clientes nem tem `.catch`, falhando silenciosamente para o ID cru do Mongo na UI. |
| 10 | Help and Documentation | 1 | Zero tooltips; "ITV" aparece sem expansão em nenhum idioma. |
| **Total** | | **19/40** | **Poor — abaixo do aceitável (banda 12–19)** |

## Design Specificity Verdict

**LLM assessment**: Não é específico para gestão de frota — é um esqueleto de admin genérico com vocabulário de domínio por cima. Tire os textos em português dos 6 cards (`components/dashboard/overview-cards.tsx:32-38`) e troque por "Users/Active/Pending" e o componente é indistinguível de qualquer tutorial de dashboard: caixas idênticas com `rounded border border-black/10`, número grande, legenda cinza — sem ícone, sem cor, sem indicador de tendência. O mapa é o único elemento realmente específico do produto, mas nem ele tem legenda visível na tela (as cores só são explicadas dentro do popup de cada marcador).

O achado mais revelador: o projeto **já tem** um sistema de cores por status (`STATUS_COLORS` em `lib/vehicle-status.ts`, usado em `/vehicles`), e o dashboard — a tela cujo único trabalho é comunicar status à primeira vista — **ignora esse sistema por completo**, renderizando os cards de "Disponíveis/Alugados/Em manutenção" em preto e branco.

**Deterministic scan**: O detector automático (`detect.mjs`) rodou nos 5 arquivos-alvo e retornou `[]` (zero achados, exit 0) — mas essa é uma leitura fraca aqui: a maioria das regras do detector (contraste, tamanho de texto, espaçamento, hierarquia tipográfica) exige HTML renderizado ou CSS computado, algo que TSX bruto não fornece. Das ~9 regras que **conseguem** rodar em TSX puro (side-tab, gradient-text, paleta "AI-roxa", bounce-easing, imagem quebrada etc.), nenhuma encontrou ocorrência real — confirmado por grep manual dos mesmos padrões. Então `[]` significa "sem esses 9 problemas específicos", não "sem problemas de design".

A varredura manual (grep) complementar trouxe fatos objetivos e contáveis:
- **0 ícones** nos 3 componentes que mostram dados (`overview-cards`, `alerts-list`, `fleet-map`) — todo ícone do app está confinado ao `site-header.tsx`.
- **0 estados de loading** (`skeleton|isLoading|Suspense|animate-pulse` → 0 ocorrências) — confirma que o "flash de zero" do Heurística #1 é real, não hipotético.
- **0 utilitários de `focus`/`focus-visible`/`outline`** nos 5 arquivos — navegação por teclado depende 100% do estilo padrão do navegador, sem nenhum indicador de foco customizado.
- **1 único uso de `shadow-*`** em todo o conjunto (`shadow-lg` no menu mobile do header) — os cards do dashboard não têm nenhuma elevação, só borda 1px.
- **5 tokens de cor no total** em `app/globals.css` (`--background`, `--foreground`, `--accent`, `--accent-strong`, `--accent-foreground`) — **zero tokens semânticos de status** (sem `--success`/`--warning`/`--danger`), o que confirma que os vermelhos/âmbares/verdes usados na página são todos hardcoded, componente a componente, e não vêm de um sistema compartilhado.

**Visual overlays**: Nenhuma ferramenta de browser/screenshot está disponível nesta sessão, e a rota do dashboard exige login multi-tenant sem credenciais fornecidas — não há overlay visual disponível. As duas avaliações trabalharam a partir do código-fonte (JSX/classNames/CSS) e sinalizam essa limitação nos próprios achados; nenhuma descrição de pixel renderizado ou contraste medido deve ser tratada como observação direta.

## Overall Impression

O dashboard não está quebrado — está **inacabado**. A lógica por trás dele é sólida (ordenação por urgência, convenção de sinal para `diasRestantes`, dados corretos), mas a camada visual não foi levada ao mesmo nível de acabamento que o resto do produto: `/vehicles` já tem um sistema de cor por status que o dashboard simplesmente não usa. A maior oportunidade não é "adicionar mais design" — é conectar o dashboard ao sistema de cor que já existe no código e usar cor com intenção (bom/atenção/urgente) em vez de decoração.

## What's Working

1. **A lógica de urgência é bem pensada.** `mostUrgentAlert` e a ordenação por `diasRestantes` (`alerts-list.tsx:15-20,34-36`) já colocam o item mais crítico primeiro, com convenção de sinal documentada — a camada de dados para "o que precisa de atenção primeiro" está correta, só não é aproveitada visualmente.
2. **Vocabulário de alerta correto e bem localizado.** `seguro`/`itv`/`licenciamento`/`revisão` fazem sentido nos três idiomas (pt/en/es), e textos como "devolução em"/"Ver contrato" são linguagem operacional precisa, não placeholder genérico.
3. **O `<details>`/`<summary>` por veículo** (`alerts-list.tsx:64`) é o único ponto da página com progressive disclosure de verdade — nativo, acessível por teclado, sem modal customizado.

## Priority Issues

**[P0] Zero cor-por-status nos cards principais, apesar do sistema já existir no código**
- **Why it matters**: O trabalho número um de um dashboard de frota é deixar claro em menos de 1 segundo o que está saudável e o que precisa de atenção. Hoje todo número parece igualmente (ir)relevante — o usuário tem que ler todas as 6 legendas, toda vez, o que anula a função de um dashboard.
- **Fix**: Reaproveitar `STATUS_COLORS` (de `lib/vehicle-status.ts`, já usado em `/vehicles`) nos 4 cards de status de frota (disponível=verde, alugado=azul, manutenção=âmbar) e dar aos 2 cards de alerta um tratamento visual próprio (borda/ícone vermelho-âmbar) condicionado a `count > 0` — um dia sem alertas deve *parecer* diferente de um dia com pendências.
- **Suggested command**: `/impeccable colorize`

**[P1] Três âmbares diferentes na mesma tela sem relação entre si**
- **Why it matters**: `--accent #ffb020` (marca), `amber-700/400` (alerta "vence em N dias") e `#f59e0b` (posição manual no mapa) são três âmbares visualmente parecidos com três significados diferentes. Usuários reconhecem por matiz, não por tom exato — então "âmbar" será lido como "mesma categoria de atenção" em todo lugar onde aparecer, o que aqui é falso.
- **Fix**: Criar tokens semânticos em `app/globals.css` (`--color-warning`, `--color-danger`, `--color-success`, `--color-info`) e migrar o `ORIGIN_COLOR` do mapa, o `urgencyClassName` dos alertas e as novas cores dos cards para o mesmo conjunto de tokens — reservar `--accent` estritamente para marca/CTA, nunca para status.
- **Suggested command**: `/impeccable colorize`

**[P1] Sem estado de loading — primeira renderização mostra zeros enganosos**
- **Why it matters**: Confirmado por grep (0 ocorrências de `skeleton|isLoading|Suspense`): antes do fetch resolver, a página mostra "0 Veículos / 0 Alertas" de verdade — indistinguível de uma frota genuinamente vazia. É exatamente a ambiguidade que um dashboard de status nunca deveria introduzir, e afeta toda checagem rápida ("primeira coisa de manhã").
- **Fix**: Adicionar um estado `loading` (ou sentinela `vehicles === null`, já usado corretamente em `/vehicles` e `/customers`) e renderizar skeletons nos cards / spinner no mapa / estado "carregando…" na lista, em vez de zeros reais.
- **Suggested command**: `/impeccable harden`

**[P1] Nenhum indicador de foco visível em toda a superfície**
- **Why it matters**: Confirmado por grep (0 ocorrências de `focus:`/`focus-visible:`/`outline-` nos 5 arquivos) — navegação por teclado depende inteiramente do estilo padrão (e frequentemente inconsistente) do navegador. Para o persona Sam (usuário dependente de teclado/leitor de tela), isso é uma barreira objetiva, não uma questão de gosto.
- **Fix**: Adicionar `focus-visible:ring-2 focus-visible:ring-accent` (ou equivalente) nos links dos cards, itens de alerta e botões do header.
- **Suggested command**: `/impeccable audit`

**[P2] Cards inertes — sem link para a view filtrada correspondente**
- **Why it matters**: Nenhum dos 6 `<div>` de `overview-cards.tsx` é um `<Link>`, apesar de `/vehicles` já suportar filtro por `?status=` (`STATUS_FILTERS`). Ver "Em manutenção: 2" e não poder clicar para ver quais dois é o maior atrito do caminho de power user — força uma renavegação manual toda vez.
- **Fix**: Envolver cada card de status em `<Link href="/vehicles?status=X">`; ligar os 2 cards de alerta a âncoras/deep-links para a seção correspondente de `AlertsList`.
- **Suggested command**: `/impeccable layout`

**[P3] Lista de alertas mistura duas categorias sem separação visual**
- **Why it matters**: `alerts-list.tsx` concatena alertas de documentos de veículo e alertas de devolução de contrato num único `<ul>` sem cabeçalho separando as duas categorias — duas tarefas mentais diferentes forçadas numa varredura só, que piora conforme a lista cresce.
- **Fix**: Dividir em duas subseções rotuladas ("Documentos de veículos" / "Contratos vencendo"), cada uma com seu próprio contador.
- **Suggested command**: `/impeccable layout`

## Persona Red Flags

**Alex (Power User)**: Não consegue identificar em 2 segundos qual dos 6 cards é má notícia — precisa ler todas as legendas (quebra o caso de uso principal). Não consegue clicar num card para pular para o detalhe filtrado (P2) — cada vez que um relance vira "preciso agir nisso", custa uma renavegação manual extra. O header também não marca a rota ativa (`site-header.tsx:74-81` — classes idênticas independente do `pathname`), então nem a navegação confirma "sim, você está no dashboard".

**Sam (Acessibilidade)**: Toda a sinalização de urgência é só cor — `urgencyClassName` (vermelho vs âmbar) e os pontos do mapa (`ORIGIN_COLOR`) carregam significado só pelo matiz, sem ícone, forma ou redundância além do texto adjacente. No mapa especificamente, a cor do ponto é a *única* forma de distinguir posição verificada por rastreador de posição manual à primeira vista — um usuário com daltonismo precisa abrir o popup de cada marcador para descobrir. Confirmado por grep: 0 estilos de foco customizados em toda a superfície — navegação por teclado depende só do padrão do navegador.

## Minor Observations

- "Em manutenção" (pt, 14 caracteres) vs. "En mantenimiento" (es, 16 caracteres) no grid `grid-cols-2` mobile — vale checar quebra de linha em telas estreitas com o texto mais longo.
- A busca de nomes de clientes (`dashboard/page.tsx:49`) não tem `.catch` — se o `Promise.all` rejeitar, `customersById` fica vazio silenciosamente e a UI mostra o ID cru do Mongo em vez do nome do cliente, sem nenhum erro visível.
- O mapa não tem legenda visível na tela para `ORIGIN_COLOR` — o significado de verde vs. âmbar só aparece dentro do popup de cada marcador.
- `AlertsList` redeclara inline o formato de `vehiclesById` (linha 11) em vez de importar o tipo `Vehicle` — sinal de que essa fronteira de componente não foi totalmente assentada.

## Questions to Consider

- Se você cobrisse o cabeçalho e entregasse esse dashboard frio para um gestor de frota, ele saberia em 2 segundos se hoje precisa da atenção dele — ou teria que ler as seis legendas primeiro?
- Já existe um sistema de cor por status correto no código (`STATUS_COLORS`, usado em `/vehicles`) — por que a tela cujo trabalho é justamente comunicar status à primeira vista não o usa? Foi descuido ou decisão consciente?
- O mapa tem sua própria legenda de cor, os alertas têm a deles, e nenhuma concorda com a outra nem com o âmbar da marca. Se amanhã um novo elemento colorido for adicionado, alguém notaria o choque — ou já não sobra vocabulário visual compartilhado pra entrar em conflito?
