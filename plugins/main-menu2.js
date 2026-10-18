
let handler = async function (m, { conn, text, usedPrefix }) {
  
let m2 = `
> Lista de Opções

> *ADMIN*

 ${usedPrefix}captcha
 ${usedPrefix}welcome/bemvindo
 ${usedPrefix}setbye
 ${usedPrefix}antilink (com kick user)
 ${usedPrefix}antilink2 (sem kick user)
 ${usedPrefix}detect 
 ${usedPrefix}document
 ${usedPrefix}nsfw
 ${usedPrefix}autosticker
└───────────── 
> *USERS*

 ${usedPrefix}autolevelup
 ${usedPrefix}chatbot 
└─────────────
> *OWNER*

 ${usedPrefix}public
 ${usedPrefix}sopv
 ${usedPrefix}sogp
└─────────────
*📌 Exemplo:*
*${usedPrefix}on* antilink2
*${usedPrefix}off* antilink2
`
   let pp = global.marcosMenu?.length ? global.marcosMenu.getRandom() : './src/avatar_contact.png'
   conn.sendFile(m.chat, pp, 'menu.jpg', m2, m, null, global.rpl)
   
}

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'setmenu'] 

export default handler
