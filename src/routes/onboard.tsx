import { supabase } from '@/supabase/variables'
import { ConfettiFireworks } from '@/components/fireworks'
import Loader from '@/components/loader'
import LoginModal from '@/components/login-modal'
import SignupModal from '@/components/signup-modal'
import { Highlighter } from '@/components/ui/highlighter'
import { Vortex } from '@/components/ui/vortex'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/onboard')({
    beforeLoad: async () => {
        const session = await supabase.auth.getSession()
        if (session.error || !session.data) {
          redirect({to:'/onboard'})
        }
      },
      loader: () => <Loader />,
  component: App,
})

function App() {
    return (
        <div className='fixed -z-20 h-screen w-screen'>
            <Vortex backgroundColor='black' className='w-full h-full flex flex-col justify-center items-center gap-9'>
                    <ConfettiFireworks>
                        <Highlighter action='underline' color='#f59e0b'>
                            <img src='./duck.gif' alt="logo" className="h-20" title="Quak.. quak..." />
                            <h1 className='text-4xl font-semibold font-serif'>QUIRKS</h1>
                        </Highlighter>
                    </ConfettiFireworks>
                <div className="flex gap-7">
                    <SignupModal />
                    <LoginModal />
                </div>
            </Vortex>
        </div>
    )
}