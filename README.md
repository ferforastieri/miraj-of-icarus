# Masicarus

Masicarus é um MMORPG em reconstrução, desenvolvido com código-fonte próprio e
arquitetura moderna. O projeto preserva a identidade visual, os assets, mapas e
mecânicas do jogo de referência enquanto substitui sua implementação técnica.

O desenvolvimento acontece em fatias verticais: launcher, cliente, API e game
servers evoluem juntos até formar jornadas completas e testáveis.

## Componentes

- `api/`: contas, autenticação, sessões e catálogo de releases;
- `game-server/`: Login, Main/Coordinator e Lobby;
- `game-clients/client-pc/`: launcher, cliente Windows e assets do jogo;
- `portal/web/`: portal público e futura área de conta;
- `infra/`: ambiente local reproduzível com containers.

## Tecnologias

- C++20, CMake, Ninja e Wicked Engine no launcher e cliente;
- .NET 10 nos serviços e na API;
- PostgreSQL e Redis para dados e sessões;
- Next.js 16, React 19 e Tailwind CSS no portal;
- Docker e GitHub Actions para integração contínua;
- Git LFS para assets binários grandes.

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
