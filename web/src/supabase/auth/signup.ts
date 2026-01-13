import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router"; // Use hook for programmatic navigation
import { SUPABASE_CLIENT } from "@/hooks/variables";
import { type SignUserSchemaType } from "@/schemas/User";
import { toast } from "sonner";

export function QuerySignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: SignUserSchemaType) => {
      // 1. Check for existing u_qid
      const { data: existingUser, error: checkError } = await SUPABASE_CLIENT
        .from("user")
        .select("u_qid")
        .eq("u_qid", values.u_qid)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        throw new Error("Unique id already taken, please try another one 😤");
      }

      // 2. Sign up the user in Auth
      const { data: authData, error: authError } = await SUPABASE_CLIENT.auth.signUp({
        email: values.u_mail,
        password: values.u_pass,
        options: {
          data: {
            u_name: values.u_name,
            u_qid: values.u_qid
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed: No user data returned");

      // 3. Insert into the public.user table
      const { error: dbError } = await SUPABASE_CLIENT
        .from("user")
        .insert({
          "u_id": authData.user.id,
          "u_qid": values.u_qid,
          "u_name": values.u_name,
          "u_mail": values.u_mail,
          "u_created_at": new Date().toISOString()
        });
      
      if (dbError) throw dbError;

      return authData;
    },
    onSuccess: () => {
      toast.success("Welcome to quirks 🦆🦆");
      navigate({ to: "/home", replace: true });
    },
    onError: (error: any) => {
      // Handles both manual throws and Supabase errors
      const message = error.message || "An unexpected error occurred";
      toast.error(message);
      console.error("Signup Error:", error);
    }
  });
}