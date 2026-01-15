import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/lib/components/ui/button'
import { Scroller } from '@/lib/components/ui/scroller'
import Loader from '@/components/loader'
import { SUPABASE_CLIENT } from '@/hooks/variables'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/profile')({
  loader: async () => {
    // return await SUPABASE_CLIENT.auth.getUser()
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const ctx = Route.useRouteContext()
  function logout() {
    SUPABASE_CLIENT.auth.signOut()
    toast.info("Logged out, stay safe 🙂")
    navigate({ to: '/', replace: true })
  }

  return (
    <Scroller hideScrollbar className='flex flex-col p-1 sm:p-5'>
      <details className="group border border-white/10 rounded-lg bg-white/5 overflow-hidden">
        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-xs font-mono uppercase tracking-tighter text-neutral-500">
            Debug System State
          </span>
        </summary>
        <div className="p-4 border-t border-white/10 space-y-4">
          <div>
            <p className="text-[10px] text-cyan-500 font-bold mb-2">BACKEND_RESPONSE</p>
            <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto max-h-40 font-mono">
              {/* {null ? JSON.stringify(null, null, 2) : ''} */}
            </pre>
          </div>
          <div>
            <p className="text-[10px] text-emerald-500 font-bold mb-2">SUPABASE_AUTH</p>
            <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto font-mono">
              {/* {qid} */}
            </pre>
          </div>
        </div>
      </details>
      <Button onClick={logout} className='w-fit mt-8'>
        Log Out
      </Button>
      <Button onClick={async () => {
        try {
          console.log((await SUPABASE_CLIENT.auth.getUser()).data.user)
        }
        catch {
          console.error('error')
        }
      }}>
        Log session
      </Button>
    </Scroller>
  );
}