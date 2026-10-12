import { Link } from 'react-router-dom';
import { LegalList, LegalPage, LegalSection } from '@/components/account/LegalPage';

const sections = [
  { id: 'short', title: 'The short version' },
  { id: 'stored', title: 'What we store' },
  { id: 'browser', title: 'What stays in your browser' },
  { id: 'others', title: 'Who else is involved' },
  { id: 'choices', title: 'Your choices' },
  { id: 'contact', title: 'Contact' },
];

const mono = 'rounded-sm bg-surface-2 px-1 py-0.5 font-mono text-[0.8125rem]';

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy notice"
      description="What Reel stores, where it goes, and how to take it back, in plain language."
      path="/privacy"
      updated="2026-10-09"
      sections={sections}
    >
      <LegalSection id="short" title="The short version">
        <p>
          Reel has no analytics, no ads and no tracking cookies. If you don't create an account, your list never leaves your browser.
          If you do, your email and your list are stored so they can follow you between devices. You can export or delete all of it in{' '}
          <Link to="/settings">Settings</Link>.
        </p>
      </LegalSection>

      <LegalSection id="stored" title="What we store">
        <p>Only if you create an account:</p>
        <LegalList>
          <li>Your <strong>email address</strong> and a <strong>password hash</strong>. Sign-in is handled by Supabase Auth; your password is never stored or visible in plain text.</li>
          <li>Your <strong>list</strong>: the titles you saved, their status (to watch or watched), your rating, the date you watched them, runtime and when you added them.</li>
          <li>Your <strong>episode progress</strong>: which episodes you marked watched, and when.</li>
          <li>Your <strong>hidden titles</strong> ("Not interested").</li>
          <li>The sign-in session that keeps you signed in on a device.</li>
        </LegalList>
        <p>Deleting your account removes all of this from Reel's database.</p>
      </LegalSection>

      <LegalSection id="browser" title="What stays in your browser">
        <p>Reel uses your browser's storage, not cookies, to remember things on your device:</p>
        <LegalList>
          <li><code className={mono}>movie-watchlist</code>, <code className={mono}>episode-progress</code>, <code className={mono}>hidden-items</code>: your list, progress and hidden titles while you use Reel as a guest.</li>
          <li><code className={mono}>theme</code> and <code className={mono}>tmdb-region</code>: your appearance choice and the region used for "where to watch".</li>
          <li><code className={mono}>reel:query-cache:v1</code>: a copy of recent catalogue results, kept for a few hours so pages open quickly.</li>
          <li><code className={mono}>reel:last-source</code>, <code className={mono}>reel:player-full-access</code>: your choices in the video player.</li>
          <li>A sign-in token, only when you're signed in.</li>
        </LegalList>
        <p>Clearing your browser's site data removes all of it (guests: that includes your list, so export first).</p>
      </LegalSection>

      <LegalSection id="others" title="Who else is involved">
        <LegalList>
          <li><strong>Supabase</strong> provides the database and sign-in for accounts.</li>
          <li><strong>Vercel</strong> hosts the website and, like any host, keeps standard server logs that include IP addresses.</li>
          <li>
            <strong>TMDB</strong> supplies catalogue data and images. Catalogue requests go through Reel's own server, so TMDB does not see your
            browser for those. Poster and backdrop images, however, load directly from TMDB's image servers, so TMDB can see your IP address when they do.
          </li>
          <li><strong>YouTube</strong> (Google) is contacted when you open a trailer, and may set its own cookies when you press play.</li>
          <li>
            <strong>Third-party video players.</strong> Some titles offer a Watch Now option that opens a player run by another website
            inside Reel. Reel doesn't operate those sites. They have their own privacy practices and may set cookies or show ads. They load only
            when you choose to play something.
          </li>
          <li><strong>Links and sharing.</strong> Share buttons and links to IMDb or official sites contact those sites only when you click them.</li>
          <li><strong>AI assistants.</strong> If you connect one, it can see and change your list as described on the consent screen. Connect only assistants you trust.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="choices" title="Your choices">
        <LegalList>
          <li><strong>Export</strong> your list, ratings, progress and hidden titles as a JSON file in <Link to="/settings#data">Settings</Link>.</li>
          <li><strong>Delete</strong> your account and everything saved with it in <Link to="/settings#delete">Settings</Link>.</li>
          <li><strong>Guests</strong> can clear everything on their device in Settings, or by clearing site data in the browser.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions or concerns? Open an issue on{' '}
          <a href="https://github.com/omsingh02/reel/issues" target="_blank" rel="noopener noreferrer">GitHub</a>. For anything sensitive, use a{' '}
          <a href="https://github.com/omsingh02/reel/security/advisories/new" target="_blank" rel="noopener noreferrer">private security report</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
