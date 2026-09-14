import type {Metadata} from 'next';
import {LaunchPlanner} from '@/features/launch-planner';
export const metadata:Metadata={title:'Start your business',description:'A private, step-by-step business launch planner.'};
export default function StartBusinessPage(){return <main id="main"><LaunchPlanner/></main>}
