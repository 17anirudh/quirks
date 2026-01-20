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

type props = {
    relation?: any | null
    viewer: string | null
    targetQid: string | null
    queryClient: QueryClient
}

export default function CtxProfile({ relation, viewer, targetQid, queryClient }: props) {

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

    // No relationship exists - show "Initiate" button
    if (!relation) {
        return (
            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <Button disabled={isSending}>
                        {isSending ? <LoaderIcon className='animate-spin' /> : <>Initiate <HandIcon /></>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Button onClick={() => sendRequest()}>Send Friend Request</Button>
                    <Button>Message</Button>
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
                    <Button disabled={!isSender}>
                        Pending... <LoaderIcon className='animate-spin' />
                    </Button>
                </DropdownMenuTrigger>
                {isSender && (
                    <DropdownMenuContent>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button disabled={isRemoving}>
                                    Withdraw Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>Are you sure?</DialogHeader>
                                <div className='flex flex-col gap-4'>
                                    <h3>Try messaging instead 🙂</h3>
                                    <div className='flex flex-row flex-wrap gap-2'>
                                        <DialogClose asChild>
                                            <Button variant="destructive" onClick={() => removeRequest(relation.fs_id)}>
                                                Yes, Withdraw
                                            </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button>Message</Button>
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
                    <Button>
                        Friends <HandshakeIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button disabled={isRemoving}>
                                Unfriend
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>Are you sure?</DialogHeader>
                            <div className='flex flex-col gap-4'>
                                <h3>They won't be notified, but you'll lose access to friends-only content.</h3>
                                <div className='flex flex-row flex-wrap gap-2'>
                                    <DialogClose asChild>
                                        <Button variant="destructive" onClick={() => removeRequest(relation.fs_id)}>
                                            Yes, Unfriend
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button>Message</Button>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return null
}