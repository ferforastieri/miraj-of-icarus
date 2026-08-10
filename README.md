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
- `portal/web/`: portal público e futura área de conta;
- `infra/`: ambiente local reproduzível com containers.

## Tecnologias

- C++20, CMake, Ninja e Wicked Engine no launcher, cliente e futuro World
  Server;
- .NET 10 na API e nos serviços de controle: Login, Main/Coordinator e Lobby;
- PostgreSQL e Redis para dados e sessões;
- Next.js 16, React 19 e Tailwind CSS no portal;
- Docker e GitHub Actions para integração contínua;
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
```

O launcher e o cliente Windows são compilados pela pipeline em um runner
Windows. Configurações locais devem partir dos arquivos `.env.example`; nenhum
segredo deve ser versionado.
