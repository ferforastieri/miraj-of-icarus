# Produção: Cloudflare, GitHub Actions e Lightsail

## Topologia definitiva

| Endereço | Execução | Função |
| --- | --- | --- |
| `mirajoficarus.com` | Cloudflare Worker/OpenNext | landing, cliente e administração Next.js |
| `downloads.mirajoficarus.com` | Cloudflare Worker + R2 privado | launcher público e cliente autenticado |
| `api.mirajoficarus.com` | Lightsail, via Caddy | contas, sessão, personagens e releases |
| `login.mirajoficarus.com` | Lightsail, via Caddy | entrada do cliente no jogo |
| `lobby.mirajoficarus.com` | Lightsail, via Caddy | seleção de personagens |

PostgreSQL, Redis e Main/Coordinator ficam apenas na rede Docker do Lightsail.
O portal acessa a API pública pelo lado servidor; access e refresh tokens ficam
em cookies `HttpOnly`, nunca em `localStorage`.

A API é a única proprietária das escritas e migrations de contas e personagens.
O Lobby consulta a mesma tabela somente para montar a seleção do jogo e sempre
filtra personagens com exclusão agendada. Criação, exclusão e restauração passam
exclusivamente pela API, evitando regras e transações concorrentes.

## 1. Ativar o domínio no Cloudflare

1. Adicione `mirajoficarus.com` como uma zona no Cloudflare.
2. No Registro.br, troque os servidores DNS pelos dois nameservers fornecidos
   pelo Cloudflare e aguarde a zona mudar para **Active**.
3. Preserve os registros MX/TXT de e-mail importados. Não publique registros
   A/AAAA provisórios para a raiz se ainda não houver destino.

## 2. Preparar o R2

1. Crie o bucket `miraj-of-icarus-releases`, classe **Standard** e localização
   automática.
2. Deixe o bucket privado e o acesso `r2.dev` desativado em produção.
3. Crie um token R2 restrito a esse bucket, com leitura e gravação de objetos.
4. Remova a ligação direta do domínio ao R2 antes de publicar o Worker; o
   Custom Domain final é declarado em `backend/download-worker/wrangler.jsonc`.

Cadastre em **GitHub > Settings > Secrets and variables > Actions**:

- `CLOUDFLARE_R2_ACCOUNT_ID`;
- `CLOUDFLARE_R2_ACCESS_KEY_ID`;
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`;
- `MIRAJ_OF_ICARUS_RELEASE_SIGNING_KEY_BASE64`;
- `DOWNLOAD_AUTHORIZATION_SIGNING_KEY`, Base64 com pelo menos 32 bytes.

A chave pública correspondente já é empacotada no launcher. Trocar apenas a
chave privada no GitHub quebra a validação; uma rotação exige atualizar e
distribuir primeiro a chave pública.

## 3. Preparar o portal no Cloudflare Workers

Crie um API Token do Cloudflare limitado à conta, com permissão para editar
Workers Scripts e Workers Routes. Cadastre:

- `CLOUDFLARE_ACCOUNT_ID`;
- `CLOUDFLARE_API_TOKEN`.

Cadastre também a variable `CLOUDFLARE_TURNSTILE_SITE_KEY`. O secret do widget
fica apenas na API do Lightsail, como `TURNSTILE_SECRET_KEY`.

O arquivo `apps/portal/web/wrangler.jsonc` declara o Worker
`miraj-of-icarus-portal`, a rota customizada `mirajoficarus.com` e a API interna como
`https://api.mirajoficarus.com`. O workflow publica o portal somente depois que
a CI da mesma revisão passa. Não crie um projeto Pages separado.

## 4. Preparar o Lightsail

1. Crie uma instância Ubuntu com IP estático e associe esse IP à instância.
2. No firewall do Lightsail, libere inicialmente TCP 80 e 443. Restrinja TCP 22
   ao IP administrativo sempre que possível. UDP 443 é opcional para HTTP/3.
   Não exponha 5432, 6379, 8080, 8081 ou 8083.
3. Instale Docker Engine com o plugin Compose e permita que o usuário de deploy
   execute Docker.
4. Crie `/opt/miraj_of_icarus/infra` e copie
   `backend/infra/.env.production.example` para
   `/opt/miraj_of_icarus/infra/.env.production`.
5. Preencha o arquivo com senhas aleatórias, e-mail TLS, namespace GHCR em
   minúsculas e endpoints públicos. Restrinja-o com `chmod 600`.

Crie no DNS do Cloudflare registros A `api`, `login` e `lobby` apontando para o
IP estático. Eles podem ficar com proxy laranja. O Caddy recebe 80/443, emite os
certificados e encaminha cada hostname ao container correto.

## 5. Autorizar o deploy do backend

Crie um token do GitHub com acesso somente de leitura aos packages do
repositório e cadastre estes secrets:

- `GHCR_DEPLOY_USER` e `GHCR_DEPLOY_TOKEN`;
- `LIGHTSAIL_HOST` e `LIGHTSAIL_USER`;
- `LIGHTSAIL_SSH_PRIVATE_KEY`;
- `LIGHTSAIL_SSH_HOST_KEY`, contendo a linha completa e previamente conferida
  do host em formato `known_hosts`.

Não use `StrictHostKeyChecking=no`: o workflow fixa a identidade SSH informada.
As imagens são identificadas pelo SHA completo do commit. O script
`backend/infra/deploy-backend.sh` sobe a revisão, aguarda todos os serviços e retorna à
imagem anterior se a saúde não estabilizar.

## 6. Primeiro deploy e verificação

Depois que secrets, DNS, R2 e Lightsail estiverem prontos, revise as alterações.
Push e deploy dependem de autorização explícita do proprietário.
A sequência esperada é:

1. `CI` fica verde;
2. `Portal deploy` publica o Worker do portal;
3. `Backend deploy` envia quatro imagens ao GHCR e atualiza o Lightsail;
4. se o Worker mudou, `Download worker deploy` publica automaticamente a mesma
   revisão validada em `downloads.mirajoficarus.com`;
5. se houve mudança em `apps/game/windows/**`, `Windows client release`
   publica `channels/alpha.json` por último.

Verifique:

```bash
curl --fail https://mirajoficarus.com/api/health
curl --fail https://api.mirajoficarus.com/health/ready
curl --fail https://downloads.mirajoficarus.com/channels/alpha.json
```

No servidor, use:

```bash
cd /opt/miraj_of_icarus/infra
docker compose --env-file .env.production --env-file .release.env \
  -f compose.yml -f compose.production.yml ps
```

O terceiro `curl` só deve ser usado depois do cutover manual do Worker e da
primeira release; antes disso, a landing mostra que a release está em preparação.

## Rollback

- Backend: rode `deploy-backend.sh` com o SHA completo de uma imagem anterior;
  o próprio deploy automático também tenta reverter ao SHA anterior quando a
  verificação falha.
- Portal: execute novamente `Portal deploy` a partir de um commit conhecido ou
  publique localmente aquela revisão com `npm run deploy:cloudflare`.
- Cliente: republique `channels/alpha.json` apontando para uma release completa
  anterior. Os objetos em `releases/{sha}` são imutáveis e não precisam ser
  reenviados.

Faça backup periódico dos volumes PostgreSQL e Redis do Lightsail antes de
atualizações de infraestrutura ou migrações relevantes.

As configurações de Access, regras gratuitas, Origin CA, SSH, alarmes e budget
estão em [SECURITY-HARDENING.md](SECURITY-HARDENING.md).
