const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/giftdee/DAVE-MD');
    if (!res.ok) throw new Error('Error fetching GitHub repo info');

    const data = await res.json();

    let caption = `🔧 *𝐃𝐀𝐕𝐄-𝐌𝐃 Repository Info*\n\n`;
    caption += `🔹 *Project Name:* ${data.name.toUpperCase()}\n`;
    caption += `🔹 *Size:* ${(data.size / 1024).toFixed(2)} MB\n`;
    caption += `🔹 *Watchers:* ${data.watchers_count}\n`;
    caption += `🔹 *Stars:* ${data.stargazers_count}\n`;
    caption += `🔹 *Forks:* ${data.forks_count}\n`;
    caption += `🔹 *Updated On:* ${moment(data.updated_at).tz('Africa/Nairobi').format('DD MMM YYYY • HH:mm:ss')}\n\n`;
    caption += `🌐 *GitHub Link:*\n${data.html_url}\n\n`;
    caption += `🪄 _Support the project by forking & starring the repo!_`;

    const imagePath = path.join(__dirname, '../assets/Dave_repo.jpg');
    const image = fs.readFileSync(imagePath);

    await sock.sendMessage(chatId, { image, caption }, { quoted: message });
  } catch (err) {
    await sock.sendMessage(chatId, { text: '⚠️ Failed to fetch repo info. Try again later.' }, { quoted: message });
  }
}

module.exports = githubCommand;
