import Settings from "./settings"
import { useRef, useState } from "react";

type props = {
    qid?: string
    name?: string
    posts?: string[]
    friends?: string[]
    bio?: string
    pfp?: string
}

export default function ProfileCard({qid, name, posts, friends, bio, pfp}: props) {
    const image = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false)
    return (
        <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
            <div className="max-w-fit p-2">
                <h2 id="id" className="text-center scroll-m-20 mb-5 pb-2 text-3xl font-semibold tracking-tight first:mt-0">{qid ? `@${qid}` : ''}</h2>
            <div className="flex flex-wrap gap-4 justify-center items-center sm:gap-9">
                {loaded ? (
                    <img 
                    src={pfp ? pfp : "https://picsum.dev/120"} 
                    className="w-27 h-27 object-scale-down rounded-full border-2 hover:w-30 hover:h-30 transition-all"
                    alt={qid ? qid : "pfp"}
                    ref={image} 
                    onLoad={() => setLoaded(true)}
                />
                ) : (
                    <div className="w-27 h-27 object-scale-down rounded-full border-2 animate-pulse" />
                )}
                <div className="flex-col gap-5">
                    <h3 className="capitalize scroll-m-20 text-2xl font-semibold tracking-tight">{name ? name : ''}</h3>
                    <div className="flex flex-wrap gap-2">
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">{posts ? posts.length : '0'}</h4>
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">Posts</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">{friends ? friends.length : '0'}</h4>
                        <h4 className="scroll-m-20 text-xl font-light tracking-tight">Friends</h4>
                    </div>
                </div>
            </div>
            <div className="text-wrap flex flex-col justify-center items-center">
                <p className="leading-7 not-first:mt-6">{bio ? bio : 'Nothing here...'}</p>
                <Settings />
            </div>
            </div>
        </div>
    )
}