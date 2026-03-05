import { createFileRoute, redirect } from '@tanstack/react-router'
import Loader from '@/components/loader'
import PostCard from '@/components/post-card'
import ProfileCard from '@/components/profile-card'
import CtxProfile from '@/components/ctxProfile'
import { Keys } from '@/context/keys'
import { queryUser } from '@/api/api'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/u/$qid')({
  loader: async ({ context, params }) => {
    const session = await context.auth.waitForAuth()
    const viewer = !session ? 'a' : session.user.user_metadata.u_qid
    const search = params.qid
    if (viewer === search) {
      throw redirect({ to: '/profile/home', replace: true })
    }
    return {
      viewer,
      search
    }
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { viewer, search } = Route.useLoaderData()
  const qClient = Route.useRouteContext().queryClient

  const { data: UserInfo, isPending } = useQuery({
    queryKey: Keys.user(search, viewer),
    queryFn: async () => await queryUser(search, viewer)
  })

  return (
    <>
      {isPending ? <Loader /> : (
        <>
          <div className='flex flex-col min-h-dvh w-screen px-4 py-6 md:py-8 gap-6 md:gap-8 overflow-x-hidden justify-center items-center'>
            {/* Pfp, name, qid, no.of posts, no.of friends */}
            <ProfileCard information={{
              user: UserInfo!.user,
              post: UserInfo!.post,
              relation: UserInfo!.relation,
              pending: UserInfo!.pending
            }} />

            {/* Only show CtxProfile if user is logged in (viewer !== 'a') */}
            {viewer !== 'a' && (
              <CtxProfile
                relation={UserInfo?.relation?.[0] || null}
                viewer={viewer}
                targetQid={UserInfo!.user.u_qid}
                queryClient={qClient}
              />
            )}

            {/* User posts */}
            {UserInfo!.post.map((post) => (
              <PostCard key={post.p_id} post={post} />
            ))}
          </div>
        </>
      )
      }
    </>
  )
}