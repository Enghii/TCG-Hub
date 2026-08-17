import { cards as localCards } from '@/src/data/catalog';
import { Card, TcgId } from '@/src/types';

const cache = new Map<string, Card>(localCards.map((card) => [card.id, card]));
const USER_AGENT = 'TCG-Hub/0.1 (https://github.com/Enghii/TCG-Hub)';
const USD_TO_BRL_ESTIMATE = 5.5;

type SearchResult = { cards: Card[]; source: Card['source']; notice?: string };
export function getCachedCard(id: string) { return cache.get(id) ?? localCards.find((card) => card.id === id); }
export function rememberCards(items: Card[]) { items.forEach((card) => { cache.set(card.id, card); if (!localCards.some((saved) => saved.id === card.id)) localCards.push(card); }); return items; }
export function hydrateCatalog(items: Array<{ cardSnapshot?: Card }>) { rememberCards(items.map((item) => item.cardSnapshot).filter((card): card is Card => Boolean(card))); }
function fallback(tcgId: TcgId, notice: string): SearchResult { return { cards: rememberCards(localCards.filter((card) => card.tcgId === tcgId)), source: 'local', notice }; }
async function requestJson(url: string, headers?: Record<string, string>) { const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, ...headers } }); if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }

export async function searchCatalog(tcgId: TcgId, query = ''): Promise<SearchResult> {
  try {
    if (tcgId === 'magic') return await searchMagic(query);
    if (tcgId === 'pokemon') return await searchPokemon(query);
    if (tcgId === 'riftbound') return await searchRiftbound(query);
    return fallback(tcgId, 'Este catálogo ainda usa os dados demonstrativos.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido';
    return fallback(tcgId, `Catálogo online indisponível (${message}). Exibindo dados salvos no aplicativo.`);
  }
}

async function searchMagic(query: string): Promise<SearchResult> {
  const expression = query.trim() ? query.trim() : 'game:paper';
  const json = await requestJson(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(expression)}&order=released&dir=desc`, { 'User-Agent': USER_AGENT });
  const mapped: Card[] = (json.data ?? []).slice(0, 40).map((item: any) => { const usd = Number(item.prices?.usd ?? item.prices?.usd_foil ?? 0); return { id: `scryfall:${item.id}`, externalId: item.id, source: 'scryfall', tcgId: 'magic', name: item.name, set: item.set_name ?? item.set?.toUpperCase(), number: item.collector_number ?? '', rarity: item.rarity ?? 'unknown', type: item.type_line ?? '', description: item.oracle_text ?? item.card_faces?.map((face: any) => face.oracle_text).filter(Boolean).join('\n\n') ?? '', imageColor: '#4B5668', imageUrl: item.image_uris?.normal ?? item.card_faces?.[0]?.image_uris?.normal, priceUSD: usd, priceBRL: usd * USD_TO_BRL_ESTIMATE }; });
  return { cards: rememberCards(mapped), source: 'scryfall', notice: 'Dados de cartas: Scryfall. Valores em BRL são estimativas convertidas do preço em USD.' };
}

async function searchPokemon(query: string): Promise<SearchResult> {
  const q = query.trim() ? `&q=${encodeURIComponent(`name:*${query.trim()}*`)}` : '';
  const json = await requestJson(`https://api.pokemontcg.io/v2/cards?page=1&pageSize=40&orderBy=-set.releaseDate${q}`);
  const mapped: Card[] = (json.data ?? []).map((item: any) => { const usd = Number(item.tcgplayer?.prices?.holofoil?.market ?? item.tcgplayer?.prices?.normal?.market ?? item.cardmarket?.prices?.averageSellPrice ?? 0); return { id: `pokemontcg:${item.id}`, externalId: item.id, source: 'pokemontcg', tcgId: 'pokemon', name: item.name, set: item.set?.name ?? '', number: item.number ?? '', rarity: item.rarity ?? 'Unknown', type: [item.supertype, ...(item.subtypes ?? [])].filter(Boolean).join(' · '), description: [...(item.rules ?? []), ...(item.attacks ?? []).map((attack: any) => `${attack.name}: ${attack.text ?? ''}`)].join('\n'), imageColor: '#E2B93B', imageUrl: item.images?.large ?? item.images?.small, priceUSD: usd, priceBRL: usd * USD_TO_BRL_ESTIMATE }; });
  return { cards: rememberCards(mapped), source: 'pokemontcg', notice: 'Dados de cartas: Pokémon TCG API em modo público limitado. Uma chave privada poderá ser usada futuramente pelo servidor do TCG Hub.' };
}

async function searchRiftbound(query: string): Promise<SearchResult> {
  const endpoint = process.env.EXPO_PUBLIC_RIFTBOUND_CATALOG_URL;
  if (!endpoint) return fallback('riftbound', 'A integração oficial da Riot está preparada, mas aguarda a aprovação e o servidor seguro do TCG Hub.');
  const separator = endpoint.includes('?') ? '&' : '?'; const json = await requestJson(`${endpoint}${separator}q=${encodeURIComponent(query.trim())}`);
  const mapped: Card[] = (json.data ?? json.cards ?? []).slice(0, 40).map((item: any) => ({ id: `riot:${item.id ?? item.cardId}`, externalId: String(item.id ?? item.cardId), source: 'riot', tcgId: 'riftbound', name: item.name, set: item.set?.name ?? item.setName ?? item.set ?? '', number: String(item.collectorNumber ?? item.number ?? ''), rarity: item.rarity ?? 'Unknown', type: item.type ?? item.cardType ?? '', description: item.text ?? item.rulesText ?? '', imageColor: '#4B9FE8', imageUrl: item.imageUrl ?? item.assets?.card, priceUSD: 0, priceBRL: 0 }));
  return { cards: rememberCards(mapped), source: 'riot', notice: 'Dados e ativos oficiais fornecidos pela Riot API.' };
}
