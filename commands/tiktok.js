# Copy content from TikTok.js if neededconst { ttdl 
# } = require("ruhend-scraper");
nano TikTok.jsconst axios = require('axios');
# Paste or merge any additional code
// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {
        if (processedMessages.has(message.key.id)) return;
        processedMessages.add(message.key.id);
        setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text) return await sock.sendMessage(chatId, { text: "Please provide a TikTok link for the video." });

        const url = text.split(' ').slice(1).join(' ').trim();
        if (!url) return await sock.sendMessage(chatId, { text: "Please provide a TikTok link for the video." });

        const tiktokPatterns = [
            /https?:\/\/(?:www\.)?tiktok\.com\//,
            /https?:\/\/(?:vm\.)?tiktok\.com\//,
            /https?:\/\/(?:vt\.)?tiktok\.com\//,
            /https?:\/\/(?:www\.)?tiktok\.com\/@/,
            /https?:\/\/(?:www\.)?tiktok\.com\/t\//
        ];

        if (!tiktokPatterns.some(p => p.test(url))) {
            return await sock.sendMessage(chatId, { text: "That is not a valid TikTok link. Please provide a valid TikTok video link." });
        }

        await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

        try {
            let downloadData = await ttdl(url);

            if (!downloadData?.data?.length) {
                const apiResponse = await axios.get(`https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(url)}`);
                if (apiResponse.data?.status === 200 && apiResponse.data.tiktok?.video) {
                    await sock.sendMessage(chatId, {
                        video: { url: apiResponse.data.tiktok.video },
                        mimetype: "video/mp4",
                        caption: "𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗗𝗔𝗩𝗘-𝗫𝗠𝗗"
                    }, { quoted: message });
                    return;
                }
            }

            const mediaData = downloadData.data;
            for (let i = 0; i < Math.min(20, mediaData.length); i++) {
                const media = mediaData[i];
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(media.url) || media.type === 'video';

                if (isVideo) {
                    await sock.sendMessage(chatId, {
                        video: { url: media.url },
                        mimetype: "video/mp4",
                        caption: "𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗗𝗔𝗩𝗘-𝗫𝗠𝗗"
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: media.url },
                        caption: "𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗗𝗔𝗩𝗘-𝗫𝗠𝗗"
                    }, { quoted: message });
                }
            }
        } catch (error) {
            console.error('Error in TikTok download:', error);
            await sock.sendMessage(chatId, { text: "Failed to download the TikTok video. Please try again with a different link." });
        }
    } catch (error) {
        console.error('Error in TikTok command:', error);
        await sock.sendMessage(chatId, { text: "An error occurred while processing the request. Please try again later." });
    }
}

module.exports = tiktokCommand;
