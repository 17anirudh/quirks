import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "./variables";
import { type EnterUser } from "@/schemas/User";
import { toast } from "sonner";

export function QueryLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: EnterUser) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.mail,
        password: values.pass
      })
      if (error) {
        toast.error("Account doesn't exist, maybe you have to sign up 🙂")
        navigate({ to: '/onboard' })
      }
      else {
        toast.success("🥹 Welcome back")
        navigate({ to: '/' })
      }
    },
  })
}