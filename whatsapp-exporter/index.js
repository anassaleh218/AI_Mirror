// import fs from 'fs';
// import qrcode from 'qrcode-terminal';
// import inquirer from 'inquirer';
// import pkg from 'whatsapp-web.js';
// import { executablePath } from 'puppeteer-core'; // استيراد المسار الافتراضي

// const { Client, LocalAuth } = pkg;

// const client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//         headless: true,
//         // قم بتوفير مسار متصفح كروم المثبت على جهازك هنا
//         executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // <--- التعديل المهم هنا
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     }
// });

// // ... باقي الكود يبقى كما هو

// client.on('qr', qr => {
//     console.log('✅ امسح الـ QR من واتساب');
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', async () => {
//     console.log('✅ تم تسجيل الدخول بنجاح إلى واتساب');

//     const chats = await client.getChats();

//     const choices = chats.map((chat, index) => ({
//         name: `${index + 1}: ${chat.name || chat.formattedTitle || chat.id.user}`,
//         value: index
//     }));

//     const answers = await inquirer.prompt([
//         {
//             type: 'list',
//             name: 'selectedChatIndex',
//             message: 'اختر الشات اللي عايز تسحبه:',
//             choices
//         }
//     ]);

//     const selectedChat = chats[answers.selectedChatIndex];
//     const messages = await selectedChat.fetchMessages({ limit: 100 });

//     const formattedMessages = messages.map(msg => ({
//         id: msg.id.id,
//         from: msg.from,
//         to: msg.to,
//         timestamp: msg.timestamp,
//         body: msg.body
//     }));

//     const fileName = `${selectedChat.name || selectedChat.id.user}.json`;
//     fs.writeFileSync(fileName, JSON.stringify(formattedMessages, null, 2), 'utf-8');
//     console.log(`✅ تم حفظ المحادثة في الملف: ${fileName}`);

//     process.exit(0);
// });

// client.initialize();


///////////////////////////////////////////////


// server.js
// server.js
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

///////////////

// // server.js (ملف الباك إند الرئيسي بصيغة ES Modules)
// import express from 'express';
// import pkg from 'whatsapp-web.js';
// const { Client, LocalAuth } = pkg;

// const app = express();
// app.use(express.json());

// let whatsappClient;
// let isClientReady = false;

// // 1. Endpoint لبدء عملية الربط والحصول على الكود
// app.post('/whatsapp/start-linking', async (req, res) => {
//     console.log('طلب بدء الربط بواتساب...');
    
//     if (whatsappClient) {
//         console.log('Stopping existing client session...');
//         await whatsappClient.destroy().catch(err => console.error("Error stopping old session:", err));
//         whatsappClient = null;
//     }

//     isClientReady = false;
    
//     // --- تعديل مهم للتشخيص ---
//     // headless: false  ->  سيؤدي هذا إلى فتح نافذة متصفح Chrome مرئية
//     whatsappClient = new Client({
//         authStrategy: new LocalAuth({
//             dataPath: 'sessions'
//         }),
//         puppeteer: {
//             headless: false, //  <-- التغيير الأهم: اجعله مرئيًا لتشخيص المشكلة
//             executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-dev-shm-usage',
//                 '--disable-gpu',
//                 '--no-first-run',
//                 '--no-zygote',
//             ],
//         }
//     });

//     let responseSent = false;
//     const linkingTimeout = setTimeout(() => {
//         if (!responseSent) {
//             console.error('Timeout: Linking code was not generated in time.');
//             res.status(408).json({ error: 'Request Timeout', message: 'Could not get linking code. Please try again.' });
//             responseSent = true;
//             if (whatsappClient) whatsappClient.destroy().catch(e => console.error("Error on timeout destroy:", e));
//         }
//     }, 60000); // زيادة المهلة إلى 60 ثانية

//     // إضافة معالج أخطاء عام
//     whatsappClient.on('error', (err) => {
//         console.error('CLIENT ERROR:', err);
//     });

