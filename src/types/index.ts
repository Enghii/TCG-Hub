export type TcgId = 'magic' | 'pokemon' | 'yugioh' | 'onepiece' | 'riftbound';
export type Language = 'pt' | 'en'; export type Region = 'BR' | 'US';
export type Tcg = { id: TcgId; name: string; shortName: string; color: string; symbol: string };
export type Card = { id: string; tcgId: TcgId; name: string; set: string; number: string; rarity: string; type: string; description: string; imageColor: string; priceBRL: number; priceUSD: number };
export type CardCondition = 'NM' | 'EX' | 'GD' | 'LP' | 'PL';
export type CardLanguage = 'PT' | 'EN' | 'JP' | 'ES' | 'DE' | 'FR' | 'IT' | 'KR';
export type CollectionItem = { id: string; cardId: string; quantity: number; condition: CardCondition; language: CardLanguage; foil: boolean; purchasePrice: number | null };
