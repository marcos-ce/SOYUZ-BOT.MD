let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    if (!who) return m.reply(`✳️ Marque ou responda a mensagem de quem deseja mutar\n\n📌 Exemplo: *${usedPrefix + command}* @tag`)
    let chat = global.db.data.chats[m.chat]
    chat.mutedUsers = chat.mutedUsers || {}
    chat.mutedUsers[who] = true
    m.reply(`✅ Usuário mutado com sucesso!`)
}

export async function before(m, { conn, isAdmin, command }) {
    if (!m.isGroup) return true;

    const chat = global.db.data.chats[m.chat];
    const mutedUsers = chat?.mutedUsers || {};

    if (mutedUsers[m.sender] && !command) {
        await conn.deleteMessage(m.chat, m.key);
        return false;
    }

    return true;
}

handler.help = ['mute']
handler.tags = ['group']
handler.command = ['mute']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler;
