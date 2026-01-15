import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$qid')({
  component: RouteComponent,
})

function RouteComponent() {
  const { qid } = Route.useParams()
  const profile = ''

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white p-6">
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
              {profile ? JSON.stringify(profile, null, 2) : ''}
            </pre>
          </div>
          <div>
            <p className="text-[10px] text-emerald-500 font-bold mb-2">SUPABASE_AUTH</p>
            <pre className="text-[11px] p-3 bg-black/50 rounded border border-white/5 overflow-auto font-mono">
              {qid}
            </pre>
          </div>
        </div>
      </details>
    </div>
  )
}