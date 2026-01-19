import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import PostCard from '@/components/post-card'

type postType = {
  p_id: string | null,
  p_author_qid: string | null,
  p_text: string | null,
  p_likes_count: number | null,
  p_comments_count: number | null,
  created_at: string | null,
  p_url: string | null,
  p_author_pfp: string | null
}

export const Route = createFileRoute('/p/$pid')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ['post', params.pid],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/search/${params.pid}`)
        if (!res.ok) throw new Error('Failed to fetch post')
        return await res.json()
      }
    })
  },
  pendingComponent: () => <Loader />
})

function RouteComponent() {
  const res = Route.useLoaderData() as postType
  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <PostCard key={1} post={res} />
    </div>
  )
}
