const axios = require('axios');
const crypto = require('crypto');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const ytdl = require('@distube/ytdl-core');
let ytdlp;
try { ytdlp = require('yt-dlp-exec'); } catch (_) { ytdlp = null; }

// Helper: richer diagnostics for axios/network errors
function logAxiosError(prefix, error) {
        try {
                const status = error?.response?.status;
                const statusText = error?.response?.statusText;
                const url = error?.config?.url;
                const method = error?.config?.method;
                const headers = error?.response?.headers;
                const dataPreview = (() => {
                        if (!error?.response?.data) return undefined;
                        if (Buffer.isBuffer(error.response.data)) return `<buffer ${error.response.data.length} bytes>`;
                        const str = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
                        return str.slice(0, 500);
                })();
                console.error(`[${prefix}] AxiosError:`, {
                        message: error?.message,
                        code: error?.code,
                        url,
                        method,
                        status,
                        statusText,
                        headers,
                        dataPreview
                });
        } catch (e) {
                console.error(`[${prefix}] Failed to log axios error`, e);
        }
}

// PrinceTech YT-MP3 API client
const princeApi = {
    base: 'https://api.princetechn.com/api/download/ytmp3',
    apikey: process.env.PRINCE_API_KEY || 'prince',
    async fetchMeta(videoUrl) {
        const params = new URLSearchParams({ apikey: this.apikey, url: videoUrl });
        const url = `${this.base}?${params.toString()}`;

        const { data } = await axios.get(url, {
            timeout: 20000,
            headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' }
        });
        return data;
    }
};

const savetube = {
   api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
   },
   headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
   },
   formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
   crypto: {
      hexToBuffer: (hexString) => {
         const matches = hexString.match(/.{1,2}/g);
         return Buffer.from(matches.join(''), 'hex');
      },
      decrypt: async (enc) => {
         try {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 16);
            const content = data.slice(16);
            const key = savetube.crypto.hexToBuffer(secretKey);
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
         } catch (error) {
            throw new Error(error)
         }
      }
   },
   youtube: url => {
      if (!url) return null;
      const a = [
         /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
         /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ];
      for (let b of a) {
         if (b.test(url)) return url.match(b)[1];
      }
      return null
   },
   request: async (endpoint, data = {}, method = 'post') => {
      try {
         const {
            data: response
         } = await axios({
            method,
            url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
            data: method === 'post' ? data : undefined,
            params: method === 'get' ? data : undefined,
            headers: savetube.headers,
            timeout: 20000,
            maxRedirects: 3,
         })
         return {
            status: true,
            code: 200,
            data: response
         }
      } catch (error) {
         logAxiosError('SAVETUBE.request', error);
         throw error;
      }
   },
   getCDN: async () => {
      console.log(`[SAVETUBE] Fetching CDN host...`);
      const response = await savetube.request(savetube.api.cdn, {}, 'get');
      if (!response.status) throw new Error(response)
      return {
         status: true,
         code: 200,
         data: response.data.cdn
      }
   },
   download: async (link, format) => {
      console.log(`[SAVETUBE] Starting download for: ${link}, format: ${format}`);

      if (!link) {
         console.log(`[SAVETUBE] No link provided`);
         return {
            status: false,
            code: 400,
            error: "No link provided. Please provide a valid YouTube link."
         }
      }
      if (!format || !savetube.formats.includes(format)) {
         console.log(`[SAVETUBE] Invalid format: ${format}`);
         return {
            status: false,
            code: 400,
            error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
            available_fmt: savetube.formats
         }
      }
      const id = savetube.youtube(link);
      console.log(`[SAVETUBE] Extracted YouTube ID: ${id}`);

      if (!id) {
         console.log(`[SAVETUBE] Invalid YouTube link - no ID extracted`);
         throw new Error('Invalid YouTube link.');
      }

      try {
         console.log(`[SAVETUBE] Getting CDN...`);
         const cdnx = await savetube.getCDN();
         if (!cdnx.status) {
            console.log(`[SAVETUBE] CDN request failed:`, cdnx);
            return cdnx;
         }
         const cdn = cdnx.data;
         console.log(`[SAVETUBE] Got CDN: ${cdn}`);

         console.log(`[SAVETUBE] Requesting video info...`);
         const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
            url: `https://www.youtube.com/watch?v=${id}`
         });
         if (!result.status) {
            console.log(`[SAVETUBE] Info request failed:`, result);
            return result;
         }
         console.log(`[SAVETUBE] Got video info, attempting decryption...`);

         const decrypted = await savetube.crypto.decrypt(result.data.data);
         console.log(`[SAVETUBE] Decryption successful, title: ${decrypted.title}`);

         var dl;
         try {
            console.log(`[SAVETUBE] Requesting download link...`);
            dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
               id: id,
               downloadType: format === 'mp3' ? 'audio' : 'video',
               quality: format === 'mp3' ? '128' : format,
               key: decrypted.key
            });
            console.log(`[SAVETUBE] Download request successful`);
         } catch (error) {
            logAxiosError('SAVETUBE.downloadLink', error);
            throw new Error('Failed to get download link. Please try again later.');
         };

         console.log(`[SAVETUBE] Download URL: ${dl.data.data.downloadUrl}`);

         return {
            status: true,
            code: 200,
            result: {
               title: decrypted.title || "Unknown Title",
               type: format === 'mp3' ? 'audio' : 'video',
               format: format,
               thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
               download: dl.data.data.downloadUrl,
               id: id,
               key: decrypted.key,
               duration: decrypted.duration,
               quality: format === 'mp3' ? '128' : format,
               downloaded: dl.data.data.downloaded
            }
         }
      } catch (error) {
         console.error(`[SAVETUBE] Error in download function:`, error);
         throw new Error('An error occurred while processing your request. Please try again later.');
      }
   }
};

// Fallback via Piped API (public YouTube proxy instances)
const piped = {
   instances: [
      'https://piped.video',
      'https://piped.lunar.icu',
      'https://piped.projectsegfau.lt',
      'https://piped.privacy.com.de',
      'https://piped.privacydev.net',
      'https://watch.leptons.xyz',
      'https://piped.us.projectsegfau.lt',
      'https://piped.seitan-ayoub.lol',
      'https://piped.smnz.de',
      'https://piped.syncpundit.io',
      'https://piped.tokhmi.xyz'
   ],
   getStreams: async (videoId) => {
      for (const base of piped.instances) {
         try {
            console.log(`[PIPED] Trying instance: ${base}`);
            const { data } = await axios.get(`${base}/api/v1/streams/${videoId}`, {
               headers: { 'user-agent': 'Mozilla/5.0', 'accept': 'application/json' },
               timeout: 15000
            });
            if (data && Array.isArray(data.audioStreams) && data.audioStreams.length > 0) {
               console.log(`[PIPED] Found ${data.audioStreams.length} audio streams on ${base}`);
               return { ok: true, base, streams: data.audioStreams };
            }
            console.warn(`[PIPED] No audioStreams on ${base}`);
         } catch (e) {
            console.warn(`[PIPED] Instance failed: ${base} -> ${e?.message || e}`);
         }
      }
      return { ok: false };
   }
}

async function songCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, { text: "What song do you want to download?" });
        }

        // Determine if input is a YouTube link or search query
        let videoUrl = '';
        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
            videoUrl = searchQuery;
        } else {
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                return await sock.sendMessage(chatId, { text: "No songs found!" });
            }
            videoUrl = videos[0].url;
            var selectedTitle = videos[0].title || searchQuery;
        }