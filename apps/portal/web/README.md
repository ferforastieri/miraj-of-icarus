# Portal web

PWA em Next.js do Miraj of Icarus. Reúne landing page, autenticação, área do
jogador e painel administrativo, usando a API como backend por meio de rotas
BFF no próprio portal. Pode ser instalada na tela inicial em navegadores
compatíveis.

## Tecnologias

- Next.js 16 e React 19;
- TypeScript;
- Tailwind CSS 4;
- TanStack Query;
- next-intl para português, inglês e espanhol;
- OpenNext e Cloudflare Workers.

## PWA e descoberta

- `src/app/manifest.ts` define instalação, ícones e atalhos;
- `public/sw.js` oferece fallback offline sem armazenar APIs ou áreas privadas;
- `src/app/robots.ts` e `src/app/sitemap.ts` orientam os buscadores;
- metadata por rota define canonical, Open Graph e Twitter Cards;
- URLs localizadas e `hreflang` conectam as versões `/pt`, `/en` e `/es`;
- JSON-LD descreve o site e o jogo sem dados promocionais inventados.

## Internacionalização

O locale faz parte de toda URL pública. A raiz detecta a preferência do
navegador, com português como padrão, e o seletor de país grava a escolha no
cookie `MIRAJ_LOCALE`. Os catálogos ficam em `messages/pt.json`,
`messages/en.json` e `messages/es.json`; mantenha a mesma árvore de chaves nos
três arquivos.

`src/i18n/routing.ts` concentra locales e países, `src/middleware.ts` resolve
os redirecionamentos no runtime Edge exigido pelo adaptador Cloudflare e
`src/app/[locale]` contém as páginas. Rotas `/api/**` não recebem prefixo de
idioma.

Defina `GOOGLE_SITE_VERIFICATION` no ambiente de produção depois de cadastrar
o domínio no Google Search Console. A imagem social oficial fica em
`public/media/social/miraj-of-icarus-og.jpg`.

## Estrutura

```text
src/
├── api/
│   ├── client/   # cliente HTTP, hooks TanStack Query e QueryProvider
│   └── server/   # sessão, cookies e comunicação do BFF com a API principal
├── app/          # páginas localizadas e Route Handlers em app/api
├── components/
│   └── ui/       # componentes visuais globais
├── domain/game/  # classes, prestígio e regras invariantes do jogo
├── i18n/         # configuração de locales e navegação localizada
├── lib/          # utilitários compartilhados de apresentação
└── routes/       # definição central dos caminhos do portal
```

Tokens de acesso e refresh permanecem em cookies `HttpOnly`; não use
`localStorage` para sessão. Chamadas do navegador passam pelas rotas `/api/**`
do portal. Os Route Handlers delegam a comunicação externa para `api/server`,
enquanto componentes importam somente módulos de `api/client`.

## Requisitos

- Node.js 24;
- npm;
- API local ou remota acessível.

## Configuração

Crie `.env.local` sem versioná-lo:

```dotenv
MIRAJ_OF_ICARUS_API_INTERNAL_URL=http://127.0.0.1:8080
NEXT_PUBLIC_TURNSTILE_SITE_KEY=SUA_CHAVE_PUBLICA
```

Em produção, `MIRAJ_OF_ICARUS_API_INTERNAL_URL` está definido no
[`wrangler.jsonc`](wrangler.jsonc). Segredos não devem ser adicionados às
variáveis `NEXT_PUBLIC_*`.

## Executar localmente

```bash
cd apps/portal/web
npm ci
npm run dev
```

Abra `http://localhost:3000`. Para autenticação e dados reais, mantenha API,
PostgreSQL e Redis em execução; consulte o
[README de infraestrutura](../../../backend/infra/README.md).

## Validar

```bash
cd apps/portal/web
npm run lint
npm run typecheck
npm run build
npm run build:cloudflare
```

Scripts de assets só devem ser executados quando as fontes correspondentes
forem deliberadamente atualizadas:

```bash
npm run assets:prestige
node scripts/process-branding.mjs
```

Revise os arquivos gerados antes de incluí-los em um commit.

## Rotas do produto

- `/{locale}`: landing page, em que `locale` é `pt`, `en` ou `es`;
- `/{locale}/o-jogo`, `/{locale}/reinos` e `/{locale}/classes/[slug]`: conteúdo do jogo;
- `/{locale}/entrar` e `/{locale}/criar-conta`: autenticação;
- `/{locale}/cliente`: conta e personagens do jogador;
- `/{locale}/painel`: administração protegida;
- `/{locale}/download`: release pública do launcher;
- `/{locale}/comunidade`, `/{locale}/shop` e `/{locale}/trade`: destinos do ecossistema.

## Build e publicação

`npm run build` valida o build Next.js. `npm run build:cloudflare` gera o Worker
OpenNext e `npm run deploy:cloudflare` publica manualmente quando autorizado.

O fluxo normal usa `.github/workflows/portal-deploy.yml`: depois que a CI da
mesma revisão passa em `main`, o portal é publicado como
`miraj-of-icarus-portal` no domínio `mirajoficarus.com`.

Secrets e variables necessários no GitHub:

- secret `CLOUDFLARE_ACCOUNT_ID`;
- secret `CLOUDFLARE_API_TOKEN`;
- variable `CLOUDFLARE_TURNSTILE_SITE_KEY`.

O portal não é hospedado no Lightsail em produção. O container presente no
Compose existe para desenvolvimento local e validação do build standalone.
