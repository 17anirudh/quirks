import { SmileIcon, MessageCircleMore, EarthIcon, CheckIcon } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type props = {
    key: number
    p_id: string | null,
    p_author_qid: string | null,
    p_text: string | null,
    p_likes_count: number | null,
    p_comments_count: number | null,
    created_at: string | Date | null,
    p_url: string | null
    u_pfp: string | null
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

export default function PostCard({ key, p_id, p_author_qid, p_text, p_likes_count, p_comments_count, created_at, p_url, u_pfp }: props) {
    async function copyLink(): Promise<void> {
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}/p/${p_id}`;
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
            toast.success(`Link copied to clipboard 🔗`)
            return;
        }
    }

    return (
        <div className="flex flex-col gap-2 border-2 p-5 w-11/12 sm:w-8/12 mb-10" key={key}>
            <div className="flex flex-wrap gap-3">
                {/* Profile photo */}
                <div className="w-18 h-18 rounded-full border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                    <img
                        src={u_pfp || "/pfp.webp"}
                        alt={p_author_qid ? `${p_author_qid} profile photo` : "profile picture"}
                        className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                    />
                </div>
                {/* Qid and time */}
                <div className="flex flex-col">
                    {/* Qid */}
                    <h4 className="scroll-m-20 text-xl tracking-tight">
                        @{p_author_qid}
                    </h4>
                    {/* Time */}
                    <h4 className="scroll-m-20 tracking-tight">
                        {formatDayMonthName(created_at!.toLocaleString()) || 'Recently uploaded'}
                    </h4>
                </div>
            </div>
            {/* Post Image */}
            {p_url && (
                <div className="w-10/12 sm:w-8/12 aspect-rectangle border border-neutral-300 shadow-sm overflow-hidden bg-neutral-100">
                    <img
                        src={p_url}
                        alt={key + 'post image'}
                        className="w-full h-full object-cover object-center transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}
            {/* Content */}
            <p className="leading-7 [&:not(:first-child)]:mt-6 break-words whitespace-normal overflow-hidden w-10/12">
                {p_text}
            </p>
            {/* Interactions */}
            <div className="flex gap-4 flex-wrap mt-3 items-center">
                {/* Likes */}
                <span className="flex gap-2 flex-wrap">
                    <SmileIcon /> {p_likes_count}
                </span>
                {/* Comments */}
                <span className="flex gap-2 flex-wrap">
                    <MessageCircleMore /> {p_comments_count}
                </span>
                {/* Share */}
                <Button
                    className="flex gap-2 flex-wrap w-12 h-12 text-black dark:text-white hover:text-blue-500"
                    variant="link"
                    onClick={copyLink}
                >
                    <EarthIcon className="text-black dark:text-white hover:text-blue-500" />
                </Button>
            </div>
        </div>
    )
}