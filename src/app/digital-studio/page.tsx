import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Icon, SectionHeading } from '@/components/ui';
import { ConsultButton, LightCard, Reveal } from '@/components/interaction';
import { StudioPreview } from '@/components/studio-preview';
import s from './digital-studio.module.css';
import interior from '../interior.module.css';

export const metadata: Metadata = {
  title: 'Digital Studio',
  description: 'Secondary website, app and digital-product consultation from GSTPIXEL.',
};

const offerings = [
  { icon: 'website' as const, title: 'Website development', copy: 'Clear, responsive digital homes for businesses that need their offer and next step to be understood.' },
  { icon: 'phone' as const, title: 'App development', copy: 'Focused mobile or web experiences shaped around a useful customer or operational journey.' },
  { icon: 'briefcase' as const, title: 'Digital-product consultation', copy: 'A practical conversation to frame the problem, prioritize the first version and identify the right questions.' },
];

export default function DigitalStudioPage() {
  return <main id="main" className={s.page}>
    <section className={s.hero}><div className="wrap">
      <nav className={interior.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Digital Studio</span></nav>
      <div className={s.heroGrid}><div><div className="eyebrow">Secondary service / Digital Studio</div><h1>Useful digital work.<br/><em>Thoughtfully shaped.</em></h1><p className={s.lead}>When your business foundation is ready, GSTPIXEL can help shape a website, app or digital product around the people who will use it.</p><div className="actions"><ConsultButton primary topic="a digital studio project">Request a consultation</ConsultButton><ButtonLink href="/services">Explore primary services</ButtonLink></div></div><aside className={s.heroAside}><Icon name="website" boxed/><span className="eyebrow">A focused starting point</span><h2>Clarity before<br/><em>complexity.</em></h2><p>No invented packages, prices or delivery promises. Scope is discussed around your actual need.</p></aside></div>
    </div></section>
    <section className="section"><div className="wrap"><Reveal><SectionHeading number="01" label="What the studio can explore" title={<>Digital support for<br/><em>the next stage.</em></>} description="Digital work is secondary to the business foundations. These are the conversations available when the timing is right."/></Reveal><div className={s.offerGrid}>{offerings.map((item) => <LightCard key={item.title} className={s.offer}><Icon name={item.icon}/><h2>{item.title}</h2><p>{item.copy}</p></LightCard>)}</div></div></section>
    <section className={`${s.scope} section`}><div className={`wrap ${s.scopeGrid}`}><div><div className="eyebrow">02 / Scope builder</div><h2>Bring the brief.<br/><em>Shape the scope.</em></h2><p> A guided website and app scope-builder is the next useful layer. For now, start with the essentials in a consultation: who it is for, what it should help them do and what the first version must include.</p><div className={s.placeholder}><span className="badge">V1 foundation</span><strong>Scope-builder entry point</strong><span>Describe your audience, purpose, pages or journeys, and the questions still open.</span></div><ConsultButton topic="a digital product scope">Discuss a digital scope</ConsultButton></div><div className={s.preview}><StudioPreview/></div></div></section>
    <section className="section"><div className={`wrap ${s.nextGrid}`}><div><div className="eyebrow">03 / A useful next step</div><h2>Start with what<br/><em>the work needs.</em></h2><p>Share the context you are comfortable discussing. Scope, fees, timing and any technical decisions are confirmed individually before work begins.</p></div><Reveal><LightCard className={s.nextCard}><Icon name="arrow" boxed/><h3>Primary business support comes first.</h3><p>Need registration, GST, FSSAI, licensing or compliance assistance? Return to the main service catalogue.</p><div className={s.cardActions}><ButtonLink href="/services" small>View services</ButtonLink><ConsultButton small topic="your business and digital needs">Request consultation</ConsultButton></div></LightCard></Reveal></div></section>
  </main>;
}
