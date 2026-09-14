'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { ButtonLink, TextLink } from './ui';
import s from './intent-pathway.module.css';

type Pathway = {
  label: string;
  stage: string;
  title: string;
  copy: string;
  steps: string[];
  href: string;
  action: string;
  secondary?: { href: string; label: string };
};

const pathways: Pathway[] = [
  {
    label: 'Start a business', stage: 'START', title: 'Give your idea a clear beginning.',
    copy: 'Turn an early ambition into practical foundations, with the right questions answered first.',
    steps: ['Clarify your business idea and structure.', 'Map the registrations and essentials.', 'Set a considered first plan in motion.'],
    href: '/start-business', action: 'Explore starting a business',
  },
  {
    label: 'Get compliant', stage: 'COMPLY', title: 'Find a clearer path through compliance.',
    copy: 'Understand the GST and business obligations that apply to you, then move ahead with confidence.',
    steps: ['Identify the registrations you need.', 'Prepare the right information and documents.', 'Work through the next compliance step.'],
    href: '/services/gst', action: 'Explore GST support', secondary: { href: '/services/fssai', label: 'Explore FSSAI support' },
  },
  {
    label: 'Build online', stage: 'BUILD', title: 'Create a digital home with purpose.',
    copy: 'Shape a website or app around what your customers need to understand and do next.',
    steps: ['Define the audience and outcome.', 'Shape the right digital scope.', 'Build an experience that feels like yours.'],
    href: '/services/web-development', action: 'Explore web development', secondary: { href: '/services/app-development', label: 'Explore app development' },
  },
  {
    label: 'Grow my business', stage: 'GROW', title: 'Help the right people find you.',
    copy: 'Connect your business with thoughtful digital marketing built around a clear, useful message.',
    steps: ['Understand your audience and goals.', 'Choose the channels that fit.', 'Build momentum with consistent work.'],
    href: '/services/digital-marketing', action: 'Explore digital marketing',
  },
];

export function IntentPathway() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectPathway = (index: number, focus = false) => {
    setActive(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next = active;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % pathways.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (active - 1 + pathways.length) % pathways.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = pathways.length - 1;
    const isNavigationKey = event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End';
    if (isNavigationKey) event.preventDefault();
    if (next !== active) {
      selectPathway(next, true);
    }
  };

  return (
    <section className={s.section} id="pathways" aria-labelledby="pathways-title">
      <div className="wrap">
        <div className={s.intro}>
          <div className="eyebrow">A clear next step</div>
          <h2 id="pathways-title">What do you want to <em>achieve?</em></h2>
        </div>
        <div className={s.pathway}>
          <div className={s.tabs} role="tablist" aria-label="Choose your next step">
            {pathways.map((item, index) => {
              const selected = index === active;
              return <button
                key={item.stage}
                ref={(element) => { tabRefs.current[index] = element; }}
                className={`${s.tab} ${selected ? s.selected : ''}`}
                id={`pathway-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`pathway-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectPathway(index)}
                onKeyDown={handleKeyDown}
              ><span>{item.stage}</span>{item.label}</button>;
            })}
          </div>
          <div className={s.panelStack}>
            {pathways.map((item, index) => <div className={s.panel} role="tabpanel" id={`pathway-panel-${index}`} aria-labelledby={`pathway-tab-${index}`} tabIndex={0} hidden={index !== active} key={item.stage}>
              <div className={s.panelCopy}>
                <span className={s.stage}>{item.stage}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
              <ol className={s.steps}>
                {item.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <div className={s.actions}>
                <ButtonLink href={item.href} primary>{item.action}</ButtonLink>
                {item.secondary && <TextLink href={item.secondary.href}>{item.secondary.label}</TextLink>}
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
