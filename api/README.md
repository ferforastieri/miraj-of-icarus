# API do Masicarus

A API usa quatro assemblies com dependências unidirecionais e organiza o
conteúdo interno por módulo de negócio.

```text
Api -> Application -> Domain
  \          ^
   -> Infrastructure
```

- `src/Api`: HTTP, contratos públicos, autenticação ASP.NET e composição;
- `src/Application`: casos de uso e interfaces para recursos externos;
- `src/Domain`: entidades e regras que não conhecem ASP.NET, EF ou Redis;
- `src/Infrastructure`: repositories EF/PostgreSQL, Redis, configuração e R2;
- `tests/Api.Tests`: testes organizados pelos mesmos módulos.

As pastas têm nomes curtos, mas projetos, assemblies e namespaces mantêm o
prefixo `Masicarus` para serem identificáveis em referências, logs e stack
traces.

## Fluxo de uma requisição

```text
Controller -> Service -> Interface de repository/provider
                              |
                              v
                     implementação Infrastructure
```

Controllers não consultam `PlatformDbContext`, Redis ou R2 diretamente.
Repositories são específicos de cada módulo; não existe repository genérico.
Erros de aplicação usam códigos estáveis e a camada HTTP é a única responsável
por convertê-los em `400`, `401`, `404`, `409` ou `503`.

O esquema `OpaqueBearer` autentica todas as rotas com `[Authorize]`. A geração
e leitura dos tokens reutiliza `Masicarus.Game.Runtime`, garantindo que API,
Login, Main e Lobby compartilhem formato, chave Redis e consumo atômico.

## Módulos atuais

- `Accounts`: cadastro e persistência de contas;
- `Authentication`: login, access token, refresh rotativo e logout;
- `Characters`: slots, nomes, criação e exclusão com carência;
- `GameServers`: catálogo público e emissão do ticket de login compartilhado;
- `Releases`: leitura e validação do canal publicado no Cloudflare R2.

## Validação

```bash
dotnet restore api/Masicarus.slnx --locked-mode
dotnet build api/Masicarus.slnx --configuration Release --no-restore
dotnet test api/Masicarus.slnx --configuration Release --no-restore
```

Os testes marcados como `Infrastructure` exigem PostgreSQL e Redis. O workflow
`ci.yml` provisiona ambos automaticamente.
