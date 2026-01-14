import { app } from ".";
import { t } from "elysia";
import { CLIENT } from "./supabase/config";

app.post('/search/:id', async ({ params: { id }, set })=> {
    if(!id) {
        set.status = 401;
        return { error: "No path parameter" }
    }
    const { data, error } = await CLIENT
                                .from("profile")
                                .select("u_qid, u_name, u_bio, u_pfp")
                                .eq("u_qid", id)
                                .maybeSingle()
    if (error) {
        set.status = 501
        return { error: error.message }
    }
    set.status = 200
    return data
},
{
    params: t.Object({
        id: t.String()
    }),
    body: t.Object({
        u_qid: t.String()
    })
})