# Masicarus

Masicarus é um MMORPG em reconstrução, desenvolvido com código-fonte próprio e
arquitetura moderna. O projeto preserva a identidade visual, os assets, mapas e
mecânicas do jogo de referência enquanto substitui sua implementação técnica.

O desenvolvimento acontece em fatias verticais: launcher, cliente, API e game
servers evoluem juntos até formar jornadas completas e testáveis.

## Componentes

- `api/`: contas, autenticação, sessões e catálogo de releases;
- `game-server/`: Login, Main/Coordinator, Lobby e o futuro World Server;
- `game-clients/client-pc/`: launcher, cliente Windows e assets do jogo;
- `portal/web/`: landing page, download e área autenticada da conta;
- `infra/`: ambiente local reproduzível com containers.

## Tecnologias

- C++20, CMake, Ninja e Wicked Engine no launcher, cliente e futuro World
  Server;
- .NET 10 na API e nos serviços de controle: Login, Main/Coordinator e Lobby;
- PostgreSQL e Redis para dados e sessões;
- Next.js 16, React 19 e Tailwind CSS no portal;
- Docker e GitHub Actions para integração contínua;
- Cloudflare Workers para o portal, R2 para downloads e AWS Lightsail para os
  serviços persistentes;
- Git LFS para assets binários grandes.

## Arquitetura de execução

O cliente concentra renderização, animação, física local, predição e
interpolação em C++ para priorizar FPS e resposta imediata aos comandos. O
futuro `game-server/world-server/` também será um processo C++ independente,
voltado ao loop de simulação de tick fixo, movimentação, combate, NPCs,
visibilidade e instâncias de mapas com latência previsível.

API, Login, Main/Coordinator e Lobby permanecem em .NET porque atuam no plano
de controle e não no ciclo crítico de renderização ou simulação. Os dois lados
se comunicam por contratos de rede binários, explícitos e versionados. Banco de
dados e serviços externos não participam diretamente do loop de simulação.

## Estado atual

O launcher já autentica, consulta servidores, valida releases assinadas, baixa
e aplica atualizações e inicia o cliente transmitindo a sessão por canal local
restrito. Login, Main e Lobby implementam a jornada inicial de sessão e
personagens. O próximo marco é validar e ampliar essa jornada no ambiente
hospedado.

O portal público usa a mesma identidade do launcher em `https://masicarus.com.br`.
A rota `/painel` oferece cadastro, sessão persistente e gestão de personagens.
A API pública é anunciada em `https://api.masicarus.com.br`; releases assinadas
do launcher e cliente são distribuídas pelo Cloudflare R2 em
`https://downloads.masicarus.com.br`.

## Publicação do cliente

Mudanças em `game-clients/client-pc/` acionam o workflow
`client-release.yml`. Pull requests apenas compilam e validam. Em `main`, o
workflow assina o manifesto, publica objetos imutáveis no bucket R2
`masicarus-releases` e atualiza `channels/alpha.json` somente depois de validar
o upload completo.

Secrets exigidos no GitHub:

- `MASICARUS_RELEASE_SIGNING_KEY_BASE64`;
- `CLOUDFLARE_R2_ACCOUNT_ID`;
- `CLOUDFLARE_R2_ACCESS_KEY_ID`;
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`.

O bucket deve possuir o domínio próprio `downloads.masicarus.com.br`, com
acesso público somente por esse domínio. Objetos sob `releases/{git-sha}/`
recebem cache imutável; `channels/alpha.json` recebe cache de 60 segundos. Para
rollback, copie novamente o manifesto de uma release completa anterior para
`channels/alpha.json`; os objetos versionados nunca são sobrescritos.

## Entrega contínua e produção

O GitHub Actions é o único coordenador das pipelines:

- `ci.yml` valida .NET, contratos C++ e portal em cada PR e push em `main`;
- `portal-deploy.yml`, depois de uma CI aprovada em `main`, publica a mesma
  revisão como Worker OpenNext no Cloudflare;
- `backend-deploy.yml`, também depois da CI, cria imagens Linux no GHCR e
  atualiza API, Main, Login e Lobby no Lightsail com verificação de saúde e
  rollback;
- `client-release.yml` recompila os executáveis Windows quando o cliente ou o
  launcher muda e publica a release assinada no R2.

O portal não roda no Lightsail em produção. Ele continua disponível no Compose
base apenas para desenvolvimento local. O guia completo de DNS, secrets,
primeiro deploy e rollback está em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Desenvolvimento local

Requer .NET SDK 10, CMake 3.25+, Ninja, compilador C++20, Node.js e Docker.

```bash
dotnet test api/Masicarus.slnx
dotnet test game-server/Masicarus.GameServer.slnx

cmake -S game-clients/client-pc -B build/client -G Ninja \
  -DMASICARUS_BUILD_WINDOWS_APPS=OFF
cmake --build build/client
ctest --test-dir build/client --output-on-failure

npm --prefix portal/web ci
npm --prefix portal/web run lint
npm --prefix portal/web run typecheck
npm --prefix portal/web run build
npm --prefix portal/web run build:cloudflare
npm --prefix portal/web run test:e2e
```

O launcher e o cliente Windows são compilados por cross-compilation na pipeline
Linux com LLVM e o Windows SDK. Configurações locais devem partir dos arquivos `.env.example`; nenhum
segredo deve ser versionado.
