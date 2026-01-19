type props = {
    information: {
        user: {
            u_qid: string | null,
            u_bio: string | null,
            u_pfp: string | null,
            u_name: string | null
        },
        posts: [
            {
                p_id: string | null,
                p_author_qid: string | null,
                p_text: string | null,
                p_likes_count: number | null,
                p_comments_count: number | null,
                created_at: string | null,
                p_url: string | null
                p_author_pfp: string | null
            }
        ],
        relations: Array<any | null>
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
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">{information?.posts?.length || 0}</h4>
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">Posts</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">{information.relations ? information?.relations?.length : 0}</h4>
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">Friends</h4>
                    </div>
                </div>
            </div>
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