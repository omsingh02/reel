import { Link } from 'react-router-dom';
import { LegalList, LegalPage, LegalSection } from '@/components/account/LegalPage';

const sections = [
  { id: 'what', title: 'What Reel is' },
  { id: 'how', title: 'How it works' },
  { id: 'data', title: 'Your data' },
  { id: 'assistants', title: 'Connecting an assistant' },
  { id: 'credits', title: 'Credits' },
];

export default function About() {
  return (
    <LegalPage
      eyebrow="About"
      title="About Reel"
      description="A quiet place to keep track of the films and shows you watch."
      path="/about"
      sections={sections}
    >
      <LegalSection id="what" title="What Reel is">
        <p>
          Reel keeps track of what you watch. Save what you want to see, mark what you've seen, rate it out of ten,
          tick off episodes as you go, and see what's coming next. It's built as a personal tool first: quick, calm, and yours.
        </p>
      </LegalSection>

      <LegalSection id="how" title="How it works">
        <LegalList>
          <li><strong>Discover and search.</strong> Catalogue data and images come from TMDB.</li>
          <li><strong>My List.</strong> Mark titles <em>to watch</em> or <em>watched</em>, rate them 1 to 10, and set the date you watched them.</li>
          <li><strong>Episodes.</strong> Tick episodes off one by one or a season at a time. Finish the last aired episode and the show is marked watched.</li>
          <li><strong>Upcoming.</strong> Release dates and next-episode air dates for the titles in your list.</li>
          <li><strong>Stats.</strong> Titles watched, hours, movies against shows, your average rating and your favourite decades.</li>
          <li><strong>Where to watch.</strong> Streaming, rental and purchase options by region, from JustWatch through TMDB.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="data" title="Your data">
        <p>
          You don't need an account. Without one, your list lives in this browser and nothing is sent anywhere. If you create an
          account, your list is stored with it so you can use Reel on every device, and anything you saved as a guest is moved over
          when you sign in. You can export everything or delete your account at any time in <Link to="/settings">Settings</Link>.
          The <Link to="/privacy">privacy notice</Link> has the details.
        </p>
      </LegalSection>

      <LegalSection id="assistants" title="Connecting an assistant">
        <p>
          Reel can work with AI assistants that support the Model Context Protocol (MCP). Once you connect one, you can ask it to search
          for a title, add it to your list, mark it watched or rate it. Nothing is connected unless you approve it on a consent screen
          that shows what the assistant will be able to do. Setup instructions are in the project's README on GitHub.
        </p>
      </LegalSection>

      <LegalSection id="credits" title="Credits">
        <LegalList>
          <li>
            Film and TV data and images from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
            This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by JustWatch.
          </li>
          <li>Typefaces: Fraunces, Instrument Sans and IBM Plex Mono, all open source.</li>
          <li>
            Reel is open source (MIT). The code is at{' '}
            <a href="https://github.com/omsingh02/reel" target="_blank" rel="noopener noreferrer">github.com/omsingh02/reel</a>,
            where you can also report a problem or suggest something.
          </li>
        </LegalList>
      </LegalSection>
    </LegalPage>
  );
}
