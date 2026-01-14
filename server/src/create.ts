import { app } from ".";
import { CLIENT } from "./supabase/config";
import { profileSchema } from "./types/user";

app.post("/signup", async ({ body, headers, set }) => {
    // 1. Extract header token
    console.log("Hello")
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Authorization")) {
      set.status = 401;
      console.error('Header error')
      return { error: "Missing token" };
    }

    const token = authHeader.slice(7);

    // 2. Verify token with Supabase
    const { data, error } = await CLIENT.auth.getUser(token);

    if (error || !data.user) {
      set.status = 401;
      console.error(`Couldn't verify token: ${error}`)
      return { error: "Invalid token" };
    }

    // 3. Insert app user
    try {
      await CLIENT.from("profile").insert({
        u_id: data.user.id,
        u_mail: data.user.email,
        u_qid: body.u_qid,
      }).maybeSingle()

      set.status = 201;
      return { success: true };

    } catch (err: any) {
      await CLIENT.auth.admin.deleteUser(data.user.id);
      set.status = 409;
      console.error(`qid already taken`)
      return { error: "qid already taken" };
    }
  },
  {
    body: profileSchema.pick({ u_qid: true })
  }
);
