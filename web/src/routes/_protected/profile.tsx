import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/lib/components/ui/button'
import { Scroller } from '@/lib/components/ui/scroller'
import { SUPABASE_CLIENT } from '@/hooks/variables'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/loader'

type queryResult = {
  u_id: string | null,
  u_mail: string | null,
  u_qid: string | null,
  u_created_at: string | null,
  u_name: string | null,
  u_bio: string | null,
  u_pfp: string | null,
  u_friends: string[] |null,
  u_posts: string[] | null,
  u_updated_at: string | null
}

const userQueryOptions = (u_qid: string) => ({
  queryKey: ['user', u_qid],
  queryFn: async () => {
    const { data, error } = await SUPABASE_CLIENT
      .from("user")
      .select("*")
      .eq("u_qid", u_qid)
      .maybeSingle()
    if (error) throw error
    return data as queryResult
  }
})

export const Route = createFileRoute('/_protected/profile')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(userQueryOptions(context.qid))
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { qid } = Route.useRouteContext()
  const { data: profile } = useQuery(userQueryOptions(qid))

  return (
    <Scroller hideScrollbar className='flex flex-col p-1 sm:p-5'>
      <header className='w-full flex flex-col justify-center items-center mt-2 gap-15'>
        <h2 className='text-2xl font-serif'>
            @{profile?.u_qid ?? "Loading..."}
        </h2>
        
        <div className='flex gap-3 sm:gap-9'>
          <div>
            {/* Fallback to duck.gif if u_pfp is null */}
            <img 
                className='w-18 sm:w-36 rounded-full border aspect-square object-cover' 
                src={profile?.u_pfp || './duck.gif'} 
                alt='DP'
            />
          </div>
          <div className='flex flex-col gap-3'>
            <p className='text-base md:text-xl'>{profile?.u_name ?? "User"}</p>
            <Button className='cursor-pointer w-fit p-2 text-base md:text-xl' variant='ghost'>
              {/* Corrected to show count of friends */}
              {profile?.u_friends?.length || 0} friends
            </Button>
            <p className='text-base md:text-xl'>{profile?.u_bio || null}</p>
            <Button className='cursor-pointer w-fit p-2'>Modify profile</Button>
          </div>
        </div>
      </header>

      <main className="mt-8">
        <h2 className='text-xl sm:text-2xl font-bold uppercase mb-7 text-center'>POSTS</h2>
        <div className='flex flex-wrap gap-6 justify-center'>
          {/* Corrected typo: u_posts instead of u_post */}
          {profile?.u_posts && profile.u_posts.length > 0 ? (
            profile.u_posts.map((item, index) => (
              <div key={index} className="h-60 w-60 rounded-md border p-2 overflow-hidden bg-secondary/20">
                <img src={item} alt={`Post ${index}`} className='w-full h-full object-cover rounded' />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No posts yet 🦆</p>
          )}
        </div>
        
        <details className="mt-10 opacity-50">
            <summary className="cursor-pointer text-xs">Debug Raw Data</summary>
            <pre className="text-xs p-2 bg-black/10 rounded">
                {JSON.stringify(profile, null, 2)}
            </pre>
        </details>
      </main>
    </Scroller>
  );
}