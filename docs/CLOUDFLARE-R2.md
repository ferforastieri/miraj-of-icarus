# Distribuição privada no Cloudflare R2

## Topologia

- bucket privado: `miraj-of-icarus-releases`;
- Worker: `miraj-of-icarus-downloads`;
- domínio final: `downloads.mirajoficarus.com`;
- canal público: `channels/alpha.json`;
- launcher público: `releases/{sha}/launcher/MirajOfIcarusLauncher.zip`;
- cliente protegido: `releases/{sha}/client/**`.

O domínio não deve permanecer ligado diretamente ao bucket. O código em
`distribution/download-worker` lê o R2 por binding privado, não oferece
listagem e exige um token HS256 de 15 minutos para manifesto, assinatura e
arquivos do cliente. O launcher obtém esse token somente depois de autenticar.

## Publicação

O workflow do cliente usa credenciais S3 limitadas ao bucket para enviar os
objetos. Ele valida hashes e a existência de cada objeto versionado antes de
gravar `channels/alpha.json` por último. Os secrets são:

- `CLOUDFLARE_R2_ACCOUNT_ID`;
- `CLOUDFLARE_R2_ACCESS_KEY_ID`;
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`;
- `MIRAJ_OF_ICARUS_RELEASE_SIGNING_KEY_BASE64`.

`DOWNLOAD_AUTHORIZATION_SIGNING_KEY` é outro secret: uma chave aleatória de no
mínimo 32 bytes codificada em Base64. O mesmo valor deve existir na API do
Lightsail e no Worker. Ele não substitui a chave Ed25519 que assina o manifesto.

## Validação e cutover

1. Mantenha o bucket privado e desative `r2.dev`.
2. Cadastre `DOWNLOAD_AUTHORIZATION_SIGNING_KEY` nos secrets do GitHub.
3. Execute manualmente o workflow `Download worker deploy` sem rota customizada.
4. Valide o endereço temporário `*.workers.dev`: canal e launcher retornam
   `200`; caminhos `client/**` retornam `401` sem token e `200/206` com token.
5. Somente após a revisão, remova a ligação R2 direta e associe
   `downloads.mirajoficarus.com` ao Worker.

O cutover não é feito por este repositório automaticamente.

## Cache e rollback

Objetos versionados recebem `public,max-age=31536000,immutable`. O canal recebe
cache curto com revalidação. Para rollback, publique `channels/alpha.json`
apontando para uma release completa anterior; não sobrescreva os objetos
versionados.

Referências oficiais:

- https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
