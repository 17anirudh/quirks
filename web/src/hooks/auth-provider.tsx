import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthState =
    | { status: 'loading' }
    | { status: 'authenticated'; user: User; session: Session }
    | { status: 'unauthenticated'; user: null; session: null };

interface AuthContextValue {
    state: AuthState;
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({ status: 'loading' });

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState(
                session
                    ? { status: 'authenticated', user: session.user, session }
                    : { status: 'unauthenticated', user: null, session: null },
            );
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setState(
                session
                    ? { status: 'authenticated', user: session.user, session }
                    : { status: 'unauthenticated', user: null, session: null },
            );
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = useMemo<AuthContextValue>(() => {
        const isLoading = state.status === 'loading';
        const isAuthenticated = state.status === 'authenticated';

        return {
            state,
            user: isAuthenticated ? state.user : null,
            session: isAuthenticated ? state.session : null,
            isLoading,
            isAuthenticated,
        };
    }, [state]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// Optional: narrower hooks people often like
export function useUser() {
    return useAuth().user;
}

export function useIsAuthenticated() {
    return useAuth().isAuthenticated;
}