import { Button } from '@/lib/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/components/ui/dialog'
import {
    QRCode,
    QRCodeCanvas,
    QRCodeOverlay,
    QRCodeSkeleton
} from "@/lib/components/ui/qr-code";
import { toast } from 'sonner';
import { sideCannons } from './fireworks';

type Props = {
    pfp: string | null;
    qid: string | null;
}

export default function ShareProfile({ pfp, qid }: Props) {

    const url = `${window.location.origin}/u/${qid}`;

    async function copyLink(): Promise<void> {
        if (typeof window === 'undefined') return;
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
            toast.success(`Link copied to clipboard 🔗`)
            return;
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    onClick={sideCannons}
                    className="flex gap-2 flex-wrap cursor-pointer bg-transparent text-foreground hover:bg-transparent hover:text-foreground"
                >
                    Share Profile
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-center'>Share your profile</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col gap-4 mt-4 max-h-96 overflow-y-auto justify-center items-center'>
                    <QRCode
                        value={url}
                        size={240}
                        level="H"
                        foregroundColor='#EFBF04'
                        backgroundColor='#001F3F'
                        className="gap-4"
                    >
                        <QRCodeSkeleton />
                        <QRCodeCanvas />
                        <QRCodeOverlay className="rounded-full border-2 border-white p-2">
                            <img
                                src={pfp ?? "/pfp.webp"}
                                alt={qid ?? "profile picture"}
                                width={40}
                                height={40}
                                className="object-cover object-center transition-transform duration-200 hover:scale-105"
                                loading="lazy"
                            />
                        </QRCodeOverlay>
                    </QRCode>
                    <Button
                        onClick={copyLink}
                        className="flex gap-2 flex-wrap cursor-pointer bg-transparent text-foreground hover:bg-transparent hover:text-foreground w-fit"
                    >
                        Copy
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    )
}