import {
    createContext,
    useContext,
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
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,                  // don't retry on auth errors
        refetchOnWindowFocus: false,
        refetchOnReconnect: false   // optional — prevent extra calls
    })

    // Listen for auth state changes (login, logout, token refresh, etc.)
    useEffect(() => {
        const { data: { subscription } } = SUPABASE_CLIENT.auth.onAuthStateChange((_event, newSession) => {
            queryClient.setQueryData(AUTH_QUERY_KEY, newSession)
        })

        return () => subscription.unsubscribe()
    }, [queryClient])

    const user = data?.user ?? null
    const qid = data?.user.user_metadata.u_qid as string | null | undefined

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
            // queryClient.setQueryData(AUTH_QUERY_KEY, null)
            // queryClient.invalidateQueries({ queryKey: ['auth'] })
            queryClient.clear()
            navigate({ to: '/', replace: true })
            toast.info('Signed out successfully')
        },
        onError: (err) => {
            toast.error('Sign out failed: ' + (err as Error).message)
        },
    })
}