import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { SUPABASE_CLIENT } from "@/hooks/variables";
import { type LogUserSchemaType} from "@/schemas/User";
import { toast } from "sonner";

export function QueryLogin() {
  return useMutation({
    mutationFn: async (values: LogUserSchemaType) => {
      const { error } = await SUPABASE_CLIENT.auth.signInWithPassword({
        email: values.u_mail,
        password: values.u_pass
      })
      if (error) {
        toast.error("Account doesn't exist, maybe you have to sign up 🙂")
        throw error.message
      }
      else {
        toast.success("Welcome back 🦆")
        throw redirect({ to: "/home" })
      }
    },
  })
}