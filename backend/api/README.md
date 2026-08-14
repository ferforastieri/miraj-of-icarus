# API

A API HTTP do Miraj of Icarus é responsável por contas, autenticação,
personagens, catálogo de servidores, releases do cliente e administração. Ela
é a autoridade de escrita para contas e personagens e também executa as
migrations desse domínio.

## Arquitetura

```text
Api -> Application -> Domain
  \          ^
   -> Infrastructure
```

- `src/Api`: controllers, contratos HTTP, autenticação e composição;
- `src/Application`: casos de uso e interfaces de recursos externos;
- `src/Domain`: entidades, valores e regras de negócio sem dependência de web,
  banco ou cache;
- `src/Infrastructure`: Entity Framework Core, PostgreSQL, Redis, releases e
  integrações externas;
- `tests/Api.Tests`: testes por módulo e testes de arquitetura.

Uma requisição segue o fluxo `Controller -> Service -> interface ->
Infrastructure`. Controllers não acessam o `DbContext`, Redis ou R2
diretamente. Erros internos usam códigos estáveis e somente a camada HTTP os
converte em respostas públicas.

## Módulos

- `Accounts`: cadastro e estado da conta;
- `Authentication`: login, access token, refresh rotativo e logout;
- `Characters`: slots, regras de nome, criação e exclusão com carência;
- `GameServers`: catálogo e emissão de tickets de jogo;
- `Releases`: metadados públicos e autorização temporária de download;
- `Administration`: contas, personagens, manutenção e auditoria;
- `Security`: Turnstile, autenticação e limites de requisição.

## Requisitos

- .NET SDK `10.0.302` ou patch compatível;
- PostgreSQL 18;
- Redis 8;
- acesso à internet para Turnstile e manifesto de releases quando esses fluxos
  forem exercitados.

## Configuração

A configuração usa o padrão do ASP.NET Core. Chaves JSON são convertidas em
variáveis com `__`, por exemplo `ConnectionStrings__Database`.

| Variável | Finalidade |
| --- | --- |
| `ConnectionStrings__Database` | conexão PostgreSQL |
| `Cache__ConnectionString` | conexão Redis |
| `Database__ApplyMigrations` | aplica migrations ao iniciar |
| `ClientReleases__ChannelManifestUrl` | URL de `channels/alpha.json` |
| `DownloadAuthorization__SigningKey` | chave Base64 compartilhada com o Worker |
| `Turnstile__SecretKey` | segredo de validação do cadastro |
| `GameServers__0__*` | primeiro servidor anunciado pela API |

Use valores locais próprios e nunca grave segredos em `appsettings*.json`.
Os modelos completos estão em
[`../infra/.env.example`](../infra/.env.example) e
[`../infra/.env.production.example`](../infra/.env.production.example).

## Executar localmente

A forma recomendada de subir toda a pilha é o Docker Compose descrito em
[`../infra/README.md`](../infra/README.md). Para executar somente a API pelo
SDK, inicie PostgreSQL e Redis e então use:

```bash
export ConnectionStrings__Database='Host=127.0.0.1;Port=5432;Database=miraj-of-icarus;Username=miraj-of-icarus;Password=SUA_SENHA;GSS Encryption Mode=Disable'
export Cache__ConnectionString='127.0.0.1:6379'
export Database__ApplyMigrations=true
export DownloadAuthorization__SigningKey='CHAVE_BASE64_DE_32_BYTES'
export Turnstile__SecretKey='SEGREDO_TURNSTILE'

dotnet run --project backend/api/src/Api/MirajOfIcarus.Api.csproj
```

A API atende em `http://localhost:5232` no perfil de desenvolvimento. Em
desenvolvimento, o documento OpenAPI é disponibilizado pelo ASP.NET Core.

## Rotas principais

| Grupo | Prefixo |
| --- | --- |
| Contas | `/v1/accounts` |
| Autenticação | `/v1/auth` |
| Personagens | `/v1/account/characters` |
| Servidores e tickets | `/v1/game-servers`, `/v1/game-tickets` |
| Releases | `/v1/client-releases/windows` |
| Administração | `/v1/admin` |
| Saúde | `/health/live`, `/health/ready` |

Rotas administrativas exigem autenticação e o papel `Administrator`. Corpos de
mutação são limitados e os grupos de endpoints possuem políticas de rate limit.

## Validar

```bash
dotnet restore backend/api/MirajOfIcarus.slnx --locked-mode
dotnet build backend/api/MirajOfIcarus.slnx --configuration Release --no-restore
dotnet test backend/api/MirajOfIcarus.slnx --configuration Release --no-restore
```

Parte dos testes de infraestrutura requer PostgreSQL e Redis. A CI provisiona
ambos automaticamente.

## Administração operacional

Para criar ou promover o primeiro administrador em um ambiente Docker, use os
scripts documentados no [README de infraestrutura](../infra/README.md). O
cadastro público nunca concede privilégios administrativos.

## Container

O [`Dockerfile`](Dockerfile) gera a imagem Linux da API. Em produção, a CI
publica a imagem no GHCR com o SHA completo do commit; o Compose não deve usar
tags mutáveis para decidir uma implantação.
