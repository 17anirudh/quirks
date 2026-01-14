import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { useMutation } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from '@/hooks/variables';

type QueryResult = {
  u_qid: string | null;
  u_name: string | null;
  u_bio: string | null;
  u_pfp: string | null;
}

const fetchMutation = useMutation({
  mutationFn: async (params: string) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND.URL}/search/${params}`, {
        method: 'GET',
      }).catch((err) => {
        throw err
      })
    }
    catch (err) {
      throw err
    }
  },
  onSuccess: (data) => {
      return data as QueryResult | void
  },
  onError: (e) => {
      throw new Error(e.message)
  },
})

const loggedIn = useMutation({
  mutationFn: async () => {
    const { error } = await SUPABASE_CLIENT.auth.getUserIdentities()
    if(error) {
      throw error
    }
  },
  onSuccess: () => { return true as boolean },
  onError: () => { return false as boolean }
})

export const Route = createFileRoute('/$qid')({
  loader: async ({ params }) => {
    fetchMutation.mutate(params.qid)
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { qid } = Route.useParams()
  const { data: profile } = Route.useRouteContext()

  const authed = loggedIn.mutate()

  return (
    <>
      <div className="p-4">
        <h1 className="text-xl font-bold">{profile ? profile?.u_name : 'User not found'}</h1>
        <p className="text-sm italic">{authed ? 'You are viewing this logged in' : 'Public view'}</p>
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