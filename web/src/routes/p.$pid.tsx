import { createFileRoute } from '@tanstack/react-router'
import Loader from '@/components/loader'
import PostCard from '@/components/post-card'
import { queryPost } from '@/api/api'
import { useQuery } from '@tanstack/react-query'
import { Keys } from '@/context/keys'

export const Route = createFileRoute('/p/$pid')({
  component: RouteComponent,
  pendingComponent: () => <Loader />
})

function RouteComponent() {
  const res = Route.useParams();
  const { data, isPending, error } = useQuery({
    queryKey: Keys.post(res.pid),
    queryFn: async () => await queryPost(res.pid)
  })
  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      {isPending ? <Loader /> : error ? <div>Error</div> : <PostCard key={1} post={data} />}
    </div>
  )
}
