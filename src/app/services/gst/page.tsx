import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Icon } from '@/components/ui';
import { ConsultButton } from '@/components/interaction';
import { ProgressiveConsultation } from '@/features/service-engine';
import s from '../../interior.module.css';

export const metadata: Metadata = {
  title: 'GST Registration & Compliance',
  description: 'Build a preliminary GST registration requirements brief and discuss the next step with GSTPIXEL.',
};

export default function GstService() {
  return <main id="main">
    <section className={s.serviceHero}><div className="wrap"><nav className={s.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><span aria-current="page">GST registration</span></nav><div className={s.serviceGrid}><div><div className="eyebrow">Business foundations / GST assistance</div><h1>Start with clarity.<br/><em>Review what matters.</em></h1><p>Build a preliminary requirements brief around your business activity, supply footprint, turnover range and structure. This is preparation for professional review, not a statutory determination or filing.</p><div className="actions"><a className="button primary" href="#registration-workspace">Build registration brief <span aria-hidden="true">↓</span></a><ButtonLink href="/tools/gst-calculator">Try the calculator</ButtonLink></div></div><aside className={s.serviceAside}><Icon name="document" boxed/><span className="eyebrow">The safe starting point</span><h2>Your answers.<br/><em>Context first.</em></h2><p>No sensitive document uploads. No automatic eligibility decisions. No application is submitted through this site.</p><ul><li>Answer one question at a time</li><li>Flag what needs clarification</li><li>Prepare for professional review</li></ul><span className="subtle-note">Registration requirements depend on facts, rules and exceptions that must be verified.</span></aside></div></div></section>
    <section className="section" id="registration-workspace"><div className="wrap"><ProgressiveConsultation /></div></section>
    <section className="section"><div className={`wrap ${s.twoColumns}`}><div><div className="eyebrow">After the brief</div><h2 className="section-title">Ready for a<br/><em>human review.</em></h2><p className={s.copy}>The brief helps organize the conversation. GSTPIXEL will verify the applicable registration requirement, documents, fees and timing before any agreed filing or assistance.</p></div><div className={s.resource}><Icon name="calculator" boxed/><h3>Need to work out the arithmetic?</h3><p>Use the GST calculator for inclusive or exclusive calculations. It does not determine legal obligations.</p><ButtonLink href="/tools/gst-calculator" primary>Open GST calculator</ButtonLink></div></div></section>
    <section className={s.serviceContact}><div className="wrap"><div className={s.serviceContactBox}><div><h2>Let’s understand<br/><em>your next step.</em></h2><p>Speak with Ashis Gurung, Business Consultant.</p></div><ConsultButton primary topic="your GST registration brief">Request consultation</ConsultButton></div></div></section>
  </main>;
}
