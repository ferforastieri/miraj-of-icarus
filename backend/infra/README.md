# Infraestrutura

Definições de execução local e produção do backend do Miraj of Icarus. Esta
pasta concentra Docker Compose, proxy HTTPS, implantação no Lightsail,
hardening do host e comandos administrativos.

## Topologia

| Endereço | Execução | Função |
| --- | --- | --- |
| `mirajoficarus.com` | Cloudflare Worker/OpenNext | portal web |
| `downloads.mirajoficarus.com` | Cloudflare Worker + R2 privado | releases |
| `api.mirajoficarus.com` | Lightsail/Caddy | API |
| `login.mirajoficarus.com` | Lightsail/Caddy | entrada do cliente |
| `lobby.mirajoficarus.com` | Lightsail/Caddy | seleção de personagens |

PostgreSQL, Redis e Main/Coordinator permanecem somente na rede Docker.

## Arquivos

- `compose.yml`: serviços, volumes, rede, health checks e build local;
- `compose.production.yml`: imagens GHCR e Caddy de produção;
- `Caddyfile`: HTTPS e reverse proxy por hostname;
- `.env.example`: configuração local;
- `.env.production.example`: configuração do host;
- `deploy-backend.sh`: implantação por SHA com health check e rollback;
- `harden-lightsail.sh`: SSH, fail2ban e atualizações de segurança;
- `promote-administrator.sh`: promove uma conta existente;
- `provision-administrator.sh`: cria o primeiro administrador.

## Requisitos locais

- Docker Engine;
- Docker Compose v2;
- Git LFS para obter os assets usados pelos builds.

## Executar localmente

```bash
cp backend/infra/.env.example backend/infra/.env
```

Preencha todos os valores marcados como `replace-with-*`. Use senhas e chaves
locais, não credenciais de produção. Para construir e iniciar a pilha:

```bash
docker compose \
  --env-file backend/infra/.env \
  -f backend/infra/compose.yml \
  up --build -d
```

Verifique os serviços:

```bash
docker compose \
  --env-file backend/infra/.env \
  -f backend/infra/compose.yml \
  ps

curl --fail http://127.0.0.1:8080/health/ready
curl --fail http://127.0.0.1:3000/api/health
```

Para acompanhar ou encerrar:

```bash
docker compose --env-file backend/infra/.env -f backend/infra/compose.yml logs -f
docker compose --env-file backend/infra/.env -f backend/infra/compose.yml down
```

Não use `down -v` sem intenção explícita: ele remove os dados locais de
PostgreSQL e Redis.

## Configurar produção no Lightsail

1. Crie uma instância Ubuntu com IP estático.
2. Libere inicialmente TCP 80/443 e restrinja TCP 22 ao IP administrativo.
3. Instale Docker Engine e o plugin Compose.
4. Crie `/opt/miraj_of_icarus/infra`.
5. Copie `.env.production.example` para `.env.production`, preencha os valores
   e aplique `chmod 600`.
6. Crie no Cloudflare os registros `api`, `login` e `lobby` apontando para o IP
   estático, com proxy habilitado.

Nunca exponha as portas 5432, 6379, 8080, 8081 ou 8083 no firewall público.

### Variáveis e secrets do deploy

No GitHub Actions, o backend exige:

- `GHCR_DEPLOY_USER` e `GHCR_DEPLOY_TOKEN` com leitura de packages;
- `LIGHTSAIL_HOST` e `LIGHTSAIL_USER`;
- `LIGHTSAIL_SSH_PRIVATE_KEY`;
- `LIGHTSAIL_SSH_HOST_KEY`, contendo a linha validada de `known_hosts`.

No arquivo `.env.production` do host, configure senhas, chave interna dos
serviços, chave de download, Turnstile, namespace GHCR, endpoints públicos e
e-mail TLS. O modelo enumera todas as chaves exigidas.

## Implantação e rollback

Após a CI aprovar um push em `main`, o workflow de backend publica API, Main,
Login e Lobby no GHCR e chama:

```bash
cd /opt/miraj_of_icarus/infra
./deploy-backend.sh GIT_SHA_COMPLETO
```

O script atualiza `.release.env`, baixa as imagens, aguarda os health checks e
retorna ao SHA anterior caso a nova revisão não estabilize. Para rollback
manual, execute o mesmo comando com um SHA completo conhecido.

Verificação de produção:

```bash
curl --fail https://api.mirajoficarus.com/health/ready
curl --fail https://downloads.mirajoficarus.com/channels/alpha.json

docker compose \
  --env-file .env.production \
  --env-file .release.env \
  -f compose.yml \
  -f compose.production.yml \
  ps
```

## Administrador inicial

Para criar uma conta administrativa diretamente no container:

```bash
cd /opt/miraj_of_icarus/infra
./provision-administrator.sh NOME_DA_CONTA
```

Para promover uma conta normal existente:

```bash
./promote-administrator.sh NOME_DA_CONTA
```

Os comandos revogam sessões anteriores quando necessário. O cadastro público
nunca concede o papel `Administrator`.

## Segurança

Antes de endurecer o host, confirme uma chave autorizada e mantenha uma sessão
SSH de recuperação aberta. Depois execute e teste uma segunda conexão:

```bash
sudo /opt/miraj_of_icarus/infra/harden-lightsail.sh
```

O script desabilita login por senha e root, limita tentativas, instala
fail2ban e ativa atualizações automáticas de segurança.

No Cloudflare:

- use `Full (strict)`, TLS mínimo 1.2, TLS 1.3 e Always Use HTTPS;
- habilite o Free Managed Ruleset;
- mantenha o bucket R2 privado e `r2.dev` desativado;
- proteja `/painel*` e `/api/admin/*` com Cloudflare Access;
- mantenha Bot Fight Mode e Hotlink Protection desligados se interferirem no
  launcher;
- ative HSTS somente após validar todos os subdomínios em HTTPS.

Depois de validar Origin CA e Authenticated Origin Pulls, restrinja 443 às
faixas da Cloudflare e feche a porta 80. Faça isso somente com uma sessão de
recuperação disponível.

## Custos, logs e backup

O Compose limita os logs JSON a três arquivos de 10 MB por container. Configure
um AWS Budget com alertas de 80%, 100% e previsão, além de alarmes de CPU e
estado da instância. Não habilite snapshots automáticos, GuardDuty ou Inspector
sem revisar os custos.

Mantenha backups periódicos dos volumes PostgreSQL e Redis antes de migrations
ou mudanças relevantes de infraestrutura.
