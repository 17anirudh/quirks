import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Vortex } from '@/lib/ui/vortex'
import { ConfettiFireworks } from '@/components/fireworks'
import { Highlighter } from '@/lib/ui/highlighter'
import LoginModal from '@/components/login-modal'
import { SUPABASE_CLIENT } from '@/hooks/variables'
import Loader from '@/components/loader'

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const { data: { session } } = await SUPABASE_CLIENT.auth.getSession()
        if (session) {
            throw redirect({ 
                to: '/home', 
                replace: true,
            })
        }
    },
    pendingComponent: () => <Loader />,
    component: AppComponent,
})

function AppComponent() {
    return (
        <div className='h-dvh w-screen'>
            <Vortex backgroundColor='black'>
            <main className='w-screen h-dvh flex flex-col justify-center items-center gap-9 -z-20 absolute'>
                <ConfettiFireworks>
                    <Highlighter action='underline' color='#f59e0b'>
                        <img src='./duck.gif' alt='logo' className='h-20' title='Quak.. quak...' />
                        <h1 className='text-4xl font-semibold font-serif'>QUIRKS</h1>
                    </Highlighter>
                </ConfettiFireworks>
                <div className="flex gap-7">
                    <Link to='/signup' className='cursor-pointer'>Sign up</Link>
                    <LoginModal />
                </div>
            </main>
        </Vortex>
        </div>
    )
}
