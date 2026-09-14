import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink, Icon } from '@/components/ui';
import { ConsultButton, LightCard, Reveal } from '@/components/interaction';
import { allServices, getService, services } from '@/content/services';
import s from '@/features/service-catalog.module.css';
import interior from '../../interior.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: 'Service not found' };
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const related = service.relatedSlugs.map((relatedSlug) => allServices.find((item) => item.slug === relatedSlug)).filter(Boolean);

  return <main id="main" className={s.detail}>
    <section className={s.detailHero}><div className="wrap">
      <nav className={interior.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><span aria-current="page">{service.shortTitle}</span></nav>
      <div className={s.detailHeroGrid}><div><div className="eyebrow">{service.kicker}</div><h1>{service.title}</h1><p className={s.lead}>{service.proposition}</p><div className="actions"><ConsultButton primary topic={service.consultationTopic}>Discuss your needs</ConsultButton><ButtonLink href="/services">All services</ButtonLink></div></div><aside className={s.heroCard}><Icon name={service.icon} boxed/><h2>Start with<br/><em>your context.</em></h2><p>{service.summary}</p></aside></div>
    </div></section>
    <section className={s.detailSection}><div className={`wrap ${s.detailGrid}`}><div><div className="eyebrow">01 / Your intent</div><h2>Start with the<br/><em>right question.</em></h2><p>{service.customerIntent}</p><p className={s.scopeNote}>{service.nextStep}</p></div><div><h3 className={s.subheading}>Useful information to discuss</h3><ul className={s.checkList}>{service.informationToCollect.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
    <section className={`${s.detailSection} ${s.alt}`}><div className={`wrap ${s.detailGrid}`}><div><div className="eyebrow">02 / Preparation</div><h2>Bring the<br/><em>useful basics.</em></h2><p>These are neutral placeholders for a consultation. Confirm the current official requirements before relying on any checklist.</p></div><div><h3 className={s.subheading}>Generic document checklist</h3><ul className={s.checkList}>{service.documentChecklist.map((item) => <li key={item}>{item}</li>)}</ul><p className="subtle-note">No documents are uploaded, stored or submitted by this prototype.</p></div></div></section>
    <section className={s.detailSection}><div className={`wrap ${s.detailGrid}`}><div><div className="eyebrow">03 / A considered process</div><h2>From question<br/><em>to next move.</em></h2><p>{service.prepare}</p></div><ol className={s.stepList}>{service.steps.map((step, i) => <li key={step.title}><span>0{i + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></li>)}</ol></div></section>
    <section className={`${s.detailSection} ${s.alt}`}><div className={`wrap ${s.detailGrid}`}><div><div className="eyebrow">04 / Related support</div><h2>Keep the<br/><em>journey connected.</em></h2><p>These services may be relevant, but the right combination depends on your circumstances and verified information.</p></div><div className={s.relatedList}>{related.map((item) => item && <Link key={item.slug} href={item.href || `/services/${item.slug}`}><span>{item.category}</span><strong>{item.shortTitle}</strong><span aria-hidden="true">↗</span></Link>)}</div></div></section>
    <section className={s.detailSection}><div className={`wrap ${s.detailGrid}`}><div><div className="eyebrow">05 / Next step</div><h2>Discuss your<br/><em>context.</em></h2><p>{service.nextStep}</p></div><Reveal><LightCard className={s.prep}><Icon name="briefcase" boxed/><h3>A conversation built around you.</h3><p>Scope, fees and timing are confirmed individually before any work begins. No outcome is guaranteed.</p><ConsultButton primary topic={service.consultationTopic}>Get consultation</ConsultButton></LightCard></Reveal></div></section>
    <section className={interior.serviceContact}><div className="wrap"><div className={interior.serviceContactBox}><div><h2>Let’s understand<br/><em>your next step.</em></h2><p>Start with a focused conversation about {service.consultationTopic}.</p></div><ConsultButton primary topic={service.consultationTopic}>Get consultation</ConsultButton></div></div></section>
  </main>;
}
