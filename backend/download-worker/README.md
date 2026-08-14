# Download Worker

Worker do Cloudflare responsável por entregar releases do Miraj of Icarus sem
expor diretamente o bucket R2. O launcher e o canal são públicos; os arquivos
do cliente exigem uma autorização curta emitida pela API.

## Responsabilidades

- ler objetos pelo binding privado `RELEASES`;
- impedir listagem e travessia de caminhos;
- validar tokens HS256 vinculados à conta e ao SHA da release;
- atender `GET`, `HEAD` e downloads com `Range`;
- aplicar rate limit e retornar `Retry-After` em `429`;
- definir cache curto para o canal e cache imutável para objetos versionados.

## Estrutura de objetos

```text
channels/alpha.json
releases/{git-sha}/launcher/MirajOfIcarusLauncher.exe
releases/{git-sha}/client/release-manifest.json
releases/{git-sha}/client/release-manifest.sig
releases/{git-sha}/client/files/**
```

`channels/alpha.json` e o executável do launcher são públicos. Todo caminho
`releases/{sha}/client/**` exige `Authorization: Bearer <token>`.

## Requisitos

- Node.js 24;
- npm;
- conta Cloudflare com Workers e R2;
- bucket privado `miraj-of-icarus-releases`.

## Instalar e validar

```bash
cd backend/download-worker
npm ci
npm run typecheck
npm test
```

## Executar localmente

Crie o segredo somente no ambiente local do Wrangler:

```bash
cd backend/download-worker
printf 'DOWNLOAD_AUTHORIZATION_SIGNING_KEY=%s\n' 'CHAVE_BASE64_DE_32_BYTES' > .dev.vars
npx wrangler dev
```

Não versione `.dev.vars`. Para testar objetos, grave-os no R2 local do
Wrangler respeitando a estrutura acima. O binding e o rate limiter estão
declarados em [`wrangler.jsonc`](wrangler.jsonc).

## Publicar

O deploy normal é realizado por `.github/workflows/download-worker-deploy.yml`
depois que a CI da mesma revisão passa. Para uma publicação manual autorizada:

```bash
cd backend/download-worker
npx wrangler secret put DOWNLOAD_AUTHORIZATION_SIGNING_KEY
npm run deploy
```

O ambiente de CI exige:

- `CLOUDFLARE_ACCOUNT_ID`;
- `CLOUDFLARE_API_TOKEN`;
- `DOWNLOAD_AUTHORIZATION_SIGNING_KEY`.

A chave de autorização deve ser o mesmo valor configurado na API. Ela é
diferente da chave usada para assinar o manifesto da release.

## Domínio, cache e rollback

O Worker atende `downloads.mirajoficarus.com` como domínio customizado. O
bucket deve permanecer privado, sem `r2.dev` e sem ligação pública direta.

- `channels/alpha.json`: `max-age=30`, com revalidação;
- `releases/{sha}/**`: cache de um ano, `immutable`.

Rollback de código é feito republicando uma revisão conhecida do Worker.
Rollback do cliente é feito pelo pipeline de release ao apontar o canal para um
SHA completo anterior; objetos versionados não devem ser sobrescritos.
