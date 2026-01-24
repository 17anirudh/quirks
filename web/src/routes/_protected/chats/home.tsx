import { createFileRoute } from '@tanstack/react-router'
import { MessageCircle } from 'lucide-react'

export const Route = createFileRoute('/_protected/chats/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='md:flex md:flex-col md:justify-center md:items-center md:h-full md:w-full hidden'>
      <MessageCircle className='text-2xl' />
      <p className='text-center'>Click a chat to start messaging</p>
    </div>
  )
}
