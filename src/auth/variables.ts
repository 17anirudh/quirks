import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

const AXIOS_CLIENT = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  
});
AXIOS_CLIENT.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export { AXIOS_CLIENT, supabase }