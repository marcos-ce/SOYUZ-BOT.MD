import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import pino from 'pino'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import cloudDBAdapter from './lib/cloudDBAdapter.js'
import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import readline from 'readline'

const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

function question(promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => {
    rl.question(promptText, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix
    ? /file:\/\/\//.test(pathURL)
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] }
            : {})
        })
      )
    : '')

global.timestamp = {
  start: new Date()
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
if (global.opts['prefix']) {
  global.prefix = new RegExp(
    '^[' + global.opts['prefix'].replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']'
  )
}

const dbUrl =
  global.opts['db'] ||
  (global.dbType === 'mongodb' ? process.env.MONGODB_URI || process.env.DATABASE_URI : '') ||
  ''

global.db = new Low(
  /https?:\/\//.test(dbUrl)
    ? new cloudDBAdapter(dbUrl)
    : /mongodb(\+srv)?:\/\//i.test(dbUrl)
    ? global.opts['mongodbv2']
      ? new mongoDBV2(dbUrl)
      : new mongoDB(dbUrl)
    : new JSONFile(`${global.opts._[0] ? global.opts._[0] + '_' : ''}${global.dbPath || 'database.json'}`)
)

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise(resolve =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this)
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
        }
      }, 1 * 1000)
    )
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}

function clearTmp() {
  const tmp = [tmpdir(), join(__dirname, './tmp')]
  const filename = []
  tmp.forEach(dirname => {
    if (existsSync(dirname)) {
      readdirSync(dirname).forEach(file => filename.push(join(dirname, file)))
    }
  })

  return filename.map(file => {
    try {
      const stats = statSync(file)
      if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 1) return unlinkSync(file)
    } catch {
      // Ignore already removed or locked temp files
    }
    return false
  })
}

async function _quickTest() {
  let test = await Promise.all(
    [
      spawn('ffmpeg'),
      spawn('ffprobe'),
      spawn('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-filter_complex',
        'color',
        '-frames:v',
        '1',
        '-f',
        'webp',
        '-'
      ]),
      spawn('convert'),
      spawn('magick'),
      spawn('gm'),
      spawn('find', ['--version'])
    ].map(p => {
      return Promise.race([
        new Promise(resolve => {
          p.on('close', code => {
            resolve(code !== 127)
          })
        }),
        new Promise(resolve => {
          p.on('error', _ => resolve(false))
        })
      ])
    })
  )
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  let s = (global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  })
  Object.freeze(global.support)

  if (!s.ffmpeg) console.warn(chalk.yellow('⚠️  Please install ffmpeg for sending videos (pkg install ffmpeg)'))
  if (s.ffmpeg && !s.ffmpegWebp)
    console.warn(chalk.yellow('⚠️  Stickers may not animate without libwebp on ffmpeg'))
  if (!s.convert && !s.magick && !s.gm)
    console.warn(chalk.yellow('⚠️  Stickers may not work without imagemagick (pkg install imagemagick)'))
}

