import { createClient } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const SUPABASE_CLIENT = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

export function useAuth() {
  const queryClient = useQueryClient()
  const queryKey = ['auth-user']

  // Initial fetch for the user
  const { data: user, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await SUPABASE_CLIENT.auth.getUser()
      return data.user
    },
    staleTime: Infinity, // Keep in cache until manually changed
  })

  useEffect(() => {
    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = SUPABASE_CLIENT.auth.onAuthStateChange(
      (_event, session) => {
        // Manually update the query cache whenever auth state changes
        queryClient.setQueryData(queryKey, session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [queryClient])

  return { user, isLoggedIn: !!user, isLoading }
}