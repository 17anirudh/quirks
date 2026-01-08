import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AXIOS_CLIENT } from "./variables";
import { type OnboardUser } from "@/schemas/User";
import { toast } from "sonner";

export function QueryOnboard() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: OnboardUser) => {
      AXIOS_CLIENT.post('/add/me', {
        u_id: values.u_id,
        full_name: values.full_name,
      })
      .then(() => {
        toast.success("🤩 Sucess, Taking you to greatness....")
        navigate({to: '/'})
      })
      .catch(function (error){
        toast.warning("😅 Please try another u_id...")
        throw Error(error)
      })
    },
  })
}