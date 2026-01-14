import { app } from ".";
import { CLIENT } from "./supabase/config";
import { profileSchema } from "./types/user";

app.post("/signup", async ({ body, headers, set }) => {
    const authHeader = headers.authorization;

    if(!body.u_qid) {
      set.status = 400;
      return { error: "Missing body" }
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Missing or invalid Authorization header" };
    }

    const token = authHeader.slice(7);

    const { data: tokenData, error: tokenError } = await CLIENT.auth.getUser(token);

    if (tokenError || !tokenData.user) {
      set.status = 401;
      console.error(`Couldn't verify token: ${tokenError}`)
      return { error: "Invalid token" };
    }

    // 3. Insert app user
    try {
      await CLIENT.from("profile")
        .insert({
            u_id: tokenData.user.id,
            u_mail: tokenData.user.email,
            u_qid: body.u_qid,
          })
        .maybeSingle()

      set.status = 201;
      return { success: true };

    } 
    catch (err: any) {
      await CLIENT.auth.admin.deleteUser(tokenData.user.id);
      set.status = 409;
      console.error(`qid already taken`)
      return { error: "qid already taken" };
    }
  },
  {
    body: profileSchema.pick({ u_qid: true }),
  }
);