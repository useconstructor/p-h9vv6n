import {getTrips} from '@/lib/db';
export async function GET(req:Request){try{const p=new URL(req.url).searchParams;return Response.json(await getTrips(Object.fromEntries(p)),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'No pudimos cargar los viajes. Vuelve a intentarlo.'},{status:503});}}
