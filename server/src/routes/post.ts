import { Elysia, t } from "elysia"
import { CLIENT } from "../supabase/config"

export const post = new Elysia({ prefix: '/post' })
    .post('/create/:qid', async ({ params, body, set }) => {
        const { p_text, p_image, p_author_pfp } = body
        const { qid } = params
        if (!qid || qid === null || !p_text || p_text === null || p_text.length === 0) {
            set.status = 400
            return { error: 'Qid or post text required' }
        }
        const random_number = crypto.randomUUID();
        if (p_image) {
            const ext = p_image.name.split(".").pop() || 'bin';
            const path = `${params.qid}-${random_number}.${ext}`

            const { error } = await CLIENT.storage
                .from("post")
                .upload(path, p_image, {
                    upsert: true,
                    contentType: p_image.type,
                })

            if (error) {
                set.status = 500
                return { error: error.message }
            }

            const { data: p_url } = CLIENT.storage
                .from("post")
                .getPublicUrl(path)

            if (!p_url) {
                set.status = 500
                return { error: "Failed to fetch url" }
            }

            const { data, error: dbError } = await CLIENT.from("post")
                .insert({
                    p_text: p_text,
                    p_url: p_url.publicUrl,
                    p_author_qid: qid,
                    p_author_pfp: p_author_pfp,
                    p_id: random_number,
                    p_created_at: new Date().toISOString()
                })
                .maybeSingle()

            if (!data || dbError) {
                set.status = 500;
                return { error: dbError?.message || "Failed to post" }
            }

            set.status = 201;
            return { success: true }
        }
        else {
            const { error: dbError } = await CLIENT.from("post")
                .insert({
                    p_text: p_text,
                    p_author_qid: qid,
                    p_id: random_number,
                    p_author_pfp: p_author_pfp ?? null,
                    p_created_at: new Date().toISOString()
                })
                .maybeSingle()
            if (dbError) {
                set.status = 500;
                return { error: dbError?.message || "Failed to post here" }
            }
            set.status = 201;
            return { success: true }
        }
    },
        {
            body: t.Object({
                p_text: t.String(),
                p_image: t.Optional(t.File()),
                p_author_pfp: t.Optional(t.String())
            }),
            params: t.Object({
                qid: t.String({
                    maxLength: 400,
                    minLength: 4
                })
            })
        }
    )
    .get('/search/:pid', async ({ params, set }) => {
        const { data: postData, error: postError } = await CLIENT
            .from('post')
            .select('*')
            .eq('p_id', params.pid)
            .maybeSingle()

        if (!postData || postError) {
            set.status = 404;
            return { error: postError?.message || "Post not found" }
        }
        const { data: user } = await CLIENT
            .from('profile')
            .select('u_pfp')
            .eq('u_qid', postData.p_author_qid)
            .maybeSingle()

        return { ...postData, user: user ?? null };
    },
        {
            params: t.Object({
                pid: t.String()
            })
        }
    )
    .get('/feed/:qid', async ({ params, query, set }) => {
        const { cursor, limit = 30 } = query;
        let pQuery = CLIENT
            .from('post')
            .select('*')
            .order('p_created_at', { ascending: false })
            .limit(limit);

        if (cursor) {
            pQuery = pQuery.lt('p_created_at', cursor);
        }

        const { data: posts, error } = await pQuery;

        if (error) {
            set.status = 500;
            return { error: error.message };
        }

        let nextCursor: string | null = null;
        if (posts && posts.length === limit) {
            nextCursor = posts[posts.length - 1].p_created_at;
        }

        return {
            items: posts || [],
            nextCursor
        };
    },
        {
            params: t.Object({ qid: t.String() }),
            query: t.Object({
                cursor: t.Optional(t.String()),
                limit: t.Optional(t.Numeric())
            })
        }
    )
    .delete('/:pid', async ({ params, set }) => {
        const { pid } = params
        const { error } = await CLIENT
            .from('post')
            .delete()
            .eq('p_id', pid)

        if (error) {
            set.status = 500
            return { error: error.message }
        }

        return { success: true }
    }, {
        params: t.Object({
            pid: t.String()
        })
    })
