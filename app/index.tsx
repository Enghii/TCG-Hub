import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pill, ScreenTitle } from '@/src/components/ui';
import { tcgs } from '@/src/data/catalog';
import { useAppStore } from '@/src/store/AppStore';
import { colors, pressFeedback, spacing } from '@/src/theme';

export default function HomeScreen() {
  const { language, region, session, syncState, setLanguage, setRegion, selectTcg } = useAppStore();
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}>
    <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>T</Text></View><Text style={styles.brandText}>TCG HUB</Text><Pressable onPress={() => router.push('/profile' as never)} style={({ pressed }) => [styles.account, pressed && pressFeedback]}><Text style={styles.accountText}>{syncState === 'syncing' ? 'Sincronizando…' : 'Perfil'}</Text></Pressable></View>
    <ScreenTitle title={language === 'pt' ? 'Escolha seu universo' : 'Choose your universe'} subtitle={language === 'pt' ? 'Um hub para todas as suas cartas.' : 'One hub for all your cards.'} />
    <View style={styles.settings}><View style={styles.row}><Pill label="PT" active={language === 'pt'} onPress={() => setLanguage('pt')} /><Pill label="EN" active={language === 'en'} onPress={() => setLanguage('en')} /></View><View style={styles.row}><Pill label="BR" active={region === 'BR'} onPress={() => setRegion('BR')} /><Pill label="US" active={region === 'US'} onPress={() => setRegion('US')} /></View></View>
    <View style={styles.grid}>{tcgs.map((tcg) => <Pressable key={tcg.id} onPress={() => { selectTcg(tcg.id); router.push({ pathname: '/tcg/[id]', params: { id: tcg.id } }); }} style={({ pressed }) => [styles.tcg, { borderColor: tcg.color }, pressed && pressFeedback]}><View style={[styles.symbol, { backgroundColor: tcg.color }]}><Text style={styles.symbolText}>{tcg.symbol}</Text></View><Text style={styles.tcgName}>{tcg.name}</Text><Text style={styles.enter}>{language === 'pt' ? 'Entrar →' : 'Enter →'}</Text></Pressable>)}</View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, container: { padding: spacing.lg, paddingBottom: 48 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 42 }, logo: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, logoText: { fontWeight: '900', fontSize: 20, color: colors.background }, brandText: { color: colors.text, fontWeight: '900', letterSpacing: 2 }, account: { marginLeft: 'auto', backgroundColor: colors.surfaceAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }, accountText: { color: colors.primary, fontSize: 12, fontWeight: '900' }, settings: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }, row: { flexDirection: 'row', gap: 7 }, grid: { gap: 12 }, tcg: { backgroundColor: colors.surface, borderWidth: 1, borderRadius: 18, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 13 }, symbol: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, symbolText: { color: 'white', fontWeight: '900', fontSize: 20 }, tcgName: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '800' }, enter: { color: colors.muted, fontWeight: '700' } });
