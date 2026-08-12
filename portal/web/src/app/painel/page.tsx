import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { AuthPortal } from "@/components/AuthPortal";
import { CharacterPanel } from "@/components/CharacterPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { formatBytes, getAccount, getCharacters, getRelease, getServers } from "@/lib/api";

const messages: Record<string, string> = {
  character_created: "Personagem criado.",
  character_deletion_scheduled: "Exclusão agendada. Você pode cancelar durante sete dias.",
  character_restored: "Exclusão cancelada. O personagem já pode entrar no jogo.",
  invalid_character_name: "Use de 3 a 24 letras ou números no nome.",
  invalid_archetype: "Escolha uma classe válida.",
  invalid_gender: "Escolha um gênero válido.",
  character_slots_full: "Os quatro slots da conta estão ocupados.",
  character_name_unavailable: "Esse nome de personagem já está em uso.",
  character_confirmation_invalid: "Digite exatamente o nome do personagem para confirmar.",
  session_expired: "Sua sessão terminou. Atualize a página e entre novamente.",
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; erro?: string; sucesso?: string }>;
}) {
  const query = await searchParams;
  const account = await getAccount();
  if (!account) return <><SiteHeader compact /><AuthPortal mode={query.modo ?? "login"} error={query.erro} /></>;

  const [characters, servers, release] = await Promise.all([getCharacters(), getServers(), getRelease()]);
  return (
    <div className="dashboard-shell">
      <SiteHeader compact />
      <main className="dashboard">
        <header className="dashboard-welcome">
          <div><p className="kicker">Portal do jogador</p><h1>Bem-vindo, <em>{account.userName}</em>.</h1><p>Acompanhe seus viajantes e prepare a próxima entrada no reino.</p></div>
          <form action={logoutAction}><button className="button button-ghost" type="submit">Sair da conta</button></form>
        </header>

        {(query.erro || query.sucesso) && (
          <p className={`dashboard-message ${query.erro ? "form-error" : "form-success"}`} role="status">
            {messages[query.erro ?? query.sucesso ?? ""] ?? "Ação concluída."}
          </p>
        )}

        <section className="overview-grid" aria-label="Visão geral">
          <article className="overview-card"><span>Conta</span><strong>{account.userName}</strong><small>ID #{account.accountId}</small></article>
          <article className="overview-card"><span>Reinos</span><strong>{servers.filter(server => server.available).length} online</strong><small>{servers.length || "Nenhum"} configurado(s)</small></article>
          <article className="overview-card"><span>Release Alpha</span><strong>{release ? release.version.slice(0, 8) : "Em preparação"}</strong><small>{release ? formatBytes(release.totalSize) : "Sem download disponível"}</small></article>
          <article className="overview-card overview-download"><span>Launcher</span>{release ? <a href={release.launcherUrl}>Baixar para Windows ↓</a> : <strong>Indisponível</strong>}<small>Atualização e integridade automáticas</small></article>
        </section>

        <CharacterPanel characters={characters} />

        <section className="panel-section account-security" aria-labelledby="security-title">
          <div><p className="kicker">Segurança</p><h2 id="security-title">Sua sessão</h2><p>Este dispositivo permanecerá conectado por até 30 dias. Ao sair, a renovação desta sessão é revogada.</p></div>
          <form action={logoutAction}><button className="button button-secondary" type="submit">Encerrar sessão</button></form>
        </section>
        <Link className="dashboard-home" href="/">← Voltar para a landing page</Link>
      </main>
    </div>
  );
}
