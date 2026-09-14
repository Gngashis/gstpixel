'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConsultButton } from '@/components/interaction';
import { Arrow, ButtonLink, Icon } from '@/components/ui';
import { buildBusinessSupportBrief, type BusinessSupportAnswers } from './business-support-logic';
import { buildFormationBrief, type FormationAnswers } from './company-registration-logic';
import { buildFssaiBrief, type FssaiAnswers } from './fssai-logic';
import {
  buildGstReturnFilingBrief,
  buildRegistrationBrief,
  type GstReturnFilingAnswers,
  type RegistrationAnswers,
} from './service-engine-logic';
import { buildTradeLicenceBrief, type TradeLicenceAnswers } from './trade-license-logic';
import { buildUdyamMsmeBrief, type UdyamMsmeAnswers } from './udyam-msme-logic';
import s from './service-engine.module.css';

export type ServiceMode = 'gst' | 'company' | 'proprietorship' | 'partnership' | 'llp' | 'fssai' | 'gst-return-filing' | 'trade-license' | 'udyam-msme' | 'business-support';

type WorkflowAnswers = Record<string, string | undefined> & { readiness?: 'ready' | 'help' };
type WorkflowBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  nextSteps: string[];
  reviewItems: string[];
  structures?: string[];
};
type Question = { key: string; label: string; prompt: string; help?: string; options: string[] };
type WorkflowConfig = {
  questions: Question[];
  storageKey: string;
  title: string;
  intro: string;
  consultationTopic: string;
  summaryLabel: string;
  summaryEmphasis: string;
  summaryLead: string;
  disclaimer: string;
  includeReadiness?: boolean;
  readinessLabel?: string;
  buildBrief: (answers: WorkflowAnswers) => WorkflowBrief;
};

const gstQuestions: Question[] = [
  { key: 'activity', label: 'Business activity', prompt: 'What is your primary business activity?', options: ['Selling goods', 'Providing services', 'Both', "I'm not sure"] },
  { key: 'supply', label: 'Customer supply', prompt: 'Where does the business supply customers?', options: ['Primarily within one state', 'Across state borders', 'International customers', 'Multiple / not sure'] },
  { key: 'turnover', label: 'Turnover range', prompt: 'What is the approximate annual turnover range?', help: 'A factual range only. Turnover alone does not determine a GST requirement.', options: ['Not started / no turnover yet', 'Below ₹20 lakh', '₹20–50 lakh', 'Above ₹50 lakh', "I'm not sure"] },
  { key: 'structure', label: 'Business structure', prompt: 'What is the current business structure?', options: ['Proprietorship', 'Partnership', 'LLP', 'Company', 'Not registered / not sure'] },
  { key: 'clarification', label: 'Clarification', prompt: 'Is there anything else you want a professional to clarify?', help: 'Choosing “I’m not sure” keeps the brief moving.', options: ['I want help understanding the applicable requirement', 'I have a specific GST question', 'I’m not sure yet', 'Nothing else for now'] },
];

const formationQuestions: Question[] = [
  { key: 'founders', label: 'Founders / owners', prompt: 'How many founders or owners are involved?', options: ['Just me', 'Two or more', "I'm not sure"] },
  { key: 'activity', label: 'Business activity', prompt: 'What will the business do?', options: ['Selling goods', 'Providing services', 'Both', "I'm not sure"] },
  { key: 'investment', label: 'External investment', prompt: 'May external investment be sought?', help: 'This records your current intention only; it does not recommend a structure.', options: ['Yes', 'No', 'Possibly', "I'm not sure"] },
  { key: 'name', label: 'Proposed name', prompt: 'Do you have a proposed business name?', help: 'A name is noted for discussion only. Availability is never assumed.', options: ['I have a name to discuss', 'No name yet', "I'm not sure"] },
  { key: 'location', label: 'Operating location', prompt: 'Where will the business operate?', options: ['One state / location', 'Multiple locations', 'Online / location not settled', "I'm not sure"] },
  { key: 'existingEntity', label: 'Existing entity', prompt: 'Does an entity already exist?', options: ['No, this is new', 'Yes, an entity exists', 'Not sure'] },
];

