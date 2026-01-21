import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  TimerDisplay,
  TimerIcon,
  TimerRoot,
} from '@/lib/components/timer';
import { useGlobalTimer } from '@/hooks/time-provider';
import { SearchIcon } from 'lucide-react';

export const Route = createFileRoute('/_protected/posts')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { remainingSeconds, isBlocked } = useGlobalTimer();
  const location = useLocation();

  // Icon spins only when on posts route and NOT blocked
  const isRunning = location.pathname.startsWith('/_protected/posts/home') && !isBlocked;

  const formatDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    <div className='flex flex-col gap-5 items-center pt-2 h-full w-full overflow-hidden'>
      {/* Header and Timer stay fixed at the top because the parent is h-screen and hidden overflow */}
      <header className='w-9/12 flex-none'>
        <div className="text-xs text-muted-foreground">
          DEBUG: Route={location.pathname} | Running={isRunning.toString()} | Blocked={isBlocked.toString()} | Secs={remainingSeconds}
        </div>
        <form onSubmit={(e) => userSearch(e)} className='flex gap-2 border-4 w-full'>
          <Input type='text' placeholder='Search' name='qid' />
          <Button type='submit' className='cursor-pointer'><SearchIcon /></Button>
        </form>
      </header>

      <TimerRoot variant={isBlocked ? "destructive" : "outline"} size="lg">
        {/* loading prop triggers 'animate-spin' */}
        <TimerIcon size="lg" loading={isRunning} />
        <TimerDisplay size="lg" time={formatDisplay(remainingSeconds)} />
      </TimerRoot>

      {/* The Outlet container takes up the remaining space and handles scrolling */}
      <div className='w-full flex-1 overflow-y-auto'>
        <Outlet />
      </div>
    </div>
  )
}
