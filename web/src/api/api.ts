import { SUPABASE_CLIENT } from "@/context/utils"
import type { PostSchema } from "@/routes/_protected/profile/create"

const url = import.meta.env.VITE_BACKEND_URL as string

type postType = {
    p_id: string | null,
    p_author_qid: string | null,
    p_text: string | null,
    p_likes_count: number | null,
    p_comments_count: number | null,
    p_created_at: string | null,
    p_url: string | null,
    p_author_pfp: string | null
}

type queryResponse = {
    user: {
        u_qid: string | null,
        u_bio: string | null,
        u_pfp: string | null,
        u_name: string | null
    },
    post: {
        p_id: string | null,
        p_author_qid: string | null,
        p_text: string | null,
        p_likes_count: number | null,
        p_comments_count: number | null,
        p_created_at: string | null,
        p_url: string | null
        p_author_pfp: string | null
    }[],
    relation: {
        fs_id: string | null,
        sent_qid: string | null,
        receive_qid: string | null,
        fs_status: string | null,
        fs_created_at: string | null
    }[],
    pending?: {
        fs_id: string | null,
        sent_qid: string | null,
        receive_qid: string | null,
        fs_status: string | null,
        fs_created_at: string | null
    }[]
}

export async function queryMe(qid: string): Promise<queryResponse> {
    const res = await fetch(`${url}/user/me`, {
        headers: {
            id: qid
        }
    })
    if (!res.ok) throw new Error('Failed to fetch profile')
    return await res.json()
}

export async function queryPost(pid: string): Promise<postType> {
    const res = await fetch(`${url}/post/search/${pid}`)
    if (!res.ok) throw new Error('Failed to fetch post')
    return await res.json()
}

export async function queryUser(search: string, viewer: string): Promise<queryResponse> {
    const res = await fetch(`${url}/user/u/${search}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'viewer': viewer || 'a'
        }
    })
    if (!res.ok) {
        console.error(await res.json())
        throw new Error('Failed to fetch user')
    }
    const response = await res.json()
    return {
        user: response.user,
        post: response.post || [],
        relation: response.relation || null,
    }
}

export async function queryShowdownInvites(qid: string): Promise<any> {
    const res = await fetch(`${url}/showdown/invites/${qid}`)
    if (!res.ok) throw new Error("Failed to poll invites")
    return res.json()
}

export async function createShowdown(targetQid: string, qid: string): Promise<any> {
    const res = await fetch(`${url}/showdown/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creater_qid: qid, joiner_qid: targetQid })
    })
    if (!res.ok) throw new Error("Failed to create showdown")
    return res.json()
}

export async function createPost(values: PostSchema, res: queryResponse) {
    if (!values.p_image) {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/post/create/${res!.user.u_qid}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    p_text: values.p_text,
                    p_author_pfp: res!.user.u_pfp
                }),
            }
        )

        if (!response.ok) throw new Error("Post failed")
        return response.json()
    }

    const formData = new FormData()
    formData.append("p_text", values.p_text)
    formData.append("p_image", values.p_image)
    formData.append("p_authour_pfp", res!.user.u_pfp!)

    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/post/create/${res!.user.u_qid}`,
        {
            method: "POST",
            body: formData,
        }
    )

    if (!response.ok) throw new Error("Post failed")
    return response.json()
}

export async function queryConversationPartner(chatId: string, qid: string) {
    const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { data, error } = await SUPABASE_CLIENT
        .from('conversation_member')
        .select('conv_mem_qid, profile:conv_mem_qid(u_name, u_pfp, u_qid)')
        .eq('conv_mem_conv_ref_id', chatId)
        .neq('conv_mem_qid', qid)
        .single()

    if (error) throw error;
    const p = data?.profile;
    if (Array.isArray(p)) return p[0] as any;
    return p as any;
}

export async function loadHistory(chatId: string) {
    const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/${chatId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    const data = await res.json();
    return data.messages as any[];
}

export async function loadConversations(): Promise<any[]> {
    const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/list`, {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[FRONTEND] Failed to fetch conversations:', res.status, errorText);
        throw new Error("Failed to fetch conversations");
    }
    const data = await res.json();
    console.log('[FRONTEND] Fetched conversations:', data.conversations?.length || 0);
    return data.conversations;
}