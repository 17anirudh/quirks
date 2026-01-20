import { Elysia, t } from 'elysia'
import { z } from 'zod'
import { CLIENT } from '../supabase/config'

// POST: friendship/request = send request
// PATCH: friendship/accept = accept request
// DELETE: friendship/remove = remove friend
// GET: friendship/incoming/:qid = get incoming requests
// GET: friendship/list/:qid = get friends list
// GET: friendship/:me/:other = get friendship status

export const friendship = new Elysia({ prefix: '/friendship' })

    .post('/request', async ({ body, set }) => {
        const { sent_qid, receive_qid } = body

        if (sent_qid === receive_qid) {
            set.status = 400
            return { error: 'Cannot friend yourself' }
        }

        const { error } = await CLIENT
            .from('friendship')
            .insert({
                fs_id: crypto.randomUUID(),
                sent_qid,
                receive_qid,
                fs_status: 'pending'
            })

        if (error) {
            // unique index violation → already exists
            if (error.code === '23505') {
                set.status = 409
                return { error: 'Friendship already exists' }
            }

            set.status = 500
            return { error: error.message }
        }

        set.status = 201
        return { success: true }
    },
        {
            body: t.Object({
                sent_qid: t.String({ minLength: 4, maxLength: 400 }),
                receive_qid: t.String({ minLength: 4, maxLength: 400 })
            })
        }
    )

    .patch('/accept', async ({ body, set }) => {
        const { fs_id, receiver_qid } = body

        const { data, error } = await CLIENT
            .from('friendship')
            .update({ fs_status: 'friends' })
            .eq('fs_id', fs_id)
            .eq('receive_qid', receiver_qid)
            .eq('fs_status', 'pending')
            .select('fs_id')
            .maybeSingle()

        if (error) {
            set.status = 500
            return { error: error.message }
        }

        if (!data) {
            set.status = 404
            return { error: 'Request not found or already handled' }
        }

        set.status = 200
        return { success: true }
    },
        {
            body: z.object({
                fs_id: z.uuid(),
                receiver_qid: z.string().min(4).max(200)
            })
        }
    )

    .delete('/remove', async ({ body, set }) => {
        const { fs_id } = body

        const { error } = await CLIENT
            .from('friendship')
            .delete()
            .eq('fs_id', fs_id)

        if (error) {
            set.status = 500
            return { error: error.message }
        }

        set.status = 200
        return { success: true }
    },
        {
            body: z.object({
                fs_id: z.uuid()
            })
        }
    )

    .get('/incoming/:qid', async ({ params, set }) => {
        const { qid } = params

        const { data, error } = await CLIENT
            .from('friendship')
            .select('fs_id, sent_qid, fs_created_at')
            .eq('receive_qid', qid)
            .eq('fs_status', 'pending')
            .order('fs_created_at', { ascending: false })

        if (error) {
            set.status = 500
            return { error: error.message }
        }

        set.status = 200
        return { success: true, requests: data }
    },
        {
            params: t.Object({
                qid: t.String({ minLength: 4 })
            })
        }
    )

    .get('/list/:qid', async ({ params, set }) => {
        const { qid } = params
        const { data, error } = await CLIENT
            .from('friendship')
            .select('sent_qid, receive_qid, fs_created_at')
            .eq('fs_status', 'friends')
            .or(`sent_qid.eq.${qid},receive_qid.eq.${qid}`)
            .order('fs_created_at', { ascending: false })
            .limit(50)

        if (error) {
            set.status = 500
            return { error: error.message }
        }

        const friends = data.map(row =>
            row.sent_qid === qid ? row.receive_qid : row.sent_qid
        )

        set.status = 200
        return { success: true, friends }
    },
        {
            params: t.Object({
                qid: t.String({ minLength: 4 })
            })
        }
    )