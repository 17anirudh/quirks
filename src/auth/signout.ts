import { supabase } from "./variables";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useSignOutAccount() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      toast.info("Let's meet again, stay safe 🙂");
      navigate({ to: '/onboard' });
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });
}