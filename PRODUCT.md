# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primário: equipe interna de uma locadora de veículos (gestor de frota, atendente, administrador do
tenant) usando o app no dia a dia para controlar disponibilidade da frota, documentação/manutenção
vencendo e localização dos carros. Uso operacional recorrente, não uma ferramenta de uso esporádico.

Secundário: Super Admin da plataforma (dono do RentFleet), que cadastra/aprova locadoras (tenants),
gerencia cobrança e vê métricas globais — tela própria em `/admin`, papel distinto do dia a dia da
locadora.

Fora do produto autenticado: o cliente final da locadora (quem aluga o carro) não tem login — é
apenas um registro vinculado a um contrato. Só existe uma superfície pública read-only pra ele: o
portfólio público (`/portfolio/[token]`), fora do escopo deste rebrand.

## Product Purpose

SaaS multi-tenant de gestão de frota para empresas de aluguel de carros (rent-a-car), de 1 a
centenas de veículos. Substitui planilhas/papel/sistemas genéricos que hoje causam: multa ou perda
de veículo por documentação vencida sem aviso, aluguéis sem controle real de devolução/atraso, e
falta de visibilidade de onde a frota está fisicamente. Sucesso = a locadora nunca é pega de
surpresa por um documento vencido e sempre sabe onde cada carro está.

## Positioning

Três coisas que uma planilha ou sistema genérico não fazem juntas: (1) rastreamento por GPS/tag
agnóstico de fornecedor — a locadora pode usar GPS veicular dedicado, celular velho deixado no
carro, ou tag Bluetooth tipo AirTag, sem depender de uma marca específica; quando não há posição em
tempo real, o sistema mostra a última posição conhecida em vez de fingir que é ao vivo; (2) alertas
automáticos antes de vencer seguro/ITV/licenciamento/manutenção, não depois; (3) ciclo de contrato
de aluguel com PDF gerado automaticamente a partir de um template, fotos de vistoria anexadas, e
alerta de devolução próxima/atrasada.

## Operating Context

- Multi-tenant com isolamento total de dados entre locadoras; papéis: `super_admin`,
  `tenant_admin`, `tenant_staff`.
- 3 mercados/locales confirmados: Brasil, Espanha, EUA (`pt`/`en`/`es`, país por tenant —
  `MAP_CENTER_BY_COUNTRY` em `lib/map-defaults.ts`).
- PWA responsivo (instalável, funciona bem no celular) construído em Next.js — sem loja de app por
  enquanto.
- Fluxo de contrato hoje é físico-assistido: sistema gera o PDF, a locadora imprime/assina com o
  cliente (ou assina em tela) e depois anexa foto do contrato assinado — não é assinatura eletrônica
  de verdade (isso é v2 documentado, fora de escopo agora).
- Rastreamento depende do dispositivo que a locadora já tem; a plataforma nunca deve fingir posição
  em tempo real quando só tem última posição conhecida.

## Capabilities and Constraints

- Ficha técnica de veículo: dados básicos, fotos múltiplas com data, documentação (seguro/ITV/
  licenciamento), manutenção preventiva com histórico, status (disponível/alugado/manutenção/
  inativo).
- Mapa em tempo real por veículo e mapa geral da frota (tela hoje redesenhada é essa: o dashboard).
- Cadastro de cliente final + contrato de aluguel (carro ↔ cliente ↔ período ↔ valor ↔ status).
- Geração automática de PDF de contrato a partir de template.
- Painel da locadora: visão geral (quantos disponíveis/alugados/manutenção), mapa da frota, alertas
  de documento vencendo e de devolução de contrato.
- Cobrança do Super Admin sobre os tenants existe como funcionalidade própria (fora do escopo do
  redesign da experiência do dia a dia da locadora, mas compartilha o mesmo shell autenticado).

## Brand Commitments

- Nome: **RentFleet**. Marca (`lib/brand-mark.ts`, `LogoMarkIcon`): silhueta de carro + pino de
  localização — o diferencial do produto é *saber onde cada carro está*, não só cadastrar frota.
  Vetor único reaproveitado em favicon/apple-icon/PWA-icon/OG-image/header — mudar a marca é editar
  um arquivo só.
- A landing pública (`app/[locale]/page.tsx` + `landing.css`) já tem uma identidade visual própria,
  deliberada e independente do resto do app, apelidada de "asfalto": tema escuro fixo (não segue
  `prefers-color-scheme`), acento âmbar (`#ffb020`/`#ffc24d`), Instrument Serif pra display, Inter
  pro corpo, JetBrains Mono pra dado/eyebrow, superfícies em camadas (`--surface`/`--surface-2`/
  `--surface-3`), textura de grade de fundo, sombra grande definida (`--shadow-lg`). Essa identidade
  nunca vazou pro app autenticado (dashboard/veículos/clientes/contratos/admin/login), que hoje usa
  um tema claro/escuro simples e genérico sem relação com a marca — é essa lacuna que motivou o
  pedido de rebrand.
- Cor âmbar (`#ffb020`) é o único elemento de marca confirmado como binding pelo usuário até agora
  (usado tanto na landing quanto no logo); não deve virar cor de status (isso já causava confusão
  visual antes do rebrand — ver tokens semânticos discutidos com o usuário).

## Evidence on Hand

- `IDEIA.md` — documento de produto já expandido cobrindo problema, hierarquia de usuários,
  funcionalidades (ficha de veículo, rastreamento, contratos, dashboard, cobrança do Super Admin).
- `landing.css` + `app/[locale]/page.tsx` — sistema visual "asfalto" já construído e aprovado pelo
  usuário ao longo de várias rodadas (`LANDING.md` documenta v1–v6), com fotos reais em
  `public/gallery/`.
- Nenhuma métrica de uso real, depoimento de cliente ou case documentado ainda — produto em
  desenvolvimento ativo, não deve inventar prova social.

## Product Principles

1. Nunca fingir dado em tempo real que não existe — última posição conhecida é mostrada como tal,
   com data/hora, nunca disfarçada de "ao vivo".
2. Superfície operacional (uso diário da equipe da locadora) prioriza escaneabilidade e sinal de
   status acima de expressão visual — mas isso não é desculpa pra parecer genérico: a marca deve
   viver em detalhes precisos, não em decoração.
3. Isolamento de dados entre tenants é absoluto — nenhuma decisão de UI pode implicar dado
   cross-tenant, mesmo visualmente (ex: nomes de exemplo, contadores agregados).
4. Alertas de vencimento (documento, manutenção, devolução) são o coração funcional do produto —
   qualquer redesign precisa deixá-los mais fáceis de notar e agir, nunca mais difíceis.
5. A identidade visual da landing pública já existe e já foi validada pelo usuário — o rebrand do
   app autenticado deve tratá-la como ponto de partida forte, não descartá-la em favor de uma
   direção nova sem motivo.

## Accessibility & Inclusion

Nenhum requisito de acessibilidade específico do produto foi confirmado ainda além do padrão web
(WCAG AA como piso geral). Uso majoritariamente por equipe interna via desktop/celular no dia a dia
operacional — foco de teclado e contraste de texto/estado importam porque é ferramenta de trabalho
usada sob pressão (prazo vencendo, carro sumido), não porque foi levantado um requisito formal de
acessibilidade.
