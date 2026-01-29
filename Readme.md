# Telegram Kino Bot 🎬

Node.js da yozilgan Telegram kino bot - kanalga a'zolikni tekshirish funksiyasi bilan.

## Xususiyatlar ✨

- ✅ Kanalga a'zolikni tekshirish
- 🎬 Kino kodi orqali video yuborish
- 📋 Kinolar ro'yxati
- 🔄 A'zolikni qayta tekshirish tugmasi
- 💬 O'zbek tilida interfeys

## O'rnatish 🚀

### 1. Loyihani yuklab olish

```bash
# Loyiha papkasiga o'ting
cd telegram-cinema-bot
```

### 2. Kerakli paketlarni o'rnatish

```bash
npm install
```

### 3. Bot sozlamalari

`telegram-cinema-bot.js` faylini ochib, quyidagi ma'lumotlarni to'ldiring:

```javascript
// Bot tokenini BotFather'dan oling
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

// Kanalingiz username'i
const CHANNEL_USERNAME = '@your_channel_username';

// Kanal ID raqami
const CHANNEL_ID = '-1001234567890';
```

### 4. Kanal ID ni topish

Kanal ID ni topish uchun:

1. Botni kanalingizga admin qiling
2. Quyidagi botga kanalingizdan xabar forward qiling: @userinfobot
3. Kanal ID ni oling (masalan: -1001234567890)

### 5. Bot tokenini olish

1. Telegram'da @BotFather ga o'ting
2. `/newbot` buyrug'ini yuboring
3. Bot nomini va username'ini kiriting
4. Token'ni oling va `BOT_TOKEN` ga qo'ying

### 6. Kino qo'shish

Video fayllarni qo'shish uchun:

1. Botga video yuborib, `file_id` ni oling
2. `movies` obyektiga yangi kino qo'shing:

```javascript
const movies = {
    'K001': {
        title: 'Kinoning nomi',
        file_id: 'VIDEO_FILE_ID_HERE',
        year: 2024
    },
    // Boshqa kinolar...
};
```

### 7. Botni ishga tushirish

```bash
npm start
```

Yoki development rejimida (avtomatik qayta ishga tushish):

```bash
npm run dev
```

## Foydalanish 📱

### User uchun:

1. Botga `/start` buyrug'ini yuboring
2. Agar kanalga a'zo bo'lmasangiz - "Kanalga o'tish" tugmasini bosing
3. Kanalga a'zo bo'lgach - "✅ Tekshirish" tugmasini bosing
4. Tasdiqlangach - kino kodini yuboring (masalan: K001)
5. Kino sizga yuboriladi!

### Admin uchun:

Yangi kino qo'shish:

1. Botga video faylni yuboring
2. Telegram API orqali `file_id` ni oling
3. Kodni yangilang va qayta ishga tushiring

## Fayl tuzilishi 📁

```
telegram-cinema-bot/
│
├── telegram-cinema-bot.js  # Asosiy bot fayli
├── package.json            # NPM paketlar
├── README.md               # Yo'riqnoma
└── .env                    # Muhim ma'lumotlar (ixtiyoriy)
```

## Xatolarni tuzatish 🔧

### Bot ishlamayapti?

- Bot tokenini tekshiring
- Kanal ID to'g'ri ekanligini tekshiring
- Bot kanalda admin ekanligini tekshiring

### A'zolik tekshirilmayapti?

- Botning kanalda admin huquqlari borligini tekshiring
- Kanal ID to'g'ri ekanligini tekshiring (minus belgisi bilan)

### Kino yuklanmayapti?

- Video `file_id` to'g'ri ekanligini tekshiring
- Video hajmi 50MB dan oshmasligi kerak (Telegram cheklovi)

## Qo'shimcha xususiyatlar 🎯

Keyinchalik qo'shish mumkin:

- 🗄️ MongoDB ma'lumotlar bazasi
- 👤 Admin panel
- 📊 Statistika
- 🔍 Kino qidirish
- ⭐ Reyting tizimi
- 💾 Kino ma'lumotlarini saqlash

## Yordam 💡

Savollar bo'lsa yoki yordam kerak bo'lsa, issue ochishingiz mumkin.

## Litsenziya 📄

MIT License - o'zingiz xohlaganingizday foydalanishingiz mumkin!

---

**Eslatma:** Bot faqat ta'lim maqsadida yaratilgan. Mualliflik huquqlarini hurmat qiling!