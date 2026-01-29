const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// ================== MUHIM: .env faylini tekshirish ==================


const BOT_TOKEN = `8540792652:AAHTqikJgOKWiqlpnGHv9uWS9tPhhQv0Igw`;
const CHANNEL_USERNAME = `@UzKinoPremiera`;
const CHANNEL_ID = -1003707805152;
const ADMIN_ID = 7542365426;
const PRIVATE_CHANNEL_ID = 1003415052995;

// Muhim ma'lumotlar mavjudligini tekshirish
if (!BOT_TOKEN) {
    process.exit(1);
}

if (!CHANNEL_ID || !ADMIN_ID) {
    process.exit(1);
}



const botOptions = {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
};



const bot = new TelegramBot(BOT_TOKEN, botOptions);


// ================== KINOLAR FAYLINI BOSHQARISH ==================
const MOVIES_FILE = path.join(__dirname, 'movies.json');

async function loadMovies() {
    try {
        const data = await fs.readFile(MOVIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveMovies(movies) {
    try {
        await fs.writeFile(MOVIES_FILE, JSON.stringify(movies, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('❌ Saqlashda xatolik:', error);
        return false;
    }
}

// ================== KINOLAR ==================
let movies = {};

(async () => {
    movies = await loadMovies();
    console.log(`✅ ${Object.keys(movies).length} ta kino yuklandi`);
})();

// ================== VAQTINCHALIK MA'LUMOTLAR ==================
const tempData = {};

// ================== CHIROYLI POST YARATISH ==================
function createMovieCaption(movieInfo, channelUsername) {
    const caption = `
🎬 *${movieInfo.name}*

━━━━━━━━━━━━━━━━━━━━━
📅 *Yil:* ${movieInfo.chiqarilgan_yili}
🎭 *Janr:* ${movieInfo.janr}
🔢 *Kod:* \`${movieInfo.cod}\`
━━━━━━━━━━━━━━━━━━━━━

📢 *Kanal:* ${channelUsername}

💡 *Yangi kinolarni birinchi bo'lib ko'ring!*
`.trim();

    return caption;
}

// ================== A'ZOLIKNI TEKSHIRISH ==================
async function isUserMember(userId) {
    try {
        const chat = await bot.getChatMember(CHANNEL_ID, userId);
        const status = chat.status;
        console.log(`👤 User ${userId} status: ${status}`);
        return status !== 'left' && status !== 'kicked';
    } catch (error) {
        console.error('❌ A\'zolikni tekshirishda xatolik:', error.message);
        return false;
    }
}

// ================== WELCOME ==================
async function sendWelcome(chatId, userId, firstName) {
    try {
        const isMember = await isUserMember(userId);

        if (isMember) {
            await bot.sendMessage(
                chatId,
                `👋 *Salom, ${firstName}!*

✅ Siz kanalga *a'zosiz*

🎬 Kino olish uchun:
— Kino kodini yuboring (masalan: *1*)
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
            const channelLink = CHANNEL_USERNAME.startsWith('http')
                ? CHANNEL_USERNAME
                : `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`;

            await bot.sendMessage(
                chatId,
                `👋 *Salom, ${firstName}!*

❌ Kino olish uchun kanalga a'zo bo'lishingiz shart 👇

📢 Kanal: [👉 BU YERGA BOSING](${channelLink})

A'zo bo'lgach, pastdagi *✅ Tekshirish* tugmasini bosing`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        keyboard: [['✅ Tekshirish']],
                        resize_keyboard: true
                    }
                }
            );
        }
    } catch (error) {
        await bot.sendMessage(chatId, 'Xatolik yuz berdi. Qaytadan /start bosing');
    }
}

// ================== /START ==================
bot.onText(/\/start/, async (msg) => {
    await sendWelcome(msg.chat.id, msg.from.id, msg.from.first_name);
});

// ================== /ADD KOMANDASI ==================
bot.onText(/\/add/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;


    if (userId !== ADMIN_ID) {
        await bot.sendMessage(chatId, '❌ Bu komanda faqat admin uchun!');
        return;
    }

    tempData[userId] = { step: 'waiting_info' };

    await bot.sendMessage(
        chatId,
        `📝 *Kino ma'lumotlarini quyidagi formatda yuboring:*

\`\`\`json
{
  "name": "Formula 1",
  "janr": "Poyga",
  "chiqarilgan_yili": "2025y",
  "cod": "1"
}
\`\`\`

⚠️ Diqqat: JSON formatida yuboring!`,
        { parse_mode: 'Markdown' }
    );
});

// ================== /DELETE KOMANDASI ==================
bot.onText(/\/delete (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const code = match[1].trim();

    if (userId !== ADMIN_ID) {
        await bot.sendMessage(chatId, '❌ Bu komanda faqat admin uchun!');
        return;
    }

    // Loading message
    const loadingMsg = await bot.sendMessage(chatId, '⏳ O\'chirilmoqda...');

    if (movies[code]) {
        const movieTitle = movies[code].title;
        delete movies[code];

        const saved = await saveMovies(movies);

        await bot.deleteMessage(chatId, loadingMsg.message_id);

        if (saved) {
            await bot.sendMessage(
                chatId,
                `✅ Kino o'chirildi:\n🎬 ${movieTitle}\n🔢 Kod: ${code}`
            );
        } else {
            await bot.sendMessage(chatId, '❌ Saqlashda xatolik!');
        }
    } else {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
        await bot.sendMessage(chatId, `❌ "${code}" kodi topilmadi!`);
    }
});

// ================== /LIST KOMANDASI ==================
bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId !== ADMIN_ID) {
        await bot.sendMessage(chatId, '❌ Bu komanda faqat admin uchun!');
        return;
    }

    // Loading message
    const loadingMsg = await bot.sendMessage(chatId, '⏳ Yuklanmoqda...');

    if (Object.keys(movies).length === 0) {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
        await bot.sendMessage(chatId, '📂 Bazada kinolar yo\'q');
        return;
    }

    let list = '📊 *BAZADAGI KINOLAR:*\n\n';
    for (const [code, movie] of Object.entries(movies)) {
        list += `*${code}* - ${movie.title}\n`;
        list += `   🎭 ${movie.genre} | 📅 ${movie.year}\n`;
        list += `   📹 Message ID: ${movie.message_id}\n\n`;
    }

    await bot.deleteMessage(chatId, loadingMsg.message_id);
    await bot.sendMessage(chatId, list, { parse_mode: 'Markdown' });
});

// ================== ODDIY XABARLAR ==================
bot.on('message', async (msg) => {
    // Komandalarni o'tkazib yuborish
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'Foydalanuvchi';
    const text = msg.text;

    console.log(`📨 Xabar qabul qilindi: "${text}" dan ${userId}`);

    try {
        // ================== ADMIN: KINO QO'SHISH ==================
        if (userId === ADMIN_ID && tempData[userId]) {

            if (tempData[userId].step === 'waiting_info') {
                try {
                    const movieInfo = JSON.parse(text);

                    if (!movieInfo.name || !movieInfo.janr || !movieInfo.chiqarilgan_yili || !movieInfo.cod) {
                        await bot.sendMessage(chatId, '❌ Barcha maydonlarni to\'ldiring!');
                        return;
                    }

                    if (movies[movieInfo.cod]) {
                        await bot.sendMessage(
                            chatId,
                            `⚠️ "${movieInfo.cod}" kodi allaqachon mavjud!\n🎬 ${movies[movieInfo.cod].title}\n\nBoshqa kod tanlang yoki /delete ${movieInfo.cod} bilan o'chiring`
                        );
                        return;
                    }

                    tempData[userId].movieInfo = movieInfo;
                    tempData[userId].step = 'waiting_message_id';

                    await bot.sendMessage(
                        chatId,
                        `✅ Ma'lumotlar qabul qilindi:

🎬 Nomi: *${movieInfo.name}*
🎭 Janr: ${movieInfo.janr}
📅 Yil: ${movieInfo.chiqarilgan_yili}
🔢 Kod: ${movieInfo.cod}

📹 Endi yopiq kanaldagi video *message ID* sini yuboring
(Masalan: 3)`,
                        { parse_mode: 'Markdown' }
                    );

                } catch (error) {
                    await bot.sendMessage(chatId, '❌ JSON format xato! Qaytadan urinib ko\'ring.');
                }
                return;
            }

            if (tempData[userId].step === 'waiting_message_id') {
                const messageId = parseInt(text.trim());

                if (isNaN(messageId)) {
                    await bot.sendMessage(chatId, '❌ Faqat raqam yuboring! (Masalan: 3)');
                    return;
                }

                // Loading message
                const loadingMsg = await bot.sendMessage(chatId, '⏳ Video tekshirilmoqda...');

                try {
                    const forwardedMsg = await bot.forwardMessage(chatId, PRIVATE_CHANNEL_ID, messageId);

                    if (!forwardedMsg.video) {
                        await bot.deleteMessage(chatId, loadingMsg.message_id);
                        await bot.sendMessage(chatId, '❌ Bu message video emas!');
                        return;
                    }

                    const movieInfo = tempData[userId].movieInfo;

                    movies[movieInfo.cod] = {
                        title: movieInfo.name,
                        genre: movieInfo.janr,
                        year: movieInfo.chiqarilgan_yili,
                        message_id: messageId,
                        added_date: new Date().toISOString()
                    };

                    await bot.deleteMessage(chatId, loadingMsg.message_id);
                    const savingMsg = await bot.sendMessage(chatId, '💾 Saqlanmoqda...');

                    const saved = await saveMovies(movies);

                    await bot.deleteMessage(chatId, savingMsg.message_id);

                    if (saved) {
                        // Chiroyli formatda ko'rsatish
                        const caption = createMovieCaption(movieInfo, CHANNEL_USERNAME);

                        await bot.sendVideo(chatId, forwardedMsg.video.file_id, {
                            caption: caption,
                            parse_mode: 'Markdown'
                        });

                        await bot.sendMessage(
                            chatId,
                            `✅ *Kino muvaffaqiyatli qo'shildi va saqlandi!*

💾 Jami kinolar: ${Object.keys(movies).length} ta

💡 Yuqoridagi ko'rinishda postlar yuboriladi`,
                            { parse_mode: 'Markdown' }
                        );
                    } else {
                        await bot.sendMessage(chatId, '⚠️ Kino qo\'shildi lekin faylga saqlashda xatolik!');
                    }

                    delete tempData[userId];

                } catch (error) {
                    await bot.deleteMessage(chatId, loadingMsg.message_id);
                    await bot.sendMessage(
                        chatId,
                        `❌ Videoni olishda xatolik!

Sabablari:
- Message ID noto'g'ri
- Bot yopiq kanalda admin emas
- Video o'chirilgan

Qaytadan /add ni bosing`
                    );
                }
                return;
            }
        }

        // ================== ODDIY FOYDALANUVCHILAR ==================

        // ✅ TEKSHIRISH
        if (text === '✅ Tekshirish') {
            const loadingMsg = await bot.sendMessage(chatId, '⏳ Tekshirilmoqda...');

            const isMember = await isUserMember(userId);

            await bot.deleteMessage(chatId, loadingMsg.message_id);

            if (isMember) {
                await bot.sendMessage(chatId, '✅ Siz kanalga a\'zosiz!');
                await sendWelcome(chatId, userId, firstName);
            } else {
                await bot.sendMessage(chatId, '❌ Siz hali kanalga a\'zo emassiz');
            }
            return;
        }

        // A'zo emas bo'lsa
        const isMember = await isUserMember(userId);
        if (!isMember) {
            await sendWelcome(chatId, userId, firstName);
            return;
        }

        // 📋 Kinolar
        if (text === '📋 Kinolar') {
            const loadingMsg = await bot.sendMessage(chatId, '⏳ Yuklanmoqda...');

            if (Object.keys(movies).length === 0) {
                await bot.deleteMessage(chatId, loadingMsg.message_id);
                await bot.sendMessage(chatId, '📂 Hozircha kinolar yo\'q');
                return;
            }

            let list = '🎬 *KINOLAR RO\'YXATI*\n\n';
            for (const [code, movie] of Object.entries(movies)) {
                list += `━━━━━━━━━━━━━━━\n`;
                list += `🔢 *Kod:* \`${code}\`\n`;
                list += `🎬 *${movie.title}*\n`;
                list += `🎭 ${movie.genre} | 📅 ${movie.year}\n\n`;
            }
            list += '━━━━━━━━━━━━━━━\n\n';
            list += '💡 *Kino olish uchun kodini yuboring*';

            await bot.deleteMessage(chatId, loadingMsg.message_id);
            await bot.sendMessage(chatId, list, { parse_mode: 'Markdown' });
            return;
        }

        // Kino kodi bo'yicha video olish
        const code = text.trim();
        if (movies[code]) {
            const movie = movies[code];

            const loadingMsg = await bot.sendMessage(
                chatId,
                '⏳ *Yuklanmoqda...*\n\n📹 Video tayyorlanmoqda, iltimos kuting...',
                { parse_mode: 'Markdown' }
            );

            try {
                // Chiroyli formatda caption yaratish
                const movieInfo = {
                    name: movie.title,
                    janr: movie.genre,
                    chiqarilgan_yili: movie.year,
                    cod: code
                };
                const caption = createMovieCaption(movieInfo, CHANNEL_USERNAME);

                await bot.sendVideo(chatId, movie.file_id, {
                    caption: caption,
                    parse_mode: 'Markdown'
                });

                await bot.deleteMessage(chatId, loadingMsg.message_id);
            } catch (error) {
                console.error('❌ Video yuborishda xatolik:', error);
                await bot.deleteMessage(chatId, loadingMsg.message_id);
                await bot.sendMessage(chatId, '❌ Video yuborishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
            }
        } else {
            await bot.sendMessage(chatId, '❌ Bunday kod topilmadi!\n"📋 Kinolar" ni bosing');
        }

    } catch (error) {
        await bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
});


