import { dashboardUrl, hubUrl, PLAY_HREF, resultsUrl } from "@/lib/links";
import { siteName } from "@/lib/site";

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="4" cy="11" r="3" fill="#02fe01" />
      <circle cx="18" cy="5" r="3" fill="#9bdcf5" />
      <circle cx="18" cy="17" r="3" fill="#ff6a1a" />
      <path
        d="M7 11h8M15.4 6.8 7.6 10.2M15.4 15.2 7.6 11.8"
        stroke="#f4f7f2"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function HomePage() {
  const name = siteName();
  const dashboard = dashboardUrl();
  const results = resultsUrl();
  const hub = hubUrl();

  return (
    <div className="shell">
      <div className="frame">
        <header className="top">
          <div className="brand">
            <Mark />
            {name}
          </div>
          <nav className="nav" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href={results} data-cta="results" rel="noreferrer">
              Results
            </a>
            <a className="play" href={PLAY_HREF} data-cta="play">
              Play
            </a>
          </nav>
        </header>

        <section className="hero">
          <div>
            <p className="kicker">Daily jackpot · Live now</p>
            <h1>Play the daily pot.</h1>
            <p className="lede">
              Megapot is the onchain lottery. One ticket puts you in
              today&apos;s draw. Check winners in the open.
            </p>
            <div className="actions">
              <a className="play" href={PLAY_HREF} data-cta="play">
                Play the jackpot
              </a>
              <a
                className="ghost"
                href={results}
                data-cta="results"
                rel="noreferrer"
              >
                Latest results
              </a>
              <a className="ghost" href="#how">
                How it works
              </a>
            </div>
          </div>
          <aside className="hero-aside">
            <p>Powered by Megapot</p>
            <strong>Fair draws. Public results.</strong>
            <p className="aside-note">
              Play from this site. Winners stay public. This page never shows a
              referral code.
            </p>
            <a
              className="aside-link"
              href={dashboard}
              data-cta="dashboard"
              rel="noreferrer"
            >
              Your tickets
            </a>
          </aside>
        </section>

        <section id="how" className="how" aria-labelledby="how-heading">
          <h2 id="how-heading" className="section-label">
            How it works
          </h2>
          <div className="props">
            <article className="prop">
              <span>01 / Enter</span>
              <h3>Simple tickets</h3>
              <p>
                Tap Play, buy a ticket, and you&apos;re in the draw. No extra
                steps on this page.
              </p>
            </article>
            <article className="prop">
              <span>02 / Jackpot</span>
              <h3>A prize worth chasing</h3>
              <p>
                One pot, drawn daily. Play small. The jackpot is the whole
                point.
              </p>
            </article>
            <article className="prop">
              <span>03 / Fair</span>
              <h3>Anyone can check</h3>
              <p>
                Draws stay public. Latest results live where anyone can read
                them.
              </p>
            </article>
          </div>
        </section>

        <footer className="foot">
          <p>
            {name} · play Megapot · no referral codes or wallets on this page
          </p>
          <p>
            <a href={hub} data-cta="hub" rel="noreferrer">
              Megapot Network
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
