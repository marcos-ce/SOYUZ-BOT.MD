
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
let handler = async (m, { conn, text }) => {
	
if (!text) throw `✏️ ${mssg.notext}`;
m.react('💬')

	try {
		let gpt = await fetch(global.API('fgmods', '/api/info/openai2', { text }, 'apikey'));
        let res = await gpt.json()
        await m.reply(res.result)
	} catch {
		m.reply(`❗️ Error: Falha na API, tente mais tarde`);
	}

}
handler.help = ['ia <text>']; 
handler.tags = ['tools', 'ia'];
handler.command = ['ia', 'ai', 'chatgpt2', 'openai', 'gpt2'];

export default handler;
