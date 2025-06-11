// WhatsappImportScreen.js
import React, { useState, useEffect, useCallback } from 'react';
// السطر الصحيح
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- إضافة مهمة
import * as FileSystem from 'expo-file-system'; // <-- إضافة مهمة
// تأكد من أن هذا هو الـ IP الصحيح والمنفذ
const WHATSAPP_API_BASE_URL = 'http://192.168.1.31:3000';
const PREPROCESSING_API_URL = 'https://3b3f-34-125-53-190.ngrok-free.app';

const WhatsappImportScreen = () => {
    const navigation = useNavigation();
    // 'initializing', 'qr_pending', 'loading_chats', 'chat_list', 'processing'
    const [step, setStep] = useState('initializing');
    // const [qrCode, setQrCode] = useState(null); // <-- لم نعد بحاجة لهذا المتغير
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const pollForReadyStatus = useCallback(async () => {
        try {
            const response = await fetch(`${WHATSAPP_API_BASE_URL}/initiate-whatsapp`);
            const data = await response.json();

            if (data.status === 'already-ready') {
                setStep('loading_chats');
            } else if (data.status === 'waiting-for-scan') {
                setStep('qr_pending'); // حالة انتظار جديدة
                setIsLoading(false);
            } else { // 'initializing'
                setTimeout(pollForReadyStatus, 3000);
            }
        } catch (e) {
            console.error(e);
            setError('فشل الاتصال بسيرفر واتساب. تأكد أنك على نفس الشبكة وأن السيرفر يعمل.');
            setIsLoading(false);
        }
    }, []);

    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${WHATSAPP_API_BASE_URL}/get-chats`);
            const data = await response.json();
            if (response.ok) {
                setChats(data.chats);
                setStep('chat_list');
            } else {
                throw new Error(data.error || 'فشل جلب المحادثات');
            }
        } catch (e) {
            setError(e.message);
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // يتم استدعاء هذه الدالة مرة واحدة فقط في البداية
        if (step === 'initializing') {
            pollForReadyStatus();
        }

        // إذا كنا في حالة انتظار المسح، نستمر في التحقق كل 5 ثوانٍ
        if (step === 'qr_pending') {
            const interval = setInterval(pollForReadyStatus, 5000);
            return () => clearInterval(interval);
        }

        if (step === 'loading_chats') {
            fetchChats();
        }

    }, [step, pollForReadyStatus]);

    const saveImportedCharacterLocally = async (characterData) => {
        try {
            // 1. تحميل الصورة وحفظها في ذاكرة التطبيق
            let localImageUri = null;
            if (characterData.image) {
                const filename = characterData.image.split('/').pop().split('?')[0]; // تنظيف اسم الملف
                localImageUri = FileSystem.documentDirectory + `char_image_${Date.now()}_${filename}`;
                console.log(`Downloading image from ${characterData.image} to ${localImageUri}`);
                await FileSystem.downloadAsync(characterData.image, localImageUri);
            }

            // 2. تجهيز كائن الشخصية النهائي
            const finalCharacterObject = {
                ...characterData,
                image: localImageUri, // استخدام المسار المحلي للصورة
            };

            // 3. قراءة قائمة الشخصيات الحالية وإضافة الجديدة
            const existingCharactersJSON = await AsyncStorage.getItem('characters');
            const characters = existingCharactersJSON ? JSON.parse(existingCharactersJSON) : [];

            // 4. التحقق من عدم وجود تكرار
            const isDuplicate = characters.some(char => char.id === finalCharacterObject.id || char.name === finalCharacterObject.name);
            if (isDuplicate) {
                console.log(`Character '${finalCharacterObject.name}' already exists. Skipping save.`);
                return finalCharacterObject; // إرجاع الكائن للمتابعة إلى الشات
            }

            characters.push(finalCharacterObject);
            await AsyncStorage.setItem('characters', JSON.stringify(characters));
            console.log(`Character '${finalCharacterObject.name}' saved locally.`);
            return finalCharacterObject;

        } catch (error) {
            console.error("Failed to save character locally:", error);
            // في حالة الفشل، نستمر ولكن قد لا يتم حفظ الشخصية
            Alert.alert("خطأ في الحفظ المحلي", "لم يتم حفظ الشخصية في قائمة الشخصيات الموجودة، ولكن يمكنك بدء المحادثة.");
            return characterData; // إرجاع البيانات الأصلية للمتابعة
        }
    };

    // في WhatsappImportScreen.js

    const handleSelectChat = async (chatObject) => {
        setStep('processing');
        setIsLoading(true);
        let characterName = "Unknown"; // قيمة افتراضية

        try {
            // --- الخطوة الأولى: جلب الرسائل من سيرفر النود ---
            console.log(`Step 1: Fetching messages for ${chatObject.id} from Node.js server...`);
            const messagesResponse = await fetch(`${WHATSAPP_API_BASE_URL}/fetch-chat-messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: chatObject.id }),
            });

            const messagesData = await messagesResponse.json();
            if (!messagesResponse.ok) {
                throw new Error(messagesData.error || "Failed to fetch messages from Node.js server.");
            }

            const { messages } = messagesData;
            characterName = messagesData.characterName; // حفظ اسم الشخصية
            console.log(`Step 1 successful. Fetched ${messages.length} messages.`);

            // --- الخطوة الثانية: إرسال الرسائل إلى سيرفر البايثون للمعالجة ---
            console.log(`Step 2: Sending messages to Python server for processing...`);
            const processingResponse = await fetch(`${PREPROCESSING_API_URL}/preprocessing_whats_data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterName: characterName,
                    characterId: chatObject.id,
                    messages: messages
                })
            });

            const processingData = await processingResponse.json();
            // --- أضف هذا السطر للتشخيص ---
            console.log("Response from Python Server:", JSON.stringify(processingData, null, 2));
            // ---------------------------------

            if (!processingResponse.ok) {
                throw new Error(processingData.detail || "Failed to process data on Python server.");
            }

            console.log(`Step 2 successful. Received processed data.`);
            const { bio, answers } = processingData.processedData;

            // --- الخطوة الثالثة: الحفظ المحلي والانتقال (كما كانت) ---
            const characterToSave = {
                id: chatObject.id, name: characterName, image: chatObject.picUrl,
                bio: bio, questionnaireAnswers: answers
            };
            const finalCharacter = await saveImportedCharacterLocally(characterToSave);

            Alert.alert('نجاح!', `تم إنشاء شخصية "${characterName}" وحفظها.`, [
                { text: 'ابدأ المحادثة', onPress: () => navigation.replace('Chat', { selectedCharacter: finalCharacter }) },
            ]);

        } catch (e) {
            console.error("Error during the import process:", e);
            Alert.alert('خطأ', e.message);
            setStep('chat_list');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            let loadingText = 'جاري التهيئة...';
            if (step === 'loading_chats') loadingText = 'جاري تحميل المحادثات...';
            if (step === 'processing') loadingText = 'جاري معالجة الشات المختار...';
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                    <Text style={styles.statusText}>{loadingText}</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            );
        }

        switch (step) {
            case 'qr_pending': // <-- الحالة الجديدة
                return (
                    <View style={styles.centerContainer}>
                        <Text style={styles.title}>الخطوة التالية على الكمبيوتر</Text>
                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionText}>
                                ١. انظر إلى شاشة الأوامر (الترمينال) الخاصة بالباك إند على جهاز الكمبيوتر الخاص بك.
                            </Text>
                            <Text style={styles.instructionText}>
                                ٢. ستجد QR Code قد ظهر.
                            </Text>
                            <Text style={styles.instructionText}>
                                ٣. افتح واتساب على موبايلك وامسح الكود.
                            </Text>
                        </View>
                        <ActivityIndicator size="small" color="#075E54" style={{ marginTop: 20 }} />
                        <Text style={styles.statusText}>بانتظار مسح الكود...</Text>
                    </View>
                );
            case 'chat_list':
                return (
                    <>
                        <Text style={styles.title}>اختر المحادثة المطلوبة</Text>
                        <FlatList
                            data={chats}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.chatItem} onPress={() => handleSelectChat(item)}>
                                    {/* يمكنك إضافة الصورة هنا أيضًا كما في الإجابة السابقة */}
                                    <Image
                                        source={item.picUrl ? { uri: item.picUrl } : require('../assets/avatar-placeholder.png')} // تأكد من وجود صورة افتراضية
                                        style={styles.chatImage}
                                    />
                                    <Text style={styles.chatName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            refreshControl={
                                <RefreshControl refreshing={isLoading} onRefresh={fetchChats} />
                            }
                        />
                    </>
                );
            default:
                return (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#075E54" />
                        <Text style={styles.statusText}>جاري الاتصال...</Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderContent()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' }, // لون أفتح قليلاً
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#128C7E', marginBottom: 25, textAlign: 'center' },
    statusText: { fontSize: 16, color: '#54656F', textAlign: 'center', marginTop: 15 },
    errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
    chatItem: { backgroundColor: 'white', padding: 20, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#E0E0E0' },
    chatName: { fontSize: 18, fontWeight: '500', color: '#111B21' },
    // ستايل جديد للتعليمات
    instructionBox: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    instructionText: {
        fontSize: 17,
        color: '#333',
        textAlign: 'right',
        lineHeight: 28,
        marginBottom: 10,
    }
});

export default WhatsappImportScreen;