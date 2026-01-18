import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  return (
    <div className='flex flex-col h-full w-full items-center justify-center'>
      <h1 className='text-2xl font-bold'>QUIRKS</h1>
      <p className='text-xl'>Welcome back, {context.auth.user?.user_metadata.u_qid}</p>
    </div>
  )
}
