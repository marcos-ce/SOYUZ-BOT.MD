import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms =>
  isNumber(ms) &&
  new Promise(resolve =>
    setTimeout(function () {
      clearTimeout(this)
      resolve()
    }, ms)
  )

/**
 * Handle messages upsert
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['messages.upsert']} chatUpdate
 */
export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  if (!chatUpdate || !chatUpdate.messages) return

  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.coin = 0
    m.diamond = false

    try {
      let user = global.db.data.users[m.sender]
      if (typeof user !== 'object') global.db.data.users[m.sender] = {}
      if (user) {
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.coin)) user.coin = 0
        if (!isNumber(user.diamond)) user.diamond = 20
        if (!isNumber(user.bank)) user.bank = 0
        if (!isNumber(user.lastclaim)) user.lastclaim = 0
        if (!('registered' in user)) user.registered = false
        if (!user.registered) {
          if (!('name' in user)) user.name = m.name
          if (!isNumber(user.age)) user.age = -1
          if (!isNumber(user.regTime)) user.regTime = -1
        }
        if (!isNumber(user.afk)) user.afk = -1
        if (!('afkReason' in user)) user.afkReason = ''
        if (!('banned' in user)) user.banned = false
        if (!isNumber(user.warn)) user.warn = 0
        if (!isNumber(user.level)) user.level = 0
        if (!('role' in user)) user.role = 'Novato'
        if (!('autolevelup' in user)) user.autolevelup = global.features?.autoLevelup || false
        if (!('chatbot' in user)) user.chatbot = global.features?.chatbot || false
        if (!('genero' in user)) user.genero = 'Indeciso'
        if (!('language' in user)) user.language = global.defaultLanguage || 'pt'
        if (!('prem' in user)) user.prem = false
        if (!user.premiumTime) user.premiumTime = 0
      } else {
        global.db.data.users[m.sender] = {
          exp: 0,
          coin: 0,
          diamond: 20,
          bank: 0,
          lastclaim: 0,
          registered: false,
          name: m.name,
          age: -1,
          regTime: -1,
          afk: -1,
          afkReason: '',
          banned: false,
          warn: 0,
          level: 0,
          role: 'Novato',
          autolevelup: global.features?.autoLevelup || false,
          chatbot: global.features?.chatbot || false,
          genero: 'Indeciso',
          language: global.defaultLanguage || 'pt',
          prem: false,
          premiumTime: 0
        }
      }

      let chat = global.db.data.chats[m.chat]
      if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
      if (chat) {
        if (!('isBanned' in chat)) chat.isBanned = false
        if (!('welcome' in chat)) chat.welcome = true
        if (!('detect' in chat)) chat.detect = false
        if (!('sWelcome' in chat)) chat.sWelcome = ''
        if (!('sBye' in chat)) chat.sBye = ''
        if (!('sPromote' in chat)) chat.sPromote = ''
        if (!('sDemote' in chat)) chat.sDemote = ''
        if (!('delete' in chat)) chat.delete = true
        if (!('antiLink' in chat)) chat.antiLink = global.features?.antiLink || false
        if (!('antiLink2' in chat)) chat.antiLink2 = false
        if (!('viewonce' in chat)) chat.viewonce = false
        if (!('captcha' in chat)) chat.captcha = false
        if (!('nsfw' in chat)) chat.nsfw = false
        if (!isNumber(chat.expired)) chat.expired = 0
        if (!('rules' in chat)) chat.rules = ''
        if (!('antifake' in chat)) chat.antifake = false
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false,
          welcome: true,
          detect: false,
          sWelcome: '',
          sBye: '',
          sPromote: '',
          sDemote: '',
          delete: true,
          antiLink: global.features?.antiLink || false,
          antiLink2: false,
          viewonce: false,
          useDocument: true,
          captcha: false,
          nsfw: false,
          expired: 0,
          rules: '',
          antifake: false
        }
      }

      var settings = global.db.data.settings[this.user.jid]
      if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
      if (settings) {
        if (!('self' in settings)) settings.self = false
        if (!('autoread' in settings)) settings.autoread = false
        if (!('restrict' in settings)) settings.restrict = false
        if (!('antiSpam' in settings)) settings.antiSpam = true
        if (!('status' in settings)) settings.status = 0
        if (!('antiCall' in settings)) settings.antiCall = true
        if (!('solopv' in settings)) settings.solopv = false
        if (!('sologp' in settings)) settings.sologp = false
      } else {
        global.db.data.settings[this.user.jid] = {
          self: false,
          autoread: false,
          restrict: false,
          antiSpam: true,
          antiCall: true,
          solopv: false,
          sologp: false,
          status: 0
        }
      }
      settings = global.db.data.settings[this.user.jid]
    } catch (e) {
      console.error(e)
    }

    if (opts['nyimak']) return
    if (!m.fromMe && opts['self']) return
    if (settings?.solopv && m.chat.endsWith('g.us')) return
    if (
      settings?.sologp &&
      !m.chat.endsWith('g.us') &&
      !/jadibot|bebot|getcode|serbot|bots|stop|support|donate|off|on|s|tiktok|code|newcode|join/gim.test(m.text)
    )
      return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

    const isROwner = [this.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
      .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      .includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods =
      isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isPrems =
      isROwner ||
      global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) ||
      _user?.prem == true

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque,
        time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    let usedPrefix
    const groupMetadata =
      (m.isGroup ? (this.chats[m.chat] || {}).metadata || (await this.groupMetadata(m.chat).catch(_ => null)) : {}) ||
      {}
    const participants = (m.isGroup ? groupMetadata.participants : []) || []
    const user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
    const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
    const isRAdmin = user?.admin == 'superadmin' || false
    const isAdmin = isRAdmin || user?.admin == 'admin' || false
    const isBotAdmin = bot?.admin || false

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin) continue
      if (plugin.disabled) continue
      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
        } catch (e) {
          console.error(e)
        }
      }

      if (!opts['restrict']) {
        if (plugin.tags && plugin.tags.includes('admin')) {
          continue
        }
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
      let match = (
        _prefix instanceof RegExp
          ? [[_prefix.exec(m.text), _prefix]]
          : Array.isArray(_prefix)
          ? _prefix.map(p => {
              let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
              return [re.exec(m.text), re]
            })
          : typeof _prefix === 'string'
          ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
          : [[[], new RegExp()]]
      ).find(p => p[1])

      if (typeof plugin.before === 'function') {
        if (
          await plugin.before.call(this, m, {
            match,
            conn: this,
            participants,
            groupMetadata,
            user,
            bot,
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
        )
          continue
      }

      if (typeof plugin !== 'function') continue

      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
        args = args || []
        let _args = noPrefix.trim().split` `.slice(1)
        let text = _args.join` `
        command = (command || '').toLowerCase()
        let fail = plugin.fail || global.dfail
        let isAccept =
          plugin.command instanceof RegExp
            ? plugin.command.test(command)
            : Array.isArray(plugin.command)
            ? plugin.command.some(cmd => (cmd instanceof RegExp ? cmd.test(command) : cmd === command))
            : typeof plugin.command === 'string'
            ? plugin.command === command
            : false

        if (!isAccept) continue
        m.plugin = name

        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          let chat = global.db.data.chats[m.chat]
          let user = global.db.data.users[m.sender]
          if (
            name != 'owner-unbanchat.js' &&
            name != 'owner-exec.js' &&
            name != 'owner-exec2.js' &&
            name != 'tool-delete.js' &&
            chat?.isBanned &&
            !isROwner
          )
            return
          if (name != 'owner-unbanUser.js' && m.text && user?.banned && !isROwner) {
            if (user.antispam > 2) return
            m.reply(
              `🚫 *ESTÁ BANIDO(A), NÃO PODE USAR COMANDOS*\n📑 *MOTIVO: ${
                !user.messageSpam ? 'NÃO ESPECIFICADO' : user.messageSpam
              }*\n⚠️ _SE ACHA QUE PODE SER UM ERRO, ENTRAR EM CONTATO_`
            )
            user.antispam = (user.antispam || 0) + 1
            return
          }

          if (user?.antispam2) return
          if (new Date() - (user.spam || 0) < 5000) {
            console.log(`[ SPAM ]`)
            return
          }
          user.spam = new Date() * 1
        }

        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
          fail('owner', m, this)
          continue
        }
        if (plugin.rowner && !isROwner) {
          fail('rowner', m, this)
          continue
        }
        if (plugin.owner && !isOwner) {
          fail('owner', m, this)
          continue
        }
        if (plugin.mods && !isMods) {
          fail('mods', m, this)
          continue
        }
        if (plugin.premium && !isPrems) {
          fail('premium', m, this)
          continue
        }
        if (plugin.group && !m.isGroup) {
          fail('group', m, this)
          continue
        } else if (plugin.botAdmin && !isBotAdmin) {
          fail('botAdmin', m, this)
          continue
        } else if (plugin.admin && !isAdmin) {
          fail('admin', m, this)
          continue
        }
        if (plugin.private && m.isGroup) {
          fail('private', m, this)
          continue
        }
        if (plugin.register == true && _user.registered == false) {
          fail('unreg', m, this)
          continue
        }

        m.isCommand = true
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
        if (xp > 200) m.reply('chirrido -_-')
        else m.exp += xp

        if (!isPrems && plugin.diamond && global.db.data.users[m.sender].diamond < plugin.diamond * 1) {
          this.reply(
            m.chat,
            `✳️ Teus diamantes se acabaram\nuse o seguinte comando para comprar mais diamantes\n\n*${usedPrefix}buy*`,
            m
          )
          continue
        }
        if (plugin.level > _user.level) {
          this.reply(
            m.chat,
            `✳️ Nível requerido ${plugin.level} para usar este comando.\nTeu nível ${_user.level}`,
            m
          )
          continue
        }

        let extra = {
          match,
          usedPrefix,
          noPrefix,
          _args,
          args,
          command,
          text,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename
        }

        try {
          await plugin.call(this, m, extra)
          if (!isPrems) m.diamond = m.diamond || plugin.diamond || false
        } catch (e) {
          m.error = e
          console.error(e)
          if (e) {
            let text = format(e)
            for (let key of Object.values(global.APIKeys))
              text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
            m.reply(text)
          }
        } finally {
          if (typeof plugin.after === 'function') {
            try {
              await plugin.after.call(this, m, extra)
            } catch (e) {
              console.error(e)
            }
          }
          if (m.diamond) m.reply(`Utilizando *${+m.diamond}* 💎`)
        }
        break
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }

    let user,
      stats = global.db.data.stats
    if (m) {
      if (m.sender && (user = global.db.data.users[m.sender])) {
        user.exp += m.exp
        user.diamond -= m.diamond * 1
      }

      let stat
      if (m.plugin) {
        let now = +new Date()
        if (m.plugin in stats) {
          stat = stats[m.plugin]
          if (!isNumber(stat.total)) stat.total = 1
          if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
          if (!isNumber(stat.last)) stat.last = now
          if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
        } else {
          stat = stats[m.plugin] = {
            total: 1,
            success: m.error != null ? 0 : 1,
            last: now,
            lastSuccess: m.error != null ? 0 : now
          }
        }
        stat.total += 1
        stat.last = now
        if (m.error == null) {
          stat.success += 1
          stat.lastSuccess = now
        }
      }
    }

    try {
      if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
    } catch (e) {
      console.log(m, m.quoted, e)
    }
    if (opts['autoread'])
      await this.chatRead(m.chat, m.isGroup ? m.sender : undefined, m.id || m.key.id).catch(() => {})
  }
}

