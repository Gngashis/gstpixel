'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConsultButton } from '@/components/interaction';
import { Arrow, ButtonLink, Icon } from '@/components/ui';
import s from './service-engine.module.css';
import { buildRegistrationBrief, type RegistrationAnswers, type RegistrationBrief } from './service-engine-logic';

type Question = {
  key: keyof RegistrationAnswers;
  label: string;
  prompt: string;
  help?: string;
  options: string[];
};

const questions: Question[] = [
  { key: 'activity', label: 'Business activity', prompt: 'What is your primary business activity?', options: ['Selling goods', 'Providing services', 'Both', "I'm not sure"] },
  { key: 'supply', label: 'Customer supply', prompt: 'Where does the business supply customers?', options: ['Primarily within one state', 'Across state borders', 'International customers', 'Multiple / not sure'] },
  { key: 'turnover', label: 'Turnover range', prompt: 'What is the approximate annual turnover range?', help: 'A factual range only. Turnover alone does not determine a GST requirement.', options: ['Not started / no turnover yet', 'Below ₹20 lakh', '₹20–50 lakh', 'Above ₹50 lakh', "I'm not sure"] },
  { key: 'structure', label: 'Business structure', prompt: 'What is the current business structure?', options: ['Proprietorship', 'Partnership', 'LLP', 'Company', 'Not registered / not sure'] },
  { key: 'clarification', label: 'Clarification', prompt: 'Is there anything else you want a professional to clarify?', help: 'Optional. Choosing “I’m not sure” keeps the brief moving.', options: ['I want help understanding the applicable requirement', 'I have a specific GST question', 'I’m not sure yet', 'Nothing else for now'] },
];

const storageKey = 'gstpixel-gst-registration-brief-v1';

export function ProgressiveConsultation() {
  const [answers, setAnswers] = useState<RegistrationAnswers>({});
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const total = questions.length + 1;
  const complete = step >= total;
  const brief = useMemo(() => buildRegistrationBrief(answers), [answers]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setAnswers(JSON.parse(stored) as RegistrationAnswers);
    } catch {}
  }, []);

  useEffect(() => {
    titleRef.current?.focus();
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
      setSaved(true);
    } catch {}
  }, [answers, step]);

  function choose(value: string) {
    const key = questions[step]?.key;
    if (key) {
      setAnswers((current) => ({ ...current, [key]: value }));
      setNotice('');
      setStep((current) => current + 1);
    }
  }

  function chooseReadiness(value: 'ready' | 'help') {
    setAnswers((current) => ({ ...current, readiness: value }));
    setStep(total);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setNotice('Your local draft was cleared.');
    try { localStorage.removeItem(storageKey); } catch {}
  }

  return <section className={s.workspace} aria-labelledby="registration-workspace-title">
    <aside className={s.context}>
      <span className="eyebrow">Progressive consultation</span>
      <h2 id="registration-workspace-title">Build a<br /><em>registration brief.</em></h2>
      <p>Five focused questions, followed by a readiness check. Your answers stay in this browser and are used to shape a discussion brief.</p>
      <div className={s.contextNote}><Icon name="shield" /><strong>Preliminary requirements brief</strong><span>Not a statutory determination, application or approval promise.</span></div>
      <div className={s.contactSnippet}><span className="eyebrow">Human review</span><p>When you are ready, discuss the brief with Ashis Gurung, Business Consultant.</p><ConsultButton topic="your GST registration brief">Request consultation</ConsultButton></div>
      <Link className={s.backLink} href="/services">← Back to services</Link>
    </aside>
    <div className={s.activePane}>
      <div className={s.paneTop}><span>{complete ? 'Brief compiled' : `0${Math.min(step + 1, total)} / 0${total}`}</span><span>{saved ? 'Saved locally' : 'Browser only'}</span></div>
      <div className={s.progress}><span style={{ width: `${complete ? 100 : (step / total) * 100}%` }} /></div>
      {!complete && step < questions.length && <div className={s.questionPane}>
        <span className={s.questionLabel}>{questions[step].label}</span>
        <h3 tabIndex={-1} ref={titleRef}>{questions[step].prompt}</h3>
        {questions[step].help && <p className={s.help}>{questions[step].help}</p>}
        <div className={s.optionList} role="group" aria-label={questions[step].prompt}>
          {questions[step].options.map((option) => <button type="button" key={option} className={s.option} onClick={() => choose(option)}>{option}<Arrow /></button>)}
        </div>
        {step > 0 && <button type="button" className={s.backButton} onClick={() => setStep((current) => current - 1)}>← Previous question</button>}
      </div>}
      {!complete && step === questions.length && <div className={s.questionPane}>
        <span className={s.questionLabel}>Document readiness</span>
        <h3 tabIndex={-1} ref={titleRef}>How ready are the basic details?</h3>
        <p className={s.help}>This is a readiness check only. Do not upload Aadhaar, PAN scans, bank statements or other sensitive documents here.</p>
        <div className={s.readiness}><button type="button" className={s.option} onClick={() => chooseReadiness('ready')}>I have these ready <Arrow /></button><button type="button" className={s.option} onClick={() => chooseReadiness('help')}>I need help preparing them <Arrow /></button></div>
        <button type="button" className={s.backButton} onClick={() => setStep((current) => current - 1)}>← Previous question</button>
      </div>}
      {complete && <BriefSummary brief={brief} onReset={reset} />}
      <div className={s.live} aria-live="polite">{notice || (complete ? 'Registration brief ready for professional review.' : `Step ${Math.min(step + 1, total)} of ${total}`)}</div>
    </div>
  </section>;
}

function BriefSummary({ brief, onReset }: { brief: RegistrationBrief; onReset: () => void }) {
  return <div className={s.summary} aria-labelledby="brief-summary-title">
    <span className="eyebrow">Registration brief / Review</span>
    <h3 id="brief-summary-title">A clear starting point.<br /><em>Not a filing.</em></h3>
    <p className={s.summaryLead}>Your answers are organized below for a professional conversation. GSTPIXEL will verify the applicable registration requirement before filing.</p>
    <div className={s.summaryGrid}><div><h4>Answers supplied</h4><dl>{brief.answers.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div><div><h4>Likely next steps</h4><ol>{brief.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol><h4>Professional review required</h4><ul>{brief.reviewItems.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
    <div className={s.summaryActions}><ConsultButton primary topic="your GST registration brief">Submit for professional review</ConsultButton><ButtonLink href="/tools/gst-calculator">Open GST calculator</ButtonLink><button type="button" className={s.reset} onClick={onReset}>Start a new brief</button></div>
    {brief.uncertain.length > 0 && <p className={s.uncertain}>Needs clarification: {brief.uncertain.join(' · ')}</p>}
  </div>;
}
