import { ThemeToggler } from './theme-toggler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from '@/lib/components/ui/dialog';
import { Settings2, LogOutIcon, CircleAlertIcon } from 'lucide-react';
import { Button } from '../lib/components/ui/button';
import { SUPABASE_CLIENT } from '@/hooks/variables';
import { useAuth } from '@/hooks/auth-provider'
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/lib/components/ui/input';
import { useState, useId } from 'react';
import { useMutation } from '@tanstack/react-query';

export default function Settings() {
  const navigate = useNavigate()
  const id = useId();
  const [inputValue, setInputValue] = useState('');
  const { user, session } = useAuth()
  const [qid, access_token]: [string, string | undefined] = [user?.user_metadata.u_qid, session?.access_token]

  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!access_token) {
        throw new Error("User not found")
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      return response
    },
    onSuccess: async () => {
      // await SUPABASE_CLIENT.auth.signOut()
      toast.info("Goodbye 😓")
      return navigate({ to: '/', replace: true })
      // window.location.reload()
    },
    onError: (err) => {
      toast.error("Something went wrong, maybe universe is not ready for you to leave 😅")
      console.error(err)
    }
  })
  function logout() {
    SUPABASE_CLIENT.auth.signOut()
    toast.info("Logged out, stay safe 🙂")
    return navigate({ to: '/', replace: true })
  }
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
              onClick={logout}
              className='cursor-pointer'
            >
              <LogOutIcon /> <span>Log Out</span>
            </Button>
          </DialogClose>
        </div>
        <div className='flex gap-5 justify-center items-center'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <CircleAlertIcon className="opacity-80" size={16} />
                </div>
                <DialogHeader>
                  <DialogTitle className="sm:text-center">
                    Final confirmation
                  </DialogTitle>
                  <DialogDescription className="sm:text-center">
                    This action cannot be undone. To confirm, please enter your qid <span className="text-red-500">{qid}</span>.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <form className="space-y-5">
                <div className="*:not-first:mt-2">
                  <label htmlFor={id}>Qid</label>
                  <Input
                    type="text"
                    placeholder={`Type ${qid} to confirm`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1 cursor-pointer"
                    disabled={inputValue !== qid}
                    onClick={() => deleteAccount.mutate()}
                  >
                    Delete Account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
