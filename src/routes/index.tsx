import { createFileRoute, redirect } from '@tanstack/react-router'
import { Vortex } from '@/components/ui/vortex'
import { ConfettiFireworks } from '@/components/fireworks'
import { Highlighter } from '@/components/ui/highlighter'
import SignupModal from '@/components/signup-modal'
import LoginModal from '@/components/login-modal'
import { supabase } from '@/supabase/variables'

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        // If a session exists, the user is already logged in. 
        if (session && !error) {
            throw redirect({ to: '/home', replace: true })
    }
},
    component: Onboard,
})

function Onboard() {
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
                    <SignupModal />
                    <LoginModal />
                </div>
            </main>
        </Vortex>
        </div>
    )
}
