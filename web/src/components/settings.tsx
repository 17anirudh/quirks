import { ThemeToggler } from './theme-toggler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/lib/components/ui/dialog';
import { Settings2, LogOutIcon } from 'lucide-react';
import { Button } from '../lib/components/ui/button';
import { useMutation, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SUPABASE_CLIENT } from '@/hooks/utils';
import { useNavigate } from '@tanstack/react-router';

export default function Settings({ queryClient }: { queryClient: QueryClient }) {
  const navigate = useNavigate()
  const byeAccount = useMutation({
    mutationFn: async () => {
      const { error: authError } = await SUPABASE_CLIENT.auth.signOut()
      if (authError) throw authError
    },
    onError: (err) => {
      toast.error(err.message + '😅')
      throw new Error(err.message)
    },
    onSuccess: () => {
      toast.success("Stay safe, see you again 😀")
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      return navigate({ to: '/', replace: true })
    }
  })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='bg-transparent cursor-pointer'>
          <Settings2 /> App Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              SETTINGS
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Quick Settings.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className='flex gap-5 justify-center items-center'>
          <ThemeToggler />
          <span>Click to change Theme</span>
        </div>
        <div className='flex gap-5 justify-center items-center'>
          <DialogClose asChild>
            <Button
              onClick={() => byeAccount.mutate()}
              className='cursor-pointer'
            >
              <LogOutIcon /> <span>Log Out</span>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
