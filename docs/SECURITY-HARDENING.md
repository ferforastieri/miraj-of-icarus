# Segurança de produção sem serviços pagos adicionais

Nenhuma etapa desta página deve ser aplicada antes de validar o acesso por SSH
e manter uma sessão de recuperação aberta.

## Cloudflare

Na zona `mirajoficarus.com`:

1. Em SSL/TLS, mantenha **Full (strict)**, TLS mínimo 1.2, TLS 1.3 e Always Use
   HTTPS. Ative HSTS somente depois que todos os subdomínios responderem em
   HTTPS.
2. Ative o Free Managed Ruleset.
3. Crie a regra gratuita de rate limit para
   `http.request.uri.path starts_with "/releases/"`, com 100 requisições em 10
   segundos por IP e bloqueio temporário.
4. Mantenha Bot Fight Mode e Hotlink Protection desligados para não interferir
   no launcher.
5. Use cache imutável em `/releases/*` e revalidação curta em
   `/channels/alpha.json`.
6. Crie aplicações Cloudflare Access self-hosted para
   `mirajoficarus.com/painel*` e `mirajoficarus.com/api/admin/*`. A política
   Allow deve aceitar somente o código de uso único enviado para
   `ffnephew@hotmail.com`.
7. Crie um widget Turnstile limitado a `mirajoficarus.com`. Grave a chave
   pública na variable GitHub `CLOUDFLARE_TURNSTILE_SITE_KEY` e o secret no
   arquivo `.env.production` do Lightsail como `TURNSTILE_SECRET_KEY`.

Cloudflare Access é uma primeira barreira; a API continua exigindo sessão
HttpOnly e papel `Administrator` em todas as rotas administrativas.

## Lightsail

Copie e revise `backend/infra/harden-lightsail.sh`, depois execute uma única vez com
`sudo`. Ele recusa prosseguir sem uma chave autorizada para `ubuntu`, desativa
login SSH por senha e root, instala fail2ban e habilita atualizações automáticas
de segurança. Teste uma segunda conexão SSH antes de fechar a primeira.

No firewall do Lightsail:

- mantenha 22/TCP restrito ao IP administrativo quando possível;
- nunca exponha PostgreSQL, Redis ou portas 8080/8081/8083;
- mantenha 80/443 apenas durante a emissão e validação inicial dos certificados.

Depois de instalar um certificado Cloudflare Origin CA e validar Authenticated
Origin Pulls, feche a porta 80 e restrinja 443 às faixas publicadas pela
Cloudflare. Essa troca é operacional e deliberadamente não está automatizada,
pois um certificado ou allowlist incorreto derruba todos os serviços.

O Compose limita os logs JSON de cada container a três arquivos de 10 MB.

## Custos e alertas AWS

Crie um AWS Budget mensal com alertas de 80%, 100% e previsão para
`ffnephew@hotmail.com`. No Lightsail, crie alarmes de CPU e estado da instância.
Não habilite snapshots automáticos, GuardDuty ou Inspector sem revisar a
cobrança posterior ao período promocional.

## Primeiro administrador

Cadastre uma conta normal e execute no host:

```bash
cd /opt/miraj_of_icarus/infra
./promote-administrator.sh NOME_DA_CONTA
```

O comando promove a conta dentro do container da API e revoga todas as sessões
anteriores. O cadastro público nunca aceita ou concede um papel administrativo.
