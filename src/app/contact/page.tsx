import type { Metadata } from 'next';
import Link from 'next/link';
import { LightCard, Reveal } from '@/components/interaction';
import { ButtonLink, Icon, SectionHeading } from '@/components/ui';
import s from '../company-pages.module.css';

export const metadata: Metadata = {
  title: 'Contact GSTPIXEL',
  description: 'Contact Ashis Gurung at GSTPIXEL to discuss business registration, compliance or digital support.',
};

const contactMethods = [
  {
    label: 'WhatsApp',
    value: '+91 90465 20548',
    href: 'https://wa.me/919046520548?text=Hello%20GSTPIXEL%2C%20I%20want%20to%20discuss%20my%20business%20needs.',
    note: 'Fastest direct message',
  },
  {
    label: 'India · Primary',
    value: '+91 90465 20548',
    href: 'tel:+919046520548',
    note: 'Call from your phone',
  },
  {
    label: 'India · Alternate',
    value: '+91 81160 76725',
    href: 'tel:+918116076725',
    note: 'Alternate phone line',
  },
  {
    label: 'Bhutan contact',
    value: '+975 77260538',
    href: 'tel:+97577260538',
    note: 'Call from your phone',
  },
  {
    label: 'Email',
    value: 'bentraders7@gmail.com',
    href: 'mailto:bentraders7@gmail.com?subject=GSTPIXEL%20consultation',
    note: 'Opens your email app',
  },
];

export default function ContactPage() {
  return (
    <main id="main" className={s.page}>
      <section className={`${s.hero} ${s.contactHero}`}>
        <div className="wrap">
          <nav className={s.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Contact</span>
          </nav>
          <div className={s.contactHeroGrid}>
            <div className={s.heroCopy}>
              <div className="eyebrow">Contact GSTPIXEL</div>
              <h1>Start with<br /><em>a conversation.</em></h1>
              <p>Tell Ashis Gurung what you are working on, what stage you are at and where you need clarity. Choose the contact route that is easiest for you.</p>
            </div>
            <aside className={s.contactIntro}>
              <span className={s.initials} aria-hidden="true">AG</span>
              <div>
                <strong>Ashis Gurung</strong>
                <span>Business Consultant</span>
              </div>
              <p>No documents are requested or uploaded on this page.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="01"
              label="Direct contact"
              title={<>Choose one<br /><em>simple route.</em></>}
              description="Phone and email links open the matching app on your device."
            />
          </Reveal>
          <div className={s.contactGrid}>
            {contactMethods.map((method, index) => (
              <Reveal key={method.label}>
                <LightCard className={s.contactCard}>
                  <span className={s.cardNumber}>0{index + 1}</span>
                  <span className={s.contactLabel}>{method.label}</span>
                  <a href={method.href} className={s.contactValue}>{method.value}</a>
                  <span className={s.contactNote}>{method.note}<span aria-hidden="true">↗</span></span>
                </LightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.visitSection} section`}>
        <div className={`wrap ${s.visitGrid}`}>
          <Reveal>
            <div>
              <div className="eyebrow">02 / Business details</div>
              <h2 className="section-title">Know who<br /><em>you’re speaking with.</em></h2>
              <p className={s.sectionLead}>Use these details when you need to identify GSTPIXEL or discuss an in-person visit.</p>
            </div>
          </Reveal>
          <Reveal>
            <LightCard className={s.addressCard}>
              <Icon name="briefcase" boxed />
              <div>
                <span className={s.contactLabel}>Address</span>
                <address>Ramgaon, Near Anthony School,<br />Jaigaon – 736182</address>
              </div>
              <div className={s.identityRow}>
                <span>Business identifier</span>
                <strong>GSTIN 19ESPPG2569P1ZP</strong>
              </div>
              <a className={s.inlineCall} href="tel:+919046520548">Call before visiting <span aria-hidden="true">↗</span></a>
            </LightCard>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className={`wrap ${s.prepareGrid}`}>
          <Reveal>
            <div className={s.prepareHeading}>
              <div className="eyebrow">03 / Before you contact us</div>
              <h2 className="section-title">A few details make<br /><em>the first conversation easier.</em></h2>
            </div>
          </Reveal>
          <ol className={s.prepareList}>
            <li><span>01</span><div><h3>What your business does</h3><p>A plain-language description is enough to begin.</p></div></li>
            <li><span>02</span><div><h3>Where you operate</h3><p>Share the city, state or country relevant to your question.</p></div></li>
            <li><span>03</span><div><h3>What you need help with</h3><p>Name the registration, compliance or digital question you want to discuss.</p></div></li>
            <li><span>04</span><div><h3>What remains uncertain</h3><p>It is fine to say that you are unsure. Those points can be flagged for review.</p></div></li>
          </ol>
        </div>
      </section>

      <section className={s.contactClosing}>
        <div className="wrap">
          <Reveal>
            <div className={s.closingBox}>
              <div>
                <div className="eyebrow">Your next step</div>
                <h2>Need help choosing<br /><em>the right service?</em></h2>
                <p>Use the guided business planner or browse the compliance-first service catalogue.</p>
              </div>
              <div className="actions">
                <ButtonLink href="/start-business" primary>Start business planner</ButtonLink>
                <ButtonLink href="/services">Browse services</ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
