import { supabase } from "./variables";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export function useSignOutAccount() {
  return useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      toast.info("Let's meet again, stay safe 🙂");
      throw redirect({ to: '/onboard' });
    },
  });
}