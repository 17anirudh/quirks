<<<<<<< HEAD:web/src/routes/_protected/posts.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from '@/lib/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/lib/components/ui/button'
import { useState } from 'react'
=======
import { createFileRoute, Outlet } from '@tanstack/react-router'
>>>>>>> fix-attempt-backup:web/src/routes/_protected/posts/route.tsx

export const Route = createFileRoute('/_protected/posts')({
  component: RouteComponent,
})

function RouteComponent() {
<<<<<<< HEAD:web/src/routes/_protected/posts.tsx
  const [user, setUser] = useState<string>('')
  const navigate = useNavigate()
  function search(user: string) {
    navigate({
      to: '/user/$qid',
      params: {
        qid: user
      },
    })
  }
  return (
    <div className='flex flex-col h-full'>
      <form method="post" className='flex items-center gap-2 p-5' onSubmit={(e) => e.preventDefault()}>
        <Input
          className="w-full bg-muted rounded-full px-4 py-2 outline-none"
          type='text'
          onChange={(e) => setUser(e.target.value)}
          required
        />
        <Button variant='ghost' type='submit' onClick={() => search(user)}>
          <SearchIcon />
        </Button>
      </form>
    </div>
  )
=======
  return <div><Outlet /></div>
>>>>>>> fix-attempt-backup:web/src/routes/_protected/posts/route.tsx
}
