import { Elysia, t } from "elysia";
import { CLIENT } from "../supabase/config";

export const users = new Elysia({ prefix: '/user' })

    .post("/create", async ({ body, headers, set }) => 
        {
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
    .get('/search/:id', async ({ params: { id }, set }) => 
        {
            if (!id || typeof id !== 'string' || id.length < 4) {
                set.status = 400;
                return { error: 'Invalid or missing qid' };
            }
            try {
            const { data, error } = await CLIENT
                .from('profile')
                .select('u_qid, u_name, u_bio, u_pfp') 
                .eq('u_qid', id)
                .maybeSingle();

            if (error) {
                console.error('Supabase error:', error);
                set.status = 500;
                return { error: 'Internal server error' };
            }

            if (!data) {
                set.status = 404;
                return { error: 'User not found' };
            }

            set.status = 200;
            set.headers['Cache-Control'] = 'public, max-age=300, s-maxage=3600'; // cache 5 min browser / 1h edge/CDN

            return data;
            } 
            catch (err) {
                console.error('Unexpected error in /user/search:', err);
                set.status = 500;
                return { error: 'Internal server error' };
            }
        },
        {
            params: t.Object({
            id: t.String({ minLength: 4, maxLength: 200 })
            })
        }
    )
    .delete('/delete', async ({ set, headers }) => 
        {
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
