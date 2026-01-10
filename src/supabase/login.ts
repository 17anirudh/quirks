import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { supabase } from "./variables";
import { type LogUserSchemaType} from "@/schemas/User";
import { toast } from "sonner";

export function QueryLogin() {
  return useMutation({
    mutationFn: async (values: LogUserSchemaType) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.u_mail,
        password: values.u_pass
      })
      if (error) {
        toast.error("Account doesn't exist, maybe you have to sign up 🙂")
        throw new Error(error.message)
      }
      else {
        toast.success("Welcome back 🦆")
        throw redirect({ to: '/' })
      }
    },
  })
}