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
import PfpForm from '@/components/pfpForm'
import { useSignOut } from '@/hooks/auth-provider'

type queryResponse = {
  user: {
    u_qid: string | null,
    u_bio: string | null,
    u_pfp: string | null,
    u_name: string | null
  },
  post: {
    p_id: string | null,
    p_author_qid: string | null,
    p_text: string | null,
    p_likes_count: number | null,
    p_comments_count: number | null,
    created_at: string | null,
    p_url: string | null
    p_author_pfp: string | null
  }[],
  relation: {
    fs_id: string | null,
    sent_qid: string | null,
    receive_qid: string | null,
    fs_status: string | null,
    fs_created_at: string | null
  }[],
  pending: {
    fs_id: string | null,
    sent_qid: string | null,
    receive_qid: string | null,
    fs_status: string | null,
    fs_created_at: string | null
  }[]
}

type tabsType = {
  title: string;
  value: string;
  content: ReactNode;
}

export const Route = createFileRoute('/_protected/profile/settings')({
  loader: async ({ context }) => {
    return context.queryClient.getQueryData(['me'])
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const ctx = Route.useLoaderData() as queryResponse
  const qClient = Route.useRouteContext().queryClient

  const id = useId()
  const [inputValue, setInputValue] = useState<string>('')

  const signOut = useSignOut()

  const tabs: tabsType[] = [
    {
      title: "Account",
      value: "account",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-black dark:text-white bg-white dark:bg-black">
          <p>Account Settings</p>
          {/* Pfp Upload */}
          <PfpForm loading={ctx.user!} client={qClient} qid={ctx.user.u_qid!} />
          {/* Log out */}
          <div className='mt-9 p-5 w-fit'>
            <Button
              variant="ghost"
              onClick={() => signOut.mutate()}
              className='cursor-pointer bg-yellow-500/10 hover:bg-yellow-500/20'
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
                    This action cannot be undone. To confirm, please enter your qid <span className="text-red-500">{ctx.user.u_qid}</span>.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <form className="space-y-5">
                <div className="*:not-first:mt-2">
                  <Label htmlFor={id}>Q ID</Label>
                  <Input
                    id={id}
                    type="text"
                    placeholder={`Type ${ctx.user.u_qid} to confirm`}
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
                    disabled={inputValue !== ctx.user.u_qid}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
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
    }
  ]
  return (
    <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full items-start justify-start my-20">
      <Tabs tabs={tabs} />
    </div>
  )
}