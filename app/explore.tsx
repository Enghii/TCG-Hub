import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { CardTile } from '@/src/components/CardTile'; import { Pill, SearchInput } from '@/src/components/ui'; import { colors, spacing } from '@/src/theme';
import { searchCatalog } from '@/src/services/catalog'; import { Card, TcgId } from '@/src/types';

export default function ExploreScreen() {
  const { tcgId } = useLocalSearchParams<{ tcgId: TcgId }>(); const [query, setQuery] = useState(''); const [submittedQuery, setSubmittedQuery] = useState(''); const [rarity, setRarity] = useState('Todas'); const [items, setItems] = useState<Card[]>([]); const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(true);
  const load = async (term = submittedQuery) => { setLoading(true); setRarity('Todas'); const result = await searchCatalog(tcgId, term); setItems(result.cards); setNotice(result.notice ?? ''); setLoading(false); };
  useEffect(() => { load(''); }, [tcgId]);
  const rarities = ['Todas', ...new Set(items.map((card) => card.rarity))]; const filtered = useMemo(() => items.filter((card) => rarity === 'Todas' || card.rarity === rarity), [items, rarity]);
  const submit = () => { setSubmittedQuery(query); load(query); };
  return <SafeAreaView edges={['bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>Explorar cartas</Text><View style={styles.searchRow}><SearchInput value={query} onChangeText={setQuery} onSubmitEditing={submit} returnKeyType="search" placeholder="Nome da carta..." style={styles.search} /><Pressable onPress={submit} style={styles.searchButton}><Text style={styles.searchButtonText}>Buscar</Text></Pressable></View>
    {!!notice && <View style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></View>}
    {loading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.loadingText}>Atualizando catálogo...</Text></View> : <><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{rarities.map((item) => <Pill key={item} label={item} active={rarity === item} onPress={() => setRarity(item)} />)}</ScrollView><Text style={styles.count}>{filtered.length} resultado(s){submittedQuery ? ` para “${submittedQuery}”` : ''}</Text><View style={styles.grid}>{filtered.map((card) => <CardTile key={card.id} card={card} />)}</View>{filtered.length === 0 && <Text style={styles.empty}>Nenhuma carta encontrada. Tente outro nome.</Text>}</>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, container: { padding: spacing.lg, paddingBottom: 48 }, title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: spacing.md }, searchRow: { flexDirection: 'row', gap: 8 }, search: { flex: 1 }, searchButton: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center' }, searchButtonText: { color: colors.background, fontWeight: '900' }, notice: { backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 12, marginTop: spacing.md }, noticeText: { color: colors.muted, fontSize: 12, lineHeight: 18 }, loading: { paddingVertical: 72, alignItems: 'center', gap: spacing.md }, loadingText: { color: colors.muted }, filters: { gap: 8, paddingVertical: spacing.md }, count: { color: colors.muted, marginBottom: spacing.md }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, empty: { color: colors.muted, textAlign: 'center', paddingVertical: 48 } });
