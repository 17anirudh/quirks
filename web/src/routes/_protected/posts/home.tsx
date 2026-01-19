import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-5 items-center pt-10 h-full'>

    </div>
  )
}
