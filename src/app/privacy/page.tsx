import type { Metadata } from 'next';
import Link from 'next/link';
import s from '../company-pages.module.css';

export const metadata: Metadata = {
  title: 'Privacy Notice — Review Draft',
  description: 'Privacy Notice — Review Draft for GSTPIXEL.',
};

export default function PrivacyPage() {
  return (
    <main id="main" className={s.page}>
      <section className={s.hero}>
        <div className="wrap">
          <nav className={s.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Privacy</span>
          </nav>
          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <div className="eyebrow">Privacy</div>
              <h1>Privacy Notice<br /><em>— Review Draft</em></h1>
              <p>This conservative draft describes the current GSTPIXEL preview. It is not a final legal notice and needs professional review before publication.</p>
            </div>
            <aside className={s.statement} aria-label="GSTPIXEL privacy boundary">
              <div className="eyebrow">Current product boundary</div>
              <p>No accounts.<br />No uploads.<br /><em>No production database.</em></p>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={s.scopeGrid}>
            <div>
              <div className="eyebrow">01 / What this preview does</div>
              <h2 className="section-title">Local tools.<br /><em>Clear limits.</em></h2>
            </div>
            <div className={s.scopeList}>
              <article><div><h3>Information you choose to provide</h3><p>The site does not require an account, collect payment, accept uploads or operate a client workspace. If you contact GSTPIXEL directly by phone or email, you voluntarily choose what to share.</p></div></article>
              <article><div><h3>Browser-local storage</h3><p>Some guided tools may save a draft in your browser so you can resume locally. This existing browser-local storage is not a server account or production database.</p></div></article>
              <article><div><h3>Use professional review</h3><p>Tool results and service information are starting points only. Professional review is needed for your circumstances, requirements, fees, timelines and any authority decision.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className={`${s.visitSection} section`}>
        <div className="wrap">
          <div className={s.boundaryBox}>
            <div>
              <div className="eyebrow">02 / Please protect sensitive information</div>
              <h2>Do not send sensitive documents through unverified channels.</h2>
              <p>Do not send PAN, Aadhaar, bank credentials or sensitive documents through this preview or an unverified contact channel. No automated government submission, public AI service or security guarantee is provided here.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={s.scopeGrid}>
            <div>
              <div className="eyebrow">03 / Privacy contact</div>
              <h2 className="section-title">Questions about<br /><em>this draft?</em></h2>
            </div>
            <div>
              <p className={s.sectionLead}>For privacy questions or corrections, contact GSTPIXEL at <a href="mailto:bentraders7@gmail.com">bentraders7@gmail.com</a>. GSTPIXEL is represented here by Ashis Gurung, Business Consultant.</p>
              <p className={s.sectionLead}>Business contact details: India +91 90465 20548 and +91 81160 76725; Bhutan +975 77260538; Ramgaon, Near Anthony School, Jaigaon – 736182; GSTIN 19ESPPG2569P1ZP.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
