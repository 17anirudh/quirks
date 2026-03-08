import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/lib/components/ui/button";
import { type QueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePfp } from "@/api/api";
import { Keys } from "@/context/keys";
import { Image } from "@unpic/react";

type res = {
    u_qid: string | null,
    u_name: string | null,
    u_bio: string | null,
    u_pfp: string | null
}

type props = {
    client: QueryClient
    qid: string
    loading: res
}

export default function PfpForm({ client, qid, loading }: props) {

    const imageInputRef = useRef<HTMLInputElement | null>(null)
    const [newPfp, setNewPfp] = useState<File | null>(null)
    const [blobURL, setBlobURL] = useState<string | null>(null)

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewPfp(e.target.files[0])
            setBlobURL(URL.createObjectURL(e.target.files[0]))
        }
    }

    const { mutate: uploadPfp, isPending } = useMutation({
        mutationKey: ['pfp'],
        mutationFn: async () => updatePfp(newPfp!, qid),
        onMutate: () => {
            toast.loading(`Uploading ${newPfp?.name}`);
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: Keys.me })
            toast.dismiss();
            toast.success("Pfp uploaded")
            setBlobURL(null)
            setNewPfp(null)
            if (imageInputRef.current) {
                imageInputRef.current.value = ''
            }
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to upload pfp")
        }
    })

    return (
        <div className='flex flex-col mt-9 border-2 gap-3 p-9 w-fit'>
            <h3 className='text-xl font-semibol underline'>Change PFP</h3>
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                multiple={false}
                onChange={handleImageChange}
                className="bg-transparent"
            />

            <Button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    imageInputRef.current?.click()
                }}
                className="w-28 h-28 rounded-full overflow-hidden cursor-pointer bg-transparent"
            >
                {!blobURL ? (
                    <Image
                        src={loading.u_pfp ?? "/pfp.webp"}
                        alt="profile picture"
                        className="w-full h-full object-cover pointer-events-none bg-transparent"
                        draggable={false}
                        layout="fullWidth"
                        title="Click to change PFP"
                    />
                ) : (
                    <Image
                        src={blobURL ?? "/pfp.webp"}
                        alt="profile picture"
                        layout="fullWidth"
                        className="w-full h-full object-cover pointer-events-none bg-transparent"
                        draggable={false}
                    />
                )}
            </Button>

            {newPfp && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => uploadPfp()}
                    disabled={isPending}
                    className="w-fit cursor-pointer bg-transparent"
                >
                    {isPending ? 'Uploading...' : 'Upload pfp'}
                </Button>
            )}
        </div>
    )
}
