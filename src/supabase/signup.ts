import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { supabase } from "./variables";
import { type SignUserSchemaType } from "@/schemas/User";
import { toast } from "sonner";

export function QuerySignup() {
  return useMutation({
    mutationFn: async (values: SignUserSchemaType) => {
      const { data, error } = await supabase
        .from("user")
        .select("u_qid")
        .eq("u_qid", values.u_qid)
        .maybeSingle()

      if (error) throw error
      if (data) {
        toast.error("Unique id already taken, please try another one 😤")
        return
      }

      const { error: authError } = await supabase.auth.signUp({
        email: values.u_mail,
        password: values.u_pass,
        options: {
          data: {
            u_name: values.u_name,
            u_qid: values.u_qid
          }
        }
      })

      if (authError) throw authError

      toast.success("Welcome to quirks 🦆🦆")
      throw redirect({ to: "/" })
    }
  })
}