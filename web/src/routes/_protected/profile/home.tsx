import { createFileRoute, Link } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { PlusCircleIcon, WrenchIcon } from 'lucide-react'
import PostCard from '@/components/post-card'
import ProfileCard from '@/components/profile-card'

export const Route = createFileRoute('/_protected/profile/home')({
  loader: ({ context }) => {
    return context.queryClient.getQueryData(['me'])
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useLoaderData()
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
      </div>
      {/* Posts */}
      <div className='w-full flex flex-col gap-2 justify-center items-center'>
        {ctx.posts.map((post: any, index: number) => (
          <PostCard key={post.p_id ?? index} post={post} />
        ))}
      </div>
    </div>
  )
}

