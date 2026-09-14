import Link from 'next/link';
import type { ReactNode } from 'react';
import s from './ui.module.css';
export function Arrow({down=false}:{down?:boolean}){return <span className={s.arrow} aria-hidden="true">{down?'↓':'↗'}</span>}
export function ButtonLink({href,children,primary=false,small=false}:{href:string;children:ReactNode;primary?:boolean;small?:boolean}){return <Link href={href} className={`${s.button} ${primary?s.primary:''} ${small?s.small:''}`}>{children}<Arrow/></Link>}
export function TextLink({href,children}:{href:string;children:ReactNode}){return <Link className={s.textLink} href={href}>{children}<Arrow/></Link>}
export type IconName='document'|'website'|'phone'|'growth'|'briefcase'|'launch'|'calculator'|'arrow'|'shield';
const paths:Record<IconName,ReactNode>={
 document:<><path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h7M8 16h5"/></>,
 website:<><rect x="2" y="3" width="20" height="15" rx="2"/><path d="M2 7h20M8 22h8M12 18v4m-3-12-3 3 3 3m6-6 3 3-3 3"/></>,
 phone:<><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 18h2"/></>,
 growth:<><path d="M3 20h18M5 16v-4m7 4V8m7 8V3M4 8l7-4 4 2 5-4"/></>,
 briefcase:<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12l9 4 9-4M10 13h4"/></>,
 launch:<><path d="m12 3 9 6-9 6-9-6 9-6Zm-9 12 9 6 9-6M3 12l9 6 9-6"/></>,
 calculator:<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h1m3 0h1m3 0h.1M8 14h1m3 0h1m3 0h.1M8 18h1m3 0h1m3 0h.1"/></>,
 arrow:<path d="M5 19 19 5M5 5h14v14"/>,
 shield:<path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Zm-4 9 3 3 5-5"/>,
};
export function Icon({name,boxed=false}:{name:IconName;boxed?:boolean}){const icon=<svg className={s.icon} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;return boxed?<span className={s.iconBox}>{icon}</span>:icon}
export function SectionHeading({number,label,title,description}:{number:string;label:string;title:ReactNode;description?:string}){return <div className="section-heading"><div><div className="eyebrow">{number} / {label}</div><h2 className="section-title">{title}</h2></div>{description&&<p>{description}</p>}</div>}
