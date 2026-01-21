import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/lib/components/ui/dialog"
import { Link } from "@tanstack/react-router"
import { Button } from "@/lib/components/ui/button"

type props = {
    information: {
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
}

export default function ProfileCard({ information }: props) {
    return (
        <div className='flex flex-col gap-5 p-5 border items-start w-11/12 h-full'>
            {/* qid */}
            <h2 id="id" className="text-center scroll-m-20 mb-5 pb-2 text-3xl font-semibold tracking-tight first:mt-0">{`@${information.user.u_qid}` || ''}</h2>
            {/* image, posts, Friends */}
            <div className="flex flex-wrap gap-4 justify-center items-center sm:gap-9">
                <div className="w-28 h-28 rounded-full border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                    <img
                        src={information.user.u_pfp ?? "/pfp.webp"}
                        alt={information.user.u_qid ?? "profile picture"}
                        className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                    />
                </div>

                <div className="flex-col gap-5">
                    <h3 className="capitalize scroll-m-20 text-2xl font-semibold tracking-tight">{information ? information.user.u_name : ''}</h3>
                    <div className="flex flex-wrap gap-2">
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">{information?.post?.length || 0}</h4>
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">Posts</h4>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="scroll-m-20 text-xl font-light tracking-tight bg-transparent hover:bg-transparent cursor-pointer"
                            >
                                {information.relation ? information?.relation?.length : 0} Friends
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{information.user.u_qid || information.user.u_name} Friends</DialogTitle>
                            </DialogHeader>
                            <div className='flex flex-col gap-4 mt-4 max-h-96 overflow-y-auto'>
                                {information.relation.length === 0 ? (
                                    <p className='text-center text-muted-foreground py-8'>No Friends</p>
                                ) : (
                                    information.relation.map((relation) => {
                                        const friend_qid = relation.sent_qid === information.user.u_qid ? relation.receive_qid : relation.sent_qid;
                                        return (
                                            <div
                                                key={relation.fs_id}
                                                className='flex items-center justify-between gap-4 p-4 border rounded-lg'
                                            >
                                                <div className='flex-1'>
                                                    <Link
                                                        to="/u/$qid"
                                                        params={{ qid: friend_qid! }}
                                                        className='font-medium'
                                                    >
                                                        {friend_qid}
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* bio */}
            <article className='w-full flex'>
                <p className="min-w-0 break-words whitespace-normal overflow-hidden">
                    {information.user.u_bio ? information.user.u_bio : (
                        <p className="text-muted text-secondary">Add some bio....</p>
                    )}
                </p>
            </article>
        </div>
    )
}