const fssaiQuestions: Question[] = [
  { key: 'foodBusiness', label: 'Food business', prompt: 'What is the nature of the food business?', options: ['Manufacturing or processing', 'Restaurant, catering or food service', 'Retail, distribution or sale', 'Home-based or temporary activity', "I'm not sure"] },
  { key: 'location', label: 'Operating location', prompt: 'Where will the food activity operate?', options: ['One state / location', 'Multiple states', 'Online / location not settled', "I'm not sure"] },
  { key: 'footprint', label: 'Operating footprint', prompt: 'What best describes the operating footprint?', options: ['Single premises', 'Multiple premises', 'Mobile, temporary or shared premises', "I'm not sure"] },
  { key: 'turnover', label: 'Turnover band', prompt: 'What is the approximate annual turnover band?', help: 'A factual range only. Turnover alone does not determine licence classification or eligibility.', options: ['Not started / no turnover yet', 'Below a lower band', 'Within a middle band', 'Above a higher band', "I'm not sure"] },
  { key: 'entity', label: 'Business status', prompt: 'What is the current business or entity status?', options: ['Not started yet', 'Operating as an individual', 'An entity already exists', 'Not sure'] },
  { key: 'currentLicence', label: 'Existing FSSAI status', prompt: 'Does the business already hold an FSSAI registration or licence?', options: ['No, not yet', 'Yes, current details are available', 'Yes, but details need review', "I'm not sure"] },
];

const gstReturnFilingQuestions: Question[] = [
  { key: 'filingPeriod', label: 'Filing period', prompt: 'Which filing period do you want to discuss?', options: ['A recent month', 'A recent quarter', 'An annual filing period', 'Another period / not sure'] },
  { key: 'frequency', label: 'Filing frequency', prompt: 'What filing frequency are you currently following?', help: 'This records what you understand today. It does not determine the applicable return.', options: ['Monthly', 'Quarterly', 'Another frequency', "I'm not sure"] },
  { key: 'businessActivity', label: 'Business activity', prompt: 'What is the main business activity?', options: ['Selling goods', 'Providing services', 'Both', "I'm not sure"] },
  { key: 'salesType', label: 'Sales context', prompt: 'What best describes the sales records for this period?', options: ['Mainly business customers', 'Mainly individual customers', 'A mix of both', 'No sales recorded / not sure'] },
  { key: 'purchaseRecords', label: 'Purchase records', prompt: 'How ready are the purchase records for this period?', options: ['Organized and available', 'Partly organized', 'Not ready', "I'm not sure"] },
  { key: 'salesRecords', label: 'Sales records', prompt: 'How ready are the sales records for this period?', options: ['Organized and available', 'Partly organized', 'Not ready', "I'm not sure"] },
  { key: 'nilReturnExpectation', label: 'Nil return expectation', prompt: 'What is your current expectation for this filing period?', help: 'Your answer is recorded as context only. GSTPIXEL will not treat it as a filing conclusion.', options: ['I expect a Nil return', 'I do not expect a Nil return', "I'm not sure"] },
  { key: 'clarification', label: 'Clarification', prompt: 'What should a professional review first?', options: ['Which return applies', 'Missing or incomplete records', 'The filing position for this period', 'Everything / not sure'] },
];

const tradeLicenceQuestions: Question[] = [
  { key: 'primaryActivity', label: 'Primary activity', prompt: 'What is the main activity carried out by the business?', options: ['Retail or customer-facing sales', 'Office or professional services', 'Food, workshop or production activity', 'Another activity / not sure'] },
  { key: 'premisesUse', label: 'Premises use', prompt: 'How will the premises be used?', options: ['Customer-facing business premises', 'Office or administrative use', 'Storage, workshop or production use', 'Home-based, shared or not sure'] },
  { key: 'operatingLocation', label: 'Operating location', prompt: 'What best describes the operating location?', help: 'Share only broad location context here. The applicable local authority will be verified separately.', options: ['One identified local area', 'More than one location', 'Online with a physical operating base', 'Location not settled / not sure'] },
  { key: 'premisesStatus', label: 'Premises status', prompt: 'What is the current status of the premises?', options: ['Owned', 'Rented or leased', 'Shared or temporary', 'Not finalized / not sure'] },
  { key: 'existingPermissions', label: 'Existing permissions', prompt: 'What existing registration or permission context is available?', options: ['Some details are available', 'Nothing obtained yet', 'Existing details need review', "I'm not sure"] },
  { key: 'businessContext', label: 'Business context', prompt: 'What stage is the business at?', options: ['Planning to start', 'Setting up the premises', 'Already operating', 'Changing or expanding an activity'] },
  { key: 'clarification', label: 'Clarification needed', prompt: 'What needs clarification first?', options: ['Whether any local permission applies', 'Which authority or local area applies', 'Current or renewal context', 'Everything / not sure'] },
];

