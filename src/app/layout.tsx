import type {Metadata} from 'next';
import {Inter,Cormorant_Garamond} from 'next/font/google';
import {Header} from '@/components/navigation';import {Footer} from '@/components/footer';import {ConsultationProvider} from '@/components/interaction';
import './globals.css';
const inter=Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
const display=Cormorant_Garamond({subsets:['latin'],weight:['400','500'],style:['normal','italic'],variable:'--font-display',display:'swap'});
export const metadata:Metadata={title:{default:'GSTPIXEL — Business & Digital Solutions',template:'%s | GSTPIXEL'},description:'Business setup, GST and compliance assistance, website and app development, and digital growth. Explore GSTPIXEL.',robots:{index:false,follow:false},icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${display.variable}`}><body><a className="skip-link" href="#main">Skip to content</a><ConsultationProvider><Header/>{children}<Footer/></ConsultationProvider></body></html>}
