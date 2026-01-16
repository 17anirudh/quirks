import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import ProfileCard from '@/components/profile-card'

type res = {
  u_qid: string | null,
  u_name: string | null,
  u_bio: string | null,
  u_pfp: string | null
}

export const Route = createFileRoute('/user/$qid')({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ['user', params.qid],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/search/${params.qid}`)
        return await res.json() as res
      }
    })
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { qid } = Route.useParams()
  const ctx = Route.useLoaderData();
  const context = Route.useRouteContext()
  let who: string
  if (context.auth.user) {
    if (context.auth.user.user_metadata.u_qid === qid) {
      who = 'self'
    }
    else {
      who = 'other'
    }
  }
  else {
    who = 'anon'
  }
  return (
    <>
      {who === 'self' && <ProfileCard ctx={ctx} qClient={context.queryClient} />}
      {who === 'other' && <ProfileCard ctx={ctx} who='other' />}
      {who === 'anon' && <ProfileCard ctx={ctx} who='anon' />}
    </>
  )
}