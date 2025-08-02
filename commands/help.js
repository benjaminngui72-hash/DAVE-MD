// GIFTEDDAVE PROPERTY 😊

const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const pkg = require('../package.json');

const startTime = Date.now();

function formatUptime(ms) {
  let seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function ram() {
  const totalMem = os.totalmem() / (1024 * 1024 * 1024);
  const freeMem = os.freemem() / (1024 * 1024 * 1024);
  return `${freeMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB`;
}

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

async function helpCommand(conn, m, quoted, commands = []) {
  const uptime = formatUptime(Date.now() - startTime);
  const menuCaption = `
╭━━━〔𝐃𝐀𝐕𝐄-𝐌𝐃〕━━⬣
┃ 🔥 𝘾𝙧𝙚𝙖𝙩𝙤𝙧 : \`『𝙂𝙄𝙁𝙏𝙀𝘿 𝘿𝘼𝙑𝙀』\`
┃ 🧨 𝙊𝙬𝙣𝙚𝙧   : ${settings.botOwner || '𝘿𝘼𝙑𝙀'}
┃ 💣 𝙑𝙚𝙧𝙨𝙞𝙤𝙣 : ${settings.version || '2.0.0'}
┃ ⏱️ 𝙍𝙪𝙣𝙩𝙞𝙢𝙚 : ${runtime(process.uptime())}
┃ 🧩 𝙋𝙡𝙪𝙜𝙞𝙣𝙨 : \`420\`
┃ 💊 𝙍𝘼𝙈     : ${ram()}t
╰━━━━━━━━━━━━━━━━━━⬣
┏━━「 \`Mode\` 」
│ ─≽ *private*
│ ─≽ *public*
│ ─≽ *recording*
│ ─≽ *typing*
│ ─≽ *autoreact*
┗━━━━━━━━━━━━━━━♢

┏━━「 \`General\` 」
│ ─≽ *ping*
│ ─≽ *repo*
│ ─≽ *bot*
│ ─≽ *autostatusview*
│ ─≽ *uptime*
│ ─≽ *delete*
│ ─≽ *listplugin*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Download\` 」
│ ─≽ *song*
│ ─≽ *play*
│ ─≽ *play2*
│ ─≽ *tiktok*
│ ─≽ *vv*
│ ─≽ *vv2*
│ ─≽ *anime*
│ ─≽ *detiknews*
│ ─≽ *apk*
│ ─≽ *apk2*
│ ─≽ *fb*
│ ─≽ *igdl2*
│ ─≽ *igdl*
│ ─≽ *lyrics*
│ ─≽ *spotifydown*
│ ─≽ *spotifysearch*
│ ─≽ *igstalk*
│ ─≽ *tiktokstalk*
│ ─≽ *ytmp4*
│ ─≽ *ytmp3*
│ ─≽ *mediafire*
│ ─≽ *playtiktok*
│ ─≽ *play3*
│ ─≽ *song2*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Group\` 」
│ ─≽ *remove*
│ ─≽ *tagall*
│ ─≽ *hidetag*
│ ─≽ *promote*
│ ─≽ *demote*
│ ─≽ *kickall*
│ ─≽ *kill*
│ ─≽ *invite*
│ ─≽ *add*
│ ─≽ *open*
│ ─≽ *close*
│ ─≽ *antilinkgc*
│ ─≽ *antilink*
│ ─≽ *getidgc*
│ ─≽ *ceklinkgc*
│ ─≽ *gcinfo*
│ ─≽ *poll*
│ ─≽ *setppgc*
│ ─≽ *listonline*
│ ─≽ *resetlink*
│ ─≽ *pin*
│ ─≽ *setnamegc*
│ ─≽ *request-join*
│ ─≽ *approve*
│ ─≽ *reject*
│ ─≽ *left*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Sticker\` 」
│ ─≽ *s*
│ ─≽ *take*
│ ─≽ *brat*
│ ─≽ *emojimix*
│ ─≽ *notes*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Owner\` 」
│ ─≽ *getbio*
│ ─≽ *getpp*
│ ─≽ *block*
│ ─≽ *unblock*
│ ─≽ *storytext*
│ ─≽ *storyaudio*
│ ─≽ *storyimage*
│ ─≽ *storyvideo*
│ ─≽ *Creategc*
│ ─≽ *listgc*
│ ─≽ *setpp*
│ ─≽ *onlypc*
│ ─≽ *onlygc*
│ ─≽ *reactch*
│ ─≽ *createch*
│ ─≽ *clear*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Maths\` 」
│ ─≽ *kalkulator*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Search\` 」
│ ─≽ *ai*
│ ─≽ *ai2*
│ ─≽ *country*
│ ─≽ *quiz*
│ ─≽ *gpt*
│ ─≽ *gpt2*
│ ─≽ *gpt3*
│ ─≽ *gemma*
│ ─≽ *yts*
│ ─≽ *pinterest*
│ ─≽ *igstory*
│ ─≽ *ytstalk*
│ ─≽ *ffstalk*
│ ─≽ *telestalk*
│ ─≽ *meme*
│ ─≽ *channelinfo*
│ ─≽ *cekkodam*
│ ─≽ *define*
│ ─≽ *sfile*
│ ─≽ *myip*
│ ─≽ *trackip*
│ ─≽ *xvideos*
│ ─≽ *yiffersearch*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Converter\` 」
│ ─≽ *photo*
│ ─≽ *tovideo*
│ ─≽ *toaudio*
│ ─≽ *tovn*
│ ─≽ *translate*
│ ─≽ *flux*
│ ─≽ *deepimage*
│ ─≽ *tourl*
│ ─≽ *logo*
│ ─≽ *tts*
│ ─≽ *ghiblistyle*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Religion\` 」
│ ─≽ *Quran*
│ ─≽ *Bible*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Developer\` 」
│ ─≽ *githubstalk*
│ ─≽ *gitclone*
│ ─≽ *getfile*
│ ─≽ *scweb*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Heroku\` 」
│ ─≽ *getvars*
│ ─≽ *setvar*
│ ─≽ *update*
│──────♢
┗━━━━━━━━━━━━━━━♢

┏━━「 \`Others\` 」
│ ─≽ *cc*
│ ─≽ *ckalender*
│ ─≽ *epl*
│ ─≽ *laliga*
│ ─≽ *bundesliga*
│ ─≽ *serie-a*
│ ─≽ *ligue-1*
│ ─≽ *fixtures*
│ ─≽ *news*
│ ─≽ *vcf*
│ ─≽ *save*
│ ─≽ *say*
│──────♢
┗━━━━━━━━━━━━━━━♢

━━「 \`Email\` 」
│ ─≽ *sendemail*
│ ─≽ *tempmail*
│──────♢
┗━━⬣ ⌜ \`New version\`⌟

> 🔚 𝐌𝐮𝐜𝐡 𝐋𝐨𝐯𝐞, 𝘿𝘼𝙑𝙀-𝙏𝙀𝘾𝙃
`;

  try {
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
    const messagePayload = fs.existsSync(imagePath)
      ? {
          image: fs.readFileSync(imagePath),
          caption: menuCaption,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363400480173280@newsletter',
              newsletterName: 'POWERED BY GIFTED 𝘿𝘼𝙑𝙀-𝗧𝗘𝗖𝗛',
              serverMessageId: -1
            }
          }
        }
      : {
          text: menuCaption,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363400480173280@newsletter',
              newsletterName: 'POWERED BY GIFTED 𝘿𝘼𝙑𝙀-𝗧𝗘𝗖𝗛',
              serverMessageId: -1
            }
          }
        };

    await conn.sendMessage(m, messagePayload, { quoted });
  } catch (err) {
    console.error('Error in help command:', err);
    await conn.sendMessage(m, { text: menuCaption });
  }
}

module.exports = helpCommand;
