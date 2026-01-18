import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/post/view/$pid')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/post/view/$pid"!</div>
}
