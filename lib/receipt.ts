import 'server-only';
import {cookies} from 'next/headers';
import {createHash} from 'node:crypto';
import {getDb,initialize} from './db';
import type {Receipt} from './types';
export async function getReceipt(){const token=(await cookies()).get('cumbre_session')?.value;if(!token)return null;await initialize();const r=await getDb().execute({sql:'SELECT i.reference,i.name,i.email,i.period,i.message,i.created_at,t.name AS trip_name FROM inquiries i JOIN trips t ON t.id=i.trip_id WHERE session_hash=? ORDER BY i.rowid DESC LIMIT 1',args:[createHash('sha256').update(token).digest('hex')]});return (r.rows[0] as unknown as Receipt)||null;}
