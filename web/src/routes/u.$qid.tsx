import { createFileRoute, redirect } from '@tanstack/react-router'
import Loader from '@/components/loader'
import PostCard from '@/components/post-card'
import ProfileCard from '@/components/profile-card'
import CtxProfile from '@/components/ctxProfile'

type queryResponse = {
  user: {
    u_qid: string | null,
    u_bio: string | null,
    u_pfp: string | null,
    u_name: string | null
  },
  post: [
    {
      p_id: string | null,
      p_author_qid: string | null,
      p_text: string | null,
      p_likes_count: number | null,
      p_comments_count: number | null,
      created_at: string | null,
      p_url: string | null
      p_author_pfp: string | null
    }
  ],
  relation: any | null,
}

export const Route = createFileRoute('/u/$qid')({
  loader: async ({ context, params }) => {
    const session = await context.auth.waitForAuth()
    const viewer = !session ? 'a' : session.user.user_metadata.u_qid
    const search = params.qid
    if (viewer === search) {
      throw redirect({ to: '/profile/home', replace: true })
    }
    const data = await context.queryClient.ensureQueryData({
      queryKey: ['user', search, viewer],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/u/${search}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'viewer': viewer || 'a'
          }
        })
        if (!res.ok) {
          console.error(await res.json())
          throw new Error('Failed to fetch user')
        }
        const response = await res.json()
        return {
          user: response.user,
          post: response.post || [],
          relation: response.relation || null,
        } as queryResponse
      }
    })
    return {
      data,
      viewer
    }
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { data, viewer } = Route.useLoaderData()
  const qClient = Route.useRouteContext().queryClient
  console.log(viewer)

  return (
    <div className='flex flex-col min-h-dvh w-screen px-4 py-6 md:py-8 gap-6 md:gap-8 overflow-x-hidden'>
      {/* Pfp, name, qid, no.of posts, no.of friends */}
      <ProfileCard information={data} />

      {/* Only show CtxProfile if user is logged in (viewer !== 'a') */}
      {viewer !== 'a' && (
        <CtxProfile
          relation={data.relation}
          viewer={viewer}
          targetQid={data.user.u_qid}
          queryClient={qClient}
        />
      )}

      {/* User posts */}
      {data.post.map((post) => (
        <PostCard key={post.p_id} post={post} />
      ))}
    </div>
  )
  // return (
  //   <div className='h-dvh w-screen flex justify-center items-center'>
  //     <pre className='w-9/12 text-pretty break-words'>{JSON.stringify(data, null, 2)}</pre>
  //   </div>
  // )
}