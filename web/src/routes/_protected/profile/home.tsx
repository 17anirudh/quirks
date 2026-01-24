import { createFileRoute, Link } from '@tanstack/react-router'
import Loader from '@/components/loader'
import { PlusCircleIcon, WrenchIcon, EarthIcon, BellIcon, BellDotIcon, XIcon, CheckIcon } from 'lucide-react'
import PostCard from '@/components/post-card'
import ProfileCard from '@/components/profile-card'
import { toast } from 'sonner'
import { Button } from '@/lib/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/lib/components/ui/dialog';
import { useMutation } from '@tanstack/react-query'

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

export const Route = createFileRoute('/_protected/profile/home')({
  loader: async ({ context }) => {
    const data = await context.queryClient.getQueryData(['me'])
    return data
  },
  pendingComponent: () => <Loader />,
  component: RouteComponent,
  pendingMinMs: 0
})

function RouteComponent() {
  const ctx = Route.useLoaderData() as queryResponse
  const queryClient = Route.useRouteContext().queryClient
  // return (
  //   <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
  //     <pre className='w-9/12 text-pretty p-4 break-words overflow-hidden'>{JSON.stringify(ctx, null, 2)}</pre>
  //   </div>
  // )
  async function copyLink(): Promise<void> {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/u/${ctx.user.u_qid}`;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      toast.success(`Link copied to clipboard 🔗`)
      return;
    }
  }
  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: async (fs_id: string) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/friendship/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fs_id, receiver_qid: ctx.user.u_qid })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to accept request')
      }
      return await res.json()
    },
    onSuccess: () => {
      toast.success('Friend request accepted!')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
    mutationFn: async (fs_id: string) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/friendship/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fs_id })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to reject request')
      }
      return await res.json()
    },
    onSuccess: () => {
      toast.success('Friend request rejected')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
  return (
    <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
      {/* Profile Card */}
      <ProfileCard information={ctx} />
      {/* Auth User specific */}
      <div className='flex gap-2 flex-wrap justify-center items-center'>
        <Link className='flex flex-wrap gap-2' to='/profile/settings'>
          <WrenchIcon />
          Settings
        </Link>
        <Link className='flex flex-wrap gap-2' to='/profile/create'>
          <PlusCircleIcon />
          Create Post
        </Link>
        <Button
          className="flex gap-2 flex-wrap cursor-pointer bg-transparent text-foreground hover:bg-transparent hover:text-foreground"
          onClick={copyLink}
        >
          <EarthIcon />
          Share Profile
        </Button>
        {/* Pending Requests */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className='flex gap-2 flex-wrap cursor-pointer bg-transparent text-foreground hover:bg-transparent hover:text-foreground'>
              {ctx.pending?.length > 0 ? <BellDotIcon /> : <BellIcon />}
              Notifications
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                You have {ctx.pending.length} pending notification{ctx.pending.length !== 1 ? 's' : ''}.
              </DialogDescription>
            </DialogHeader>

            <div className='flex flex-col gap-4 mt-4 max-h-96 overflow-y-auto'>
              {ctx.pending.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>No pending notifications</p>
              ) : (
                ctx.pending.map((request) => (
                  <div
                    key={request.fs_id}
                    className='flex items-center justify-between gap-4 p-4 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <p className='font-medium'>{request.sent_qid}</p>
                      <p className='text-sm text-muted-foreground'>
                        Sent you a friend request
                      </p>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() => acceptRequest(request.fs_id!)}
                        disabled={isAccepting || isRejecting}
                      >
                        <CheckIcon className='w-4 h-4' />
                        Accept
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => rejectRequest(request.fs_id!)}
                        disabled={isAccepting || isRejecting}
                      >
                        <XIcon className='w-4 h-4' />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Posts */}
      <div className='w-full flex flex-col gap-2 justify-center items-center'>
        {ctx.post.map((post) => (
          <PostCard post={post} />
        ))}
      </div>
    </div>
  )
}

