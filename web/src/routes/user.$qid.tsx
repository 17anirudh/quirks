import { createFileRoute, notFound } from '@tanstack/react-router'
import ProfileCard from '@/components/profile-card';
import Loader from '@/components/loader';
import { useQuery } from '@tanstack/react-query';

type res = {
  u_qid: string,
  u_name: string | null,
  u_bio: string | null,
  u_pfp: string | null
}

export const Route = createFileRoute('/user/$qid')({
  loader: async ({ params: { qid }, context }) => {
    let who: "user" | "other" | "anon"
    if (context.auth?.user) {
      who = context.auth.user.user_metadata.u_qid === qid ? "user" : "other"
    }
    else {
      who = "anon"
    }
    return { who, qid }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { who, qid } = Route.useLoaderData();
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', qid],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/${qid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      return res.json()
    },
  })
  if (error) {
    throw notFound({
      data: {
        message: "User not found"
      }
    })
  }
  return (
    <>
      {isLoading && <Loader />}
      {data && (
        <div className="flex flex-col min-h-screen bg-neutral-950 text-white p-6">
          <details className="group border border-white/10 rounded-lg bg-white/5 overflow-hidden">
            <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-xs font-mono uppercase tracking-tighter text-neutral-500">
                Debug System State
              </span>
            </summary>
            <div className="p-4 border-t border-white/10 space-y-4">
              <div>
                <p className="text-[10px] text-cyan-500 font-bold mb-2">BACKEND_RESPONSE</p>
                <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto max-h-40 font-mono">
                  {profile ? JSON.stringify(profile, null, 2) : ''}
                </pre>
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 font-bold mb-2">SUPABASE_AUTH</p>
                <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto font-mono">
                  {qid}
                </pre>
              </div>
            </div>
          </details>
          <ProfileCard
            who={who}
            qid={data.u_qid}
            name={data.u_name}
            bio={data.u_bio}
            pfp={data.u_pfp}
          />
        </div>
      )}

    </>

  )
}