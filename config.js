import { watchFile, unwatchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { pt, es, en, id, ar } from './language/index.js'

// Load environment variables from .env file
dotenv.config()

const __filename = fileURLToPath(import.meta.url)

// =====================================================
// CONFIGURATION MANAGEMENT
// =====================================================

/**
 * Parse owner numbers from environment variable
 * Format: number1|number2|number3 or comma-separated
 */
function parseOwners() {
  const ownerEnv = process.env.BOT_OWNER_NUMBER || ''
  if (!ownerEnv || ownerEnv === 'YOUR_NUMBER_HERE') {
    return [
      ['558881647724', 'marcoskz_', true],
      ['61488873561', 'owner-1', false]
    ]
  }

  return ownerEnv
    .split(/[|,]/)
    .map(num => num.trim())
    .filter(num => num.length > 0)
    .map((number, idx) => {
      const isMainOwner = idx === 0
      return [number, idx === 0 ? 'marcoskz_' : `owner-${idx}`, isMainOwner]
    })
}

/**
 * Parse comma or pipe-separated lists
 */
function parseList(envVar = '', defaultList = []) {
  if (!envVar) return defaultList
  return envVar
    .split(/[|,]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

function safeReadFile(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null
  } catch {
    return null
  }
}

// =====================================================
// GLOBAL CONFIGURATION
// =====================================================

global.owner = parseOwners()
global.mods = parseList(process.env.BOT_MODS, ['558881647724'])
global.prems = parseList(process.env.BOT_PREMIUMS, ['558881647724'])
global.botNumber = (process.env.BOT_PHONE_NUMBER || '').replace(/[^0-9]/g, '')
global.pairingCode = process.env.PAIRING_CODE === 'true' || Boolean(global.botNumber)

// =====================================================
// API CONFIGURATION
// =====================================================

global.APIs = {
  fgmods: process.env.FG_MODS_API_URL || 'https://api.fgmods.xyz',
  nrtm: process.env.NRTM_API_URL || 'https://fg-nrtm.ddns.net'
}

global.APIKeys = {
  [global.APIs.fgmods]: process.env.FG_MODS_API_KEY || 'aa9HWoim'
}

// =====================================================
// MENU & GPT IMAGES CONFIGURATION
// =====================================================

global.img = safeReadFile('./src/menus/Menu4.jpg')
global.img2 = safeReadFile('./src/menus/IMG-20240213-WA0035.jpg')
global.img3 = safeReadFile('./src/menus/menuia.jpeg')
global.img4 = safeReadFile('./src/menus/dave1.mp4')

global.gpt1 = safeReadFile('./src/GPT/menuia.jpeg')
global.gpt2 = safeReadFile('./src/GPT/chatgptprincipal.jpg')
global.gpt3 = safeReadFile('./src/GPT/chatgptprincipal.jpg')
global.gpt4 = safeReadFile('./src/GPT/gpt1.jpeg')
global.gpt5 = safeReadFile('./src/GPT/gpt3.jpeg')
global.gpt6 = safeReadFile('./src/GPT/chatgpt8.jpeg')
global.gpt7 = safeReadFile('./src/GPT/chatgpt7.jpeg')

global.marcosMenu = [global.img, global.img2, global.img3, global.img4].filter(Boolean)
global.marcosgpt = [global.gpt1, global.gpt2, global.gpt3, global.gpt4, global.gpt5, global.gpt6, global.gpt7].filter(Boolean)

// =====================================================
// BOT BRANDING, LINKS & CONSTANTS
// =====================================================

global.packname = process.env.BOT_PACKNAME || '🤖 𝚂𝙾𝚈𝚄𝚉-𝙱𝙾𝚃-𝙼𝙳'
global.author = process.env.BOT_AUTHOR || 'user'
global.botName = process.env.BOT_NAME || 'Vladivostok'

global.fgig = 'https://www.instagram.com/marcoskz_'
global.fgsc = 'https://github.com/marcos-ce/SOYUZ-BOT.MD'
global.fgyt = 'https://youtube.com'
global.fgpyp = 'https://www.paypal.com/donate/?business=WUDZNJ573PAF6&no_recurring=0&item_name=Help+this+project+stay+active%21+%3A%29&currency_code=BRL'
global.fglog = 'https://i.ibb.co/1zdz2j3/logo.jpgs'

global.fgcanal = 'https://chat.whatsapp.com/LPddZ7u0v8G3PxEQ1SR1mZ'
global.bgp = 'https://chat.whatsapp.com/LPddZ7u0v8G3PxEQ1SR1mZ'
global.bgp2 = 'https://chat.whatsapp.com/LPddZ7u0v8G3PxEQ1SR1mZ'
global.bgp3 = 'https://chat.whatsapp.com/LPddZ7u0v8G3PxEQ1SR1mZ'

global.wait = '_*Baixando...*_ 📥\n*▬▬▬▭*'
global.rwait = '🔄'
global.dmoji = '🤠'
global.done = '✅'
global.error = '🚫'
global.xmoji = '🎉'

global.multiplier = 69
global.maxwarn = '2'

// =====================================================
// DATABASE, FEATURES & LOGGING CONFIGURATION
// =====================================================

global.dbType = process.env.DB_TYPE || 'json'
global.dbPath = process.env.DB_PATH || './database.json'

global.features = {
  chatbot: process.env.ENABLE_CHATBOT === 'true',
  autoLevelup: process.env.ENABLE_AUTO_LEVELUP === 'true',
  antiLink: process.env.ENABLE_ANTI_LINK === 'true',
  keepAlive: process.env.KEEP_ALIVE === 'true'
}

global.logLevel = process.env.LOG_LEVEL || 'info'
global.debugMode = process.env.DEBUG_MODE === 'true'

// =====================================================
// LANGUAGE & PREFIX CONFIGURATION
// =====================================================

global.defaultLanguage = process.env.DEFAULT_LANGUAGE || 'pt'
const langMap = { pt, es, en, id, ar }
global.mssg = langMap[global.defaultLanguage] || pt

const defaultPrefix = '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-'
const prefixEnv = process.env.BOT_PREFIX || defaultPrefix
global.prefix = new RegExp('^[' + prefixEnv.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

// =====================================================
// VALIDATION & LOGGING
// =====================================================

function validateConfig() {
  const warnings = []
  const errors = []

  if (!process.env.BOT_OWNER_NUMBER || process.env.BOT_OWNER_NUMBER === 'YOUR_NUMBER_HERE') {
    warnings.push('BOT_OWNER_NUMBER not set in .env; using fallback owner configuration')
  }

  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_MODE === 'true') {
    warnings.push('Debug mode is enabled in production')
  }

  if (!process.env.FG_MODS_API_KEY || process.env.FG_MODS_API_KEY === 'aa9HWoim') {
    warnings.push('Using default FG_MODS_API_KEY. Consider setting your own in .env')
  }

  return { warnings, errors }
}

const { warnings, errors } = validateConfig()

if (errors.length > 0) {
  console.error(chalk.red('❌ Configuration Errors:'))
  errors.forEach(err => console.error(chalk.red(`   - ${err}`)))
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn(chalk.yellow('⚠️  Configuration Warnings:'))
  warnings.forEach(warn => console.warn(chalk.yellow(`   - ${warn}`)))
}

// =====================================================
// CONFIG RELOAD ON FILE CHANGE (Development)
// =====================================================

if (process.env.NODE_ENV !== 'production') {
  watchFile(__filename, () => {
    unwatchFile(__filename)
    console.log(chalk.cyan("🔄 Update 'config.js'"))
    import(`${__filename}?update=${Date.now()}`)
  })
}

console.log(chalk.green('✅ Configuration loaded successfully'))
