import { createFileRoute, Link } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { PlusCircleIcon, WrenchIcon } from 'lucide-react'
import PostCard from '@/components/post-card'
import ProfileCard from '@/components/profile-card'
import { toast } from 'sonner'
import { Button } from '@/lib/components/ui/button'
import { EarthIcon } from 'lucide-react'

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
  relation: Array<any | null>
}

export const Route = createFileRoute('/_protected/profile/home')({
  loader: async ({ context }) => {
    const data = await context.queryClient.getQueryData(['me'])
    return data
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
  pendingMinMs: 0
})

function RouteComponent() {
  const ctx = Route.useLoaderData() as queryResponse
  // return (
  //   <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
  //     <pre className='w-9/12 text-pretty p-4 break-words overflow-hidden'>{JSON.stringify(ctx, null, 2)}</pre>
  //   </div>
  // )
  async function copyLink(): Promise<void> {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/u/${ctx.user.u_qid}`;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      toast.success(`Link copied to clipboard 🔗`)
      return;
    }
  }
  return (
    <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
      {/* Profile Card */}
      <ProfileCard information={ctx} />
      {/* Auth User specific */}
      <div className='flex gap-2 flex-wrap'>
        <Link className='flex flex-wrap gap-2' to='/profile/settings'>
          <WrenchIcon />
          Settings
        </Link>
        <Link className='flex flex-wrap gap-2' to='/posts/create'>
          <PlusCircleIcon />
          Create Post
        </Link>
        <Button
          className="flex gap-2 flex-wrap"
          variant="link"
          onClick={copyLink}
        >
          <EarthIcon />
        </Button>
      </div>
      {/* Posts */}
      <div className='w-full flex flex-col gap-2 justify-center items-center'>
        {ctx.post.map((post) => (
          <PostCard post={post} />
        ))}
      </div>
    </div>
  )
}

