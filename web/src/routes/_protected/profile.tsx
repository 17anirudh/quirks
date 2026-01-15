import { createFileRoute } from '@tanstack/react-router'
import { Scroller } from '@/lib/components/ui/scroller'
import Loader from '@/components/loader'
import ProfileCard from '@/components/profile-card'

type ctxProps = { 
  queryClient: any | JSON,
  qid?: string 
}

export const Route = createFileRoute('/_protected/profile')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useRouteContext() as ctxProps
  return (
    <Scroller hideScrollbar className='flex flex-col p-1 sm:p-5'>
      <ProfileCard qid={ctx.qid} name='anirudh' />
    </Scroller>
  );
}