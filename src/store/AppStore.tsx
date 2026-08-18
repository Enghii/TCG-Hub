import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CollectionItem, Language, Region, TcgId } from '@/src/types';
import { hydrateCatalog } from '@/src/services/catalog';
import { BackupPayload, CloudSession, isCloudConfigured, pullBackup, pushBackup, refreshSession, signIn as cloudSignIn, signUp as cloudSignUp } from '@/src/services/cloud';

type CollectionDraft = Omit<CollectionItem, 'id'>;
type SyncState = 'idle' | 'syncing' | 'synced' | 'error';
type AppState = {
  selectedTcg: TcgId | null; language: Language; region: Region; collection: CollectionItem[]; wishlist: string[]; savedCards: Card[];
  session: CloudSession | null; cloudConfigured: boolean; syncState: SyncState; syncError: string | null; lastSyncedAt: string | null; autoSyncEnabled: boolean;
  selectTcg: (id: TcgId) => void; setLanguage: (value: Language) => void; setRegion: (value: Region) => void;
  addCollectionItem: (draft: CollectionDraft) => void; updateCollectionItem: (id: string, draft: CollectionDraft) => void; removeCollectionItem: (id: string) => void; toggleWishlist: (card: Card) => void;
  signIn: (email: string, password: string) => Promise<void>; signUp: (email: string, password: string) => Promise<'signed-in' | 'confirmation-required'>; signOut: () => void; backupNow: () => Promise<void>; restoreBackup: () => Promise<boolean>;
};
const Store = createContext<AppState | null>(null); const STORAGE_KEY = '@tcg-hub/state'; const SESSION_KEY = '@tcg-hub/session';

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [selectedTcg, selectTcg] = useState<TcgId | null>(null); const [language, setLanguage] = useState<Language>('pt'); const [region, setRegion] = useState<Region>('BR'); const [collection, setCollection] = useState<CollectionItem[]>([]); const [wishlist, setWishlist] = useState<string[]>([]); const [savedCards, setSavedCards] = useState<Card[]>([]); const [ready, setReady] = useState(false);
  const [session, setSession] = useState<CloudSession | null>(null); const [syncState, setSyncState] = useState<SyncState>('idle'); const [syncError, setSyncError] = useState<string | null>(null); const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null); const [autoSyncEnabled, setAutoSyncEnabled] = useState(false); const autoSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(SESSION_KEY)]).then(async ([rawState, rawSession]) => { if (rawState) applyPayload(JSON.parse(rawState)); if (rawSession && isCloudConfigured) { try { const stored = JSON.parse(rawSession) as CloudSession; const renewed = await refreshSession(stored.refreshToken); setSession(renewed); setAutoSyncEnabled(true); } catch { await AsyncStorage.removeItem(SESSION_KEY); } } }).finally(() => setReady(true)); }, []);
  const payload = useMemo<BackupPayload>(() => ({ selectedTcg, language, region, collection, wishlist, savedCards, schemaVersion: 1 }), [selectedTcg, language, region, collection, wishlist, savedCards]);
  useEffect(() => { if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); }, [ready, payload]);
  useEffect(() => { if (!ready) return; if (session) AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)); else AsyncStorage.removeItem(SESSION_KEY); }, [ready, session]);
  useEffect(() => { if (!session) return; const delay = Math.max(1000, session.expiresAt - Date.now() - 60000); const timer = setTimeout(() => refreshSession(session.refreshToken).then(setSession).catch(() => { setSession(null); setAutoSyncEnabled(false); setSyncError('Sua sessão expirou. Entre novamente.'); }), delay); return () => clearTimeout(timer); }, [session]);
  useEffect(() => { if (!ready || !session || !autoSyncEnabled) return; if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current); autoSyncTimer.current = setTimeout(() => performBackup(session, payload), 1800); return () => { if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current); }; }, [ready, session, autoSyncEnabled, payload]);

  function applyPayload(saved: Partial<BackupPayload> & { collection?: Array<string | CollectionItem> }) { selectTcg(saved.selectedTcg ?? null); setLanguage(saved.language ?? 'pt'); setRegion(saved.region ?? 'BR'); const migrated = (saved.collection ?? []).map((item, index) => typeof item === 'string' ? { id: `migrated-${item}-${index}`, cardId: item, quantity: 1, condition: 'NM' as const, language: 'EN' as const, foil: false, purchasePrice: null } : item); const restoredCards = saved.savedCards ?? []; hydrateCatalog([...migrated, ...restoredCards.map((card) => ({ cardSnapshot: card }))]); setCollection(migrated); setWishlist(saved.wishlist ?? []); setSavedCards(restoredCards); }
  async function performBackup(activeSession = session, activePayload = payload) { if (!activeSession) throw new Error('Entre em sua conta para sincronizar.'); setSyncState('syncing'); setSyncError(null); try { await pushBackup(activeSession, activePayload); setLastSyncedAt(new Date().toISOString()); setSyncState('synced'); setAutoSyncEnabled(true); } catch (error) { const message = error instanceof Error ? error.message : 'Falha na sincronização.'; setSyncError(message); setSyncState('error'); throw error; } }
  async function login(email: string, password: string) { setSyncError(null); const nextSession = await cloudSignIn(email.trim(), password); setSession(nextSession); setSyncState('idle'); setAutoSyncEnabled(false); }
  async function register(email: string, password: string) { setSyncError(null); const nextSession = await cloudSignUp(email.trim(), password); if (nextSession) { setSession(nextSession); setAutoSyncEnabled(false); return 'signed-in' as const; } return 'confirmation-required' as const; }
  async function restore() { if (!session) throw new Error('Entre em sua conta para restaurar.'); setSyncState('syncing'); setSyncError(null); try { const backup = await pullBackup(session); if (!backup) { setSyncState('idle'); return false; } applyPayload(backup.payload); setLastSyncedAt(backup.updated_at); setSyncState('synced'); setAutoSyncEnabled(true); return true; } catch (error) { const message = error instanceof Error ? error.message : 'Falha ao restaurar.'; setSyncError(message); setSyncState('error'); throw error; } }

  const value = useMemo<AppState>(() => ({ selectedTcg, language, region, collection, wishlist, savedCards, session, cloudConfigured: isCloudConfigured, syncState, syncError, lastSyncedAt, autoSyncEnabled, selectTcg, setLanguage, setRegion,
    addCollectionItem: (draft) => setCollection((items) => [...items, { ...draft, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]), updateCollectionItem: (id, draft) => setCollection((items) => items.map((item) => item.id === id ? { ...draft, id } : item)), removeCollectionItem: (id) => setCollection((items) => items.filter((item) => item.id !== id)), toggleWishlist: (card) => { setWishlist((items) => items.includes(card.id) ? items.filter((item) => item !== card.id) : [...items, card.id]); setSavedCards((items) => items.some((item) => item.id === card.id) ? items : [...items, card]); },
    signIn: login, signUp: register, signOut: () => { setSession(null); setAutoSyncEnabled(false); setSyncState('idle'); setSyncError(null); AsyncStorage.removeItem(SESSION_KEY); }, backupNow: () => performBackup(), restoreBackup: restore,
  }), [selectedTcg, language, region, collection, wishlist, savedCards, session, syncState, syncError, lastSyncedAt, autoSyncEnabled, payload]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export function useAppStore() { const value = useContext(Store); if (!value) throw new Error('useAppStore must be inside AppStoreProvider'); return value; }
