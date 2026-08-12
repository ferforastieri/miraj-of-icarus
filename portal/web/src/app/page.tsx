import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { formatBytes, getRelease, getServers } from "@/lib/api";

export default async function Home() {
  const [release, servers] = await Promise.all([getRelease(), getServers()]);
  const availableServers = servers.filter((server) => server.available).length;

  return (
    <div className="site-shell">
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <SiteHeader />
        <div className="hero-beams" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-content">
          <p className="hero-kicker"><span /> Alpha · Acesso para Windows <span /></p>
          <h1 id="hero-title">A passagem<br /><em>está aberta.</em></h1>
          <p>Um mundo preservado com cuidado e reconstruído sobre uma fundação preparada para durar.</p>
          <div className="hero-actions">
            {release ? (
              <a className="button button-primary" href={release.launcherUrl}>Baixar launcher <span aria-hidden="true">↓</span></a>
            ) : (
              <span className="button button-disabled" aria-disabled="true">Download indisponível</span>
            )}
            <Link className="button button-ghost" href="/painel">Acessar painel</Link>
          </div>
        </div>
        <a className="scroll-cue" href="#jogo"><span>Conheça o mundo</span><i aria-hidden="true" /></a>
      </section>

      <main>
        <section className="world-section content-section" id="jogo">
          <div className="section-copy">
            <p className="kicker">Além do portão</p>
            <h2>O mundo que você lembra respira outra vez.</h2>
            <p>Masicarus é um MMORPG em reconstrução. Mapas, criaturas e a atmosfera original permanecem no centro enquanto cada sistema recebe uma implementação própria, segura e moderna.</p>
            <div className="world-notes" aria-label="Características do projeto">
              <span>Cliente nativo</span><span>Mundo persistente</span><span>Jornada compartilhada</span>
            </div>
          </div>
          <div className="world-window" aria-hidden="true"><span>O reino além do portão</span></div>
        </section>

        <section className="rebuild-section" id="reconstrucao">
          <div className="rebuild-mark"><Image src="/media/mark.png" alt="" width={420} height={420} /></div>
          <div className="section-copy">
            <p className="kicker">Reconstruído para durar</p>
            <h2>Memória preservada.<br />Fundação renovada.</h2>
            <p>O launcher, o cliente e os serviços evoluem juntos em jornadas completas. Cada release é assinada, verificada e distribuída de forma reproduzível.</p>
            <ul className="rebuild-list">
              <li><strong>Integridade</strong><span>Arquivos validados antes de abrir o jogo.</span></li>
              <li><strong>Evolução</strong><span>Atualizações diferenciais pelo próprio launcher.</span></li>
              <li><strong>Preservação</strong><span>Identidade e conteúdo tratados como parte do mundo.</span></li>
            </ul>
          </div>
        </section>

        <section className="realms-section content-section" id="reinos">
          <div className="panel-section-heading">
            <div><p className="kicker">Estado dos reinos</p><h2>Escolha sua passagem.</h2></div>
            <span className={`realm-summary${availableServers ? " is-online" : ""}`}><i /> {availableServers ? `${availableServers} disponível` : "Indisponível"}</span>
          </div>
          <div className="realm-grid">
            {servers.length ? servers.map((server) => (
              <article className="realm-card" key={server.id}>
                <div><span className="realm-region">{server.region}</span><h3>{server.name}</h3></div>
                <span className={server.available ? "status-online" : "status-offline"}>{server.available ? "Online" : "Manutenção"}</span>
              </article>
            )) : <p className="empty-state">Não foi possível consultar os reinos agora.</p>}
          </div>
        </section>

        <section className="download-section" id="download">
          <div className="download-glow" aria-hidden="true" />
          <Image className="download-mark" src="/media/mark.png" alt="" width={180} height={180} />
          <p className="kicker">Masicarus para Windows</p>
          <h2>Seu caminho começa pelo launcher.</h2>
          <p>Baixe uma vez. O launcher instala, verifica e mantém o cliente atualizado antes de cada jornada.</p>
          {release ? (
            <>
              <a className="button button-primary button-large" href={release.launcherUrl}>Baixar launcher para Windows <span>↓</span></a>
              <div className="release-details">
                <span>Versão {release.version.slice(0, 8)}</span>
                <span>{formatBytes(release.totalSize)}</span>
                <span>Publicada em {new Intl.DateTimeFormat("pt-BR").format(new Date(release.publishedAt))}</span>
              </div>
            </>
          ) : (
            <div className="release-unavailable"><strong>Release em preparação</strong><span>O download aparecerá aqui assim que o canal Alpha estiver disponível.</span></div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <Link className="footer-brand" href="#inicio"><Image src="/media/mark.png" alt="" width={48} height={48} /><span>MASICARUS</span></Link>
        <p>Uma reconstrução independente em andamento.</p>
        <p>© {new Date().getFullYear()} Masicarus</p>
      </footer>
    </div>
  );
}
