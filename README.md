<div align="center">

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" width="100%" />

# 🚀 SOYUZ-BOT.MD — Multi-Device & Multi-Language WhatsApp Bot

<p align="center">
  <b>Bot de WhatsApp Multi-Dispositivo e Multilíngue (🇧🇷 PT-BR • 🇪🇸 ES • 🇺🇸 EN • 🇮🇩 ID • 🇸🇦 AR) construído em Node.js com <code>@whiskeysockets/baileys</code>.</b><br/>
  Conexão fácil via <b>Código de Pareamento (8 dígitos / Pairing Code)</b> ou <b>QR Code</b>, criação de figurinhas (stickers), downloads (YouTube, TikTok, Instagram), administração de grupos, sistema de economia/RPG, jogos e Inteligência Artificial.
</p>

<p align="center">
  <a href="https://github.com/marcos-ce/SOYUZ-BOT.MD/stargazers"><img src="https://img.shields.io/github/stars/marcos-ce/SOYUZ-BOT.MD?style=for-the-badge&logo=github&color=yellow" alt="GitHub Stars"></a>
  <a href="https://github.com/marcos-ce/SOYUZ-BOT.MD/network/members"><img src="https://img.shields.io/github/forks/marcos-ce/SOYUZ-BOT.MD?style=for-the-badge&logo=github&color=blue" alt="GitHub Forks"></a>
  <a href="https://github.com/marcos-ce/SOYUZ-BOT.MD/blob/main/LICENSE"><img src="https://img.shields.io/github/license/marcos-ce/SOYUZ-BOT.MD?style=for-the-badge&color=green" alt="License"></a>
  <a href="https://github.com/marcos-ce"><img src="https://img.shields.io/badge/Autor-marcos--ce-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Autor"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Baileys-Multi--Device-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="Baileys MD" />
  <img src="https://img.shields.io/badge/Languages-PT--BR%20%7C%20ES%20%7C%20EN%20%7C%20ID%20%7C%20AR-009c3b?style=flat-square" alt="Idiomas" />
  <img src="https://img.shields.io/badge/Platforms-Termux%20%7C%20VPS%20%7C%20Docker%20%7C%20PC-0db7ed?style=flat-square&logo=docker&logoColor=white" alt="Plataformas" />
  [![Contribuidor do XERJ Corpus Hub](https://hub.xerj.org/contributors/marcos-ce/badge.svg)](https://hub.xerj.org/contributors/marcos-ce)
</p>

<p align="center">
  <img src="https://s9.gifyu.com/images/SFnhA.gif" alt="Soyuz Bot Preview" width="600" />
</p>

</div>

---

## 🚀 Começando Rápido (Para quem for usar)

> Clonando o repositório pela primeira vez? Siga estes **5 passos**:

**1. Clone (ou bifurque) e entre na pasta:**
```bash
git clone https://github.com/marcos-ce/SOYUZ-BOT.MD.git
cd SOYUZ-BOT.MD
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Crie seu arquivo de configuração `.env`:**
```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows (CMD)
copy .env.example .env
```

**4. Edite o `.env` e coloque pelo menos seu número:**
```env
BOT_OWNER_NUMBER=5588981647724   # ← seu número com DDI+DDD, sem espaços
BOT_PHONE_NUMBER=5588981647724   # ← mesmo número (usado no Pairing Code)
PAIRING_CODE=true                # ← true = conectar via código de 8 dígitos
```

**5. Inicie o bot:**
```bash
npm start
```
> O bot vai gerar um **código de 8 dígitos** no terminal. Abra o WhatsApp → *Aparelhos Conectados* → *Conectar um aparelho* → *Conectar com número de telefone* → digite o código.

---

### 🔑 Chaves de API opcionais (para recursos extras)

Os comandos abaixo precisam de chaves gratuitas. Sem elas, o comando simplesmente não funcionará — o restante do bot funciona normalmente.

| Comando | API necessária | Como obter grátis |
| :--- | :--- | :--- |
| `!emojimix` (figurinha com 2 emojis) | `TENOR_API_KEY` | [developers.google.com/tenor](https://developers.google.com/tenor/guides/quickstart) |
| `!whatmusic` (identificar música) | `ACRCLOUD_ACCESS_KEY` + `ACRCLOUD_ACCESS_SECRET` | [acrcloud.com](https://www.acrcloud.com/) → criar projeto gratuito |

Adicione as chaves no seu `.env`:
```env
TENOR_API_KEY=sua_chave_aqui
ACRCLOUD_ACCESS_KEY=sua_chave_aqui
ACRCLOUD_ACCESS_SECRET=seu_secret_aqui
```

---

## 📋 Sumário / Table of Contents

- [🚀 Começando Rápido](#-começando-rápido-para-quem-for-usar)
- [🌐 Suporte Multilíngue (5 Idiomas)](#-suporte-multilíngue-5-idiomas)
- [✨ Principais Funcionalidades](#-principais-funcionalidades)
- [🔑 Conexão Fácil (Código de 8 Dígitos ou QR Code)](#-conexão-fácil-código-de-8-dígitos-ou-qr-code)
- [📱 Instalação no Termux (Android)](#-instalação-no-termux-android)
- [💻 Como Rodar Localmente no PC (Windows, Linux & macOS)](#-como-rodar-localmente-no-pc-windows-linux--macos)
- [🐳 Rodando com Docker](#-rodando-com-docker)
- [⚙️ Configuração (`.env` e `config.js`)](#️-configuração-env-e-configjs)
- [💬 Suporte e Contato](#-suporte-e-contato)
- [📜 Termos e Agradecimentos](#-termos-e-agradecimentos)

---

## 🌐 Suporte Multilíngue (5 Idiomas)

O **SOYUZ-BOT.MD** possui sistema de tradução integrado por usuário! Embora o **Português Brasileiro (`pt`)** seja o idioma padrão, cada usuário pode escolher em qual idioma o bot deve responder usando o comando `!idioma`, `!lang`, `!language` ou `!lenguaje`:

| Código | Idioma | Comando no WhatsApp |
| :---: | :--- | :--- |
| 🇧🇷 **`pt`** | **Português (Brasil)** *(Padrão)* | `!idioma pt` |
| 🇪🇸 **`es`** | **Español** | `!lenguaje es` |
| 🇺🇸 **`en`** | **English** | `!language en` |
| 🇮🇩 **`id`** | **Bahasa Indonesia** | `!lang id` |
| 🇸🇦 **`ar`** | **العربية (Arabic)** | `!lang ar` |

---

## ✨ Principais Funcionalidades

O **SOYUZ-BOT.MD** conta com **200+ plugins modulares** com recarregamento automático (*hot-reload*):

| Categoria | Recursos e Comandos Principais |
| :--- | :--- |
| 🔑 **Conexão Moderna** | Pareamento via **Código de 8 dígitos (Pairing Code)** direto no celular (sem precisar de segundo aparelho) ou via **QR Code**. |
| 🌐 **Multilíngue por Usuário** | Respostas dinâmicas em **Português, Espanhol, Inglês, Indonésio e Árabe** (`!idioma`, `!lang`, `!lenguaje`). |
| 🖼️ **Figurinhas (Stickers)** | Criação de figurinhas estáticas e animadas de fotos, vídeos e links (`!s`, `!sticker`, `!attp`, `!ttp`, `!wm`, `!toimg`, `!tomp4`). |
| 📥 **Downloads (Mídias)** | Baixe vídeos e músicas do **YouTube** (`!play`, `!ytmp3`, `!ytmp4`), **TikTok** sem marca d'água (`!tiktok`), **Instagram** (`!ig`), **Facebook**, **MediaFire**, **Google Drive**, **GitHub** e **APK/ModAPK**. |
| 🛡️ **Administração de Grupos** | **Anti-Link** (com ou sem ban), **Anti-Fake** (bloqueio de DDI estrangeiro), **Bem-vindo / Adeus** personalizável, **Captcha**, `!hidetag`, `!tagall`, `!ban`, `!promote`, `!demote`, `!warn` e `!mute`. |
| 🎮 **Economia, RPG & Jogos** | Sistema completo de **XP, Nível, Patentes, Diamantes, Banco, Roubo, Mineração, Apostas**, **Jogo da Velha (TicTacToe)**, **Matemática**, **Adivinhe a Bandeira** e **Verdade ou Desafio**. |
| 🧠 **Ferramentas & Áudio** | Tradutor (`!trad`), Wikipedia, Letra de Música (`!lyrics`), OCR (`!totext`), Calculadora, Clima, Encurtador de URL e efeitos de áudio (*bass, nightcore, slow, robot*). |

---

## 🔑 Conexão Fácil (Código de 8 Dígitos ou QR Code)

Ao iniciar o bot pela primeira vez, ele perguntará no terminal como você deseja conectar:

```text
╭─────────────────────────────────────────────╮
│       🚀 SOYUZ-BOT - MÉTODO DE LOGIN        │
├─────────────────────────────────────────────┤
│  [1] Conectar via QR Code                   │
│  [2] Conectar via Código de 8 dígitos       │
╰─────────────────────────────────────────────╯
👉 Escolha uma opção (1 ou 2):
```

- **Opção 1 (QR Code):** Exibe o QR Code tradicional no terminal.
- **Opção 2 (Código de 8 dígitos / Pairing Code):** Basta digitar o número do WhatsApp do bot com DDI e DDD (ex: `5588981647724`) e inserir o código gerado (`XXXX-XXXX`) na notificação de **Aparelhos Conectados** do seu WhatsApp!
- **Modo Automático (Servidor/Docker):** Defina `BOT_PHONE_NUMBER=5588981647724` no arquivo `.env` ou inicie com `node index.js --pairing-code --phone 5588981647724`.

---

## 📱 Instalação no Termux (Android)

> 💡 **Dica:** Use a versão atualizada do **Termux** (baixada pelo [F-Droid](https://f-droid.org/pt_BR/packages/com.termux/) ou GitHub oficial, não a da Play Store antiga).

Execute os comandos abaixo um por vez no Termux:

```bash
pkg update -y && pkg upgrade -y
pkg install git nodejs ffmpeg imagemagick -y
git clone https://github.com/marcos-ce/SOYUZ-BOT.MD.git
cd SOYUZ-BOT.MD
npm install
npm start
```

---

## 💻 Como Rodar Localmente no PC (Windows, Linux & macOS)

### 1. Instalar os Pré-requisitos

#### 🪟 No Windows (via PowerShell ou Winget)
Abra o **PowerShell** e instale o Node.js, Git, FFmpeg e ImageMagick (ou baixe pelos sites oficiais):
```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Gyan.FFmpeg
winget install ImageMagick.ImageMagick
```
> 💡 *Após instalar, feche e abra novamente o terminal para atualizar o `PATH`.*

#### 🐧 No Linux (Ubuntu / Debian / Mint / WSL)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs git ffmpeg imagemagick webp
```

#### 🍎 No macOS (via Homebrew)
```bash
brew install node git ffmpeg imagemagick webp
```

---

### 2. Clonar, Configurar e Iniciar no PC

No seu terminal (**PowerShell**, **CMD**, **Git Bash** ou **Terminal Linux/Mac**), execute:

```bash
# 1. Clone o repositório
git clone https://github.com/marcos-ce/SOYUZ-BOT.MD.git

# 2. Entre na pasta do projeto
cd SOYUZ-BOT.MD

# 3. Instale todas as dependências
npm install

# 4. (Opcional) Crie o arquivo .env para configurar seu número de dono
cp .env.example .env

# 5. Inicie o bot!
npm start
```

### 3. Comandos Úteis no PC

| Comando | O que faz |
| :--- | :--- |
| `npm start` | Inicia o bot normalmente (exibe o menu de escolha **QR Code** ou **Código de 8 dígitos**). |
| `npm run dev` | Inicia o bot em modo de desenvolvimento com reinício automático ao editar arquivos. |
| `node index.js --pairing-code --phone 5588981647724` | Conecta direto gerando o código de 8 dígitos para o número informado. |
| `rm -rf sessions` *(Linux/Mac)* ou ` rmdir /s /q sessions` *(Windows)* | Apaga a sessão salva caso queira desconectar e parear outro número. |

#### 🔄 Mantendo o Bot Online 24/7 em Segundo Plano (PM2)
Se quiser deixar o bot rodando em segundo plano no PC ou VPS com reinício automático:
```bash
npm install -g pm2
pm2 start index.js --name "soyuz-bot"
pm2 save
pm2 logs soyuz-bot
```

---

## 🐳 Rodando com Docker

O repositório já inclui um `Dockerfile` otimizado com Node.js 20, FFmpeg e ImageMagick pré-configurados:

```bash
docker build -t soyuz-bot .
docker run -it -e BOT_PHONE_NUMBER=5588981647724 -p 3000:3000 soyuz-bot
```

---

## ⚙️ Configuração (`.env` e `config.js`)

[![Bifurcar Repositório](https://img.shields.io/badge/Bifurcar-Reposit%C3%B3rio%20(Fork)-blue?style=for-the-badge&logo=github)](https://github.com/marcos-ce/SOYUZ-BOT.MD/fork)

1. Copie o arquivo de exemplo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edite o seu número de dono no `.env` ou diretamente em [`config.js`](https://github.com/marcos-ce/SOYUZ-BOT.MD/blob/main/config.js):
   ```env
   BOT_OWNER_NUMBER=5588981647724
   BOT_PHONE_NUMBER=5588981647724
   PAIRING_CODE=true
   ```

---

## 💬 Suporte e Contato

Ficou com alguma dúvida ou encontrou algum bug? Entre em contato ou abra uma [Issue](https://github.com/marcos-ce/SOYUZ-BOT.MD/issues):

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/5588981125331?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20SOYUZ-BOT)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:smarcos.ce@gmail.com)

---

## 📜 Termos e Agradecimentos

1. ⭐ **Deixe uma estrela (Star)** neste repositório se ele te ajudou!
2. Este projeto é distribuído sob a licença **GPL-3.0** para fins educacionais e de automação pessoal. Não possuímos vínculo com o WhatsApp Inc.
3. **Créditos:**
   - [**@marcos-ce**](https://github.com/marcos-ce) — Desenvolvimento, tradução PT-BR, novos comandos e manutenção.
   - [**@FG98F**](https://github.com/FG98F) — Estrutura base (dylux-fg).
