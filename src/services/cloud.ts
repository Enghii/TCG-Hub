import { Card, CollectionItem, Language, Region, TcgId } from '@/src/types';

export type CloudSession = { accessToken: string; refreshToken: string; expiresAt: number; user: { id: string; email: string } };
export type BackupPayload = { selectedTcg: TcgId | null; language: Language; region: Region; collection: CollectionItem[]; wishlist: string[]; savedCards: Card[]; schemaVersion: 1 };
const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, ''); const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const isCloudConfigured = Boolean(url && anonKey);

function requireConfig() { if (!url || !anonKey) throw new Error('Sincronização ainda não configurada.'); return { url, anonKey }; }
async function jsonRequest(path: string, init: RequestInit = {}) { const config = requireConfig(); const response = await fetch(`${config.url}${path}`, { ...init, headers: { apikey: config.anonKey, 'Content-Type': 'application/json', ...init.headers } }); const body = response.status === 204 ? null : await response.json().catch(() => null); if (!response.ok) throw new Error(body?.msg ?? body?.message ?? body?.error_description ?? `Erro ${response.status}`); return body; }
function toSession(body: any): CloudSession { return { accessToken: body.access_token, refreshToken: body.refresh_token, expiresAt: body.expires_at ? body.expires_at * 1000 : Date.now() + (body.expires_in ?? 3600) * 1000, user: { id: body.user.id, email: body.user.email ?? '' } }; }
export async function signIn(email: string, password: string) { return toSession(await jsonRequest('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) })); }
export async function signUp(email: string, password: string) { const body = await jsonRequest('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) }); return body.access_token ? toSession(body) : null; }
export async function refreshSession(refreshToken: string) { return toSession(await jsonRequest('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) })); }
export async function pushBackup(session: CloudSession, payload: BackupPayload) { await jsonRequest('/rest/v1/user_backups?on_conflict=user_id', { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: session.user.id, payload, updated_at: new Date().toISOString() }) }); }
export async function pullBackup(session: CloudSession): Promise<{ payload: BackupPayload; updated_at: string } | null> { const rows = await jsonRequest(`/rest/v1/user_backups?user_id=eq.${encodeURIComponent(session.user.id)}&select=payload,updated_at`, { headers: { Authorization: `Bearer ${session.accessToken}` } }); return rows?.[0] ?? null; }
