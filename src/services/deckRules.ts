import { Card, Deck, DeckFormat, TcgId } from '@/src/types';

export type FormatRule = { id: DeckFormat; label: string; deckSize: number | null; exactSize: boolean; maxCopies: number | null; note: string };
const formats: Record<TcgId, FormatRule[]> = {
  magic: [
    { id: 'magic-standard', label: 'Standard', deckSize: 60, exactSize: false, maxCopies: 4, note: 'Mínimo de 60 cartas e até 4 cópias, exceto terrenos básicos.' },
    { id: 'magic-commander', label: 'Commander', deckSize: 100, exactSize: true, maxCopies: 1, note: 'Exatamente 100 cartas e apenas uma cópia, exceto terrenos básicos.' },
    { id: 'casual', label: 'Livre', deckSize: null, exactSize: false, maxCopies: null, note: 'Sem validação automática de tamanho ou cópias.' },
  ],
  pokemon: [{ id: 'pokemon-standard', label: 'Standard', deckSize: 60, exactSize: true, maxCopies: 4, note: 'Exatamente 60 cartas e até 4 com o mesmo nome, exceto Energias Básicas.' }, { id: 'casual', label: 'Livre', deckSize: null, exactSize: false, maxCopies: null, note: 'Sem validação automática de tamanho ou cópias.' }],
  riftbound: [{ id: 'riftbound-standard', label: 'Standard', deckSize: 40, exactSize: true, maxCopies: 3, note: 'Deck principal com 40 cartas e até 3 cópias. Runas, Lenda e Campo serão validados em uma próxima etapa.' }, { id: 'casual', label: 'Livre', deckSize: null, exactSize: false, maxCopies: null, note: 'Sem validação automática de tamanho ou cópias.' }],
  yugioh: [{ id: 'casual', label: 'Livre', deckSize: null, exactSize: false, maxCopies: null, note: 'Regras oficiais serão adicionadas futuramente.' }],
  onepiece: [{ id: 'casual', label: 'Livre', deckSize: null, exactSize: false, maxCopies: null, note: 'Regras oficiais serão adicionadas futuramente.' }],
};
export function formatsFor(tcgId: TcgId) { return formats[tcgId]; }
export function defaultFormat(tcgId: TcgId) { return formats[tcgId][0].id; }
function exemptFromCopyLimit(tcgId: TcgId, card?: Card) { if (!card) return false; if (tcgId === 'magic') return /basic land/i.test(card.type); if (tcgId === 'pokemon') return /basic energy/i.test(`${card.name} ${card.type}`); return false; }
export function validateDeck(deck: Deck, resolve: (id: string) => Card | undefined) {
  const rule = formats[deck.tcgId].find((item) => item.id === deck.format) ?? formats[deck.tcgId][0]; const total = deck.cards.reduce((sum, item) => sum + item.quantity, 0); const issues: string[] = [];
  if (rule.deckSize != null) { if (rule.exactSize && total !== rule.deckSize) issues.push(`O deck deve ter exatamente ${rule.deckSize} cartas.`); if (!rule.exactSize && total < rule.deckSize) issues.push(`Adicione mais ${rule.deckSize - total} carta(s) para atingir o mínimo.`); }
  if (rule.maxCopies != null) { const copies = new Map<string, { name: string; quantity: number; exempt: boolean }>(); deck.cards.forEach((item) => { const card = resolve(item.cardId) ?? item.cardSnapshot; const name = card?.name ?? item.cardId; const key = name.trim().toLowerCase(); const current = copies.get(key); copies.set(key, { name, quantity: (current?.quantity ?? 0) + item.quantity, exempt: (current?.exempt ?? false) || exemptFromCopyLimit(deck.tcgId, card) }); }); copies.forEach((entry) => { if (entry.quantity > rule.maxCopies! && !entry.exempt) issues.push(`${entry.name} excede o limite de ${rule.maxCopies} cópia(s).`); }); }
  return { rule, total, issues, valid: issues.length === 0, progress: rule.deckSize == null ? 1 : Math.min(1, total / rule.deckSize) };
}
