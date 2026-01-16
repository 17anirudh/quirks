import Settings from "./settings"
import { useRef, useState } from "react";
import { Button } from "@/lib/components/ui/button";
import type { QueryClient } from "@tanstack/react-query";

type props = {
    who?: 'other' | 'anon'
    ctx: {
        u_qid: string | null,
        u_name: string | null,
        u_bio: string | null,
        u_pfp: string | null
    },
    qClient?: QueryClient
}

export default function ProfileCard({ who, ctx, qClient }: props) {
    const image = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false)
    return (
        <div className="w-full p-4 flex flex-col gap-5 justify-center items-center">
            <div className="max-w-fit p-2">
                <h2 id="id" className="text-center scroll-m-20 mb-5 pb-2 text-3xl font-semibold tracking-tight first:mt-0">{ctx ? `@${ctx.u_qid}` : ''}</h2>
                <div className="flex flex-wrap gap-4 justify-center items-center sm:gap-9">
                    {loaded ? (
                        <img
                            src={ctx.u_pfp ? ctx.u_pfp : "https://picsum.dev/120"}
                            className="w-27 h-27 object-scale-down rounded-full border-2 hover:w-30 hover:h-30 transition-all"
                            alt={ctx.u_qid ? ctx.u_qid : "pfp"}
                            ref={image}
                            onLoad={() => setLoaded(true)}
                        />
                    ) : (
                        <div className="w-27 h-27 object-scale-down rounded-full border-2 animate-pulse" />
                    )}
                    <div className="flex-col gap-5">
                        <h3 className="capitalize scroll-m-20 text-2xl font-semibold tracking-tight">{ctx ? ctx.u_name : ''}</h3>
                        <div className="flex flex-wrap gap-2">
                            <h4 className="scroll-m-20 text-xl font-light tracking-tight">0</h4>
                            <h4 className="scroll-m-20 text-xl font-light tracking-tight">Posts</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <h4 className="scroll-m-20 text-xl font-light tracking-tight">0</h4>
                            <h4 className="scroll-m-20 text-xl font-light tracking-tight">Friends</h4>
                        </div>
                    </div>
                </div>
                <div className="text-wrap flex flex-col justify-center items-center">
                    <p className="leading-7 not-first:mt-6">{ctx ? ctx.u_bio : 'Nothing here...'}</p>
                    {qClient && <Settings queryClient={qClient} />}
                    {who === 'other' && <Button>Follow</Button>}
                </div>
            </div>
        </div>
    )
}