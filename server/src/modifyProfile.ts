import { app } from ".";
import { t } from "elysia";
import { modifyUser } from "./types/user";
import { CLIENT } from "./supabase/config";

app.patch("/update/:field", async ({ params: { field }, body, set, request }) => {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            set.status = 401;
            return { error: "unauthorized" };
        }

        const allowed = ["u_qid", "u_name", "u_bio", "u_pfp"];
        if (!allowed.includes(field)) {
            set.status = 400;
            return { error: "invalid field" };
        }

        const value = (body as any)[field];
        if (value === undefined) {
            set.status = 400;
            return { error: "missing value for field" };
        }

        const patch = { [field]: value, u_updates_at: new Date().toISOString() };

        const { error } = await CLIENT
            .from("profile")
            .update(patch)
            .eq("u_id", userId)
            .select()
            .single();

            if (error) {
                if (error?.code === "23505") {
                    set.status = 409;
                    return { error: "conflict" };
                }
                set.status = 500;
                return { error: "internal error" };
            }
            set.status = 204;
            return { ok: true };
    },
    {
        params: t.Object({
            field: t.Union([
                t.Literal("u_qid"),
                t.Literal("u_name"),
                t.Literal("u_bio"),
                t.Literal("u_pfp")
            ])
        }),
        body: modifyUser
    }
);