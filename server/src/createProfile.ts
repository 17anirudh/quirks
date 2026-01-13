import { app } from ".";
import { CLIENT } from "./supabase/config";
import { signInUser } from "./types/user";

app.post("/create", async ({ body, set, request }) => {
    const userId = request.headers.get("x-user-id")
    const email = request.headers.get("x-user-email")

    if (!userId || !email) {
      set.status = 401
      return { error: "unauthorized" }
    }

    const { error } = await CLIENT
      .from("profile")
      .insert({
        u_id: userId,
        u_qid: body.u_qid,
        u_name: body.u_name,
        u_mail: email,
        u_created_at: new Date().toISOString()
      })

    if (error) {
      if (error.code === "23505") {
        set.status = 409
        return { error: "profile already exists" }
      }

      set.status = 500
      return { error: "internal error" }
    }

    set.status = 201
    return { ok: true }
  },
  {
    body: signInUser
  }
)
