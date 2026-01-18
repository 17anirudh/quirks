import { createFileRoute } from '@tanstack/react-router'
import PostCard from '@/components/post-card'

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-5 items-center pt-10 h-full'>
      {Array.from({ length: 10 }).map((_, index) => (
        <PostCard key={index} />
      ))}
    </div>
  )
}