//     whatsappClient.on('code', (code) => {
//         clearTimeout(linkingTimeout);
//         console.log(`✅ Linking Code is: ${code}`);
//         if (!responseSent) {
//             res.status(200).json({ code: code });
//             responseSent = true;
//         }
//     });

//     whatsappClient.on('ready', () => {
//         clearTimeout(linkingTimeout);
//         isClientReady = true;
//         console.log('✅ WhatsApp client is ready!');
//         if (!responseSent) {
//             res.status(208).json({ status: 'already_ready', message: 'Session is ready.' });
//             responseSent = true;
//         }
//     });

//     whatsappClient.on('auth_failure', (msg) => {
//         clearTimeout(linkingTimeout);
//         console.error('Authentication failure', msg);
//         if (!responseSent) {
//             res.status(500).json({ error: 'Authentication failed', message: msg });
//             responseSent = true;
//         }
//     });

//     whatsappClient.on('disconnected', (reason) => {
//         console.log('Client was logged out', reason);
//         isClientReady = false;
//         if (whatsappClient) whatsappClient.destroy().catch(e => console.error("Error on disconnect destroy:", e));
//     });

//     console.log('Initializing WhatsApp client...');
//     try {
//         await whatsappClient.initialize();
//     } catch (err) {
//         clearTimeout(linkingTimeout);
//         console.error('Client initialization failed:', err);
//         if (!responseSent) {
//             res.status(500).json({ error: 'Client initialization failed', message: err.toString() });
//             responseSent = true;
//         }
//     }
// });


// // ... باقي الـ endpoints تبقى كما هي بدون تغيير ...

// // 2. Endpoint للتحقق مما إذا كان العميل جاهزًا
// app.get('/whatsapp/status', (req, res) => {
//     if (isClientReady) {
//         res.status(200).json({ status: 'ready', message: 'العميل جاهز' });
//     } else {
//         res.status(202).json({ status: 'pending', message: 'في انتظار ربط الجهاز...' });
//     }
// });


// // 3. Endpoint لجلب قائمة المحادثات
// app.get('/whatsapp/chats', async (req, res) => {
//     if (!isClientReady || !whatsappClient) {
//         return res.status(400).json({ error: 'العميل غير جاهز بعد.' });
//     }
//     try {
//         const chats = await whatsappClient.getChats();
//         const choices = chats
//             .filter(chat => !chat.isGroup && chat.name)
//             .map(chat => ({
//                 id: chat.id._serialized,
//                 name: chat.name || chat.id.user,
//             }));
//         res.status(200).json(choices);
//     } catch (error) {
//         console.error("Error fetching chats:", error);
//         res.status(500).json({ error: 'Failed to fetch chats.' });
//     }
// });

// // 4. Endpoint لجلب رسائل محادثة معينة
// app.get('/whatsapp/messages/:chatId', async (req, res) => {
//     if (!isClientReady || !whatsappClient) {
//         return res.status(400).json({ error: 'العميل غير جاهز بعد.' });
//     }
//     const chatId = req.params.chatId;
//     try {
//         const selectedChat = await whatsappClient.getChatById(chatId);
//         const messages = await selectedChat.fetchMessages({ limit: 200 }); 
//         const formattedMessages = messages.map(msg => ({
//             fromMe: msg.fromMe,
//             body: msg.body,
//             timestamp: msg.timestamp
//         }));
//         res.status(200).json({
//             contactName: selectedChat.name,
//             messages: formattedMessages
//         });
//     } catch (error) {
//         console.error("Error fetching messages:", error);
//         res.status(500).json({ error: 'Failed to fetch messages.' });
//     }
// });


// // Endpoint الخاص بموديل الذكاء الاصطناعي
// app.post('/store_data', (req, res) => {
//     console.log('Receiving character data:', req.body);
//     // ... Processing logic
//     res.status(200).json({ status: 'success', message: 'Data received successfully!' });
// });


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server is running on port ${PORT}`);
// });
