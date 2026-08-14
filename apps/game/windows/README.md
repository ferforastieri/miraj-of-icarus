# Launcher e cliente Windows

Aplicações nativas do Miraj of Icarus para Windows: o launcher autentica,
verifica e instala releases; o cliente inicia a sessão do jogo e integra o
fluxo de Lobby.

## Estrutura

```text
assets/       # branding, launcher e recursos do lobby
client/       # executável do jogo
launcher/     # atualização, autenticação e inicialização
common/       # contratos compartilhados e implementação WinHTTP
tests/        # contratos portáveis e fixtures
tools/        # build, manifesto, assinatura e publicação R2
cmake/        # toolchain Windows usada na cross-compilation
```

## Tecnologias

- C++20;
- CMake 3.25+ e Ninja;
- Win32 e WinHTTP;
- Wicked Engine com revisão fixada no CMake;
- nlohmann/json com hash fixado.

## Validar contratos em qualquer plataforma

Os testes portáveis não exigem a construção dos executáveis Windows:

```bash
cmake -S apps/game/windows -B build/windows-contracts -G Ninja \
  -DMIRAJ_OF_ICARUS_BUILD_WINDOWS_APPS=OFF \
  -DMIRAJ_OF_ICARUS_BUILD_TESTS=ON
cmake --build build/windows-contracts
ctest --test-dir build/windows-contracts --output-on-failure
```

## Compilar no Windows

Em um terminal com toolchain MSVC disponível:

```powershell
cmake -S apps/game/windows -B build/windows -G Ninja `
  -DMIRAJ_OF_ICARUS_BUILD_WINDOWS_APPS=ON `
  -DMIRAJ_OF_ICARUS_PUBLIC_API_URL=https://api.mirajoficarus.com
cmake --build build/windows --config Release
```

O cliente 3D pode usar uma cópia local fixada do Wicked Engine com
`-DMIRAJ_OF_ICARUS_WICKED_ROOT=C:\caminho\WickedEngine`. Sem essa opção, o CMake
obtém a revisão declarada no projeto.

## Cross-compilation usada pela CI

O workflow Linux prepara Windows SDK/CRT com `xwin` e usa LLVM 20:

```bash
apps/game/windows/tools/prepare-xwin.sh DIRETORIO_XWIN DIRETORIO_CACHE
apps/game/windows/tools/build-windows.sh \
  DIRETORIO_XWIN \
  DIRETORIO_BUILD \
  DIRETORIO_SAIDA_CLIENTE \
  DIRETORIO_SAIDA_LAUNCHER
```

Variáveis relevantes:

- `MIRAJ_OF_ICARUS_PUBLIC_API_URL`: API embutida no launcher; produção exige
  HTTPS;
- `MIRAJ_OF_ICARUS_RELEASE_VERSION`: SHA Git completo da release;
- `MIRAJ_OF_ICARUS_BUILD_JOBS`: paralelismo do build;
- `MIRAJ_OF_ICARUS_WICKED_ROOT`: checkout local opcional do engine.

## Releases

O pipeline cria `release-manifest.json`, assina o manifesto, valida hashes e
publica no R2:

```text
releases/{sha}/launcher/MirajOfIcarusLauncher.exe
releases/{sha}/client/release-manifest.json
releases/{sha}/client/release-manifest.sig
releases/{sha}/client/files/**
channels/alpha.json
```

O canal é escrito somente depois que todos os objetos versionados foram
enviados e verificados. Pull requests compilam e validam sem publicar; pushes
em `main` que alteram esta pasta publicam uma nova release.

Secrets exigidos pelo workflow:

- `MIRAJ_OF_ICARUS_RELEASE_SIGNING_KEY_BASE64`;
- `CLOUDFLARE_R2_ACCOUNT_ID`;
- `CLOUDFLARE_R2_ACCESS_KEY_ID`;
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`.

A assinatura do manifesto garante integridade da atualização. Ela não equivale
a Authenticode; enquanto os executáveis não tiverem certificado de assinatura
de código, o Windows pode exibir um aviso de editor desconhecido.

## Cuidados

- não grave credenciais ou tokens no disco;
- não compile endpoints HTTP públicos para produção;
- não altere a chave pública do launcher sem planejar a rotação da chave
  privada de release;
- não sobrescreva objetos dentro de `releases/{sha}`.