const udyamMsmeQuestions: Question[] = [
  { key: 'legalStructure', label: 'Legal structure', prompt: 'What is the current legal structure?', options: ['Proprietorship', 'Partnership or LLP', 'Company', 'Not formed / not sure'] },
  { key: 'panAvailability', label: 'PAN availability', prompt: 'Is the relevant PAN information available for review?', help: 'Do not enter a PAN number or upload an identity document here.', options: ['Available', 'Not available yet', 'Needs review', "I'm not sure"] },
  { key: 'gstStatus', label: 'GST status', prompt: 'What is the current GST registration status?', help: 'This answer does not determine whether GST registration is required.', options: ['Registered', 'Not registered', 'Application or status needs review', "I'm not sure"] },
  { key: 'primaryActivity', label: 'Primary activity', prompt: 'What is the main business activity?', options: ['Manufacturing or production', 'Services', 'Trading or mixed activity', 'Another activity / not sure'] },
  { key: 'turnoverEstimate', label: 'Turnover context', prompt: 'How would you describe the approximate turnover information available?', help: 'A broad readiness answer only. This workflow does not calculate an MSME classification.', options: ['Current figures are available', 'Only an estimate is available', 'Business has not started', "I'm not sure"] },
  { key: 'investmentEstimate', label: 'Investment context', prompt: 'How ready is the approximate investment information?', options: ['Current figures are available', 'Only an estimate is available', 'Not yet assessed', "I'm not sure"] },
  { key: 'clarification', label: 'Clarification needed', prompt: 'What should a professional review first?', options: ['Business activity mapping', 'Financial information', 'Registration or identity context', 'Everything / not sure'] },
];

const businessSupportQuestions: Question[] = [
  { key: 'businessStage', label: 'Business stage', prompt: 'Where is the business today?', options: ['Planning or setting up', 'Recently started', 'Already operating', 'Changing or expanding'] },
  { key: 'supportArea', label: 'Support area', prompt: 'What needs attention first?', options: ['Registration or licence questions', 'GST or filing organization', 'Business records and next actions', 'Several areas / not sure'] },
  { key: 'currentRegistrations', label: 'Current registrations', prompt: 'How clear is the current registration context?', options: ['Current details are available', 'Some details are available', 'Nothing arranged yet', "I'm not sure"] },
  { key: 'recordReadiness', label: 'Record readiness', prompt: 'How organized are the relevant business records?', options: ['Organized and available', 'Partly organized', 'Need help organizing', "I'm not sure"] },
  { key: 'recurringContext', label: 'Recurring support', prompt: 'What kind of ongoing support are you considering?', options: ['A one-time review', 'Regular check-ins', 'Help after a business change', 'Not sure yet'] },
  { key: 'preferredNextStep', label: 'Preferred next step', prompt: 'What would be most useful next?', options: ['A focused consultation', 'A prioritized action list', 'Review of an existing question', 'Help deciding where to start'] },
  { key: 'clarification', label: 'Clarification needed', prompt: 'What should the first review clarify?', options: ['The most urgent practical action', 'Which service area applies', 'What information to prepare', 'Everything / not sure'] },
];

