import { t } from "elysia";
import { CLIENT } from "./supabase/config";
import { app } from ".";

app.get('/search/:id', async ({ params: { id }, set })=> {
    if(!id) {
        set.status = 401;
        return { error: "No path parameter" }
    }
    const { data, error } = await CLIENT
                                .from("profile")
                                .select("u_qid, u_name, u_bio, u_pfp")
                                .eq("u_qid", id)
                                .maybeSingle()
    if (error || !data) {
        set.status = 501;
        return { error: "No user" }
    }
    set.status = 200;
    return { ok: "User found" }
},
{
    params: t.Object({
        id: t.String()
    })
})