export async function startBot() {
  await global.loadDatabase()

  global.authFolder = 'sessions'
  const { state, saveCreds } = await useMultiFileAuthState(global.authFolder)
  const { version } = await fetchLatestBaileysVersion()

  let usePairingCode =
    Boolean(global.opts['pairing-code'] || global.opts['code'] || global.pairingCode)
  let phoneNumber = (
    global.opts['phone'] ||
    global.botNumber ||
    process.env.BOT_PHONE_NUMBER ||
    ''
  ).replace(/[^0-9]/g, '')

  if (!state.creds.registered && !usePairingCode && !global.opts['qr'] && process.stdin.isTTY) {
    console.log(
      chalk.cyan(
        '\n╭─────────────────────────────────────────────╮\n' +
          '│       🚀 SOYUZ-BOT - MÉTODO DE LOGIN        │\n' +
          '├─────────────────────────────────────────────┤\n' +
          '│  [1] Conectar via QR Code                   │\n' +
          '│  [2] Conectar via Código de 8 dígitos       │\n' +
          '╰─────────────────────────────────────────────╯'
      )
    )
    const option = await question(chalk.yellow('👉 Escolha uma opção (1 ou 2): '))
    if (option === '2') {
      usePairingCode = true
    }
  }

  if (!state.creds.registered && usePairingCode && !phoneNumber && process.stdin.isTTY) {
    phoneNumber = (
      await question(
        chalk.yellow(
          '📱 Digite o número do WhatsApp do bot com DDI e DDD (ex: 5588981647724): '
        )
      )
    ).replace(/[^0-9]/g, '')
  }

  const connectionOptions = {
    version,
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    patchMessageBeforeSending: message => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      )
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {}
              },
              ...message
            }
          }
        }
      }
      return message
    },
    logger: pino({ level: 'silent' })
  }

  global.conn = makeWASocket(connectionOptions)
  global.conn.isInit = false

  if (usePairingCode && !global.conn.authState.creds.registered) {
    if (!phoneNumber) {
      console.error(
        chalk.red(
          '❌ Número de telefone não informado para o Pairing Code! Defina BOT_PHONE_NUMBER no .env ou informe no terminal.'
        )
      )
    } else {
      setTimeout(async () => {
        try {
          let codeBot = await global.conn.requestPairingCode(phoneNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot
          console.log(
            chalk.greenBright(
              '\n╭─────────────────────────────────────────────╮\n' +
                `│  🔑 CÓDIGO DE PAREAMENTO: ${chalk.bold.white(codeBot.padEnd(16))}│\n` +
                '╰─────────────────────────────────────────────╯\n'
            )
          )
        } catch (err) {
          console.error(chalk.red('❌ Erro ao solicitar código de pareamento:'), err)
        }
      }, 3000)
    }
  }

  if (!global.opts['test']) {
    setInterval(async () => {
      if (global.db.data) await global.db.write().catch(console.error)
      if (global.opts['autocleartmp']) {
        try {
          clearTmp()
        } catch (e) {
          console.error(e)
        }
      }
    }, 60 * 1000)

    setInterval(async () => {
      clearTmp()
    }, 60000)
  }

  if (global.opts['server']) (await import('./server.js')).default(global.conn, PORT)

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin } = update
    if (isNewLogin) global.conn.isInit = true
    const code =
      lastDisconnect?.error?.output?.statusCode ||
      lastDisconnect?.error?.output?.payload?.statusCode
    if (code && code !== DisconnectReason.loggedOut && global.conn?.ws?.socket == null) {
      console.log(await global.reloadHandler(true).catch(console.error))
      global.timestamp.connect = new Date()
    }
    if (connection === 'open') {
      console.log(chalk.green('✅ Conectado ao WhatsApp com sucesso!'))
    }
    if (global.db.data == null) await global.loadDatabase()
  }

  let isInit = true
  let handler = await import('./handler.js')

  global.reloadHandler = async function (restartConn) {
    try {
      const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
      if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) {
      console.error(e)
    }
    if (restartConn) {
      const oldChats = global.conn.chats
      try {
        global.conn.ws.close()
      } catch {}
      global.conn.ev.removeAllListeners()
      global.conn = makeWASocket(connectionOptions, { chats: oldChats })
      isInit = true
    }
    if (!isInit) {
      global.conn.ev.off('messages.upsert', global.conn.handler)
      global.conn.ev.off('group-participants.update', global.conn.participantsUpdate)
      global.conn.ev.off('groups.update', global.conn.groupsUpdate)
      global.conn.ev.off('message.delete', global.conn.onDelete)
      global.conn.ev.off('connection.update', global.conn.connectionUpdate)
      global.conn.ev.off('creds.update', global.conn.credsUpdate)
    }

    global.conn.welcome = 'Olá, @user\nBem-vindo(a) a @group'
    global.conn.bye = 'Adeus @user'
    global.conn.spromote = '@user promovido a admin'
    global.conn.sdemote = '@user rebaixado'
    global.conn.sDesc = 'A descrição foi alterada para \n@desc'
    global.conn.sSubject = 'O nome do grupo foi alterado para \n@group'
    global.conn.sIcon = 'O ícone do grupo foi alterado'
    global.conn.sRevoke = 'O link do grupo foi alterado para \n@revoke'

    global.conn.handler = handler.handler.bind(global.conn)
    global.conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
    global.conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
    global.conn.onDelete = handler.deleteUpdate.bind(global.conn)
    global.conn.connectionUpdate = connectionUpdate.bind(global.conn)
    global.conn.credsUpdate = saveCreds.bind(global.conn, true)

    global.conn.ev.on('messages.upsert', global.conn.handler)
    global.conn.ev.on('group-participants.update', global.conn.participantsUpdate)
    global.conn.ev.on('groups.update', global.conn.groupsUpdate)
    global.conn.ev.on('message.delete', global.conn.onDelete)
    global.conn.ev.on('connection.update', global.conn.connectionUpdate)
    global.conn.ev.on('creds.update', global.conn.credsUpdate)
    isInit = false
    return true
  }

  const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
  const pluginFilter = filename => /\.js$/.test(filename)
  global.plugins = {}

  async function filesInit() {
    for (let filename of readdirSync(pluginFolder).filter(pluginFilter)) {
      try {
        let file = global.__filename(join(pluginFolder, filename))
        const module = await import(file)
        global.plugins[filename] = module.default || module
      } catch (e) {
        global.conn.logger.error(`Error loading plugin '${filename}':`, e)
        delete global.plugins[filename]
      }
    }
  }

  await filesInit()
    .then(_ => console.log(chalk.cyan(`📦 ${Object.keys(global.plugins).length} plugins carregados`)))
    .catch(console.error)

  global.reload = async (_ev, filename) => {
    if (filename && pluginFilter(filename)) {
      let dir = global.__filename(join(pluginFolder, filename), true)
      if (filename in global.plugins) {
        if (existsSync(dir)) global.conn.logger.info(`🌟 Plugin Atualizado - '${filename}'`)
        else {
          global.conn.logger.warn(`🗑️ Plugin Eliminado - '${filename}'`)
          return delete global.plugins[filename]
        }
      } else global.conn.logger.info(`✨ Novo plugin - '${filename}'`)

      let err = syntaxerror(readFileSync(dir), filename, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true
      })
      if (err) global.conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
      else
        try {
          const module = await import(`${global.__filename(dir)}?update=${Date.now()}`)
          global.plugins[filename] = module.default || module
        } catch (e) {
          global.conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
        } finally {
          global.plugins = Object.fromEntries(
            Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
          )
        }
    }
  }
  Object.freeze(global.reload)
  watch(pluginFolder, global.reload)
  await global.reloadHandler()

  await _quickTest()
    .then(() => global.conn.logger.info('SOYUZ-BOT @marcoskz 🚀'))
    .catch(console.error)

  return global.conn
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('📛 Shutting down gracefully...'))
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log(chalk.yellow('📛 Shutting down gracefully...'))
  process.exit(0)
})

// Auto-start if executed directly (e.g. `node main.js`)
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startBot().catch(console.error)
}

export default startBot
