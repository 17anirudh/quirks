import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/variables'

type QueryResult = {
  u_qid: string | null;
  u_name: string | null;
  u_bio: string | null;
  u_pfp: string | null;
}

export const Route = createFileRoute('/$qid')({
  component: RouteComponent,
})

function RouteComponent() {
  const { qid } = Route.useParams()
  const { isLoggedIn, user, isLoading: authLoading } = useAuth()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['search', qid],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search/${qid}`)
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json() as Promise<QueryResult>
    },
  })

  if (profileLoading || authLoading) return <Loader />

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-1">
          {profile?.u_name ?? 'User not found'}
        </h1>
        <p className="text-sm text-neutral-400 mb-8">
          {isLoggedIn ? `Authenticated as ${user?.email}` : 'Viewing as Guest'}
        </p>

        {/* Debug Section */}
        <details className="group border border-white/10 rounded-lg bg-white/5 overflow-hidden">
          <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-xs font-mono uppercase tracking-tighter text-neutral-500">
              Debug System State
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-neutral-300">
              JSON
            </span>
          </summary>
          <div className="p-4 border-t border-white/10 space-y-4">
            <div>
              <p className="text-[10px] text-cyan-500 font-bold mb-2">BACKEND_PROFILE</p>
              <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto max-h-40 font-mono">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-[10px] text-emerald-500 font-bold mb-2">SUPABASE_AUTH</p>
              <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto font-mono">
                {JSON.stringify({ isLoggedIn, userId: user?.id }, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}