import { ThemeToggler } from './theme-toggler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Settings2, LogOutIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useSignOutAccount } from '@/supabase/signout';

export default function Settings() {
   const { mutate: signOut, isPending } = useSignOutAccount();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Settings2 />
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
          <DialogClose>
            <div>
              <Button 
                onClick={() => signOut()} 
                disabled={isPending}
                className='cursor-pointer'
              >
                <LogOutIcon />
              </Button>
              <span>Log Out</span>
            </div>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
