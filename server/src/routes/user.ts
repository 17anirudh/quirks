import { Elysia, t } from "elysia";
import { CLIENT } from "../supabase/config";

export const users = new Elysia({ prefix: '/user' })
    // Create account
    .post("/create", async ({ body, headers, set }) => {
        const authHeader = headers.authorization;

        if (!body.u_qid) {
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
            console.log(`qid already taken`)
            return { error: "qid already taken" };
        }
    },
        {
            body: t.Object({
                u_qid: t.String({
                    maxLength: 200,
                    minLength: 4
                })
            }),
        }
    )
    // View Own profile
    .get('/me', async ({ headers, set }) => {
        const { id } = headers;
        if (!id || typeof id !== 'string' || id.length < 4) {
            set.status = 400;
            return { error: 'Invalid or missing qid' };
        }
        const { data: profileData, error: profileError } = await CLIENT
            .from('profile')
            .select('u_qid, u_bio, u_pfp, u_name')
            .eq('u_qid', id)
            .maybeSingle();

        if (profileError) {
            set.status = 500;
            return { error: profileError.message || "Database Error" };
        }

        if (!profileData) {
            set.status = 404;
            return { error: "User not found" + id }
        }

        const { data: postData, error: postError } = await CLIENT
            .from('post')
            .select('*')
            .eq('p_author_qid', id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (postError) {
            console.error('Supabase error:', postError);
            set.status = 500;
            return { error: 'Internal server error' };
        }

        const { data: relationData, error: relationError } = await CLIENT
            .from('friendship')
            .select('*')
            .eq('fs_status', 'friends')
            .or(`sent_qid.eq.${id},receive_qid.eq.${id}`)
            .limit(20)

        if (relationError) {
            set.status = 500;
            return { error: relationError.message || "Database Error" }
        }

        set.status = 200;
        return { user: profileData, posts: postData, relations: relationData };
    },
        {
            headers: t.Object({
                id: t.String({ minLength: 4, maxLength: 200 })
            })
        }
    )
    // Public View
    .get('/u/:search', async ({ params: { search }, set, headers }) => {
        if (!search) {
            set.status = 400;
            return { error: "Required param missing" }
        }
        const { data: userData, error: userError } = await CLIENT
            .from('profile')
            .select('*')
            .eq('u_qid', search)
            .maybeSingle()

        if (userError) {
            set.status = 500;
            return { error: userError?.message || "Database Error" }
        }
        if (!userData) {
            set.status = 404;
            return { error: "User not found" }
        }
        const { data: postData, error: postError } = await CLIENT
            .from('post')
            .select('*')
            .eq('p_author_qid', search)
            .order('created_at', { ascending: false })
            .limit(20)

        if (postError) {
            set.status = 500;
            return { error: postError?.message || "Database Error" }
        }

        const viewer = headers.viewer
        if (viewer !== 'a') {
            const { data: relationData, error: relationError } = await CLIENT
                .from('friendship')
                .select('*')
                .or(
                    `and(sent_qid.eq.${viewer},receive_qid.eq.${search}),
                    and(sent_qid.eq.${search},receive_qid.eq.${viewer})`
                )
                .maybeSingle()

            if (relationError) {
                set.status = 500;
                return { error: relationError.message || "Database Error" }
            }

            set.status = 200;
            return { user: userData, post: postData, relation: relationData }
        }
        else {
            set.status = 200;
            return { user: userData, post: postData }
        }
    },
        {
            params: t.Object({
                search: t.String({ minLength: 4, maxLength: 400 }),
            }),
            headers: t.Object({
                viewer: t.Optional(t.String({ minLength: 1, maxLength: 200 }))
            })
        }
    )
    // Delete account
    .delete('/delete', async ({ set, headers }) => {
        const authHeader = headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            return { error: "Missing or invalid Authorization header" };
        }
        const { data, error } = await CLIENT.auth.getUser(authHeader)
        if (error || !data) {
            set.status = 401;
            return { error: "Invalid Token" }
        }
        const userId: string = data.user.id
        try {
            await CLIENT.auth.admin.deleteUser(userId)
            set.status = 202;
            return { ok: "User deleted" }
        }
        catch (e: any) {
            set.status = 500;
            return { error: "Server Error" }
        }
    },
    )
    // Upload pfp
    .post("/upload-pfp/:qid", async ({ params, body, set }) => {
        const file = body.file as File
        if (!file) {
            set.status = 400
            return { error: "No file" }
        }

        const ext = file.name.split(".").pop()
        const path = `${params.qid}.${ext}`

        const { error } = await CLIENT.storage
            .from("pfp")
            .upload(path, file, {
                upsert: true,
                contentType: file.type,
            })

        if (error) {
            set.status = 500
            return { error: error.message }
        }

        const { data } = CLIENT.storage
            .from("pfp")
            .getPublicUrl(path)

        await CLIENT
            .from("profile")
            .update({ u_pfp: data.publicUrl })
            .eq("u_qid", params.qid)

        return { url: data.publicUrl }
    },
        {
            body: t.Object({
                file: t.File(),
            }),
            params: t.Object({
                qid: t.String({ minLength: 4, maxLength: 200 })
            })
        }
    )