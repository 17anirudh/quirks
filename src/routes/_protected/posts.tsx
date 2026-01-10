import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/posts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/posts"!</div>
}
