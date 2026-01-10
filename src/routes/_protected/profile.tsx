import { supabase } from '@/supabase/variables'
import type { QueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Scroller } from '@/components/ui/scroller'

type ctxResponse = {
  queryClient: QueryClient,
  email: string | null,
  email_verified: boolean,
  phone_verified: boolean,
  sub: string | null,
  u_name: string | null,
  u_qid: string | null,
  u_count: string | number | null
}

export const Route = createFileRoute('/_protected/profile')({
  // beforeLoad: async () => {
  //   const user = (await supabase.auth.getUser()).data.user?.user_metadata
  //   return user as ctxResponse ?? null;
  // },
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useRouteContext() as ctxResponse;
  return (
    <Scroller hideScrollbar className='flex flex-col p-1 sm:p-5'>
      <header className='w-full flex flex-col justify-center items-center mt-2 gap-15'>
        <h2 className='text-2xl font-serif'>@{ctx ? `${ctx.u_qid}` : "Loading..."}</h2>
        {/* flex card */}
        <div className='flex gap-3 sm:gap-9'>
          <div>
            <img className='w-18 sm:w-36 rounded-full border aspect-square' src='./duck.gif' alt='DP'/>
          </div>
          <div className='flex flex-col gap-3'>
            <p className='text-base md:text-xl'>{ctx ? `${ctx.u_name}` : "Loading..."}</p>
            <Button className='cursor-pointer w-fit p-2 text-base md:text-xl' variant='ghost'>
              {ctx ? `${ctx.u_count} + friends` : "Loading..."}
            </Button>
            <Button className='cursor-pointer w-fit p-2'>Modify profile</Button>
          </div>
        </div>
      </header>
      <main>
        <pre className="text-sm text-muted-foreground">
          {ctx ? JSON.stringify(ctx, null, 2) : "Loading...."}
        </pre>
        {/* POST */}
        <h2 className='text-xl sm:text-2xl font-bold uppercase mb-7 text-center'>POSTS</h2>
        <div className='flex flex-wrap gap-6 justify-center'>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-100 rounded-md w-100 border p-4 gap-5"
            >
              <p className="font-medium text-lg">Card {index + 1}</p>
              <span className="text-muted-foreground text-sm">
                This is a card description.
              </span>
            </div>
          ))}
        </div>
      </main>
    </Scroller>
  );
}
