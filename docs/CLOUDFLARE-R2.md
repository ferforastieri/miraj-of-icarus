# Distribuição de releases no Cloudflare R2

## Topologia

- bucket: `miraj-of-icarus-releases`;
- domínio de produção: `downloads.mirajoficarus.com.br`;
- canal mutável: `channels/alpha.json`;
- objetos imutáveis: `releases/{git-sha}/...`.

O domínio deve ser conectado diretamente ao bucket em **R2 > Settings > Custom
Domains**. O endpoint `r2.dev` pode ser habilitado em testes, mas deve ficar
desabilitado em produção para não criar um caminho público alternativo sem as
regras de cache e segurança do domínio próprio.

Antes disso, a zona `mirajoficarus.com.br` precisa aparecer como **Active** no
Cloudflare. No Registro.br, os únicos nameservers devem ser exatamente os dois
atribuídos à zona pelo Cloudflare. Não crie um registro DNS manual para
`downloads`: ao conectar o Custom Domain, o próprio R2 cria e administra o
registro necessário.

## Permissões e secrets

Crie credenciais S3 limitadas ao bucket `miraj-of-icarus-releases`, com leitura e
gravação de objetos. Registre o Account ID, Access Key ID e Secret Access Key
nos secrets descritos no README. A chave privada usada para assinar o manifesto
é um secret separado e nunca é enviada ao R2.

O workflow usa o comando `aws s3` apenas como cliente do protocolo compatível
com S3, apontado para o endpoint do Cloudflare R2. Os arquivos não são enviados
ao Amazon S3 e isso não cria um segundo serviço de armazenamento na AWS.

## Publicação atômica

O workflow gera dois produtos:

1. `MirajOfIcarusLauncher.zip`, contendo o launcher, a identidade visual e
   `assets/launcher/config.json` apontando para `https://api.mirajoficarus.com.br`;
2. o cliente descompactado, seu manifesto assinado e os arquivos atualizáveis.

`publish-r2-release.sh` valida os hashes locais, envia todos os objetos versionados,
confirma cada arquivo com `HeadObject` e grava o canal Alpha por último. Se qualquer upload
falhar, o canal anterior permanece ativo.

## Cache e rollback

Configure cache para todos os arquivos sob `releases/*`, respeitando o
`Cache-Control: public,max-age=31536000,immutable` gravado no upload. O canal
usa `public,max-age=60,must-revalidate`.

Para rollback, recupere os valores da release anterior e publique um novo
`channels/alpha.json` apontando para aquele SHA. Não apague releases até que
nenhum canal ou instalação suportada dependa delas.

Referência operacional: https://developers.cloudflare.com/r2/buckets/public-buckets/
