import { SUPABASE_CLIENT } from "@/hooks/variables";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export function useSignOutAccount() {
  return useMutation({
    mutationFn: async () => {
      const {error: authError} = await SUPABASE_CLIENT.auth.signOut();
      if (authError){
        toast.error("Please try again...") 
        throw authError?.message
      } 
      toast.info("Let's meet again, stay safe 🙂");
      throw redirect({ to: '/' });
    },
  });
}