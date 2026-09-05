import { watchFile, unwatchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = __filename.split('/').slice(0, -1).join('/')

// =====================================================
// CONFIGURATION MANAGEMENT
// =====================================================

/**
 * Parse owner numbers from environment variable
 * Format: number1|number2|number3 or comma-separated
 */
function parseOwners() {
  const ownerEnv = process.env.BOT_OWNER_NUMBER || ''
  if (!ownerEnv) {
    console.warn(chalk.yellow('⚠️  BOT_OWNER_NUMBER not set in .env file'))
    return []
  }
  
  return ownerEnv
    .split(/[|,]/)
    .map(num => num.trim())
    .filter(num => num.length > 0)
    .map((number, idx) => {
      const isMainOwner = idx === 0
      return [number, `owner-${idx}`, isMainOwner]
    })
}

/**
 * Parse comma or pipe-separated lists
 */
function parseList(envVar = '') {
  return envVar
    .split(/[|,]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

// =====================================================
// GLOBAL CONFIGURATION
// =====================================================

global.owner = parseOwners()
global.mods = parseList(process.env.BOT_MODS || '')
global.prems = parseList(process.env.BOT_PREMIUMS || '')

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
// MENU IMAGES CONFIGURATION
// =====================================================

try {
  global.img = fs.readFileSync('./src/menus/Menu4.jpg')
  global.img2 = fs.readFileSync('./src/menus/IMG-20240213-WA0035.jpg')
  global.img3 = fs.readFileSync('./src/menus/menuia.jpeg')
  global.img4 = fs.readFileSync('./src/menus/dave1.mp4')
} catch (err) {
  console.warn(chalk.yellow('⚠️  Some menu images not found. Creating placeholder configuration...'))
  global.img = null
  global.img2 = null
  global.img3 = null
  global.img4 = null
}

// =====================================================
// DATABASE CONFIGURATION
// =====================================================

global.dbType = process.env.DB_TYPE || 'json'
global.dbPath = process.env.DB_PATH || './database.json'

// =====================================================
// FEATURE FLAGS
// =====================================================

global.features = {
  chatbot: process.env.ENABLE_CHATBOT === 'true',
  autoLevelup: process.env.ENABLE_AUTO_LEVELUP === 'true',
  antiLink: process.env.ENABLE_ANTI_LINK === 'true',
  keepAlive: process.env.KEEP_ALIVE === 'true'
}

// =====================================================
// LOGGING CONFIGURATION
// =====================================================

global.logLevel = process.env.LOG_LEVEL || 'info'
global.debugMode = process.env.DEBUG_MODE === 'true'

// =====================================================
// LANGUAGE CONFIGURATION
// =====================================================

global.defaultLanguage = process.env.DEFAULT_LANGUAGE || 'pt'

// =====================================================
// BOT PREFIX CONFIGURATION
// =====================================================

const defaultPrefix = '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-'
const prefixEnv = process.env.BOT_PREFIX || defaultPrefix
global.prefix = new RegExp('^[' + prefixEnv.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

// =====================================================
// VALIDATION & LOGGING
// =====================================================

function validateConfig() {
  const warnings = []
  const errors = []

  if (global.owner.length === 0) {
    errors.push('No owner numbers configured. Set BOT_OWNER_NUMBER in .env')
  }

  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_MODE === 'true') {
    warnings.push('Debug mode is enabled in production')
  }

  if (process.env.FG_MODS_API_KEY === 'aa9HWoim') {
    warnings.push('Using default FG_MODS_API_KEY. Consider setting your own in .env')
  }

  return { warnings, errors }
}

const { warnings, errors } = validateConfig()

if (errors.length > 0) {
  console.error(chalk.red('❌ Configuration Errors:'))
  errors.forEach(err => console.error(chalk.red(`   - ${err}`))
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn(chalk.yellow('⚠️  Configuration Warnings:'))
  warnings.forEach(warn => console.warn(chalk.yellow(`   - ${warn}`))
}

// =====================================================
// CONFIG RELOAD ON FILE CHANGE (Development)
// =====================================================

if (process.env.NODE_ENV !== 'production') {
  watchFile(__filename, () => {
    unwatchFile(__filename)
    console.log(chalk.cyan('🔄 config.js reloaded'))
  })
}

console.log(chalk.green('✅ Configuration loaded successfully'))
