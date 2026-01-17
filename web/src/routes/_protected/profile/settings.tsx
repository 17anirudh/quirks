import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { Tabs } from '@/lib/components/tabs'
import { type ReactNode, useState, useId } from 'react'
import { ThemeToggler } from '@/components/theme-toggler'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SUPABASE_CLIENT } from '@/hooks/utils'
import { Button } from '@/lib/components/ui/button'
import { LogOutIcon, Trash2Icon, CircleAlertIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/lib/components/ui/dialog';
import { Label } from '@/lib/components/ui/label'
import { Input } from '@/lib/components/ui/input'

export const Route = createFileRoute('/_protected/profile/settings')({
  loader: async ({ context }) => {
    const qid = context.auth.user?.user_metadata.u_qid
    return context.queryClient.ensureQueryData({
      queryKey: ['user', qid],
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/search/${qid}`)
        return await res.json() as res
      }
    })
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

type res = {
  u_qid: string | null,
  u_name: string | null,
  u_bio: string | null,
  u_pfp: string | null
}
type tabsType = {
  title: string;
  value: string;
  content: ReactNode;
}

function RouteComponent() {
  const navigate = useNavigate()
  const ctx = Route.useRouteContext()
  const [q, qid] = [ctx.queryClient, ctx.auth.user?.user_metadata.u_qid]
  const id = useId();
  const [inputValue, setInputValue] = useState('');
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
      q.invalidateQueries({ queryKey: ['auth'] })
      toast.info("Stay safe, see you again 😀")
      navigate({ to: '/', replace: true })
    }
  })
  const tabs: tabsType[] = [
    {
      title: "App",
      value: "app",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black dark:text-white bg-white dark:bg-black">
          <p>App Settings</p>
          {/* Theme Toggler */}
          <div className='flex gap-5 justify-center items-center'>
            <ThemeToggler />
            <span>Click to change Theme</span>
          </div>
        </div>
      ),
    },
    {
      title: "Account",
      value: "account",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black dark:text-white bg-white dark:bg-black">
          <p>Account Settings</p>
          {/* Log out */}
          <div>
            <Button
              onClick={() => byeAccount.mutate()}
              className='cursor-pointer'
            >
              <LogOutIcon /> <span>Log Out</span>
            </Button>
          </div>
          {/* Delete Account */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className='cursor-pointer text-red-500 bg-red-500/10 hover:bg-red-500/20'>
                <Trash2Icon /><span>Delete Account</span>
              </Button>
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
                  <Label htmlFor={id}>Q ID</Label>
                  <Input
                    id={id}
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
                    className="flex-1"
                    disabled={inputValue !== qid}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )
    }
  ]
  return (
    <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full items-start justify-start my-20">
      <Tabs tabs={tabs} />
    </div>
  )
}
