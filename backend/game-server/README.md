# Game Server

Serviços de controle da sessão de jogo do Miraj of Icarus. Esta solução .NET
contém contratos compartilhados, suporte de runtime, compatibilidade de
protocolo e os serviços Login, Main/Coordinator e Lobby.

## Componentes

```text
libraries/
├── contracts/          # contratos e regras compartilhadas
├── protocol-legacy/    # codec do protocolo de compatibilidade
└── runtime/            # tickets, Redis e infraestrutura comum de execução
services/
├── login/              # entrada pública do cliente
├── coordinator/        # coordenação de sessão e seleção do servidor
└── lobby/              # seleção dos personagens disponíveis
tests/                  # contratos e comportamento dos serviços
```

## Fluxo de sessão

```text
Cliente -> Login -> Main/Coordinator -> Lobby
                     |                  |
                   Redis        PostgreSQL + Redis
```

O Login recebe o ticket emitido pela API. O Main/Coordinator consome o ticket
de forma atômica, coordena a sessão e encaminha o cliente ao Lobby. O Lobby
consulta os personagens persistidos pela API e exclui da seleção aqueles com
remoção agendada.

A criação, exclusão e restauração de personagens não pertencem ao Lobby: essas
operações passam pela API para que limite de slots, nomes, classes e gêneros
tenham uma única implementação.

## Requisitos

- .NET SDK `10.0.302` ou patch compatível;
- Redis 8 para Login e Main/Coordinator;
- PostgreSQL 18 e Redis 8 para Lobby;
- API disponível para iniciar a jornada completa do cliente.

## Configuração

Principais variáveis, usando a convenção `__` do ASP.NET Core:

| Serviço | Variáveis |
| --- | --- |
| Login | `Cache__ConnectionString`, `Main__Endpoint`, `Main__ServiceKey` |
| Main | `Cache__ConnectionString`, `Internal__ServiceKey`, `Server__Id`, `Lobby__Endpoint` |
| Lobby | `ConnectionStrings__Database`, `Cache__ConnectionString`, `Database__ApplyMigrations` |

`Main__ServiceKey` e `Internal__ServiceKey` representam o mesmo segredo interno
e devem usar um valor forte. Não grave esse valor em `appsettings.json`.

## Executar localmente

Para a jornada completa, use o Compose descrito em
[`../infra/README.md`](../infra/README.md). Para iniciar um serviço isolado:

```bash
dotnet run --project backend/game-server/services/coordinator/MirajOfIcarus.MainServer/MirajOfIcarus.MainServer.csproj
dotnet run --project backend/game-server/services/login/MirajOfIcarus.LoginServer/MirajOfIcarus.LoginServer.csproj
dotnet run --project backend/game-server/services/lobby/MirajOfIcarus.LobbyServer/MirajOfIcarus.LobbyServer.csproj
```

Defina antes as variáveis correspondentes ao serviço. Os valores padrão dos
`appsettings.json` são apenas referências locais e não contêm segredos válidos.

## Validar

```bash
dotnet restore backend/game-server/MirajOfIcarus.GameServer.slnx --locked-mode
dotnet build backend/game-server/MirajOfIcarus.GameServer.slnx --configuration Release --no-restore
dotnet test backend/game-server/MirajOfIcarus.GameServer.slnx --configuration Release --no-restore
```

Os testes cobrem codecs, contratos de Login/Main, coordenação e filtragem de
personagens no Lobby.

## Containers e produção

Cada serviço possui um Dockerfile próprio. O workflow de backend publica as
imagens no GHCR com o SHA completo e o
[`compose.production.yml`](../infra/compose.production.yml) seleciona essa
revisão. Portas de banco, Redis e Main não devem ser expostas publicamente.