/**
 * Handle groups participants update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate
 */
export async function participantsUpdate({ id, participants, action }) {
  if (opts['self']) return
  if (global.db.data == null) await global.loadDatabase()

  let chat = global.db.data.chats[id] || {}
  let text = ''
  switch (action) {
    case 'add':
    case 'remove': {
      let groupMetadata = (await this.groupMetadata(id)) || (this.chats[id] || {}).metadata
      const botParticipant = groupMetadata?.participants?.find(u => this.decodeJid(u.id) == this.user.jid) || {}
      const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin' || false

      if (chat.antifake && isBotAdmin && action === 'add') {
        const blockedPrefixes = ['6', '3', '4', '7', '8', '9']
        for (let user of participants) {
          if (blockedPrefixes.some(num => user.startsWith(num))) {
            await this.sendMessage(
              id,
              { text: `*Número @${user.split('@')[0]} removido, pois foi pego pelo antifake*`, mentions: [user] },
              { quoted: null }
            )
            await this.groupParticipantsUpdate(id, [user], 'remove').catch(console.error)
            return
          }
        }
      }

      if (chat.welcome) {
        for (let user of participants) {
          let pp = 'https://i.ibb.co/DCBY4zW/images-2024-02-22-T185539-122.jpg'
          try {
            pp = await this.profilePictureUrl(user, 'image')
          } catch {
            // Use default profile picture URL
          } finally {
            const welcomeMessage =
              chat.sWelcome || this.welcome || `Bem-vindo ao grupo @user! leia nossa @desc`
            const byeMessage = chat.sBye || this.bye || `Adeus, @user`
            const groupName = await this.getName(id)
            const groupDesc = groupMetadata?.desc?.toString() || 'Desconhecido'
            const messageContent =
              action === 'add'
                ? welcomeMessage
                    .replace('@user', `@${user.split('@')[0]}`)
                    .replace('@desc', groupDesc)
                    .replace('@grupo', groupName)
                    .replace('@group', groupName)
                : byeMessage
                    .replace('@user', `@${user.split('@')[0]}`)
                    .replace('@desc', groupDesc)
                    .replace('@grupo', groupName)
                    .replace('@group', groupName)

            await this.sendFile(id, pp, 'perfil.jpg', messageContent, null, false, { mentions: [user] })
          }
        }
      }
      break
    }
    case 'promote':
      text = chat.sPromote || this.spromote || '@user agora é um administrador'
    // fallthrough
    case 'demote': {
      let pp = await this.profilePictureUrl(participants[0], 'image').catch(
        _ => 'https://i.ibb.co/1ZxrXKJ/avatar-contact.jpg'
      )
      if (!text) text = chat.sDemote || this.sdemote || '@user você não é mais administrador'
      text = text.replace('@user', '@' + participants[0].split('@')[0])
      if (chat.detect) this.sendFile(id, pp, 'pp.jpg', text, null, false, { mentions: this.parseMention(text) })
      break
    }
  }
}

