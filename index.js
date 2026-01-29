const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// ================== SOZLAMALAR ==================
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;
const CHANNEL_ID = Number(process.env.CHANNEL_ID); // MUHIM

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ================== KINOLAR ==================
const movies = {
    'K001': {
        title: 'Avatar: The Way of Water',
        file_id: 'BAACAgIAAxkBAAIBa2dfLTQ3w...',
        year: 2022
    },
    'K002': {
        title: 'Spider-Man: No Way Home',
        file_id: 'BAACAgIAAxkBAAIBa2dfLTQ3w...',
        year: 2021
    }
};

// ================== A’ZOLIKNI TEKSHIRISH ==================
async function isUserMember(userId) {
    try {
        const chat = await bot.getChatMember(CHANNEL_ID, userId);
        const status = chat.status;


        if (status === 'left' || status === 'kicked') return false;
        return true;
    } catch (error) {
        return false;
    }
}

// ================== WELCOME ==================
async function sendWelcome(chatId, userId, firstName) {
    const isMember = await isUserMember(userId);

    if (isMember) {
        await bot.sendMessage(
            chatId,
            `👋 *Salom, ${firstName}!*

✅ Siz kanalga *a'zosiz*

🎬 Kino olish uchun:
— Kino kodini yuboring (masalan: *K001*)
— Yoki *📋 Kinolar* tugmasini bosing`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [['📋 Kinolar']],
                    resize_keyboard: true
                }
            }
        );
    } else {
        await bot.sendMessage(
            chatId,
            `👋 *Salom, ${firstName}!*

❌ Kino olish uchun kanalga a'zo bo‘lishingiz shart 👇

📢 Kanal: [👉 BU YERGA BOSING](${CHANNEL_USERNAME.startsWith('http')
                ? CHANNEL_USERNAME
                : `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`})

A'zo bo‘lgach, pastdagi *✅ Tekshirish* tugmasini bosing`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [['✅ Tekshirish']],
                    resize_keyboard: true
                }
            }
        );
    }
}

// ================== /START ==================
bot.onText(/\/start/, async (msg) => {
    await sendWelcome(msg.chat.id, msg.from.id, msg.from.first_name);
});

// ================== ODDIY XABARLAR ==================
bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'Foydalanuvchi';
    const text = msg.text;


    // ✅ TEKSHIRISH (ODDIY TUGMA)
    if (text === '✅ Tekshirish') {

        const isMember = await isUserMember(userId);

        if (isMember) {
            await bot.sendMessage(
                chatId,
                '✅ Tekshirishni bostingiz, siz kanalga a’zosiz'
            );

            await sendWelcome(chatId, userId, firstName);
        } else {
            await bot.sendMessage(
                chatId,
                '❌ Siz hali kanalga a’zo emassiz\nAvval kanalga a’zo bo‘ling'
            );
        }
        return;
    }

    // A’zo emas bo‘lsa
    const isMember = await isUserMember(userId);
    if (!isMember) {
        await sendWelcome(chatId, userId, firstName);
        return;
    }

    // 📋 Kinolar
    if (text === '📋 Kinolar') {
        let list = '🎬 Kinolar:\n\n';
        for (const [code, movie] of Object.entries(movies)) {
            list += `${code} - ${movie.title}\n`;
        }
        list += '\nKodini yuboring (K001)';
        await bot.sendMessage(chatId, list);
        return;
    }

    // Kino kodi
    const code = text.toUpperCase().trim();
    if (movies[code]) {
        const movie = movies[code];
        await bot.sendMessage(chatId, `🎬 ${movie.title}\nYuklanmoqda...`);
        await bot.sendVideo(chatId, movie.file_id, {
            caption: `🎬 ${movie.title}\n📢 ${CHANNEL_USERNAME}`
        });
    } else {
        await bot.sendMessage(chatId, '❌ Kod topilmadi!\n"📋 Kinolar" ni bosing');
    }
});

// ================== FILE_ID OLISH ==================
bot.on('video', (msg) => {
});

// ================== XATOLAR ==================
bot.on('polling_error', (error) => {
});

