import { SUPABASE_CLIENT } from "@/hooks/variables";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router"; // Use useNavigate
import { toast } from "sonner";

export function useSignOutAccount() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const { error } = await SUPABASE_CLIENT.auth.signOut();
      if (error) throw error;
      return typeof window !== 'undefined' ? window.location.reload : null; 
    },
    onSuccess: () => {
      toast.info("Let's meet again, stay safe 🙂");
      navigate({ to: '/', replace: true });
    },
    onError: (error) => {
      toast.error("Logout failed: " + error.message);
    }
  });
}