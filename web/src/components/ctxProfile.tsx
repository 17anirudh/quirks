import { Button } from '@/lib/components/ui/button'
import { HandIcon, LoaderIcon, HandshakeIcon } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from '@/lib/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogClose
} from '@/lib/components/ui/dialog'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { useMutation, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { SUPABASE_CLIENT } from '@/hooks/utils'

type props = {
    relation?: any | null
    viewer: string | null
    targetQid: string | null
    queryClient: QueryClient
}

export default function CtxProfile({ relation, viewer, targetQid, queryClient }: props) {
    const navigate = useNavigate()

    const { mutate: sendRequest, isPending: isSending } = useMutation({
        mutationFn: async () => {
            if (!viewer || !targetQid) throw new Error('Missing user information')
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/friendship/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sent_qid: viewer, receive_qid: targetQid })
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to send request')
            }
            return await res.json()
        },
        onSuccess: () => {
            toast.success('Friend request sent!')
            queryClient.invalidateQueries({ queryKey: ['user', targetQid, viewer] })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: removeRequest, isPending: isRemoving } = useMutation({
        mutationFn: async (fs_id: string) => {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/friendship/remove`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fs_id })
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to remove request')
            }
            return await res.json()
        },
        onSuccess: () => {
            toast.success('Updated friendship status')
            queryClient.invalidateQueries({ queryKey: ['user', targetQid, viewer] })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: initChat } = useMutation({
        mutationFn: async () => {
            const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
            if (!session) throw new Error("Unauthorized");

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ target_qid: targetQid })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to start chat");
            }
            return await res.json();
        },
        onSuccess: (data: { conv_id: string }) => {
            navigate({ to: '/messages/$chatId', params: { chatId: data.conv_id } });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    })

    // No relationship exists - show "Initiate" button
    if (!relation) {
        return (
            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <Button className='w-fit p-4' disabled={isSending}>
                        {isSending ? <LoaderIcon className='animate-spin' /> : <>Initiate <HandIcon /></>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Button className='w-fit p-4' onClick={() => sendRequest()}>Send Friend Request</Button>
                    <Button className='w-fit p-4' onClick={() => initChat()}>Message</Button>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // Pending state
    if (relation.fs_status === 'pending') {
        const isSender = relation.sent_qid === viewer

        return (
            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <Button className='w-fit p-4' disabled={!isSender}>
                        Pending... <LoaderIcon className='animate-spin' />
                    </Button>
                </DropdownMenuTrigger>
                {isSender && (
                    <DropdownMenuContent>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='w-fit p-4' disabled={isRemoving}>
                                    Withdraw Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>Are you sure?</DialogHeader>
                                <div className='flex flex-col gap-4'>
                                    <h3>Try messaging instead 🙂</h3>
                                    <div className='flex flex-row flex-wrap gap-2'>
                                        <DialogClose asChild>
                                            <Button className='w-fit p-4' variant="destructive" onClick={() => removeRequest(relation.fs_id)}>
                                                Yes, Withdraw
                                            </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button className='w-fit p-4' variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button className='w-fit p-4' onClick={() => initChat()}>Message</Button>
                    </DropdownMenuContent>
                )}
            </DropdownMenu>
        )
    }

    // Friends status - show unfriend option
    if (relation.fs_status === 'friends') {
        return (
            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <Button className='w-fit p-4'>
                        Friends <HandshakeIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='w-fit p-4' disabled={isRemoving}>
                                Unfriend
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>Are you sure?</DialogHeader>
                            <div className='flex flex-col gap-4'>
                                <h3>They won't be notified, but you'll lose access to friends-only content.</h3>
                                <div className='flex flex-row flex-wrap gap-2'>
                                    <DialogClose asChild>
                                        <Button className='w-fit p-4' variant="destructive" onClick={() => removeRequest(relation.fs_id)}>
                                            Yes, Unfriend
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button className='w-fit p-4' variant="outline">Cancel</Button>
                                    </DialogClose>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button className='w-fit p-4' onClick={() => initChat()}>Message</Button>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return null
}