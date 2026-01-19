import { createFileRoute, redirect } from '@tanstack/react-router'
import Loader from '@/components/loader'

export const Route = createFileRoute('/u/$qid')({
  loader: async ({ context, params }) => {
    const viewer: string | null = context.auth.session?.user.user_metadata.u_qid || null
    const search: string = params.qid

    if (viewer === search) {
      throw redirect({ to: '/profile/home', replace: true })
    }
    return await context.queryClient.ensureQueryData({
      queryKey: ['user', search, viewer],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/u/${search}/${viewer}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) {
          console.error(await res.json())
          throw new Error('Failed to fetch user')
        }
        return { dbData: await res.json(), viewer: viewer }
      }
    })
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { dbData, viewer } = Route.useLoaderData()
  return (
    <>
      <div className='h-screen w-screen'>
        <h3>{viewer ? `${viewer}` : 'Anon'}</h3>
        <pre className='mt-5 text-wrap break-words w-9/12 border-2'>{JSON.stringify(dbData, null, 2)}</pre>
      </div>
    </>
  )
}