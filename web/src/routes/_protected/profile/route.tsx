import { createFileRoute, Outlet } from '@tanstack/react-router'

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

export const Route = createFileRoute('/_protected/profile')({
  loader: async ({ context }) => {
    const qid = context.auth.session?.user.user_metadata.u_qid
    return context.queryClient.ensureQueryData({
      queryKey: ['me'],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/me`, {
          method: 'GET',
          headers: {
            'id': qid
          }
        })
        return await res.json() as queryResponse
      }
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <><Outlet /></>
}
