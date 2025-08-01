const axios = require('axios');

async function handleBibleCommand(sock, m, args, chatId, msg) {
    try {
        if (!args.length) {
            await sock.sendMessage(chatId, {
                text: `⚠️ Please provide a Bible reference.\n\n📝 Example:\n.bible John 3:16`
            }, { quoted: msg });
            return;
        }

        const reference = args.join(" ");
        const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
        const response = await axios.get(apiUrl);

        if (response.status === 200 && response.data?.text) {
            const { reference: ref, text, translation_name } = response.data;

            await sock.sendMessage(chatId, {
                text: `📖 *Reference:* ${ref}\n📜 *Verse:* ${text.trim()}\n📘 *Translation:* ${translation_name}`
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chatId, {
                text: "❌ Verse not found. Please check the reference and try again."
            }, { quoted: msg });
        }
    } catch (error) {
        console.error("Bible plugin error:", error.message);
        await sock.sendMessage(chatId, {
            text: "⚠️ An error occurred while fetching the Bible verse."
        }, { quoted: msg });
    }
}

module.exports = { handleBibleCommand };