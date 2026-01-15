import { createFileRoute } from '@tanstack/react-router'
import { Scroller } from '@/lib/components/ui/scroller'
import Loader from '@/components/loader'
import ProfileCard from '@/components/profile-card'
import type { QueryClient } from '@tanstack/react-query'

type ctxProps = {
  queryClient: QueryClient
  auth: any
}

export const Route = createFileRoute('/_protected/profile')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useRouteContext()
  return (
    <Scroller hideScrollbar className='flex flex-col p-1 sm:p-5'>
      <ProfileCard who='user' qid={ctx.auth?.user?.user_metadata?.u_qid} name='anirudh' />
    </Scroller>
  );
}