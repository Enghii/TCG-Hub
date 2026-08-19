import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStoreProvider } from '@/src/store/AppStore';
import { colors } from '@/src/theme';

export default function RootLayout() {
  return <AppStoreProvider><StatusBar style="light" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}>
    <Stack.Screen name="index" options={{ headerShown: false }} /><Stack.Screen name="profile" options={{ title: 'Perfil e estatísticas' }} /><Stack.Screen name="account" options={{ title: 'Conta e sincronização' }} /><Stack.Screen name="tcg/[id]" options={{ title: 'TCG Hub' }} /><Stack.Screen name="explore" options={{ title: 'Explorar cartas' }} /><Stack.Screen name="market" options={{ title: 'Mercado' }} /><Stack.Screen name="collection" options={{ title: 'Coleção' }} /><Stack.Screen name="collection-entry" options={{ title: 'Exemplar' }} /><Stack.Screen name="decks" options={{ title: 'Deck Builder' }} /><Stack.Screen name="deck/[id]" options={{ title: 'Deck' }} /><Stack.Screen name="deck-scan/[id]" options={{ title: 'Digitalizar cartas' }} /><Stack.Screen name="card/[id]" options={{ title: 'Detalhes da carta' }} /><Stack.Screen name="module/[slug]" options={{ title: 'TCG Hub' }} />
  </Stack></AppStoreProvider>;
}
