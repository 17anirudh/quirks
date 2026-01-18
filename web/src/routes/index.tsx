import { createFileRoute, redirect } from '@tanstack/react-router'
<<<<<<< HEAD
import { Vortex } from '@/lib/components/ui/vortex'
=======
import { Vortex } from '@/lib/components/vortex'
>>>>>>> fix-attempt-backup
import { ConfettiFireworks } from '@/components/fireworks'
import { Highlighter } from '@/lib/components/ui/highlighter'
import LoginModal from '@/components/login-modal'
import SignupModal from '@/components/signup-modal'
import Loader from '@/components/loader'
import type { QueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
<<<<<<< HEAD
    // beforeLoad: ({ context }) => {
    //     if (!context.auth?.isLoading && context.auth?.user) {
    //         throw redirect({ to: '/home', replace: true })
    //     }
    // },
=======
    beforeLoad: ({ context }) => {
        if (context.auth.qid) {
            throw redirect({ to: '/home', replace: true })
        }
        return context.queryClient
    },
>>>>>>> fix-attempt-backup
    pendingComponent: () => <Loader />,
    component: AppComponent,
})

function AppComponent() {
    const qClient = Route.useRouteContext().queryClient as QueryClient
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
<<<<<<< HEAD
                        <SignupModal />
                        <LoginModal />
=======
                        <SignupModal client={qClient} />
                        <LoginModal client={qClient} />
>>>>>>> fix-attempt-backup
                    </div>
                </main>
            </Vortex>
        </div>
    )
}
