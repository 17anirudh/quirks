import {
    createContext,
    useContext,
    type ReactNode,
    useEffect
} from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from './utils'
import type { Session } from '@supabase/supabase-js'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

interface AuthContextValue {
    session: Session | null
    isLoading: boolean
    qid: string | null | undefined
    waitForAuth: () => Promise<Session | null>
}
const AUTH_QUERY_KEY = ['auth'] as const
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()

    const authQuery = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            const { data: { session }, error } =
                await SUPABASE_CLIENT.auth.getSession()
            if (error) throw error
            return session
        },
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    useEffect(() => {
        const { data: { subscription } } =
            SUPABASE_CLIENT.auth.onAuthStateChange((_e, session) => {
                queryClient.setQueryData(AUTH_QUERY_KEY, session)
            })

        return () => subscription.unsubscribe()
    }, [queryClient])

    const session = authQuery.data ?? null
    const qid = session?.user.user_metadata.u_qid as
        | string
        | null
        | undefined

    const waitForAuth = () =>
        queryClient.ensureQueryData({
            queryKey: AUTH_QUERY_KEY,
            queryFn: async () => {
                const { data: { session }, error } =
                    await SUPABASE_CLIENT.auth.getSession()
                if (error) throw error
                return session
            },
        })

    const value: AuthContextValue = {
        session,
        isLoading: authQuery.isLoading,
        qid,
        waitForAuth,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export function useSignOut() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: () => SUPABASE_CLIENT.auth.signOut(),
        onSuccess: () => {
            queryClient.setQueryData(AUTH_QUERY_KEY, null)
            queryClient.clear()
            navigate({ to: '/', replace: true })
            toast.info('Signed out successfully')
        },
        onError: (err) => {
            toast.error('Sign out failed: ' + (err as Error).message)
        },
    })
}