let handler = async (m, { conn, participants, groupMetadata, args }) => {
    if (args.length === 0) {
        return conn.reply(m.chat, 'Por favor, forneça uma mensagem para que os administradores possam ajudar.', m)
    }

    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './src/avatar_contact.png'
    const groupAdmins = participants.filter(p => p.admin)
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n⚠️ ')
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

    let text = `
🚨 *DENÚNCIA/AVISO AOS ADMINISTRADORES* 🚨

┌─⊷ *MOTIVO*
> ${args.join(' ')}
└───────────

*ADMINISTRADORES:*
⚠️ ${listAdmin}
`

    text = text.trim()

    conn.sendFile(m.chat, pp, 'staff.png', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] })
}
handler.help = ['denunciar', 'informar']
handler.tags = ['group', 'prime']
handler.command = ['denuncia', 'dununciar', 'ajuda', 'informar', 'adm'] 
handler.group = true
export default handler
