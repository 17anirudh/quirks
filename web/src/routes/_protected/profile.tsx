import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import ProfileCard from '@/components/profile-card'

type res = {
  u_qid: string | null,
  u_name: string | null,
  u_bio: string | null,
  u_pfp: string | null
}

export const Route = createFileRoute('/_protected/profile')({
  loader: async ({ context }) => {
    const qid = context.auth.user?.user_metadata.u_qid
    return context.queryClient.ensureQueryData({
      queryKey: ['user', qid],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/search/${qid}`)
        return await res.json() as res
      }
    })
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useLoaderData() as res
  const queryClient = Route.useRouteContext().queryClient
  return (
    <>
      <ProfileCard ctx={ctx} qClient={queryClient} />
    </>
  );
}