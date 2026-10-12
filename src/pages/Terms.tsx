import { Link } from 'react-router-dom';
import { LegalList, LegalPage, LegalSection } from '@/components/account/LegalPage';

const sections = [
  { id: 'using', title: 'Using Reel' },
  { id: 'account', title: 'Your account' },
  { id: 'content', title: 'Content and data' },
  { id: 'players', title: 'Third-party players' },
  { id: 'warranty', title: 'No warranty' },
  { id: 'changes', title: 'Changes and ending the service' },
  { id: 'contact', title: 'Contact' },
];

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of use"
      description="The ground rules for using Reel, written to be read."
      path="/terms"
      updated="2026-10-09"
      sections={sections}
    >
      <LegalSection id="using" title="Using Reel">
        <p>
          Reel is a personal tool for keeping track of films and shows. Use it for yourself, don't misuse it
          (for example by overloading it, scraping it, or trying to get into other people's data), and follow the law where you live.
        </p>
      </LegalSection>

      <LegalSection id="account" title="Your account">
        <p>
          An account is optional. If you make one, keep your password safe; you're responsible for what happens under your account.
          You can delete it at any time in <Link to="/settings#delete">Settings</Link>, which also deletes everything saved with it.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Content and data">
        <p>
          Film and TV information, images and artwork belong to TMDB and the respective rights holders. They are shown here for
          identification and are not owned by Reel. Your own list, ratings and notes are yours. Reel's code is open source under the MIT licence.
        </p>
      </LegalSection>

      <LegalSection id="players" title="Third-party players">
        <p>
          Some titles can open a video player run by another website. Reel doesn't host, store or control that content or those sites.
          Whether and how you use them is up to you, and you're responsible for making sure that it's lawful where you are. Their own terms
          and privacy practices apply.
        </p>
      </LegalSection>

      <LegalSection id="warranty" title="No warranty">
        <LegalList>
          <li>Reel is provided <strong>as is</strong>, without promises that it will always work, be accurate or be available.</li>
          <li>Release dates, availability and other catalogue data can be wrong or out of date.</li>
          <li>To the fullest extent the law allows, the people who run Reel aren't liable for losses that come from using it. Keep a copy of anything you can't afford to lose (you can export it from Settings).</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="changes" title="Changes and ending the service">
        <p>
          Reel may change, and could be paused or shut down. If these terms change in a way that matters, the date at the top of this page changes with them.
          Using Reel after a change means you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions? Open an issue on <a href="https://github.com/omsingh02/reel/issues" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
