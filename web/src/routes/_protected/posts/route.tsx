import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import type { FormEvent } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_protected/posts')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const userSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const qid: string = e.currentTarget.qid.value.trim();
    if (!qid || qid.length < 3 || qid.includes('/') || qid.includes('@') || qid.length > 200) {
      toast.error('Invalid username')
      return;
    }
    navigate({ to: '/u/$qid', params: { qid } })
  }
  return (
    <div className='flex flex-col gap-5 items-center pt-2 min-h-full w-full'>
      <header className='w-9/12'>
        <form onSubmit={(e) => userSearch(e)} className='flex gap-2 border-4 w-full'>
          <Input type='text' placeholder='Search' name='qid' />
          <Button type='submit'>Search</Button>
        </form>
      </header>
      <Outlet />
    </div>
  )
}
