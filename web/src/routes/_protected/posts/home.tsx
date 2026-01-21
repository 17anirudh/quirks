import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/posts/home')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <main>
      Hello
    </main>
  )
}
