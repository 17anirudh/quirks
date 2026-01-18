import { useMutation } from "@tanstack/react-query";
import { createAccountSchema } from "./createAccount";
import z from "zod";
import { SUPABASE_CLIENT } from "@/hooks/utils";
import { toast } from "sonner";
import { redirect } from "@tanstack/react-router";

export const logInUserSchema = createAccountSchema.pick({
    u_mail: true,
    u_pass: true
})

export const logInUser = useMutation({
    mutationFn: async (values: z.infer<typeof logInUserSchema>) => {
        const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signInWithPassword({
            email: values.u_mail,
            password: values.u_pass
        })
        if (!authData || authError) throw new Error("Failed to log in")
        if (authError) throw authError
    },
    onError: (err) => {
        toast.error(err.message + '😅')
        throw new Error(err.message)
    },
    onSuccess: () => {
        toast.success("Welcome back 🦆🦆")
        throw redirect({ to: '/home', replace: true })
    }
})