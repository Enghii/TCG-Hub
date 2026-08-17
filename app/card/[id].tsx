import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { cards } from '@/src/data/catalog';
import { colors, spacing } from '@/src/theme';
import { PrimaryButton, Panel } from '@/src/components/ui';
import { useAppStore } from '@/src/store/AppStore';

export default function CardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cards.find((item) => item.id === id);
  const { region, collection, wishlist, toggleWishlist } = useAppStore();
  if (!card) return null;
  const quantity = collection.filter((item) => item.cardId === card.id).reduce((sum, item) => sum + item.quantity, 0);
  const wished = wishlist.includes(card.id);
  const price = region === 'BR' ? `R$ ${card.priceBRL.toLocaleString('pt-BR')}` : `$${card.priceUSD.toLocaleString('en-US')}`;
  return <SafeAreaView edges={['bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.container}>
    <View style={[styles.art, { backgroundColor: card.imageColor }]}><Text style={styles.letter}>{card.name[0]}</Text></View>
    <Text style={styles.name}>{card.name}</Text><Text style={styles.meta}>{card.set} · #{card.number} · {card.rarity}</Text>
    <Panel style={styles.details}><Text style={styles.type}>{card.type}</Text><Text style={styles.description}>{card.description}</Text><Text style={styles.price}>{price}</Text>{quantity > 0 && <Text style={styles.owned}>Você possui {quantity} cópia(s)</Text>}</Panel>
    <View style={styles.actions}><PrimaryButton label="Adicionar exemplar" onPress={() => router.push({ pathname: '/collection-entry', params: { cardId: card.id } })} /><PrimaryButton secondary label={wished ? 'Remover da wishlist' : 'Adicionar à wishlist'} onPress={() => toggleWishlist(card.id)} /></View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, container: { padding: spacing.lg, paddingBottom: 48 }, art: { height: 380, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, letter: { color: '#FFFFFFCC', fontSize: 140, fontWeight: '900' }, name: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: spacing.lg }, meta: { color: colors.muted, marginTop: 6 }, details: { marginTop: spacing.lg, gap: 10 }, type: { color: colors.accent, fontWeight: '800' }, description: { color: colors.text, lineHeight: 22 }, price: { color: colors.primary, fontSize: 24, fontWeight: '900', marginTop: 8 }, owned: { color: colors.accent, fontWeight: '800' }, actions: { gap: 10, marginTop: spacing.lg } });
