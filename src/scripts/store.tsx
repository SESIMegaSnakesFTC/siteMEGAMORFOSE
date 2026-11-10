import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { backend, EMPTY_USERDATA, type SignUpInput, type UserFlag } from './backend';
import type { ContentItem, Profile, UserData } from './types';

interface Toast {
  id: number;
  text: string;
  tone: 'ok' | 'info' | 'error';
}

interface Store {
  mode: 'demo' | 'supabase';
  items: ContentItem[]; // publicados (ou todos, para admin no painel)
  allItems: ContentItem[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  user: Profile | null;
  authReady: boolean;
  data: UserData;
  isAdmin: boolean;
  isMentor: boolean; // mentor ou equipe
  setWantsMentor: (want: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<Profile>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  deleteAccount: () => Promise<void>;
  toggle: (flag: UserFlag, id: string, on?: boolean) => Promise<boolean>;
  saveItem: (item: ContentItem) => Promise<ContentItem>;
  deleteItem: (id: string) => Promise<void>;
  toast: (text: string, tone?: Toast['tone']) => void;
  toasts: Toast[];
  byId: (id: string) => ContentItem | undefined;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [allItems, setAll] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<UserData>(EMPTY_USERDATA);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'mentor' || isAdmin;

  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAll(await backend.listContent(isAdmin));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os conteúdos.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    backend
      .currentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (authReady) reload();
  }, [authReady, reload]);

  useEffect(() => {
    if (!user) return setData(EMPTY_USERDATA);
    backend.getUserData(user.id).then(setData).catch(() => setData(EMPTY_USERDATA));
  }, [user]);

  const items = useMemo(() => allItems.filter((i) => i.status === 'published'), [allItems]);
  const index = useMemo(() => new Map(allItems.map((i) => [i.id, i])), [allItems]);

  const store: Store = {
    mode: backend.mode,
    items,
    allItems,
    loading,
    error,
    reload,
    user,
    authReady,
    data,
    isAdmin,
    isMentor,
    setWantsMentor: async (want) => {
      if (!user) return;
      setUser(await backend.setWantsMentor(user.id, want));
    },
    toasts,
    toast,
    byId: (id) => index.get(id),
    signIn: async (email, password) => {
      const p = await backend.signIn(email, password);
      setUser(p);
      return p;
    },
    signUp: async (input) => setUser(await backend.signUp(input)),
    signOut: async () => {
      await backend.signOut();
      setUser(null);
      toast('Você saiu da sua conta.', 'info');
    },
    saveProfile: async (p) => setUser(await backend.updateProfile(p)),
    deleteAccount: async () => {
      if (!user) return;
      await backend.deleteAccount(user.id);
      setUser(null);
    },
    toggle: async (flag, id, on) => {
      if (!user) {
        toast('Entre ou crie sua conta para salvar seu progresso.', 'info');
        return false;
      }
      const next = on ?? !data[flag].includes(id);
      setData((d) => ({ ...d, [flag]: next ? [...new Set([...d[flag], id])] : d[flag].filter((x) => x !== id) }));
      try {
        await backend.setFlag(user.id, flag, id, next);
      } catch {
        toast('Não foi possível salvar. Tente novamente.', 'error');
        setData(await backend.getUserData(user.id));
      }
      return true;
    },
    saveItem: async (item) => {
      const saved = await backend.saveContent(item);
      setAll((list) => (list.some((i) => i.id === saved.id) ? list.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...list]));
      return saved;
    },
    deleteItem: async (id) => {
      await backend.deleteContent(id);
      setAll((list) => list.filter((i) => i.id !== id));
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fora do StoreProvider');
  return s;
};
