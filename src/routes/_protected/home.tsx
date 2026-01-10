import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col justify-center items-center'>
        <h1>hello</h1>
    </div>
  )
}
