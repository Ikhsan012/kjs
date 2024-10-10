import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';

// Lanjutkan script Anda
// Masukkan token bot Anda
const token = '8042229061:AAEwTBx9k-AQrOvWoAkWFQUp8C_WCgYRzZg';
const bot = new TelegramBot(token, { polling: true });

// API endpoint untuk informasi gempa dan server
const gempaApiUrl = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json'; // Ganti dengan URL API yang sesuai
const serverInfoApiUrl = 'https://api.ryzendesu.vip/api/misc/server-info';

// Fungsi untuk fetch data dari API gempa
async function fetchGempaData() {
    try {
        const response = await fetch(gempaApiUrl);
        const data = await response.json();
        const gempa = data.Infogempa.gempa;

        const message = `
🌍 *Informasi Gempa Terkini* 🌍

📅 *Tanggal*: ${gempa.Tanggal}
⏰ *Jam*: ${gempa.Jam}
📏 *Magnitude*: ${gempa.Magnitude} Skala Richter
🌊 *Kedalaman*: ${gempa.Kedalaman}
📍 *Wilayah*: ${gempa.Wilayah}
⚠️ *Potensi Tsunami*: ${gempa.Potensi}
🧭 *Koordinat*: ${gempa.Coordinates}
        `;

        const shakemapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`;

        return { message, shakemapUrl };
    } catch (error) {
        console.error('Error fetching gempa data:', error);
        return { message: 'Gagal mendapatkan data gempa', shakemapUrl: null };
    }
}

// Fungsi untuk fetch data server dari API
async function fetchServerInfo() {
    try {
        const response = await fetch(serverInfoApiUrl);
        const data = await response.json();

        const os = data.os;
        const cpu = data.cpu;
        const ram = data.ram;
        const storage = data.storage[0]; // Mengambil storage pertama

        // Format pesan server info
        const message = `
🖥️ *Informasi Server* 🖥️

💻 *OS*:
- Platform: ${os.platform}
- Release: ${os.release}
- Type: ${os.type}

⚙️ *CPU*:
- Model: ${cpu.model}
- Cores: ${cpu.cores}

🧠 *RAM*:
- Total Memory: ${ram.totalMemory}
- Free Memory: ${ram.freeMemory}

💾 *Storage*:
- Drive: ${storage.drive}
- Total: ${storage.total}
- Used: ${storage.used}
- Free: ${storage.free}
        `;

        return message;
    } catch (error) {
        console.error('Error fetching server info:', error);
        return 'Gagal mendapatkan informasi server';
    }
}

// Respon ketika ada pesan "/infogempa"
bot.onText(/\/infogempa/, async (msg) => {
    const chatId = msg.chat.id;
    const { message, shakemapUrl } = await fetchGempaData();
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    if (shakemapUrl) {
        bot.sendPhoto(chatId, shakemapUrl, { caption: '📊 *Shakemap Gempa*' });
    }
});

// Respon ketika ada pesan "/infoserver"
bot.onText(/\/infoserver/, async (msg) => {
    const chatId = msg.chat.id;
    const message = await fetchServerInfo();
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Untuk pesan selain "/infogempa" atau "/infoserver"
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text !== '/infogempa' && msg.text !== '/infoserver') {
        bot.sendMessage(chatId, 'Ketik /infogempa untuk mendapatkan informasi gempa atau /infoserver untuk mendapatkan informasi server.');
    }
});