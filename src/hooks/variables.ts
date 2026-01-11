import { createClient } from "@supabase/supabase-js";

export const SUPABASE_CLIENT = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);