const workflowConfigs: Record<ServiceMode, WorkflowConfig> = {
  gst: { questions: gstQuestions, storageKey: 'gstpixel-gst-registration-brief-v1', title: 'registration brief.', intro: 'Five focused questions, followed by a readiness check. Your answers stay in this browser and shape a discussion brief.', consultationTopic: 'your GST registration brief', summaryLabel: 'GST registration brief', summaryEmphasis: 'Not a filing.', summaryLead: 'Your answers are organized for a professional conversation. GSTPIXEL will verify the applicable registration position before any agreed action.', disclaimer: 'Not a statutory determination, application or approval promise.', includeReadiness: true, buildBrief: (answers) => buildRegistrationBrief(answers as RegistrationAnswers) },
  company: { questions: formationQuestions, storageKey: 'gstpixel-company-registration-brief-v1', title: 'formation brief.', intro: 'Six factual questions and a readiness check prepare a business-formation conversation.', consultationTopic: 'your business formation brief', summaryLabel: 'Business formation brief', summaryEmphasis: 'Not an incorporation.', summaryLead: 'Your answers are organized for a professional conversation. No structure, eligibility or filing outcome is assumed.', disclaimer: 'Not a structure recommendation, incorporation or approval promise.', includeReadiness: true, buildBrief: (answers) => buildFormationBrief(answers as FormationAnswers) },
  proprietorship: { questions: formationQuestions, storageKey: 'gstpixel-proprietorship-brief-v1', title: 'formation brief.', intro: 'Six factual questions and a readiness check prepare a proprietorship and structure discussion.', consultationTopic: 'your proprietorship registration brief', summaryLabel: 'Proprietorship discussion brief', summaryEmphasis: 'Not a structure decision.', summaryLead: 'Your answers are organized for professional review. The brief does not assume that proprietorship is the suitable structure.', disclaimer: 'Not a structure recommendation, registration or approval promise.', includeReadiness: true, buildBrief: (answers) => buildFormationBrief(answers as FormationAnswers) },
  partnership: { questions: formationQuestions, storageKey: 'gstpixel-partnership-brief-v1', title: 'formation brief.', intro: 'Six factual questions and a readiness check prepare a partnership and structure discussion.', consultationTopic: 'your partnership registration brief', summaryLabel: 'Partnership discussion brief', summaryEmphasis: 'Not a structure decision.', summaryLead: 'Your answers are organized for professional review. The brief does not assume that partnership is the suitable structure.', disclaimer: 'Not a structure recommendation, registration or approval promise.', includeReadiness: true, buildBrief: (answers) => buildFormationBrief(answers as FormationAnswers) },
  llp: { questions: formationQuestions, storageKey: 'gstpixel-llp-registration-brief-v1', title: 'formation brief.', intro: 'Six factual questions and a readiness check prepare an LLP and structure discussion.', consultationTopic: 'your LLP registration brief', summaryLabel: 'LLP discussion brief', summaryEmphasis: 'Not an incorporation.', summaryLead: 'Your answers are organized for professional review. The brief does not assume that LLP is the suitable structure.', disclaimer: 'Not a structure recommendation, incorporation or approval promise.', includeReadiness: true, buildBrief: (answers) => buildFormationBrief(answers as FormationAnswers) },
  fssai: { questions: fssaiQuestions, storageKey: 'gstpixel-fssai-brief-v1', title: 'food brief.', intro: 'Six factual questions and a readiness check prepare a food-licence conversation.', consultationTopic: 'your FSSAI requirements brief', summaryLabel: 'FSSAI / food licence brief', summaryEmphasis: 'Not a licence decision.', summaryLead: 'Your answers are organized for a professional conversation. No classification, eligibility or approval outcome is assumed.', disclaimer: 'Not a classification, application or approval promise.', includeReadiness: true, buildBrief: (answers) => buildFssaiBrief(answers as FssaiAnswers) },
  'gst-return-filing': { questions: gstReturnFilingQuestions, storageKey: 'gstpixel-gst-return-filing-brief-v1', title: 'filing brief.', intro: 'Eight factual questions organize the filing period and record-readiness context for review.', consultationTopic: 'your GST return filing brief', summaryLabel: 'GST return filing brief', summaryEmphasis: 'Not a submitted return.', summaryLead: 'Your filing context is organized for professional review. No return type, liability, deadline or filing outcome is assumed.', disclaimer: 'Not a tax conclusion, return submission or government acknowledgement.', buildBrief: (answers) => buildGstReturnFilingBrief(answers as GstReturnFilingAnswers) },
  'trade-license': { questions: tradeLicenceQuestions, storageKey: 'gstpixel-trade-license-brief-v1', title: 'trade licence brief.', intro: 'Seven factual questions and a readiness check organize your activity, premises and location context.', consultationTopic: 'your trade licence requirements brief', summaryLabel: 'Trade licence brief', summaryEmphasis: 'Not a licence decision.', summaryLead: 'This brief organizes the business activity, premises and location context for professional or regulatory review. It does not determine whether a licence is required or identify the applicable authority.', disclaimer: 'Not a decision about licence need, authority, eligibility or approval.', includeReadiness: true, readinessLabel: 'Information readiness', buildBrief: (answers) => buildTradeLicenceBrief(answers as TradeLicenceAnswers) },
  'udyam-msme': { questions: udyamMsmeQuestions, storageKey: 'gstpixel-udyam-msme-brief-v1', title: 'Udyam / MSME brief.', intro: 'Seven factual questions and a readiness check organize the business context for review.', consultationTopic: 'your Udyam or MSME registration brief', summaryLabel: 'Udyam / MSME brief', summaryEmphasis: 'Not a classification.', summaryLead: 'Your answers are organized for professional review. Approximate inputs do not determine MSME classification, GST applicability or eligibility.', disclaimer: 'Not a classification, eligibility decision or registration submission.', includeReadiness: true, readinessLabel: 'Information readiness', buildBrief: (answers) => buildUdyamMsmeBrief(answers as UdyamMsmeAnswers) },
  'business-support': { questions: businessSupportQuestions, storageKey: 'gstpixel-business-support-brief-v1', title: 'support brief.', intro: 'Seven focused questions and a readiness check organize the business situation without making compliance conclusions.', consultationTopic: 'your ongoing business support brief', summaryLabel: 'Business support brief', summaryEmphasis: 'Not a compliance decision.', summaryLead: 'Your current situation is organized into a clear starting point for professional review and an agreed next action.', disclaimer: 'Not a compliance conclusion, monitoring service or filing submission.', includeReadiness: true, readinessLabel: 'Information readiness', buildBrief: (answers) => buildBusinessSupportBrief(answers as BusinessSupportAnswers) },
};

