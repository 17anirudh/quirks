import { Elysia, t } from "elysia"
import { CLIENT } from "../supabase/config"

export const post = new Elysia({ prefix: '/post' })
    .post('/create/:qid', async ({ params, body, set }) => {
        const { p_text, p_image } = body
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

            const { data, error: dbError } = await CLIENT.from("posts")
                .insert({
                    p_text: p_text,
                    p_url: p_url.publicUrl,
                    p_author_qid: qid,
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
            const { data, error: dbError } = await CLIENT.from("posts")
                .insert({
                    p_text: p_text,
                    p_author_qid: qid,
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
    },
        {
            body: t.Object({
                p_text: t.String(),
                p_image: t.Optional(t.File())
            }),
            params: t.Object({
                qid: t.String({
                    maxLength: 400,
                    minLength: 4
                })
            })
        }
    )