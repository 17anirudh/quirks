import { createFileRoute, redirect } from '@tanstack/react-router'
import Loader from '@/components/loader'
import PostCard from '@/components/post-card'
import ProfileCard from '@/components/profile-card'

type queryResponse = {
  user: {
    u_qid: string | null,
    u_bio: string | null,
    u_pfp: string | null,
    u_name: string | null
  },
  posts: [
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
  relations: Array<any | null>
}

export const Route = createFileRoute('/u/$qid')({
  beforeLoad: ({ context }) => {
    if (context.auth.isLoading) {
      return
    }
  },
  loader: async ({ context, params }) => {
    const viewer: string | null = context.auth.session?.user.user_metadata.u_qid || null
    const search: string = params.qid

    console.log(viewer, search)
    if (viewer === search) {
      throw redirect({ to: '/profile/home', replace: true })
    }
    return await context.queryClient.ensureQueryData({
      queryKey: ['user', search],
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
        return { user: response.user, post: response.post, relation: response.relation, viewer: viewer }
      }
    })
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { user: userData, post: postData, relation: relationData, viewer: viewer } = Route.useLoaderData()
  const data = { user: userData, posts: postData, relations: relationData }
  return (
    <>
      <div className='h-screen w-screen flex flex-col gap-3'>
        {/* <ProfileCard information={data} />
        <pre className='w-9/12 text-pretty overflow-hidden break-words'>{JSON.stringify(relationData, null, 2)}</pre>
        {postData.map((post, index) => (
          <PostCard key={index} post={post} />
        ))} */}
        <pre className='w-9/12 text-pretty break-words'>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  )
}