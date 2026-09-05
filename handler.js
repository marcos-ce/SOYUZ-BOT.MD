import chalk from 'chalk'
import { smsg } from './lib/simple.js'
import fetch from 'node-fetch'
import pino from 'pino'

const log = pino({ level: global.logLevel || 'info' })

/**
 * Main message handler
 * @param {Object} chatUpdate - WhatsApp chat update event
 * @returns {Promise<void>}
 */
export async function handler(chatUpdate) {
  try {
    this.msgqueue = this.msgqueue || []
    
    if (!chatUpdate || !chatUpdate.messages) {
      return
    }

    // Push messages to queue
    await this.pushMessage(chatUpdate.messages).catch(err => {
      log.error('Error pushing message:', err)
    })

    // Get the latest message
    const m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    // Load database
    if (global.db.data == null) {
      await global.loadDatabase()
    }

    // Serialize message
    const message = smsg(this, m) || m
    if (!message) return

    // Initialize user data in database
    await initializeUserData(this, message)

    // Route message to appropriate handler
    await routeMessage(this, message)

  } catch (err) {
    log.error('Handler error:', err)
  }
}

/**
 * Initialize user data in database
 * @param {Object} conn - Connection object
 * @param {Object} m - Message object
 */
async function initializeUserData(conn, m) {
  try {
    // Ensure users and groups collections exist
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.groups) global.db.data.groups = {}
    if (!global.db.data.settings) global.db.data.settings = {}

    // Get or create user object
    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') {
      global.db.data.users[m.sender] = {}
      user = global.db.data.users[m.sender]
    }

    // Initialize user properties with defaults
    const userDefaults = {
      exp: 0,
      coin: 0,
      diamond: 20,
      bank: 0,
      lastclaim: 0,
      registered: false,
      name: m.name || 'User',
      age: -1,
      regTime: -1,
      afk: -1,
      afkReason: '',
      banned: false,
      warn: 0,
      level: 0,
      role: 'Novato',
      autolevelup: false,
      chatbot: global.features?.chatbot || false,
      genero: 'Indeciso',
      language: global.defaultLanguage || 'pt',
      prem: false,
      premiumTime: 0
    }

    // Apply defaults for missing properties
    for (const [key, value] of Object.entries(userDefaults)) {
      if (!(key in user)) {
        user[key] = value
      }
    }

    // Handle group-specific data
    if (m.isGroup) {
      let group = global.db.data.groups[m.chat]
      if (typeof group !== 'object') {
        global.db.data.groups[m.chat] = {}
        group = global.db.data.groups[m.chat]
      }

      const groupDefaults = {
        antiLink: global.features?.antiLink || false,
        welcome: true,
        goodbye: true,
        settings: {}
      }

      for (const [key, value] of Object.entries(groupDefaults)) {
        if (!(key in group)) {
          group[key] = value
        }
      }
    }

  } catch (err) {
    log.error('Error initializing user data:', err)
  }
}

/**
 * Route message to appropriate handler
 * @param {Object} conn - Connection object
 * @param {Object} m - Message object
 */
async function routeMessage(conn, m) {
  try {
    // Check if message contains a prefix command
    if (global.prefix.test(m.text)) {
      log.info(`📨 Command received from ${m.name}: ${m.text.slice(0, 50)}...`)
      // Command handling would go here
    }

    // Auto-read messages if enabled
    if (global.features?.autoRead !== false) {
      await conn.readMessages([m.key])
    }

    // Save database periodically
    if (global.db && global.db.write) {
      await global.db.write(global.db.data)
    }

  } catch (err) {
    log.error('Error routing message:', err)
  }
}

/**
 * Error handler for message processing
 * @param {Error} err - Error object
 * @param {Object} m - Message object
 */
export function handleError(err, m) {
  log.error('Message handler error:', {
    error: err.message,
    sender: m?.sender,
    chat: m?.chat,
    text: m?.text?.slice(0, 50)
  })
}

export default handler
