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
┃ 💠 Creator : 『𝙂𝙄𝙁𝙏𝙀𝘿 𝘿𝘼𝙑𝙀』
┃ 💠 Owner   : ${settings.botOwner || '𝘿𝘼𝙑𝙀'}
┃ 💠 Version : ${settings.version || '2.0.0'}
┃ 💠 Runtime : ${runtime(process.uptime())}
┃ 💠 Plugins : 420
┃ 💠 RAM     : ${ram()}t
╰━━━━━━━━━━━━━━━━━━⬣

┏━━「 Main 」━━
│ • menu
│ • ping
│ • ping2
│ • uptime
│ • botinfo
│ • listplugin
│ • update
┗━━━━━━━━━━━━━━━♢

┏━━「 Control 」━━
│ • public
│ • private
│ • addaccess
│ • delaccess
│ • autoreact
│ • block
│ • autotyping
│ • autorecord
│ • autobio
│ • setprefix
│ • autostatusview
│ • help
┗━━━━━━━━━━━━━━━♢

┏━━「 Media 」━━
│ • playdoc
│ • ytmp4
│ • ytvid
│ • yts
│ • pinterestdl
│ • twitterdl
│ • tiktok
│ • igdl
│ • spotify
│ • ytmp3
┗━━━━━━━━━━━━━━━♢

┏━━「 Download 」━━
│ • play
│ • vv
│ • anime
│ • detiknews
│ • apk
│ • facebook 
│ • Instagram 
│ • lyrics
│ • spotifydown
│ • spotifysearch
│ • igstalk
│ • tiktokstalk
│ • mediafire
│ • tiktok
│ • song
┗━━━━━━━━━━━━━━━♢

┏━━「 Group 」━━
│ • remove
│ • tagall
│ • hidetag
│ • promote
│ • demote
│ • kickall
│ • kill
│ • invite
│ • add
│ • open
│ • close
│ • antilinkgc
│ • antilink
│ • getidgc
│ • ceklinkgc
│ • gcinfo
│ • poll
│ • setppgc
│ • listonline
│ • resetlink
│ • pin
│ • setnamegc
│ • request-join
│ • approve
│ • reject
│ • left
┗━━━━━━━━━━━━━━━♢

┏━━「 Sticker 」━━
│ • s
│ • take
│ • brat
│ • emojimix
│ • notes
┗━━━━━━━━━━━━━━━♢

┏━━「 Owner 」━━
│ • getbio
│ • getpp
│ • unblock
│ • storytext
│ • storyaudio
│ • storyimage
│ • storyvideo
│ • creategc
│ • listgc
│ • setpp
│ • onlypc
│ • onlygc
│ • reactch
│ • createch
│ • clear
┗━━━━━━━━━━━━━━━♢

┏━━「 Maths 」━━
│ • kalkulator
┗━━━━━━━━━━━━━━━♢

┏━━「 Search 」━━
│ • ai
│ • country
│ • quiz
│ • gpt
│ • gemma
│ • pinterest
│ • igstory
│ • ytstalk
│ • ffstalk
│ • telestalk
│ • meme
│ • channelinfo
│ • cekkodam
│ • define
│ • idch
│ • myip
│ • trackip
│ • xvideos
│ • yiffersearch
┗━━━━━━━━━━━━━━━♢

┏━━「 Converter 」━━
│ • photo
│ • tovideo
│ • toaudio
│ • tovn
│ • translate
│ • flux
│ • deepimage
│ • tourl
│ • logo
│ • tts
│ • ghiblistyle
┗━━━━━━━━━━━━━━━♢

┏━━「 Religion 」━━
│ • quran
│ • bible
┗━━━━━━━━━━━━━━━♢

┏━━「 Developer 」━━
│ • githubstalk
│ • gitclone
│ • getfile
│ • scweb
┗━━━━━━━━━━━━━━━♢
┏━━「 Others 」━━
│ • cc
│ • ckalender
│ • epl
│ • laliga
│ • bundesliga
│ • serie-a
│ • ligue-1
│ • fixtures
│ • news
│ • vcf
│ • save
│ • say
┗━━━━━━━━━━━━━━━♢

┏━━「 Email 」━━
│ • sendemail
│ • tempmail
┗━━━━━━━━━━━━━━━♢

> 🔚 Much Love, 𝘿𝘼𝙑𝙀-𝙏𝙀𝘾𝙃
`;

   try {
    const imagePath = path.join(__dirname, '../assets/Dave_menu.jpg');
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

    // Send menu
    await conn.sendMessage(m, messagePayload, { quoted });

    // Send random audio from your list
    const audios = [
      'https://files.catbox.moe/scopdq.mp3',
      'https://files.catbox.moe/mla4ew.mp3',
      'https://files.catbox.moe/p2jpxc.mp3',
      'https://files.catbox.moe/736aob.mp3'
    ];
    const randomAudio = audios[Math.floor(Math.random() * audios.length)];
    await conn.sendMessage(m, { audio: { url: randomAudio }, mimetype: 'audio/mpeg', ptt: true }, { quoted });

  } catch (err) {
    console.error('Error in help command:', err);
    await conn.sendMessage(m, { text: menuCaption });
  }
}

module.exports = helpCommand;
