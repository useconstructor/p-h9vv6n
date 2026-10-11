import 'server-only';
import {createClient, type Client} from '@libsql/client';
import {examples} from './seed';
import credits from '@/public/photo-credits.json';
import type {Trip,Stage} from './types';
let client:Client|undefined;
export function getDb(){
 if(!process.env.TURSO_DATABASE_URL)throw new Error('Database configuration unavailable');
 return client??=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
}
let initialization:Promise<void>|undefined;
export function initialize(){return initialization??=migrate().catch(e=>{initialization=undefined;throw e;});}
async function migrate(){
 const db=getDb(); const tx=await db.transaction('write');
 try{
 await tx.execute('PRAGMA foreign_keys = ON');
 await tx.execute('CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)');
 const migrated=await tx.execute('SELECT version FROM schema_migrations WHERE version=1');
 if(!migrated.rows.length){
 for(const sql of [
 `CREATE TABLE IF NOT EXISTS trips(id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, region TEXT NOT NULL, days INTEGER NOT NULL, difficulty TEXT NOT NULL, ascent INTEGER NOT NULL, season TEXT NOT NULL, description TEXT NOT NULL, preparation TEXT NOT NULL, image TEXT NOT NULL, image_alt TEXT NOT NULL, image_width INTEGER NOT NULL, image_height INTEGER NOT NULL, focal TEXT NOT NULL, mobile_focal TEXT NOT NULL, author TEXT NOT NULL, source TEXT NOT NULL, license TEXT NOT NULL, license_url TEXT NOT NULL, verified TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS trip_stages(id TEXT PRIMARY KEY, trip_id TEXT NOT NULL REFERENCES trips(id), stage_order INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, UNIQUE(trip_id,stage_order))`,
 `CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, trip_id TEXT NOT NULL REFERENCES trips(id), name TEXT NOT NULL, email TEXT NOT NULL, period TEXT, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, idempotency_key TEXT NOT NULL UNIQUE, session_hash TEXT NOT NULL, payload_hash TEXT NOT NULL)`,
 `CREATE INDEX IF NOT EXISTS inquiries_session ON inquiries(session_hash,created_at)`,
 `CREATE INDEX IF NOT EXISTS inquiries_trip ON inquiries(trip_id)`,
 `CREATE TABLE IF NOT EXISTS rate_limits(bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)`])await tx.execute(sql);
 for(const t of examples){const c=credits.find(c=>c.file===`/photos/${t.photo}.jpg`)!;
 await tx.execute({sql:`INSERT INTO trips VALUES (${Array(21).fill('?').join(',')})`,args:[t.id,t.slug,t.name,t.region,t.days,t.difficulty,t.ascent,t.season,t.description,t.preparation,c.file,`Paisaje de montaña ilustrativo para ${t.name}`,c.width,c.height,'50% 50%',t.id==='dolomitas'?'65% 50%':'50% 50%',c.author,c.source,c.license,c.licenseUrl,c.verified]});
 for(const [i,s] of t.stages.entries())await tx.execute({sql:'INSERT INTO trip_stages VALUES (?,?,?,?,?)',args:[`${t.id}-${i}`,t.id,i+1,s[0],s[1]]});
 }
 await tx.execute('INSERT INTO schema_migrations(version) VALUES(1)');
 }await tx.commit();
 }catch(e){await tx.rollback();throw e;}finally{tx.close();}
}
export async function getTrips(filters:Record<string,string>={}){await initialize();const where:string[]=[];const args:(string|number)[]=[];for(const [key,column]of [['region','region'],['difficulty','difficulty'],['days','days']])if(filters[key]){where.push(`${column}=?`);args.push(filters[key]);}const r=await getDb().execute({sql:'SELECT * FROM trips'+(where.length?' WHERE '+where.join(' AND '):'')+' ORDER BY rowid',args});return r.rows.map(row=>({...row})) as unknown as Trip[];}
export async function getTrip(slug:string){await initialize();const r=await getDb().execute({sql:'SELECT * FROM trips WHERE slug=?',args:[slug]});if(!r.rows[0])return null;const trip={...r.rows[0]} as unknown as Trip;const stages=await getDb().execute({sql:'SELECT id,title,description,stage_order FROM trip_stages WHERE trip_id=? ORDER BY stage_order',args:[trip.id]});return {trip,stages:stages.rows.map(row=>({...row})) as unknown as Stage[]};}
