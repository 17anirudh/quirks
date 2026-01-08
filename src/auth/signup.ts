import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "./variables";
import { type EnterUser } from "@/schemas/User";
import { toast } from "sonner";

export function QuerySignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: EnterUser) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.mail,
          password: values.pass
        })

      if (authError){
        if(authError.status = 422) {
          toast.warning("You already are a user, logging you in... 😁")
          await supabase.auth.signInWithPassword({
            password: values.pass,
            email: values.mail
          })
          navigate({to: '/'})
        }
        else {
          toast.error(authError.status + ': ' + authError.message)
          throw new Error(authError.status + ': ' + authError.message)
        }
      } 
      toast.success("Auth done ✅, time to know you 😁")
      navigate({to: '/onboard/onboard'})
    },
  })
}