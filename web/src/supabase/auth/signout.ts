import { SUPABASE_CLIENT } from "@/hooks/variables";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useSignOutAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await SUPABASE_CLIENT.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();       
      toast.info("Let's meet again, stay safe 🙂");
      navigate({ to: '/', replace: true });
    },
    onError: (error: any) => {
      toast.error("Logout failed: " + error.message);
    }
  });
}