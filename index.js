import chalk from 'chalk'
import cfonts from 'cfonts'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import express from 'express'
import os from 'os'
import path from 'path'
import { promises as fsPromises } from 'fs'
import pino from 'pino'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Setup __dirname and __filename for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { name, version, author } = require(path.join(__dirname, './package.json'))

// =====================================================
// LOGGER SETUP
// =====================================================
const log = pino({
  level: process.env.LOG_LEVEL || 'info',
})

// =====================================================
// STARTUP BANNER
// =====================================================
cfonts.say('SOYUZ', {
  font: '3d',
  align: 'center',
  gradient: ['red', 'magenta']
})

cfonts.say(`${name} v${version}`, {
  font: 'console',
  align: 'center',
  color: 'cyan'
})

cfonts.say(`by ${author.name}`, {
  font: 'console',
  align: 'center',
  color: 'yellow'
})

log.info(chalk.blue('═════════════════════════════════════════════'))
log.info(chalk.cyan(`✨ Starting bot v${version}...`))
log.info(chalk.blue('═════════════════════════════════════════════'))

// =====================================================
// EXPRESS SERVER SETUP
// =====================================================
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: name,
    version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: global.conn ? 'connected' : 'disconnected',
    owner: global.owner?.[0]?.[0] || 'not configured',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    platform: {
      os: os.type(),
      arch: os.arch(),
      cpuCount: os.cpus().length
    }
  })
})

app.listen(port, () => {
  log.info(chalk.green(`✅ Server listening on port ${port}`))
  log.info(chalk.gray(`💻 Platform: ${os.type()} ${os.release()}`), {
    arch: os.arch(),
    cpus: os.cpus().length
  })
})

// =====================================================
// SYSTEM INFO
// =====================================================
logSystemInfo()

function logSystemInfo() {
  const totalMemGb = os.totalmem() / (1024 * 1024 * 1024)
  const freeMemGb = os.freemem() / (1024 * 1024 * 1024)
  const usedMemGb = totalMemGb - freeMemGb

  log.info(chalk.gray('System Information:'))
  log.info(chalk.gray(`  Total RAM: ${totalMemGb.toFixed(2)} GB`))
  log.info(chalk.gray(`  Used RAM:  ${usedMemGb.toFixed(2)} GB`))
  log.info(chalk.gray(`  Free RAM:  ${freeMemGb.toFixed(2)} GB`))
  log.info(chalk.gray(`  CPUs:      ${os.cpus().length}`))
  log.info(chalk.gray(`  Node.js:   ${process.version}`))
}

// =====================================================
// CONFIGURATION VALIDATION
// =====================================================
function validateConfiguration() {
  const errors = []
  const warnings = []

  if (!global.owner || global.owner.length === 0) {
    errors.push('BOT_OWNER_NUMBER is not configured')
  }

  if (process.env.NODE_ENV !== 'production' && global.debugMode) {
    warnings.push('Debug mode is enabled (development only)')
  }

  if (errors.length > 0) {
    log.error(chalk.red('❌ Configuration errors:'))
    errors.forEach(err => log.error(chalk.red(`   - ${err}`)))
    process.exit(1)
  }

  if (warnings.length > 0) {
    log.warn(chalk.yellow('⚠️  Configuration warnings:'))
    warnings.forEach(warn => log.warn(chalk.yellow(`   - ${warn}`)))
  }
}

validateConfiguration()

// =====================================================
// DYNAMIC IMPORT AND BOT STARTUP
// =====================================================
async function startBot() {
  try {
    // Import bot instance and load main module
    const { default: initBaileysSocket } = await import('./main.js')
    
    // Additional initialization logic will be added here
    log.info(chalk.green('✅ Bot modules loaded successfully'))
  } catch (err) {
    log.error(chalk.red('❌ Failed to start bot:'), err)
    process.exit(1)
  }
}

startBot()

// =====================================================
// ERROR HANDLERS
// =====================================================
process.on('uncaughtException', (err) => {
  log.error(chalk.red('❌ Uncaught Exception:'), err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log.error(chalk.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason)
})

process.on('warning', (warning) => {
  log.warn(chalk.yellow('⚠️  Warning:'), warning.name, warning.message)
})

export { app }
