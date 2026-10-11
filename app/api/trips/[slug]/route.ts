import {getTrip} from '@/lib/db';
export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){try{const data=await getTrip((await params).slug);return data?Response.json(data):Response.json({error:'Este viaje no existe.'},{status:404});}catch{return Response.json({error:'No pudimos cargar el viaje.'},{status:503});}}
