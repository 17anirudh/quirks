import { SmileIcon, MessageCircleMore, EarthIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/lib/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar"
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
import { useMutation, useQueryClient } from '@tanstack/react-query'

type props = {
    post: {
        p_id: string | null,
        p_author_qid: string | null,
        p_text: string | null,
        p_likes_count: number | null,
        p_comments_count: number | null,
        p_created_at: string | null,
        p_url: string | null
        p_author_pfp: string | null
    }
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

function formatDayMonthName(isoDate: string): string {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';

    const day = String(date.getUTCDate()).padStart(2, '0');
    const monthName = MONTHS[date.getUTCMonth()];

    return `${day} ${monthName}`;
}

export default function PostCard({ post }: props) {

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${post.p_id}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to delete post')
            }
            return await res.json()
        },
        onSuccess: () => {
            toast.success('Post deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    async function copyLink(): Promise<void> {
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}/p/${post.p_id}`;
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
            toast.success(`Link copied to clipboard 🔗`)
            return;
        }
    }

    return (
        <div className="flex flex-col gap-2 border-2 p-5 w-11/12 sm:w-8/12 mb-10">
            <div className="flex flex-wrap gap-3">
                {/* Profile photo */}
                <div className="w-18 h-18 rounded-full border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                    <img
                        src={post.p_author_pfp || "/pfp.webp"}
                        alt={post.p_author_qid ? `${post.p_author_qid} profile photo` : "profile picture"}
                        className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                    />
                </div>
                {/* Qid and time */}
                <div className="flex flex-col">
                    {/* Qid */}
                    <HoverCard openDelay={10} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Button
                                variant="link"
                                className="scroll-m-20 text-xl tracking-tight cursor-pointer"
                                onClick={() => navigate({ to: '/u/$qid', params: { qid: post.p_author_qid! } })}
                            >
                                @{post.p_author_qid}
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="flex w-64 flex-col gap-0.5" side="right">
                            <Avatar>
                                <AvatarImage src={post.p_author_pfp || "/pfp.webp"} />
                                <AvatarFallback>{post.p_author_qid?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="font-semibold">@{post.p_author_qid}</div>
                        </HoverCardContent>
                    </HoverCard>
                    {/* Time */}
                    <h4 className="scroll-m-20 tracking-tight">
                        {formatDayMonthName(post.p_created_at!.toLocaleString()) || 'Recently uploaded'}
                    </h4>
                </div>
            </div>
            {/* Post Image */}
            {post.p_url && (
                <div className="w-10/12 sm:w-8/12 aspect-rectangle border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                    <img
                        src={post.p_url}
                        alt={'post image'}
                        className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}
            {/* Content */}
            <p className="leading-7 [&:not(:first-child)]:mt-6 break-words whitespace-normal overflow-hidden w-10/12">
                {post.p_text}
            </p>
            {/* Interactions */}
            <div className="flex gap-4 flex-wrap mt-3 items-center">
                {/* Likes */}
                <span className="flex gap-2 flex-wrap">
                    <SmileIcon /> {post.p_likes_count}
                </span>
                {/* Comments */}
                <span className="flex gap-2 flex-wrap">
                    <MessageCircleMore /> {post.p_comments_count}
                </span>
                {/* Share */}
                <Button
                    className="flex gap-2 flex-wrap w-12 h-12 text-black dark:text-white hover:text-blue-500"
                    variant="link"
                    onClick={copyLink}
                >
                    <EarthIcon className="text-black dark:text-white hover:text-blue-500" />
                </Button>
                {/* Delete */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="flex gap-2 flex-wrap w-12 h-12 text-black dark:text-white hover:text-red-500 ml-auto"
                            variant="link"
                            disabled={isDeleting}
                        >
                            <Trash2Icon className="text-black dark:text-white hover:text-red-500" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Post</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this post? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 justify-end">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={() => deletePost()}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}