import { Elysia, t } from "elysia"
import { CLIENT } from "../supabase/config"
import z from "zod";

interface Quiz {
    q1: string;
    a1: number;
    q2: string;
    a2: number
};

function generateQuiz(): Quiz {
    // Between 1 and 100
    const getNum = () => Math.floor(Math.random() * (100 - (-10) + 1)) + (-10);
    const ops = ['+', '-'] as const;
    const getOp = () => ops[Math.floor(Math.random() * ops.length)];

    const n = [getNum(), getNum(), getNum(), getNum()];
    const op1 = getOp();
    const op2 = getOp();

    return {
        q1: `${n[0]} ${op1} ${n[1]}`,
        a1: op1 === '+' ? n[0] + n[1] : n[0] - n[1],
        q2: `${n[2]} ${op2} ${n[3]}`,
        a2: op2 === '+' ? n[2] + n[3] : n[2] - n[3]
    };
}

const showdownSchema = z.object({
    id: z.uuid(),
    creater_qid: z
        .string()
        .min(4, "your qid must be atleat 4 characters")
        .max(200, "your qid must be below 200 characters"),
    joiner_qid: z
        .string()
        .min(4, "your qid must be atleat 4 characters")
        .max(200, "your qid must be below 200 characters"),
    q1: z.string(),
    a1: z.number(),
    q2: z.string(),
    a2: z.number(),
    status: z.enum(['created', 'full', 'completed']),
    created_at: z.date().default(() => new Date())
})

export type Showdown = z.infer<typeof showdownSchema>;

type WSMessage =
    | { type: 'join'; qid: string }
    | { type: 'submit-answer'; qIndex: number; answer: number; qid: string }
    | { type: 'validate-showdown'; a1: number; a2: number };

export const showdown = new Elysia({ prefix: '/showdown' })
    .post('/create', async ({ body }) => {
        const { creater_qid, joiner_qid } = body as { creater_qid: string, joiner_qid: string };
        const quiz = generateQuiz();

        const { data, error } = await CLIENT
            .from('showdown')
            .insert({
                creater_qid,
                joiner_qid,
                q1: quiz.q1,
                a1: quiz.a1,
                q2: quiz.q2,
                a2: quiz.a2,
                status: 'created'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }, {
        body: t.Object({
            creater_qid: t.String(),
            joiner_qid: t.String()
        })
    })
    .get('/invites/:qid', async ({ params: { qid } }) => {
        const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
        const { data, error } = await CLIENT
            .from('showdown')
            .select('*')
            .eq('joiner_qid', qid)
            .eq('status', 'created')
            .gt('created_at', sixtySecondsAgo)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw new Error(error.message);
        return data;
    })
    .post('/abandon/:id', async ({ params: { id } }) => {
        const { error } = await CLIENT
            .from('showdown')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { success: true };
    })
    .ws('/ws/:showdownId', {
        body: t.Object({
            type: t.String(),
            qid: t.Optional(t.String()),
            qIndex: t.Optional(t.Number()),
            answer: t.Optional(t.Number()),
            a1: t.Optional(t.Number()),
            a2: t.Optional(t.Number())
        }),
        open(ws) {
            const { showdownId } = ws.data.params;
            ws.subscribe(`showdown:${showdownId}`);
            console.log(`[WS] Connection opened for room: ${showdownId}`);
            ws.publish(`showdown:${showdownId}`, { type: 'partner-connected' });
        },
        async message(ws, message) {
            const { showdownId } = ws.data.params;
            const data = message as any;

            if (data.type === 'join') {
                (ws.data as any).qid = data.qid;
                ws.publish(`showdown:${showdownId}`, { type: 'partner-joined', qid: data.qid });

                // Update status to 'full' if both are in
                const { data: showdownData } = await CLIENT
                    .from('showdown')
                    .select('status')
                    .eq('id', showdownId)
                    .single();

                if (showdownData?.status === 'created') {
                    await CLIENT.from('showdown').update({ status: 'full' }).eq('id', showdownId);
                }
                return;
            }

            if (data.type === 'quit') {
                ws.publish(`showdown:${showdownId}`, { type: 'partner-quit', qid: data.qid });
                return;
            }

            if (data.type === 'sync-answer') {
                ws.publish(`showdown:${showdownId}`, {
                    type: 'answer-synced',
                    qIndex: data.qIndex,
                    answer: data.answer,
                    qid: data.qid
                });
                return;
            }

            if (data.type === 'validate-showdown') {
                const { a1, a2 } = data;
                console.log(`[WS VALIDATE] Room ${showdownId} A1:${a1} A2:${a2}`);
                const { data: showdownData, error } = await CLIENT
                    .from('showdown')
                    .select('*')
                    .eq('id', showdownId)
                    .single();

                if (error || !showdownData) {
                    ws.send({ type: 'error', message: 'Showdown not found' });
                    return;
                }

                const isCorrect = Number(showdownData.a1) === Number(a1) && Number(showdownData.a2) === Number(a2);

                if (isCorrect) {
                    await CLIENT.from('showdown').update({ status: 'completed' }).eq('id', showdownId);
                    const successPayload = { type: 'showdown-success' };
                    ws.send(successPayload);
                    ws.publish(`showdown:${showdownId}`, successPayload);
                } else {
                    ws.send({ type: 'showdown-failure', message: 'Wrong answers' });
                }
                return;
            }
        },
        close(ws) {
            const { showdownId } = ws.data.params;
            const qid = (ws.data as any).qid;

            if (qid) {
                ws.publish(`showdown:${showdownId}`, { type: 'partner-quit', qid });
            }

            ws.unsubscribe(`showdown:${showdownId}`);
            console.log(`[WS] Connection closed: ${showdownId} ${qid ? 'by ' + qid : '(pre-join)'}`);
        }
    });