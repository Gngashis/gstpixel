import type { Metadata } from 'next';
import Link from 'next/link';
import { getServicesByCategory, serviceCategories } from '@/content/services';
import { Icon, SectionHeading, TextLink } from '@/components/ui';
import { LightCard, Reveal } from '@/components/interaction';
import s from '@/features/service-catalog.module.css';
import interior from '../interior.module.css';

export const metadata: Metadata = { title: 'Business registration & compliance services', description: 'Explore GSTPIXEL registration, licensing, tax compliance and secondary digital services.' };

export default function ServicesPage() {
  return <main id="main" className={s.page}><div className="wrap"><nav className={interior.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav><section className={s.intro}><div><div className="eyebrow">01 / Business support</div><h1>Registration clarity.<br/><em>Practical next steps.</em></h1><p>Start with business registration, government-registration assistance and ongoing compliance support. Digital services remain available when they are useful for the next stage.</p></div><div className={s.introAside}><div className="eyebrow">Scope is discussed individually</div><p>We help organize your context and questions. Eligibility, fees, filing dates, approval and authority outcomes require verified information and are never assumed here.</p></div></section><section className={s.catalog} aria-labelledby="catalog-title"><div id="catalog-title"><Reveal><SectionHeading number="02" label="Explore the catalogue" title={<>Find your<br/><em>starting point.</em></>} description="Choose the question closest to where your business is today."/></Reveal></div>{serviceCategories.map((category) => { const categoryServices = getServicesByCategory(category); if (!categoryServices.length) return null; return <section key={category} className={s.category} aria-labelledby={`category-${category}`}><div className={s.categoryHeader}><h2 id={`category-${category}`}>{category}</h2><span>{categoryServices.length} services</span></div><div className={s.catalogGrid}>{categoryServices.map((service,i)=><Reveal key={service.slug}><LightCard className={s.catalogCard}><div className={s.cardMeta}><Icon name={service.icon}/><span className={s.cardNumber}>0{i+1}</span></div><h3>{service.shortTitle}</h3><p>{service.proposition}</p><TextLink href={service.href || `/services/${service.slug}`}>Explore service</TextLink></LightCard></Reveal>)}</div></section>; })}</section></div></main>;
}
