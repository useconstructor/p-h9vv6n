import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {cookies} from 'next/headers';
import {getDb,initialize} from '@/lib/db';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function POST(req:Request){
 const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==req.headers.get('host'))return Response.json({error:'Origen de solicitud no permitido.'},{status:403});
 let raw:Record<string,unknown>;try{if(Number(req.headers.get('content-length'))>24000)throw new Error();raw=await req.json();if(!raw||Array.isArray(raw)||typeof raw!=='object')throw new Error();}catch{return Response.json({error:'La solicitud no tiene un formato válido.'},{status:400});}
 const fields:Record<string,string>={};const errors:Record<string,string>={};
 for(const [key,max]of Object.entries({name:120,email:254,tripId:120,period:120,message:4000})){if(typeof raw[key]!=='string'){if(key!=='period')errors[key]='Completa este campo.';fields[key]='';continue;}fields[key]=(raw[key] as string).trim().replace(key==='message'?/[^\S\n]+/g:/\s+/g,' ');if(!fields[key]&&key!=='period')errors[key]='Completa este campo.';if(fields[key].length>max)errors[key]=`Máximo ${max} caracteres.`;}
 fields.email=fields.email.toLowerCase();if(fields.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))errors.email='Introduce un correo electrónico válido.';
 const key=req.headers.get('idempotency-key')||'';if(!/^[a-f0-9-]{36}$/i.test(key))return Response.json({error:'La clave de solicitud no es válida.'},{status:400});
 if(Object.keys(errors).length)return Response.json({errors,error:'Revisa los campos indicados.'},{status:422});
 if(raw.website)return Response.json({error:'No se pudo procesar la solicitud.'},{status:422});
 try{
 await initialize();const db=getDb();const jar=await cookies();const existingToken=jar.get('cumbre_session')?.value;const token=existingToken&&/^[a-f0-9]{64}$/.test(existingToken)?existingToken:randomBytes(32).toString('hex');const sessionHash=hash(token);const payloadHash=hash(JSON.stringify(fields));const tx=await db.transaction('write');let reference:string;
 try{
 const exists=await tx.execute({sql:'SELECT reference,session_hash,payload_hash FROM inquiries WHERE idempotency_key=?',args:[key]});
 if(exists.rows[0]){if(exists.rows[0].session_hash!==sessionHash||exists.rows[0].payload_hash!==payloadHash){await tx.rollback();return Response.json({error:'Esta clave ya corresponde a otra solicitud. Reabre el formulario.'},{status:409});}reference=String(exists.rows[0].reference);}
 else{
 const trip=await tx.execute({sql:'SELECT id FROM trips WHERE id=?',args:[fields.tripId]});if(!trip.rows.length){await tx.rollback();return Response.json({errors:{tripId:'El viaje seleccionado ya no está disponible.'}},{status:422});}
 const now=Date.now();const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';const buckets=[`session:${sessionHash}:${Math.floor(now/3600000)}`,`network:${hash(ip)}:${Math.floor(now/3600000)}`];
 for(const [i,bucket]of buckets.entries()){const rate=await tx.execute({sql:'SELECT count FROM rate_limits WHERE bucket=?',args:[bucket]});if(Number(rate.rows[0]?.count||0)>=(i===0?5:20)){await tx.rollback();return Response.json({error:'Has enviado varias solicitudes. Inténtalo de nuevo dentro de una hora.'},{status:429,headers:{'Retry-After':'3600'}});}await tx.execute({sql:'INSERT INTO rate_limits(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1',args:[bucket,now+3600000]});}
 reference='CUMBRE-'+randomBytes(5).toString('hex').toUpperCase();await tx.execute({sql:'INSERT INTO inquiries(id,reference,trip_id,name,email,period,message,idempotency_key,session_hash,payload_hash) VALUES(?,?,?,?,?,?,?,?,?,?)',args:[randomUUID(),reference,fields.tripId,fields.name,fields.email,fields.period||null,fields.message,key,sessionHash,payloadHash]});
 }await tx.commit();
 }catch(e){await tx.rollback();throw e;}finally{tx.close();}
 jar.set('cumbre_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});
 return Response.json({reference,receiptUrl:'/comprobante'},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'No pudimos guardar tu solicitud. Conservamos tus datos para que puedas reintentar.'},{status:503});}
}

export async function GET(){const jar=await cookies();if(!jar.get('cumbre_session'))jar.set('cumbre_session',randomBytes(32).toString('hex'),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});return Response.json({ready:true},{headers:{'Cache-Control':'no-store'}});}
