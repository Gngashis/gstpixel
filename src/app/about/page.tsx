import type { Metadata } from 'next';
import Link from 'next/link';
import { LightCard, Reveal } from '@/components/interaction';
import { ButtonLink, Icon, SectionHeading, TextLink } from '@/components/ui';
import s from '../company-pages.module.css';

export const metadata: Metadata = {
  title: 'About GSTPIXEL',
  description: 'Meet Ashis Gurung and learn how GSTPIXEL approaches business registration, compliance and digital support.',
};

const principles = [
  {
    number: '01',
    title: 'Start with context',
    copy: 'Your activity, location, business stage and open questions shape the conversation from the beginning.',
  },
  {
    number: '02',
    title: 'Make the next step clear',
    copy: 'Complex requirements are organized into a useful brief before scope, timing or action is discussed.',
  },
  {
    number: '03',
    title: 'Keep decisions accountable',
    copy: 'Regulatory requirements and authority outcomes are checked for the relevant circumstances rather than assumed.',
  },
];

export default function AboutPage() {
  return (
    <main id="main" className={s.page}>
      <section className={s.hero}>
        <div className="wrap">
          <nav className={s.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About</span>
          </nav>
          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <div className="eyebrow">About GSTPIXEL</div>
              <h1>Business clarity.<br /><em>Human guidance.</em></h1>
              <p>GSTPIXEL is a compliance-first business services platform for people working through registration, licensing, recurring compliance and the digital steps that follow.</p>
              <div className="actions">
                <ButtonLink href="/services" primary>Explore services</ButtonLink>
                <ButtonLink href="/contact">Contact GSTPIXEL</ButtonLink>
              </div>
            </div>
            <aside className={s.statement} aria-label="GSTPIXEL approach">
              <span className={s.statementMark} aria-hidden="true">G<span /></span>
              <div className="eyebrow">The working principle</div>
              <p>Start right.<br />Stay compliant.<br /><em>Grow online.</em></p>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="01"
              label="How we work"
              title={<>Clarity before<br /><em>complexity.</em></>}
              description="A focused process keeps the conversation useful while leaving regulatory conclusions to verified review."
            />
          </Reveal>
          <div className={s.principleGrid}>
            {principles.map((principle) => (
              <Reveal key={principle.number}>
                <LightCard className={s.principleCard}>
                  <span>{principle.number}</span>
                  <h2>{principle.title}</h2>
                  <p>{principle.copy}</p>
                </LightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.consultant} section`}>
        <div className={`wrap ${s.consultantGrid}`}>
          <Reveal>
            <div className={s.monogramPanel} aria-hidden="true">
              <span>AG</span>
              <i />
              <small>GSTPIXEL</small>
            </div>
          </Reveal>
          <Reveal>
            <div className={s.consultantCopy}>
              <div className="eyebrow">02 / Your business consultant</div>
              <h2>Ashis<br /><em>Gurung.</em></h2>
              <p className={s.role}>BUSINESS CONSULTANT · GSTPIXEL</p>
              <p>Begin with what your business does, where it operates and the decision you are trying to make. The aim is to organize that context into a practical next step for discussion or review.</p>
              <TextLink href="/contact">Choose how to get in touch</TextLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className={`wrap ${s.scopeGrid}`}>
          <Reveal>
            <div>
              <div className="eyebrow">03 / Connected support</div>
              <h2 className="section-title">From foundation<br /><em>to what follows.</em></h2>
              <p className={s.sectionLead}>The service journey begins with business setup and compliance. Website, app and digital support remain available when those foundations are ready.</p>
            </div>
          </Reveal>
          <div className={s.scopeList}>
            <Reveal>
              <article>
                <Icon name="shield" boxed />
                <div><h3>Registration & compliance</h3><p>GST, FSSAI, trade licence, Udyam/MSME, business registration and ongoing support.</p></div>
              </article>
            </Reveal>
            <Reveal>
              <article>
                <Icon name="website" boxed />
                <div><h3>Digital Studio</h3><p>Website, app and digital work shaped around a clear business purpose.</p></div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={s.boundary}>
        <div className="wrap">
          <Reveal>
            <div className={s.boundaryBox}>
              <Icon name="document" boxed />
              <div>
                <div className="eyebrow">A clear boundary</div>
                <h2>Preparation supports the decision.</h2>
                <p>GSTPIXEL can help organize your circumstances and questions. Eligibility, authority, fees, deadlines, document requirements and approval depend on current verified information for your situation.</p>
              </div>
              <ButtonLink href="/start-business">Plan my next step</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
