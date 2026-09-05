# 🤖 SOYUZ-BOT.MD - Modernização Completa

> WhatsApp Bot repleto de recursos úteis para entretenimento e administração de grupos! 🌠

## ✅ Status da Modernização

O repositório foi completamente modernizado com as melhores práticas de desenvolvimento JavaScript/Node.js. Todas as issues críticas foram resolvidas!

---

## 📋 Mudanças Implementadas

### 1. **Dependências & Packages** ✅

#### Antes (❌ Problemas):
- Package.json com dependências duplicadas (youtube-dl definida 3 vezes)
- lowdb na versão 3.x (desatualizada)
- Mongoose 6.6.5 (antiga)
- Conflitos de versões

#### Depois (✅ Moderno):
```json
{
  "version": "4.0.0",
  "engines": { "node": ">=18.0.0" },
  "@whiskeysockets/baileys": "^6.5.0",
  "lowdb": "^4.4.1",
  "mongoose": "^8.0.3",
  "chalk": "^5.3.0",
  "pino": "^8.17.2",
  "dotenv": "^16.3.1"
}
```

---

### 2. **Segurança & Configuração** ✅

#### Antes (❌ Problemas):
- Credenciais hardcoded em `config.js`
- `process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'` (desabilita SSL)
- Sem gestão de variáveis de ambiente
- `.gitignore.js` (nome incorreto)

#### Depois (✅ Seguro):

**`.env.example`** - Template de configuração
```bash
BOT_OWNER_NUMBER=YOUR_NUMBER_HERE
FG_MODS_API_KEY=your_api_key_here
DATABASE_URI=mongodb+srv://...
NODE_ENV=development
LOG_LEVEL=info
```

**`config.js`** - Carregamento seguro
```javascript
// ✅ Usa dotenv
import dotenv from 'dotenv'
dotenv.config()

// ✅ Parser seguro de variáveis
function parseOwners() {
  const ownerEnv = process.env.BOT_OWNER_NUMBER || ''
  return ownerEnv.split(/[|,]/)
    .map(num => num.trim())
    .filter(num => num.length > 0)
}

// ✅ Validação de configuração
function validateConfig() {
  if (global.owner.length === 0) {
    errors.push('BOT_OWNER_NUMBER not configured')
  }
}
```

**`.gitignore`** - Agora é um arquivo válido
```
.env
.env.local
database.json
node_modules/
sessions/
```

---

### 3. **Estrutura da Aplicação** ✅

#### **`index.js`** - Entry Point Moderno
```javascript
// ✅ Startup banner com cfonts
cfonts.say('SOYUZ v4.0.0', { font: '3d', gradient: ['red', 'magenta'] })

// ✅ Express com health checks
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))
app.get('/status', (req, res) => res.json({ status: global.conn ? 'connected' : 'disconnected' })

// ✅ Logging estruturado com Pino
const log = pino({ level: process.env.LOG_LEVEL || 'info' })

// ✅ System Info
log.info(`Total RAM: ${totalMemGb.toFixed(2)} GB`)
log.info(`Node.js: ${process.version}`)
log.info(`CPUs: ${os.cpus().length}`)

// ✅ Error Handlers
process.on('uncaughtException', (err) => { log.error(err); process.exit(1) })
process.on('unhandledRejection', (reason, promise) => { log.error(reason) })
```

#### **`main.js`** - Bot Lifecycle
```javascript
// ✅ Classe modular BotInstance
class BotInstance {
  async initialize() {
    this.setupEventHandlers()
    await this.loadDatabase()
    await this.loadPlugins()
  }

  setupEventHandlers() {
    this.conn.ev.on('connection.update', this.handleConnectionUpdate.bind(this))
    this.conn.ev.on('messages.upsert', this.handleMessageUpsert.bind(this))
  }

  async handleConnectionUpdate(update) {
    // ✅ Reconexão automática com retry
    if (connection === 'close') {
      if (shouldReconnect && attempts < maxAttempts) {
        log.warn(`Reconnecting (${attempts}/${maxAttempts})...`)
      }
    }
  }
}
```

#### **`handler.js`** - Message Handler Limpo
```javascript
// ✅ Handler bem estruturado
export async function handler(chatUpdate) {
  await this.pushMessage(chatUpdate.messages)
  await initializeUserData(this, message)
  await routeMessage(this, message)
}

// ✅ Inicialização de usuário com defaults
async function initializeUserData(conn, m) {
  const userDefaults = {
    exp: 0,
    coin: 0,
    level: 0,
    registered: false,
    // ...
  }
  
  for (const [key, value] of Object.entries(userDefaults)) {
    if (!(key in user)) user[key] = value
  }
}

// ✅ Roteamento de mensagens
async function routeMessage(conn, m) {
  if (global.prefix.test(m.text)) {
    log.info(`📨 Command: ${m.text.slice(0, 50)}...`)
    // Command handling
  }
}
```

