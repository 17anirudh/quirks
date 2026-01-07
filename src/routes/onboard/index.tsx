import { createFileRoute, Link } from '@tanstack/react-router'
import { Vortex } from '@/components/ui/vortex'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/onboard/')({
  component: Onboard,
})

function Onboard() {
  return (
    <div className='flex flex-col min-h-screen w-screen justify-center items-center'>
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <h1>QUIRKS!!!</h1>
        <pre>onboard/index.tsx</pre>
        <div className='flex gap-5'>
          <Button asChild>
            <Link to='/onboard/signup' className='p-5 underline animate-pulse'>Signup</Link>
          </Button>
        </div>
      </Vortex>
    </div>
  )
}