import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <main className='w-full flex flex-col gap-5 items-center'>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className='border-4 w-9/12 h-40'>
          Hello
        </div>
      ))}
    </main>
  )
}
