export const Keys = {
    me: ['me'],
    viteUiTheme: "vite-ui-theme",
    post: (id: string) => ['post', id],
    user: (search: string, viewer: string) => ['user', search, viewer],
    showdownInvites: (qid: string) => ['showdown-invites', qid],
    conversationPartner: (chatId: string) => ['conversation_partner', chatId],
    conversation: ['conversations'],
}