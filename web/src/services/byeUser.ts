import { useMutation } from "@tanstack/react-query"
import { SUPABASE_CLIENT } from "@/hooks/utils";
import { toast } from "sonner";
import { redirect } from "@tanstack/react-router";

export const byeAccount = useMutation({
    mutationFn: async () => {
        const { error: authError } = await SUPABASE_CLIENT.auth.signOut()
        if (authError) throw authError
    },
    onError: (err) => {
        toast.error(err.message + '😅')
        throw new Error(err.message)
    },
    onSuccess: () => {
        toast.success("Stay safe, see you again 🌹😀")
        throw redirect({ to: '/', replace: true })
    }
})