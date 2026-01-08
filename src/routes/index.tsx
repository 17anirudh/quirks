import { createFileRoute, redirect } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { supabase } from '@/auth/variables'
import { Button } from '@/components/ui/button'
import { useSignOutAccount } from '@/auth/signout' 

export const Route = createFileRoute('/')({
  loader: () => <Loader />,
  beforeLoad: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      throw redirect({
        to: '/onboard',
        search: {
          message: 'Please login/signup first',
        },
      })
    }
    return { user }
  },
  component: App,
})

async function App() {
  const { user } = Route.useRouteContext()
  const { mutate: signOut, isPending } = useSignOutAccount();
  return (
    <div className='flex flex-col min-h-screen w-screen justify-center items-center'>
      <pre>routes/index.tsx</pre>
      <Button 
        onClick={() => signOut()} 
        disabled={isPending}
        className='cursor-pointer'
      >
        {isPending ? "Logging out..." : "Log Out"}
      </Button>
      <div className='flex gap-5'>
        <pre>Hello {JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  )
}
