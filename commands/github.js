const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/giftdee/DAVE-MD');
    if (!res.ok) throw new Error('Failed to fetch repository data');

    const json = await res.json();

    const caption = `
┏━〔 *𝐃𝐀𝐕𝐄-𝐌𝐃 𝙍𝙀𝙋𝙊* 〕━⬣
┃ 🔹 *Name:* ${json.name}
┃ 🔸 *Size:* ${(json.size / 1024).toFixed(2)} MB
┃ ⭐ *Stars:* ${json.stargazers_count}
┃ 🍴 *Forks:* ${json.forks_count}
┃ 👀 *Watchers:* ${json.watchers_count}
┃ ⏱️ *Updated:* ${moment(json.updated_at).tz('Africa/Nairobi').format('DD MMM YYYY, HH:mm:ss')}
┃ 🌐 *Link:* ${json.html_url}
┃ 🪄 _Star & Fork the Repo!_
┗━━━━━━━━━━━━━━━━━━⬣`;

    const imgPath = path.join(__dirname, '../assets/Dave_repo.jpg');
    const imageBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(
      chatId,
      {
        image: imageBuffer,
        caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363400480173280@newsletter',
            newsletterName: '𝐃𝐀𝐕𝐄-𝐌𝐃 UPDATES',
            serverMessageId: -1
          }
        }
      },
      { quoted: message }
    );
  } catch (err) {
    console.error('GitHub command error:', err);
    await sock.sendMessage(chatId, { text: '❌ Unable to fetch repo info. Try again later.' }, { quoted: message });
  }
}

module.exports = githubCommand;
