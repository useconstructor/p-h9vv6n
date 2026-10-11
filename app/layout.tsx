import type {Metadata} from 'next';
import localFont from 'next/font/local';
import './globals.css';
import {Header,Footer} from '@/components/shell';
const manrope=localFont({src:'./fonts/manrope.ttf',variable:'--font-manrope',display:'swap',weight:'700'});
const source=localFont({src:'./fonts/source-sans.ttf',variable:'--font-source',display:'swap',weight:'400'});
export const metadata:Metadata={title:{default:'Cumbre · Rutas que invitan a caminar',template:'%s · Cumbre'},description:'Explora cuatro viajes de montaña de ejemplo, compara su exigencia y guarda una solicitud de información. Marca ficticia, sin reservas ni contacto externo.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es" className={`${manrope.variable} ${source.variable}`}><body><a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-4">Saltar al contenido</a><Header/>{children}<Footer/></body></html>;}