/**
 * Handle groups update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate
 */
export async function groupsUpdate(groupsUpdate) {
  if (opts['self']) return
  for (const groupUpdate of groupsUpdate) {
    const id = groupUpdate.id
    if (!id) continue
    let chats = global.db.data.chats[id],
      text = ''
    if (!chats?.detect) continue
    if (groupUpdate.desc)
      text = (chats.sDesc || this.sDesc || 'Descrição alterada para \n@desc').replace('@desc', groupUpdate.desc)
    if (groupUpdate.subject)
      text = (chats.sSubject || this.sSubject || 'O nome do grupo foi alterado para \n@group').replace(
        '@group',
        groupUpdate.subject
      )
    if (groupUpdate.icon)
      text = (chats.sIcon || this.sIcon || 'O ícone do grupo mudou para').replace('@icon', groupUpdate.icon)
    if (groupUpdate.revoke)
      text = (chats.sRevoke || this.sRevoke || 'O link do grupo mudou para\n@revoke').replace(
        '@revoke',
        groupUpdate.revoke
      )
    if (!text) continue
    await this.sendMessage(id, { text, mentions: this.parseMention(text) })
  }
}

export async function deleteUpdate(message) {
  try {
    const { fromMe, id, participant } = message
    if (fromMe) return
    let msg = this.serializeM(this.loadMessage(id))
    if (!msg) return
    let chat = global.db.data.chats[msg.chat] || {}
    if (chat.delete) return
    await this.reply(
      msg.chat,
      `
*🗑️ ANTIDELETE DETECTED*  
╭──────────────────╮  
│ *Nome:* @${participant.split`@`[0]} │  
╰──────────────────╯  

*[❗️] Desculpe, mas não é permitido deletar mensagens neste grupo.*

Para desativar esta função, digite:  
*/off antidelete*
`.trim(),
      msg,
      {
        mentions: [participant]
      }
    )
    this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
  } catch (e) {
    console.error(e)
  }
}

