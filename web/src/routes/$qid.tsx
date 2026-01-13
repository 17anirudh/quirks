import { createFileRoute } from '@tanstack/react-router'
import { SUPABASE_CLIENT } from '@/hooks/variables'
import Loader from '@/components/loader'
import { useQuery } from '@tanstack/react-query'

type QueryResult = {
  u_qid: string | null;
  u_name: string | null;
  u_bio: string | null;
  u_pfp: string | null;
  u_friends: string[] | null;
  u_posts: string[] | null;
}

const userQueryOptions = (qid: string) => ({
  queryKey: ['user', qid],
  queryFn: async () => {
    const { data, error } = await SUPABASE_CLIENT
      .from("user")
      .select("u_qid, u_name, u_bio, u_pfp, u_friends, u_posts")
      .eq("u_qid", qid)
      .maybeSingle()
    
    if (error) throw error
    return data as QueryResult
  },
})

export const Route = createFileRoute('/$qid')({
  // loader: async ({ params, context }) => {
  //   await context.queryClient.ensureQueryData(userQueryOptions(params.qid))
  // },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  // const { qid } = Route.useParams()
  // const { data: profile } = useQuery(userQueryOptions(qid))

  // const { data: currentUserQid } = useQuery({
  //   queryKey: ['current-user'],
  //   queryFn: async () => {
  //     const { data } = await SUPABASE_CLIENT.auth.getSession()
  //     return data.session?.user.user_metadata?.u_qid || null
  //   }
  // })

  // const isLogged = !!currentUserQid

  return (
    <>
      <div className="p-4">
        <h1 className="text-xl font-bold">{profile ? profile?.u_name : 'User not found'}</h1>
        <p className="text-sm italic">{isLogged ? 'You are viewing this logged in' : 'Public view'}</p>
      </div>

      <details className="mt-10 opacity-50">
        <summary className="cursor-pointer text-xs">Debug Raw Data</summary>
        <pre className="text-xs p-2 bg-black/10 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
        </pre>
      </details>
    </>
  )
}