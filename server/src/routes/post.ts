import { Elysia, t } from "elysia"
import { CLIENT } from "../supabase/config"
import z from "zod"

export const post = new Elysia({ prefix: '/post' })
    .post('/create/:qid', async ({ params, body, set }) => {
        const { p_text, p_image, p_author_pfp } = body
        const { qid } = params
        if (!qid || qid === null || !p_text || p_text === null || p_text.length === 0) {
            set.status = 400
            return { error: 'Qid or post text required' }
        }
        console.log(p_author_pfp)
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
            const { data, error: dbError } = await CLIENT.from("post")
                .insert({
                    p_text: p_text,
                    p_author_qid: qid,
                    p_id: random_number,
                    p_author_pfp: p_author_pfp
                    // created_at: new Date().toISOString()
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
                p_author_pfp: t.String()
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
            params: z.object({
                pid: z.uuid()
            })
        }
    )

    .get('/feed', async ({ query, set }) => {
        const offset = parseInt(query.offset as string) || 0; // Default to 0
        const limit = parseInt(query.limit as string) || 10; // Default to 10

        if (isNaN(offset) || isNaN(limit) || offset < 0 || limit <= 0) {
            set.status = 400;
            return { error: 'Invalid offset or limit' };
        }

        const { data: posts, error: postsError } = await CLIENT
            .from('post')
            .select('*')
            .order('p_created_at', { ascending: false })
            .range(offset, offset + limit - 1); // Paginate with range

        if (postsError) {
            set.status = 500;
            return { error: postsError?.message || 'Failed to fetch posts' };
        }

        return posts;
    });