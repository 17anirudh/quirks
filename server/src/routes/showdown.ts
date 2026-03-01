import { Elysia, t } from "elysia"
import { CLIENT } from "../supabase/config"

interface Quiz {
    q1: string;
    o1: string;
    a1: number;
    q2: string;
    o2: string;
    a2: number
};

function generateQuiz(): Quiz {
    const getNum = () => Math.floor(Math.random() * (150 - (-2) + 1)) + (-2);
    const ops = ['+', '-'] as const;
    const getOp = () => ops[Math.floor(Math.random() * ops.length)];

    const n = [getNum(), getNum(), getNum(), getNum()];
    const op1 = getOp();
    const op2 = getOp();

    return {
        q1: `${n[0]} ${op1} ${n[1]}`,
        o1: op1,
        a1: op1 === '+' ? n[0] + n[1] : n[0] - n[1],
        q2: `${n[2]} ${op2} ${n[3]}`,
        o2: op2,
        a2: op2 === '+' ? n[2] + n[3] : n[2] - n[3]
    };
}

export const showdown = new Elysia({ prefix: '/showdown' })