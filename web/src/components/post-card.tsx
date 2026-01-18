type props = {
    key: number
    pfp?: string | null;
    qid?: string | null;
    time?: string | Date | null;
    image?: string | null;
    content?: string | null;
}

const mahabharata: string = "https://upload.wikimedia.org/wikipedia/commons/8/81/Kurukshetra.jpg" as const

export default function PostCard({ key, pfp, qid, time, image, content }: props) {
    return (
        <div className="flex flex-col gap-2 border-2 p-5 w-11/12 sm:w-8/12 mb-10" key={key}>
            <div className="flex flex-wrap gap-3">
                {/* Profile photo */}
                <div className="w-18 h-18 rounded-full border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                    <img
                        src={pfp || "/pfp.webp"}
                        alt={qid ? `${qid} profile photo` : "profile picture"}
                        className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                    />
                </div>
                {/* Qid and time */}
                <div className="flex flex-col">
                    {/* Qid */}
                    <h4 className="scroll-m-20 text-xl tracking-tight">
                        @{qid || "QiD"}
                    </h4>
                    {/* Time */}
                    <h4 className="scroll-m-20 tracking-tight">
                        {time?.toLocaleString() || "Just now"}
                    </h4>
                </div>
            </div>
            {/* Post Image */}
            <div className="w-10/12 sm:w-8/12 aspect-rectangle border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                <img
                    src={image || mahabharata}
                    alt={image ? "post image" : "mahabharata"}
                    className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                    loading="lazy"
                />
            </div>
            {/* Content */}
            <p className="leading-7 [&:not(:first-child)]:mt-6 break-words whitespace-normal overflow-hidden w-10/12">
                {content || "The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax."}
            </p>
        </div>
    )
}