import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill, PrimaryButton } from '@/src/components/ui';
import { getCachedCard } from '@/src/services/catalog';
import { useAppStore } from '@/src/store/AppStore';
import { colors, pressFeedback, spacing } from '@/src/theme';
import { CardCondition, CardLanguage } from '@/src/types';

const conditions: CardCondition[] = ['NM', 'EX', 'GD', 'LP', 'PL'];
const languages: CardLanguage[] = ['PT', 'EN', 'JP', 'ES', 'DE', 'FR', 'IT', 'KR'];
export default function CollectionEntryScreen() {
  const { cardId, entryId } = useLocalSearchParams<{ cardId: string; entryId?: string }>();
  const { collection, addCollectionItem, updateCollectionItem, removeCollectionItem, region } = useAppStore();
  const existing = collection.find((item) => item.id === entryId); const card = getCachedCard(cardId) ?? existing?.cardSnapshot;
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1)); const [condition, setCondition] = useState<CardCondition>(existing?.condition ?? 'NM'); const [cardLanguage, setCardLanguage] = useState<CardLanguage>(existing?.language ?? 'EN'); const [foil, setFoil] = useState(existing?.foil ?? false); const [purchasePrice, setPurchasePrice] = useState(existing?.purchasePrice == null ? '' : String(existing.purchasePrice));
  if (!card) return null;
  const save = () => { const parsedQuantity = Math.max(1, Math.floor(Number(quantity) || 1)); const parsedPrice = purchasePrice.trim() === '' ? null : Math.max(0, Number(purchasePrice.replace(',', '.')) || 0); const draft = { cardId: card.id, cardSnapshot: card, quantity: parsedQuantity, condition, language: cardLanguage, foil, purchasePrice: parsedPrice }; if (existing) updateCollectionItem(existing.id, draft); else addCollectionItem(draft); router.back(); };
  const confirmRemoval = () => { if (!existing) return; removeCollectionItem(existing.id); router.back(); };
  const remove = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Remover este exemplar da coleção?')) confirmRemoval();
      return;
    }
    Alert.alert('Remover exemplar?', 'Esta ação removerá este registro da coleção.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: confirmRemoval }]);
  };
  return <SafeAreaView edges={['bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <View style={styles.cardHeader}><View style={[styles.thumb, { backgroundColor: card.imageColor }]}><Text style={styles.thumbText}>{card.name[0]}</Text></View><View style={{ flex: 1 }}><Text style={styles.title}>{card.name}</Text><Text style={styles.meta}>{card.set} · #{card.number}</Text></View></View>
    <Text style={styles.label}>Quantidade</Text><View style={styles.quantityRow}><Pressable style={({ pressed }) => [styles.step, pressed && pressFeedback]} onPress={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))}><Text style={styles.stepText}>−</Text></Pressable><TextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" style={styles.quantityInput} /><Pressable style={({ pressed }) => [styles.step, pressed && pressFeedback]} onPress={() => setQuantity(String((Number(quantity) || 0) + 1))}><Text style={styles.stepText}>+</Text></Pressable></View>
    <Text style={styles.label}>Condição</Text><View style={styles.options}>{conditions.map((item) => <Pill key={item} label={item} active={condition === item} onPress={() => setCondition(item)} />)}</View><Text style={styles.hint}>NM: nova · EX: excelente · GD: boa · LP: pouco usada · PL: usada</Text>
    <Text style={styles.label}>Idioma da carta</Text><View style={styles.options}>{languages.map((item) => <Pill key={item} label={item} active={cardLanguage === item} onPress={() => setCardLanguage(item)} />)}</View>
    <Text style={styles.label}>Acabamento</Text><View style={styles.options}><Pill label="Normal" active={!foil} onPress={() => setFoil(false)} /><Pill label="Foil" active={foil} onPress={() => setFoil(true)} /></View>
    <Text style={styles.label}>Preço de aquisição ({region === 'BR' ? 'R$' : 'US$'})</Text><TextInput value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" placeholder="Opcional" placeholderTextColor={colors.muted} style={styles.input} />
    <View style={styles.actions}><PrimaryButton label={existing ? 'Salvar alterações' : 'Adicionar à coleção'} onPress={save} />{existing && <PrimaryButton secondary label="Remover exemplar" onPress={remove} />}</View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, container: { padding: spacing.lg, paddingBottom: 48 }, cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl }, thumb: { width: 72, height: 96, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, thumbText: { color: '#FFFFFFCC', fontSize: 36, fontWeight: '900' }, title: { color: colors.text, fontSize: 22, fontWeight: '900' }, meta: { color: colors.muted, marginTop: 4 }, label: { color: colors.text, fontWeight: '900', fontSize: 16, marginTop: spacing.lg, marginBottom: spacing.sm }, hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: spacing.sm }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, step: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }, stepText: { color: colors.text, fontSize: 24, fontWeight: '900' }, quantityInput: { width: 74, height: 46, borderRadius: 12, borderColor: colors.border, borderWidth: 1, color: colors.text, textAlign: 'center', fontSize: 18, fontWeight: '800' }, input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, color: colors.text, paddingHorizontal: 15, paddingVertical: 13, fontSize: 16 }, actions: { gap: 10, marginTop: spacing.xl } });
