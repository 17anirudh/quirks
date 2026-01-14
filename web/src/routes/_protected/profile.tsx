import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/lib/components/ui/button'
import { Scroller } from '@/lib/components/ui/scroller'
import Loader from '@/components/loader'
import { SUPABASE_CLIENT } from '@/hooks/variables'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/profile')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  function logout() {
    SUPABASE_CLIENT.auth.signOut()
    toast.info("Logged out, stay safe 🙂")
    navigate({ to: '/', replace: true })
  }

  return (
    <Scroller hideScrollbar className='flex flex-col p-1 sm:p-5'>
      <Button onClick={logout}>
        Log Out
      </Button>
      <Button onClick={() => console.log(`${import.meta.env.VITE_BACKEND_URL}/signup`)}>Log</Button>
    </Scroller>
  );
}