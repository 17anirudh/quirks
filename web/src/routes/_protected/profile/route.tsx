import Loader from '@/components/loader'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/profile')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  return <><Outlet /></>
}
