export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#inicio" aria-label="Masicarus — início">
          <span className="wordmark-mark" aria-hidden="true"><span>A</span></span>
          <span>MASICARUS</span>
        </a>

        <nav aria-label="Navegação principal">
          <a href="#jogo">O jogo</a>
          <a href="#projeto">O projeto</a>
          <a href="#comunidade">Comunidade</a>
        </nav>

        <span className="header-state">Em desenvolvimento</span>
      </header>

      <main id="inicio">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span aria-hidden="true" /> Uma nova era está sendo construída</p>
            <h1 id="hero-title">O mundo que você lembra.<br /><em>Reconstruído para durar.</em></h1>
            <p className="hero-description">
              Estamos preservando a história de Masicarus enquanto criamos uma base
              moderna, leve e aberta à evolução. O portal, os serviços e o servidor
              de jogo nascerão juntos — sem apagar o que veio antes.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projeto">Conheça o projeto <span aria-hidden="true">→</span></a>
              <a className="button button-secondary" href="#comunidade">Acompanhe a jornada</a>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="core"><span>A</span></div>
            <span className="spark spark-one" />
            <span className="spark spark-two" />
            <span className="spark spark-three" />
          </div>
        </section>

        <section className="principles" id="projeto" aria-labelledby="principles-title">
          <div className="section-heading">
            <p className="section-kicker">O novo Masicarus</p>
            <h2 id="principles-title">Um projeto, duas missões</h2>
            <p>Preservar uma experiência que já funciona e reconstruir sua tecnologia com cuidado.</p>
          </div>

          <div className="card-grid">
            <article className="feature-card">
              <span className="card-number">01</span>
              <h3>Memória preservada</h3>
              <p>O servidor e o cliente originais permanecem documentados e versionados como referência histórica.</p>
            </article>
            <article className="feature-card featured">
              <span className="card-number">02</span>
              <h3>Fundação moderna</h3>
              <p>API, portal e serviços de jogo serão reconstruídos para Linux com testes e implantação reproduzível.</p>
            </article>
            <article className="feature-card">
              <span className="card-number">03</span>
              <h3>Evolução contínua</h3>
              <p>Um launcher mais seguro, traduções e novas experiências chegarão por etapas, com o jogo sempre no centro.</p>
            </article>
          </div>
        </section>

        <section className="world" id="jogo" aria-labelledby="world-title">
          <div>
            <p className="section-kicker">Em construção</p>
            <h2 id="world-title">A aventura começa outra vez.</h2>
          </div>
          <p>
            A primeira fase prepara a plataforma. Notícias, contas, downloads e
            status dos mundos serão incorporados ao portal conforme cada serviço
            estiver pronto para uso.
          </p>
        </section>

        <section className="community" id="comunidade" aria-labelledby="community-title">
          <p className="section-kicker">Comunidade</p>
          <h2 id="community-title">Estamos preparando o caminho.</h2>
          <p>Os canais oficiais e as primeiras notícias serão publicados aqui.</p>
          <span className="coming-soon">Em breve</span>
        </section>
      </main>

      <footer>
        <a className="wordmark compact" href="#inicio">
          <span className="wordmark-mark" aria-hidden="true"><span>A</span></span>
          <span>MASICARUS</span>
        </a>
        <p>Uma reconstrução independente em andamento.</p>
        <p>© {new Date().getFullYear()} Masicarus</p>
      </footer>
    </div>
  );
}