global.dfail = (type, m, conn) => {
  let msg = {
    rowner: `👑 ${global.mssg?.rownerH || 'Este comando só pode ser usado pelo criador do bot'}`,
    owner: `🔱 ${global.mssg?.ownerH || 'Este comando só pode ser usado pelo proprietário do bot'}`,
    mods: `🔰 ${global.mssg?.modsH || 'Esta função é apenas para moderadores do bot'}`,
    premium: `💠 ${global.mssg?.premH || 'Este comando é apenas para membros Premium'}`,
    group: `⚙️ ${global.mssg?.groupH || 'Este comando só pode ser usado em grupos'}`,
    private: `📮 ${global.mssg?.privateH || 'Este comando só pode ser usado no chat privado do bot'}`,
    admin: `🛡️ ${global.mssg?.adminH || 'Este comando é apenas para administradores do grupo'}`,
    botAdmin: `💥 ${global.mssg?.botAdmin || 'Para usar este comando, devo ser administrador!'}`,
    unreg: `📇 ${global.mssg?.unregH || 'Registre-se para usar esta função'}`,
    restrict: '🔐 Está *desabilitada*'
  }[type]
  if (msg) return m.reply(msg)
}

let file = fileURLToPath(import.meta.url)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("✅  Atualizado 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})

export default handler
