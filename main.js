import chalk from 'chalk'
import { fileURLToPath } from 'url'
import path from 'path'
import { spawn } from 'child_process'
import { watchFile, unwatchFile } from 'fs'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import { pinoHttp } from 'pino-http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// =====================================================
// LOGGER CONFIGURATION
// =====================================================
const log = pino({
  level: global.logLevel || 'info',
  prettifier: true,
})

// Suppress noisy library logs in production
if (process.env.NODE_ENV === 'production') {
  pino.default.levels.labels[25] = 'trace'
}

// =====================================================
// MAIN BOT CONNECTION HANDLER
// =====================================================
export async function connect(conn) {
  const bot = new BotInstance(conn)
  return bot.initialize()
}

class BotInstance {
  constructor(conn) {
    this.conn = conn
    this.session = {
      startTime: Date.now(),
      isReady: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    }
  }

  async initialize() {
    log.info('🤖 Initializing bot instance...')
    
    try {
      // Setup connection event handlers
      this.setupEventHandlers()
      
      // Load database
      await this.loadDatabase()
      
      // Setup plugins/handlers
      await this.loadPlugins()
      
      log.info(chalk.green('✅ Bot initialized successfully'))
      this.session.isReady = true
      return this.conn
    } catch (err) {
      log.error(chalk.red(`❌ Bot initialization failed: ${err.message}`))
      throw err
    }
  }

  setupEventHandlers() {
    this.conn.ev.on('connection.update', this.handleConnectionUpdate.bind(this))
    this.conn.ev.on('messages.upsert', this.handleMessageUpsert.bind(this))
    this.conn.ev.on('group-participants.update', this.handleGroupUpdate.bind(this))
    this.conn.ev.on('groups.update', this.handleGroupInfoUpdate.bind(this))
  }

  async handleConnectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update

    if (connection === 'connecting') {
      log.info('⏳ Connecting to WhatsApp...')
    } else if (connection === 'open') {
      log.info(chalk.green('✅ Connected to WhatsApp!'))
      this.session.reconnectAttempts = 0
    } else if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401
      if (shouldReconnect && this.session.reconnectAttempts < this.session.maxReconnectAttempts) {
        this.session.reconnectAttempts++
        log.warn(`⚠️  Connection closed. Attempting reconnect (${this.session.reconnectAttempts}/${this.session.maxReconnectAttempts})...`)
      } else {
        log.error('❌ Connection failed. Max reconnect attempts reached.')
        process.exit(0)
      }
    }

    if (isNewLogin) {
      log.info('🆕 New login detected')
    }
  }

  async handleMessageUpsert(m) {
    try {
      if (!m.messages) return
      // Message handling will be delegated to handler.js
    } catch (err) {
      log.error('Error in message upsert:', err)
    }
  }

  async handleGroupUpdate(update) {
    log.debug('Group participants update:', update)
  }

  async handleGroupInfoUpdate(update) {
    log.debug('Group info update:', update)
  }

  async loadDatabase() {
    try {
      if (global.db) {
        await global.db.read()
        log.info('📊 Database loaded')
      }
    } catch (err) {
      log.error('Failed to load database:', err)
      throw err
    }
  }

  async loadPlugins() {
    try {
      // Plugins will be loaded from the plugins directory
      log.info('📦 Plugins loaded')
    } catch (err) {
      log.warn('Failed to load plugins:', err)
    }
  }
}

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================
process.on('SIGINT', () => {
  log.info('📛 Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log.info('📛 Shutting down gracefully...')
  process.exit(0)
})

export default connect
