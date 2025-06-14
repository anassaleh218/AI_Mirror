import fs from 'fs';
import express from 'express';
import cors from 'cors';
import qrcode_terminal from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import { URL } from 'url';

const { Client, LocalAuth } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let client;
let qrCodeDataUrl = null;
let isReady = false;
let chatsCache = [];
let loggedInUserNumber = null;

function initializeWhatsApp() {
    console.log('🔄 Initializing WhatsApp client...');
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', qr => {
        console.log('✅ QR Code generated. Scan with your phone. Shown below:');
        qrcode_terminal.generate(qr, { small: true });
        isReady = false;
    });

    client.on('ready', async () => {
        console.log('✅ WhatsApp Client is ready!');
        isReady = true;
        qrCodeDataUrl = null; 
        try {
            if (client.info) {
                loggedInUserNumber = client.info.wid._serialized;
                console.log(`✅ Logged in user ID detected: ${loggedInUserNumber}`);
            }
        } catch(e) {
            console.error("❌ Could not get client info on ready:", e);
        }
        try {
            const chats = await client.getChats();
            
            const chatDataPromises = chats.map(async (chat) => {
                let picUrl = null;
                
                // ############ بداية التعديل الأساسي ############
                try {
                    // بدلًا من طلب الصورة مباشرة من الشات،
                    // نطلب الأول بيانات جهة الاتصال الكاملة ثم نطلب الصورة منها.
                    const contact = await chat.getContact();
                    picUrl = await contact.getProfilePicUrl();
                } catch (e) {
                    // هذا طبيعي جدًا ويحدث لو الشات ليس له صورة أو محظور.
                    // لا داعي لطباعة أي خطأ هنا.
                }
                // ############ نهاية التعديل الأساسي ############

                return {
                    id: chat.id._serialized,
                    name: chat.name || chat.id.user,
                    isGroup: chat.isGroup,
                    picUrl: picUrl // سيتم حفظ الرابط هنا (أو null إذا لم توجد صورة)
                };
            });

            chatsCache = await Promise.all(chatDataPromises);
            
            console.log(`✅ Fetched and cached ${chatsCache.length} chats.`);
            
            if (chatsCache.length > 0) {
                console.log("Sample cache item being sent to app:", JSON.stringify(chatsCache[0], null, 2));
            }

        } catch (error) {
            console.error('❌ Failed to fetch chats on ready:', error);
        }
    });
    
    client.on('disconnected', (reason) => {
        console.log('❌ Client was logged out', reason);
        isReady = false;
        chatsCache = [];
        client.destroy();
        initializeWhatsApp();
    });

    client.initialize();
}

app.get('/initiate-whatsapp', (req, res) => {
    if (isReady) {
        return res.json({ status: 'already-ready' });
    }
    if (!isReady && client && client.pupPage) {
        return res.json({ status: 'waiting-for-scan' });
    }
    res.json({ status: 'initializing' });
});

app.get('/get-chats', (req, res) => {
    if (!isReady) {
        return res.status(400).json({ error: 'WhatsApp is not ready yet.' });
    }
    res.json({ chats: chatsCache });
});

app.post('/fetch-chat-messages', async (req, res) => {
    console.log("Received request to fetch messages for chat:", req.body.chatId);
    
    if (!isReady) {
        return res.status(400).json({ error: 'WhatsApp is not ready yet.' });
    }

    const { chatId } = req.body;
    if (!chatId) {
        return res.status(400).json({ error: 'chatId is required.' });
    }

    try {
        console.log(`⏳ Fetching messages for chat: ${chatId}`);
        const selectedChat = await client.getChatById(chatId);
        const messages = await selectedChat.fetchMessages({ limit: 200 });

        const formattedMessages = messages.map(msg => ({
            id: msg.id.id,
            from: msg.from,
            to: msg.to,
            timestamp: msg.timestamp,
            body: msg.body
        }));
        
        console.log(`✅ Fetched ${formattedMessages.length} messages. Sending back to the app.`);
        
        res.json({
            status: 'success',
            userId: loggedInUserNumber,
            characterName: selectedChat.name || selectedChat.id.user,
            messages: formattedMessages
        });

    } catch (error) {
        console.error('❌ Error in /fetch-chat-messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    initializeWhatsApp();
});

