import Image from 'next/image';
import {Suspense} from 'react';
import {ArrowRight} from 'lucide-react';
import {getTrips} from '@/lib/db';
import type {Trip} from '@/lib/types';
import {Catalog} from '@/components/catalog';
import credits from '@/public/photo-credits.json';
export const dynamic='force-dynamic';
export default async function Home(){
 let trips:Trip[]=[];let error=false;try{trips=await getTrips();}catch{error=true;}const hero=credits.find(c=>c.file==='/photos/4.jpg')!;
 return <main id="contenido">
  <section className="page-width hero-section">
   <div className="hero-panel">
    <div className="hero-copy">
     <p className="hero-motto">Menos prisa. Más montaña.</p>
     <h1>Tu próximo<br/>horizonte.</h1>
     <p className="hero-proposition">Explora rutas de montaña, compara su exigencia y solicita información sobre tu recorrido.</p>
     <a href="#viajes" className="primary-link">Explorar viajes<ArrowRight size={19}/></a>
     <svg aria-hidden="true" viewBox="0 0 600 500" preserveAspectRatio="none" className="hero-topography">
      <path className="topo-line" d="M-60 450C60 310 12 180 145 100S295 220 330 295 395 390 475 290 505 150 660 190"/>
      <path className="topo-line" d="M-50 478C90 338 42 207 160 132S275 233 310 319 414 420 501 317 533 179 660 218"/>
      <path className="topo-line" d="M-40 506C120 366 72 235 175 164S255 246 290 343 433 450 527 344 561 208 660 246"/>
      <path className="topo-line" d="M-30 534C150 394 102 263 190 196S235 259 270 367 452 480 553 371 589 237 660 274"/>
     </svg>
    </div>
    <div className="hero-landscape">
     <Image src={hero.file} alt="Cumbres nevadas del Mont Blanc y del Mont Blanc du Tacul" fill priority quality={90} sizes="(min-width:768px) 60vw, 100vw" className="object-cover object-[50%_42%]"/>
     <div className="landscape-caption"><span>Horizonte alpino</span><span>Mont Blanc</span></div>
    </div>
   </div>
   <div className="hero-credit"><details><summary>Fotografía y licencia</summary><p>Fotografía ilustrativa de <a href={hero.source} target="_blank" rel="noreferrer" className="underline">{hero.author}</a> · <a href={hero.licenseUrl} target="_blank" rel="noreferrer" className="underline">{hero.license}</a>. Recorte de visualización; original sin modificaciones. No representa un itinerario verificado.</p></details></div>
  </section>
  <Suspense fallback={<div className="page-width h-96 animate-pulse bg-secondary"/>}><Catalog initialTrips={trips} initialError={error}/></Suspense>
  <section id="como-funciona" className="how-section">
   <div className="page-width"><div className="how-intro"><h2>Del camino a los detalles.</h2><p>Cómo solicitar información y conservar tu comprobante privado.</p></div>
    <ol className="how-steps">{[
     {title:'Encuentra tu ruta',text:'Filtra por región, duración y dificultad. Revisa las etapas y la preparación recomendada.'},
     {title:'Cuéntanos qué buscas',text:'Abre la ficha y completa tus datos, tu periodo de interés y tus preguntas.'},
     {title:'Conserva tu comprobante',text:'La solicitud queda guardada de forma privada. Puedes consultarla en este navegador después de recargar.'}
    ].map((s,i)=><li key={s.title}><span className="step-label">Paso {i+1}</span><h3>{s.title}</h3><p>{s.text}</p></li>)}</ol>
    <p className="how-note">Guardar una solicitud no confirma disponibilidad ni reserva un viaje. No se envían mensajes externos ni se garantiza una respuesta.</p>
   </div>
  </section>
 </main>;
}
