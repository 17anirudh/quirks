
export type UserProfile = {
    u_qid: string
    u_name: string | null
    u_pfp: string | null
    u_bio?: string | null
}

export type Message = {
    m_id?: string
    m_conv_ref_id?: string
    m_sender_qid: string
    content: string
    created_at: string
}

export type Conversation = {
    conv_id: string
    other_user: UserProfile
    last_message: Message | null
}
