import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/lib/components/ui/button";
import { type QueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

    const uploadPfp = useMutation({
        mutationKey: ['pfp'],
        mutationFn: async () => {
            if (!newPfp) throw new Error("No file selected")

            const fd = new FormData()
            fd.append("file", newPfp, newPfp.name) // ✅ Include filename

            console.log('Uploading file:', newPfp.name, newPfp.type, newPfp.size) // Debug

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/user/upload-pfp/${qid}`,
                {
                    method: 'POST',
                    body: fd,
                    credentials: 'include', // ✅ Include if using cookies/sessions
                    // DO NOT set Content-Type - browser sets it automatically with boundary
                }
            )

            // Better error handling
            if (!res.ok) {
                const errorText = await res.text()
                console.error('Upload failed:', res.status, errorText)
                throw new Error(`Failed to upload pfp: ${res.status} ${errorText}`)
            }

            return res.json()
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['me'] })
            toast.success("Pfp uploaded")
            setBlobURL(null)
            setNewPfp(null)
            if (imageInputRef.current) {
                imageInputRef.current.value = ''
            }
        },
        onError: (error) => {
            console.error('Upload error:', error)
            toast.error(error instanceof Error ? error.message : "Failed to upload pfp")
        }
    })

    return (
        <div className='flex flex-col mb-5'>
            <h2 className='font-light text-xl mt-5'>Pfp</h2>
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                multiple={false}
                onChange={handleImageChange}
            />

            <Button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    imageInputRef.current?.click()
                }}
                className="w-28 h-28 rounded-full overflow-hidden cursor-pointer"
            >
                {!blobURL ? (
                    <img
                        src={loading.u_pfp ?? "/pfp.webp"}
                        alt="profile picture"
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                    />
                ) : (
                    <img
                        src={blobURL ?? "/pfp.webp"}
                        alt="profile picture"
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                    />
                )}
            </Button>

            {newPfp && (
                <Button
                    type="button"
                    onClick={() => uploadPfp.mutate()}
                    disabled={uploadPfp.isPending}
                    className="w-fit cursor-pointer"
                >
                    {uploadPfp.isPending ? 'Uploading...' : 'Upload Pfp'}
                </Button>
            )}
        </div>
    )
}
