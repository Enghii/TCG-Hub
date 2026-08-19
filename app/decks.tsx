import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, SearchInput } from '@/src/components/ui';
import { findTcg } from '@/src/data/catalog';
import { useAppStore } from '@/src/store/AppStore';
import { colors, pressFeedback, spacing } from '@/src/theme';
import { TcgId } from '@/src/types';

export default function DecksScreen() {
  const { tcgId } = useLocalSearchParams<{ tcgId: TcgId }>(); const { decks, createDeck } = useAppStore(); const [name, setName] = useState('');
  const items = decks.filter((deck) => deck.tcgId === tcgId); const tcg = findTcg(tcgId);
  const create = () => { if (!name.trim()) return; const id = createDeck(tcgId, name); setName(''); router.push({ pathname: '/deck/[id]', params: { id } }); };
  return <SafeAreaView edges={['bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>{tcg?.name}</Text><Text style={styles.title}>Deck Builder</Text><Text style={styles.description}>Crie seus decks e adicione cartas diretamente pelo catálogo.</Text>
    <View style={styles.create}><SearchInput value={name} onChangeText={setName} onSubmitEditing={create} placeholder="Nome do novo deck" style={{ flex: 1 }} /><PrimaryButton label="Criar" onPress={create} /></View>
    <Text style={styles.section}>Meus decks</Text>{items.length === 0 ? <Text style={styles.empty}>Nenhum deck criado ainda.</Text> : <View style={styles.list}>{items.map((deck) => { const total = deck.cards.reduce((sum, item) => sum + item.quantity, 0); return <Pressable key={deck.id} onPress={() => router.push({ pathname: '/deck/[id]', params: { id: deck.id } })} style={({ pressed }) => [styles.deck, pressed && pressFeedback]}><View style={styles.deckIcon}><Text style={styles.deckIconText}>▤</Text></View><View style={{ flex: 1 }}><Text style={styles.deckName}>{deck.name}</Text><Text style={styles.deckMeta}>{total} cartas · {deck.cards.length} diferentes</Text></View><Text style={styles.arrow}>→</Text></Pressable>; })}</View>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, container: { padding: spacing.lg, paddingBottom: 48 }, eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 4 }, description: { color: colors.muted, lineHeight: 21, marginTop: 7 }, create: { flexDirection: 'row', gap: 8, marginTop: spacing.xl }, section: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.md }, list: { gap: 10 }, deck: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14 }, deckIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }, deckIconText: { color: colors.primary, fontSize: 22 }, deckName: { color: colors.text, fontWeight: '900', fontSize: 16 }, deckMeta: { color: colors.muted, marginTop: 4, fontSize: 12 }, arrow: { color: colors.primary, fontSize: 20 }, empty: { color: colors.muted, textAlign: 'center', paddingVertical: 48 } });