function restoredStep(answers: WorkflowAnswers, config: WorkflowConfig) {
  const firstMissing = config.questions.findIndex(({ key }) => !answers[key]);
  if (firstMissing >= 0) return firstMissing;
  if (config.includeReadiness && !answers.readiness) return config.questions.length;
  return config.questions.length + (config.includeReadiness ? 1 : 0);
}

export function ProgressiveConsultation({ mode = 'gst' }: { mode?: ServiceMode }) {
  const config = workflowConfigs[mode];
  const [answers, setAnswers] = useState<WorkflowAnswers>({});
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const skipNextSave = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const total = config.questions.length + (config.includeReadiness ? 1 : 0);
  const complete = step >= total;
  const brief = useMemo(() => config.buildBrief(answers), [answers, config]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid local draft');
        const storedRecord = parsed as Record<string, unknown>;
        const restoredAnswers = storedRecord.answers && typeof storedRecord.answers === 'object'
          ? storedRecord.answers as WorkflowAnswers
          : storedRecord as WorkflowAnswers;
        const storedStep = typeof storedRecord.step === 'number' ? storedRecord.step : restoredStep(restoredAnswers, config);
        setAnswers(restoredAnswers);
        setStep(Math.max(0, Math.min(storedStep, total)));
        setSaved(true);
      }
    } catch {}
    setHydrated(true);
  }, [config, total]);

  useEffect(() => {
    if (!hydrated) return;
    titleRef.current?.focus();
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (step === 0 && Object.keys(answers).length === 0) return;
    try {
      localStorage.setItem(config.storageKey, JSON.stringify({ answers, step }));
      setSaved(true);
    } catch {}
  }, [answers, config.storageKey, hydrated, step]);

  function choose(value: string) {
    const key = config.questions[step]?.key;
    if (!key) return;
    setAnswers((current) => ({ ...current, [key]: value }));
    setNotice('');
    setStep((current) => current + 1);
  }

  function chooseReadiness(value: 'ready' | 'help') {
    setAnswers((current) => ({ ...current, readiness: value }));
    setStep(total);
  }

  function reset() {
    skipNextSave.current = true;
    setAnswers({});
    setStep(0);
    setSaved(false);
    setNotice('Your local draft was cleared.');
    try { localStorage.removeItem(config.storageKey); } catch {}
  }

  const currentQuestion = config.questions[step];
  const stepDisplay = String(Math.min(step + 1, total)).padStart(2, '0');
  const totalDisplay = String(total).padStart(2, '0');

  return <section className={s.workspace} aria-labelledby="workflow-title">
    <aside className={s.context}>
      <span className="eyebrow">Progressive consultation</span>
      <h2 id="workflow-title">Build a<br /><em>{config.title}</em></h2>
      <p>{config.intro}</p>
      <div className={s.contextNote}><Icon name="shield" /><strong>Preliminary requirements brief</strong><span>{config.disclaimer}</span></div>
      <div className={s.contactSnippet}><span className="eyebrow">Human review</span><p>When you are ready, discuss the brief with Ashis Gurung, Business Consultant.</p><ConsultButton topic={config.consultationTopic}>Request consultation</ConsultButton></div>
      <Link className={s.backLink} href="/services">← Back to services</Link>
    </aside>
    <div className={s.activePane}>
      <div className={s.paneTop}><span>{complete ? 'Brief compiled' : `${stepDisplay} / ${totalDisplay}`}</span><span>{saved ? 'Saved locally' : 'Browser only'}</span></div>
      <div className={s.progress}><span style={{ width: `${complete ? 100 : (step / total) * 100}%` }} /></div>
      {!complete && currentQuestion && <div className={s.questionPane}>
        <span className={s.questionLabel}>{currentQuestion.label}</span>
        <h3 tabIndex={-1} ref={titleRef}>{currentQuestion.prompt}</h3>
        {currentQuestion.help && <p className={s.help}>{currentQuestion.help}</p>}
        <div className={s.optionList} role="group" aria-label={currentQuestion.prompt}>
          {currentQuestion.options.map((option) => <button type="button" key={option} className={s.option} onClick={() => choose(option)}>{option}<Arrow /></button>)}
        </div>
        {step > 0 && <button type="button" className={s.backButton} onClick={() => setStep((current) => current - 1)}>← Previous question</button>}
      </div>}
      {!complete && config.includeReadiness && step === config.questions.length && <div className={s.questionPane}>
        <span className={s.questionLabel}>{config.readinessLabel || 'Document readiness'}</span>
        <h3 tabIndex={-1} ref={titleRef}>How ready are the basic details?</h3>
        <p className={s.help}>This is a readiness check only. Do not enter identity numbers or upload PAN, Aadhaar, bank or other sensitive documents here.</p>
        <div className={s.readiness}><button type="button" className={s.option} onClick={() => chooseReadiness('ready')}>I have the details ready <Arrow /></button><button type="button" className={s.option} onClick={() => chooseReadiness('help')}>I need help preparing <Arrow /></button></div>
        <button type="button" className={s.backButton} onClick={() => setStep((current) => current - 1)}>← Previous question</button>
      </div>}
      {complete && <BriefSummary brief={brief} config={config} mode={mode} onReset={reset} />}
      <div className={s.live} aria-live="polite">{notice || (complete ? `${config.summaryLabel} ready for professional review.` : `Step ${Math.min(step + 1, total)} of ${total}`)}</div>
    </div>
  </section>;
}

