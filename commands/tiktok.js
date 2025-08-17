const { ttdl } = require("ruhend-scraper");
const axios = require('axios');

const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {
        if (processedMessages.has(message.key.id)) return;
        processedMessages.add(message.key.id);

        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Oopsie! 😅 You forgot the TikTok link. Gimme one and let's dance! 💃🕺"
            });
        }

        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "Hmm… I see no link! 😜 Send me a TikTok link to fetch some magic ✨"
            });
        }

        const tiktokPatterns = [
            /https?:\/\/(?:www\.)?tiktok\.com\//,
            /https?:\/\/(?:vm\.)?tiktok\.com\//,
            /https?:\/\/(?:vt\.)?tiktok\.com\//,
            /https?:\/\/(?:www\.)?tiktok\.com\/@/,
            /https?:\/\/(?:www\.)?tiktok\.com\/t\//
        ];

        if (!tiktokPatterns.some(pattern => pattern.test(url))) {
            return await sock.sendMessage(chatId, { 
                text: "Oops! 🚫 That doesn't look like a TikTok link. Try again, friend! 😉"
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        try {
            let downloadData = await ttdl(url);

            if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
                const apiResponse = await axios.get(`https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(url)}`);
                if (apiResponse.data && apiResponse.data.status === 200 && apiResponse.data.tiktok) {
                    const videoUrl = apiResponse.data.tiktok.video;
                    if (videoUrl) {
                        await sock.sendMessage(chatId, {
                            video: { url: videoUrl },
                            mimetype: "video/mp4",
                            caption: "🎉 Boom! Your TikTok is ready! Downloaded by 𝐃𝐀𝐕𝐄-𝐌𝐃 🚀"
                        }, { quoted: message });
                        return;
                    }
                }
            }

            if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
                return await sock.sendMessage(chatId, { 
                    text: "Hmm… couldn't grab that one. 🤔 Try another TikTok link and let's gooo! 🕺"
                });
            }

            const mediaData = downloadData.data;
            for (let i = 0; i < Math.min(20, mediaData.length); i++) {
                const media = mediaData[i];
                const mediaUrl = media.url;
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === 'video';

                if (isVideo) {
                    await sock.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: "💥 TikTok dropped! Enjoy your video 🎬 – 𝐃𝐀𝐕𝐄-𝐌𝐃"
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: "🌟 Here’s your TikTok snap! Courtesy of 𝐃𝐀𝐕𝐄-𝐌𝐃 📸"
                    }, { quoted: message });
                }
            }
        } catch (error) {
            console.error('Error in TikTok download:', error);
            await sock.sendMessage(chatId, { 
                text: "😢 Oh no! Something went wrong downloading your TikTok. Try another link or just blame the internet. 🌐"
            });
        }
    } catch (error) {
        console.error('Error in TikTok command:', error);
        await sock.sendMessage(chatId, { 
            text: "🚨 Whoops! An error occurred. 𝐃𝐀𝐕𝐄-𝐌𝐃 is confused 🤯. Try again later!"
        });
    }
}

module.exports = tiktokCommand;