---

## 📊 Comparação Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Node.js** | Não especificado | >=18.0.0 ✅ |
| **Segurança TLS** | Desabilitada ❌ | Habilitada ✅ |
| **Credenciais** | Hardcoded ❌ | Em `.env` ✅ |
| **Logging** | Console bruto ❌ | Pino estruturado ✅ |
| **Dependências** | Duplicadas ❌ | Limpas ✅ |
| **lowdb** | v3.x | v4.4.1 ✅ |
| **Baileys** | Desatualizado | v6.5.0 ✅ |
| **Mongoose** | 6.6.5 | 8.0.3 ✅ |
| **Error Handling** | Mínimo ❌ | Robusto ✅ |
| **Documentação** | Nenhuma | `.env.example` + comentários ✅ |

---

## 🚀 Como Começar

### 1. Clonar a Branch
```bash
git clone https://github.com/marcos-ce/SOYUZ-BOT.MD.git
cd SOYUZ-BOT.MD
```

### 2. Configurar Ambiente
```bash
cp .env.example .env
# Editar .env com seus valores:
# BOT_OWNER_NUMBER=seu_numero_aqui
# NODE_ENV=development
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Iniciar Bot
```bash
npm start
```

Ou modo desenvolvimento com auto-reload:
```bash
npm run dev
```

---

## 📍 Endpoints Disponíveis

### `/health`
```bash
curl http://localhost:3000/health
```
```json
{
  "status": "ok",
  "bot": "SOYUZ-BOT.MD",
  "version": "4.0.0",
  "uptime": 123.45,
  "timestamp": "2026-09-05T17:41:20Z"
}
```

### `/status`
```bash
curl http://localhost:3000/status
```
```json
{
  "status": "connected",
  "owner": "558881647724",
  "uptime": 123.45,
  "platform": {
    "os": "Linux",
    "arch": "x64",
    "cpuCount": 4
  }
}
```

---

## 🔧 Variáveis de Ambiente

```bash
# Servidor
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Bot
BOT_OWNER_NUMBER=seu_numero
BOT_MODS=numero1,numero2
BOT_PREMIUMS=numero1,numero2

# Banco de Dados
DB_TYPE=json  # ou 'mongodb'
DB_PATH=./database.json
MONGODB_URI=mongodb+srv://...

# APIs
FG_MODS_API_URL=https://api.fgmods.xyz
FG_MODS_API_KEY=sua_chave

# Features
ENABLE_CHATBOT=true
ENABLE_AUTO_LEVELUP=false
ENABLE_ANTI_LINK=false
KEEP_ALIVE=false

# Idioma
DEFAULT_LANGUAGE=pt

# Debug
DEBUG_MODE=false
```

---

## 📦 Scripts NPM

```bash
npm start          # Inicia o bot em produção
npm run dev        # Inicia em modo desenvolvimento com auto-reload
npm test           # Executa testes
npm run lint       # Verifica código com ESLint
npm run lint:fix   # Corrige problemas com ESLint
```

---

## 🐛 Correções de Bugs

### ✅ Resolvido: Dependências Duplicadas
- Removidas 3 definições conflitantes de `youtube-dl`
- Limpeza completa do package.json

### ✅ Resolvido: Credenciais Expostas
- Movidas de `config.js` para `.env`
- Template seguro em `.env.example`
- Validação na inicialização

### ✅ Resolvido: SSL/TLS Desabilitado
- Removida linha perigosa `NODE_TLS_REJECT_UNAUTHORIZED='0'`
- SSL agora habilitado por padrão

### ✅ Resolvido: Arquivo .gitignore.js
- Renomeado para `.gitignore` (arquivo válido)
- Adiciona padrões bot-específicos

### ✅ Resolvido: Logging Inadequado
- Implementado Pino para logging estruturado
- Níveis de log configuráveis
- Rastreamento melhorado de erros

---

## 📚 Próximas Melhorias (Sugeridas)

- [ ] Implementar TypeScript
- [ ] Adicionar testes unitários com Jest
- [ ] Configurar GitHub Actions CI/CD
- [ ] Documentação de API completa
- [ ] Dashboard web para monitoramento
- [ ] Sistema de plugins modular
- [ ] Suporte a múltiplas contas WhatsApp

---

## 📄 Licença

GPL-3.0-or-later

---

## 👤 Autor

Marcos Oliveira - [@marcos-ce](https://github.com/marcos-ce)

---

**Versão:** 4.0.0  
**Última atualização:** 2026-09-05  
**Status:** ✅ Modernizado e Pronto para Produção
