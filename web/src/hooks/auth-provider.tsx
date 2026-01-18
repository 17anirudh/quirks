import {
    createContext,
    useContext,
<<<<<<< HEAD
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthState =
    | { status: 'loading' }
    | { status: 'authenticated'; user: User; session: Session }
    | { status: 'unauthenticated'; user: null; session: null };

export interface AuthContextValue {
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState(
                session
                    ? { status: 'authenticated', user: session.user, session }
                    : { status: 'unauthenticated', user: null, session: null },
            );
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
=======
    type ReactNode,
    useEffect
} from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from './utils'
import type { Session, User } from '@supabase/supabase-js'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

const AUTH_QUERY_KEY = ['auth'] as const

interface AuthContextValue {
    user: User | null
    session: Session | null
    isLoading: boolean
    qid: string | null | undefined
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            const { data: { session }, error } = await SUPABASE_CLIENT.auth.getSession()
            if (error) throw error
            return session
        },
        // These help reduce flashes / unnecessary refetches
        staleTime: 30 * 1000,          // consider fresh for 30 seconds
        gcTime: 5 * 60 * 1000,         // keep in cache 5 min
        retry: false,                  // don't retry on auth errors
        refetchOnWindowFocus: false,   // optional — prevent extra calls
    })

    // Listen for auth state changes (login, logout, token refresh, etc.)
    useEffect(() => {
        const { data: { subscription } } = SUPABASE_CLIENT.auth.onAuthStateChange((_event, newSession) => {
            queryClient.setQueryData(AUTH_QUERY_KEY, newSession)
        })

        return () => subscription.unsubscribe()
    }, [queryClient])

    const user = data?.user ?? null
    const qid = user?.user_metadata?.qid as string | undefined ?? null

    const value: AuthContextValue = {
        user,
        session: data ?? null,
        isLoading,
        qid,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

// Optional: convenience sign-out hook
export function useSignOut() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: () => SUPABASE_CLIENT.auth.signOut(),
        onSuccess: () => {
            queryClient.setQueryData(AUTH_QUERY_KEY, null)
            queryClient.invalidateQueries({ queryKey: ['auth'] })
            navigate({ to: '/', replace: true })
            toast.info('Signed out successfully')
        },
        onError: (err) => {
            toast.error('Sign out failed: ' + (err as Error).message)
        },
    })
>>>>>>> fix-attempt-backup
}