import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { SUPABASE_CLIENT } from "@/hooks/variables";
import { type LogUserSchemaType } from "@/schemas/User";
import { toast } from "sonner";

export function QueryLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: LogUserSchemaType) => {
      const { data, error } = await SUPABASE_CLIENT.auth.signInWithPassword({
        email: values.u_mail,
        password: values.u_pass
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Welcome back 🦆");
      navigate({ to: "/home", replace: true });
    },
    onError: (error: any) => {
      const message = error.message || "An unexpected error occurred";
      toast.error(message);
    }
  });
}