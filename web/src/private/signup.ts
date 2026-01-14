import { SUPABASE_CLIENT } from "@/hooks/variables";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { profileSchema } from "@/types/user";

export const clientSignUp = profileSchema.pick({
    u_mail: true,
    u_qid: true,
}).extend({ 
    u_pass: z
        .string()
        .min(8, "Your password must atleast 8 characters")
        .max(300, "Your password must be atmost 300 characters") 
})

export async function signUp() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: async (value: z.infer<typeof clientSignUp>) => {
            const { data: authData, error: authError } = await SUPABASE_CLIENT
                .auth
                .signInWithPassword({
                    email: value.u_mail,
                    password: value.u_pass
                })
            if (authError) throw authError
            try {
                await fetch(`${import.meta.env.VITE_BACKEND_URL}/create`, {
                    method: 'POST',
                    headers: {
                        "Authorization": authData.session.access_token
                    },
                    body: JSON.stringify(value.u_qid)
                })
            }
            catch (e) {
                throw e
            }
        },
        onSuccess: () => {
            toast.success(`Account created, welcome 🥳`)
            navigate({ to: '/', replace: true })
        },
        onError: (e) => {
            toast.error(`${e.message}`)
            throw new Error(e.message)
        }
    })
}