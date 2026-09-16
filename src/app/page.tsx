import { dashboardUrl, PLAY_HREF, resultsUrl } from "@/lib/links";
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

  return (
    <div className="shell">
      <div className="frame">
        <header className="top">
          <div className="brand">
            <Mark />
            {name}
          </div>
          <nav className="nav" aria-label="Primary">
            <a href={results} data-cta="results">
              Results
            </a>
            <a href={dashboard} data-cta="dashboard">
              Dashboard
            </a>
            <a className="play" href={PLAY_HREF} data-cta="play">
              Play
            </a>
          </nav>
        </header>

        <section className="hero">
          <div>
            <p className="kicker">Network template · v1</p>
            <h1>Ship a jackpot front door.</h1>
            <p className="lede">
              A first-party Megapot Network shell. Play hops through a private
              /go. Dashboard and results stay public, UTM-stamped, and empty of
              attribution secrets.
            </p>
            <div className="actions">
              <a className="play" href={PLAY_HREF} data-cta="play">
                Play the jackpot
              </a>
              <a className="ghost" href={dashboard} data-cta="dashboard">
                Open dashboard
              </a>
              <a className="ghost" href={results} data-cta="results">
                Latest results
              </a>
            </div>
          </div>
          <aside className="hero-aside">
            <p>Attribution</p>
            <strong>Host env only.</strong>
            <p className="aside-note">
              Destination URL stays in MEGAPOT_PLAY_DESTINATION. This page never
              prints a referral code.
            </p>
          </aside>
        </section>

        <section className="props" aria-label="Why this shell">
          <article className="prop">
            <span>01 / Hop</span>
            <h2>Private /go</h2>
            <p>
              The Play CTA is a local hop. Cloudflare Pages reads the play
              destination at request time and 302s with campaign UTMs.
            </p>
          </article>
          <article className="prop">
            <span>02 / Books</span>
            <h2>Live look-up</h2>
            <p>
              Dashboard and drawing results stay one click away on the public
              Megapot origin — campaign params, not secrets.
            </p>
          </article>
          <article className="prop">
            <span>03 / Ship</span>
            <h2>Clone, export</h2>
            <p>
              Static Next.js to out/, then Cloudflare Pages. Cribble tokens:
              black, green, ember, ice.
            </p>
          </article>
        </section>

        <footer className="foot">
          <p>
            {name} · privacy-clean footer · no referral codes, wallet addresses,
            or invite paths
          </p>
          <p>Attribution stays on the host.</p>
        </footer>
      </div>
    </div>
  );
}
