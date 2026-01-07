import { createClient } from "@supabase/supabase-js";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

export const signup_schema = z.object({
    qid: z
        .string()
        .min(5, "your unique id must be at least 5 characters.")
        .max(32, "your unique id must be at most 32 characters.")
        .regex(
            /^[a-zA-Z_]+$/, 
            "Use only alphabets and underscores"
        ),
    name: z
        .string()
        .min(3, "name must be at least 3 characters.")
        .max(50, "name must be at most 50 characters."),
    mail: z
        .email("invalid email try again"),
    password: z
        .string()
        .min(10, "your password must be atleast 10 characters")
})

export function authMutation() {
  return useMutation({
    mutationFn: async (values: z.infer<typeof signup_schema>) => {
      // 1. Supabase Sign
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.mail,
        password: values.password,
      })

      if (authError) throw new Error(authError.message)

      // 2. Cookie Session
      const { data: { session } } = await supabase.auth.getSession()

      // 3. Backend Confirm
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          qid: values.qid,
          name: values.name,
          email: values.mail,
          uid: authData.user?.id,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Backend sync failed")
      }

      return authData
    },
    onSuccess: () => {
      redirect({ to: '/' })
    },
    onError: (error: Error) => {
      return error
    }
  })
}