function BriefSummary({ brief, config, mode, onReset }: { brief: WorkflowBrief; config: WorkflowConfig; mode: ServiceMode; onReset: () => void }) {
  return <div className={s.summary} aria-labelledby="brief-summary-title">
    <span className="eyebrow">{config.summaryLabel} / Review</span>
    <h3 id="brief-summary-title">A clear starting point.<br /><em>{config.summaryEmphasis}</em></h3>
    <p className={s.summaryLead}>{config.summaryLead}</p>
    <div className={s.summaryGrid}><div><h4>Information supplied</h4><dl>{brief.answers.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div><div>{brief.structures && <><h4>Discussion points</h4><ul>{brief.structures.map((item) => <li key={item}>{item}</li>)}</ul></>}<h4>Likely next steps</h4><ol>{brief.nextSteps.map((item) => <li key={item}>{item}</li>)}</ol><h4>Professional review required</h4><ul>{brief.reviewItems.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
    <div className={s.summaryActions}><ConsultButton primary topic={config.consultationTopic}>Request professional review</ConsultButton>{(mode === 'gst' || mode === 'gst-return-filing') && <ButtonLink href="/tools/gst-calculator">Open GST calculator</ButtonLink>}<button type="button" className={s.reset} onClick={onReset}>Start a new brief</button></div>
    {brief.uncertain.length > 0 && <p className={s.uncertain}>Needs clarification: {brief.uncertain.join(' · ')}</p>}
  </div>;
}
