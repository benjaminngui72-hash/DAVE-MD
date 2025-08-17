const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Channel info for message context
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363400480173280@newsletter',
            newsletterName: '𝐃𝐀𝐕𝐄-𝐌𝐃',
            serverMessageId: -1
        }
    }
};

async function viewOnceCommand(sock, chatId, message, sender) {
    try {
        // Owner check
        if (!settings.OWNER.includes(sender)) {
            await sock.sendMessage(chatId, { 
                text: '🙃 Sorry, this command is just for my awesome owner 🙂🙌',
                ...channelInfo
            });
            return;
        }

        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                            message.message?.imageMessage ||
                            message.message?.videoMessage;

        if (!quotedMessage) {
            await sock.sendMessage(chatId, { 
                text: '😒 Oops! You need to reply to a view-once message to unlock it 🙂',
                ...channelInfo
            });
            return;
        }

        const isViewOnceImage = quotedMessage.imageMessage?.viewOnce === true || 
                              quotedMessage.viewOnceMessage?.message?.imageMessage ||
                              message.message?.viewOnceMessage?.message?.imageMessage;

        const isViewOnceVideo = quotedMessage.videoMessage?.viewOnce === true || 
                              quotedMessage.viewOnceMessage?.message?.videoMessage ||
                              message.message?.viewOnceMessage?.message?.videoMessage;

        let mediaMessage;
        if (isViewOnceImage) {
            mediaMessage = quotedMessage.imageMessage || 
                         quotedMessage.viewOnceMessage?.message?.imageMessage ||
                         message.message?.viewOnceMessage?.message?.imageMessage;
        } else if (isViewOnceVideo) {
            mediaMessage = quotedMessage.videoMessage || 
                         quotedMessage.viewOnceMessage?.message?.videoMessage ||
                         message.message?.viewOnceMessage?.message?.videoMessage;
        }

        if (!mediaMessage) {
            await sock.sendMessage(chatId, { 
                text: '😒 Hmm, couldn’t detect a view-once message 🙃 Make sure you reply to one 🙂',
                ...channelInfo
            });
            return;
        }

        // Handle view once image
        if (isViewOnceImage) {
            try {
                const stream = await downloadContentFromMessage(mediaMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                const caption = mediaMessage.caption || '';
                await sock.sendMessage(chatId, { 
                    image: buffer,
                    caption: `🙌 *𝐃𝐀𝐕𝐄-𝐌𝐃* 🙌\n\n*Unlocked Image 🙂*\n${caption ? `*Caption:* ${caption}` : ''}`,
                    ...channelInfo
                });
                return;
            } catch (err) {
                await sock.sendMessage(chatId, { 
                    text: '😒 Failed to unlock image 🙃 Error: ' + err.message,
                    ...channelInfo
                });
                return;
            }
        }

        // Handle view once video
        if (isViewOnceVideo) {
            try {
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

                const tempFile = path.join(tempDir, `temp_${Date.now()}.mp4`);
                const stream = await downloadContentFromMessage(mediaMessage, 'video');
                const writeStream = fs.createWriteStream(tempFile);
                for await (const chunk of stream) writeStream.write(chunk);
                writeStream.end();
                await new Promise((resolve) => writeStream.on('finish', resolve));

                const caption = mediaMessage.caption || '';
                await sock.sendMessage(chatId, { 
                    video: fs.readFileSync(tempFile),
                    caption: `🙌 *𝐃𝐀𝐕𝐄-𝐌𝐃* 🙌\n\n*Unlocked Video 🙂*\n${caption ? `*Caption:* ${caption}` : ''}`,
                    ...channelInfo
                });

                fs.unlinkSync(tempFile);
                return;
            } catch (err) {
                await sock.sendMessage(chatId, { 
                    text: '😒 Failed to unlock video 🙃 Error: ' + err.message,
                    ...channelInfo
                });
                return;
            }
        }

        // Not a view once message
        await sock.sendMessage(chatId, { 
            text: '😒 This isn’t a view-once message 🙃 Please reply to one 🙂',
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, { 
            text: '🛑 Something went wrong 🙃 Error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = viewOnceCommand;
