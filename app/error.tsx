'use client';
import {RotateCcw} from 'lucide-react';
export default function Error({reset}:{reset:()=>void}){return <main id="contenido" className="page-width py-16"><h1 className="text-[32px] font-bold md:text-4xl">No pudimos cargar esta página.</h1><p className="mt-4 text-muted-foreground">Se ha producido un error temporal. Puedes reintentar sin perder tus datos guardados.</p><button onClick={reset} className="primary-link mt-6">Reintentar<RotateCcw size={18}/></button></main>;}
