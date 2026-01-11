import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { SUPABASE_CLIENT } from "@/hooks/variables";
import { type SignUserSchemaType } from "@/schemas/User";
import { toast } from "sonner";

export function QuerySignup() { 
  return useMutation({
    mutationFn: async (values: SignUserSchemaType) => {
      const { data, error } = await SUPABASE_CLIENT
        .from("user")
        .select("u_qid")
        .eq("u_qid", values.u_qid)
        .maybeSingle()

      if (error) throw error
      if (data) {
        toast.error("Unique id already taken, please try another one 😤")
        return
      }

      const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signUp({
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
      const { error: dbError } = await SUPABASE_CLIENT
        .from("user")
        .insert({
          "u_id": authData.user?.id,
          "u_qid": values.u_qid,
          "u_name": values.u_name,
          "u_mail": values.u_mail,
          "u_created_at": new Date().toISOString()
        })
      
      if (dbError) {
        if (dbError.code === "422") throw dbError.message
        else throw dbError.message
      }

      toast.success("Welcome to quirks 🦆🦆")
      throw redirect({ to: "/home" })
    },
  })
}