import { Card, TcgId } from '@/src/types';
import { searchCatalog } from '@/src/services/catalog';

type Detection = { name: string; set?: string; number?: string; confidence?: number; quantity?: number };
export type ScanMatch = { detection: Detection; card: Card | null; selected: boolean; quantity: number };
export const scannerConfigured = Boolean(process.env.EXPO_PUBLIC_CARD_SCANNER_URL || process.env.EXPO_PUBLIC_SUPABASE_URL);

export async function scanCards(tcgId: TcgId, imageBase64: string, accessToken?: string): Promise<ScanMatch[]> {
  const endpoint = process.env.EXPO_PUBLIC_CARD_SCANNER_URL ?? (process.env.EXPO_PUBLIC_SUPABASE_URL ? `${process.env.EXPO_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/scan-cards` : undefined);
  if (!endpoint) throw new Error('O scanner inteligente ainda não foi publicado no servidor. O Deck Builder já pode ser usado pela busca do catálogo.');
  if (!accessToken) throw new Error('Entre em sua conta para usar o scanner inteligente.');
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ tcgId, imageBase64, maxCards: 10 }) });
  const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error ?? `Falha no scanner (${response.status}).`);
  const detections: Detection[] = (body?.cards ?? []).slice(0, 10); const matches: ScanMatch[] = [];
  for (const detection of detections) { const result = await searchCatalog(tcgId, detection.name); const normalized = detection.name.toLowerCase(); const card = result.cards.find((item) => item.name.toLowerCase() === normalized && (!detection.number || item.number === detection.number)) ?? result.cards[0] ?? null; matches.push({ detection, card, selected: Boolean(card), quantity: Math.max(1, detection.quantity ?? 1) }); }
  return matches;
}
