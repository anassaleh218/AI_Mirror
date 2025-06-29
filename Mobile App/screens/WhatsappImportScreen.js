import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// تأكد من أن هذا هو الـ IP الصحيح والمنفذ
const WHATSAPP_API_BASE_URL = 'http://192.168.136.1:3000';
const PREPROCESSING_API_URL = 'https://1dfe-34-34-115-170.ngrok-free.app';

const WhatsappImportScreen = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState('initializing');
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
                setStep('qr_pending');
                setIsLoading(false);
            } else {
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
        if (step === 'initializing') {
            pollForReadyStatus();
        }
        if (step === 'qr_pending') {
            const interval = setInterval(pollForReadyStatus, 5000);
            return () => clearInterval(interval);
        }
        if (step === 'loading_chats') {
            fetchChats();
        }
    }, [step, pollForReadyStatus]);

    // ############ بداية التعديل الأساسي هنا ############
    const saveImportedCharacterLocally = async (characterData) => {
        let localImageUri = null; // هنبدأ بصورة فارغة

        // الخطوة 1: محاولة تحميل الصورة فقط لو فيه رابط جاي من السيرفر
        if (characterData.image && characterData.image.startsWith('http')) {
            try {
                // استخدام اسم ملف ثابت ومميز عشان نتجنب أي حروف غريبة
                const filename = `char_img_${Date.now()}.jpeg`;
                const localUri = FileSystem.documentDirectory + filename;
                
                console.log(`Downloading profile picture from: ${characterData.image}`);
                
                // تحميل الصورة
                const downloadResult = await FileSystem.downloadAsync(characterData.image, localUri);
                
                // التأكد من أن التحميل نجح (status 200)
                if (downloadResult.status === 200) {
                    console.log('Download successful. Local URI:', downloadResult.uri);
                    localImageUri = downloadResult.uri; // لو نجح، بنسجل المسار المحلي
                } else {
                    console.warn(`Failed to download image. Server responded with status: ${downloadResult.status}`);
                    // لو فشل، بنسيب localImageUri فاضي (null)
                }
            } catch (error) {
                console.error("Error downloading profile picture:", error);
                Alert.alert("خطأ في الصورة", "لم نتمكن من حفظ صورة البروفايل، ولكن سيتم إنشاء الشخصية بدونها.");
                // لو حصل أي خطأ، بنسيب localImageUri فاضي (null)
            }
        }

        // الخطوة 2: تجهيز الكائن النهائي للحفظ
        const finalCharacterObject = {
            ...characterData,
            image: localImageUri, // هنا بنحط المسار المحلي لو التحميل نجح، أو null لو فشل
        };

        // الخطوة 3: حفظ الكائن النهائي في AsyncStorage
        try {
            const existingCharactersJSON = await AsyncStorage.getItem('characters');
            const characters = existingCharactersJSON ? JSON.parse(existingCharactersJSON) : [];
            
            const existingIndex = characters.findIndex(char => char.id === finalCharacterObject.id);
            
            if (existingIndex > -1) {
                console.log(`Character '${finalCharacterObject.name}' already exists. Updating.`);
                characters[existingIndex] = finalCharacterObject;
            } else {
                characters.push(finalCharacterObject);
            }

            await AsyncStorage.setItem('characters', JSON.stringify(characters));
            console.log(`Character '${finalCharacterObject.name}' saved locally with image URI: ${localImageUri}`);
            return finalCharacterObject;

        } catch (storageError) {
            console.error("Failed to save character to AsyncStorage:", storageError);
            Alert.alert("خطأ في الحفظ", "لم نتمكن من حفظ الشخصية في القائمة.");
            return finalCharacterObject; 
        }
    };
    // ############ نهاية التعديل الأساسي هنا ############


    const handleSelectChat = async (chatObject) => {
        setStep('processing');
        setIsLoading(true);

        try {
            // --- جلب الرسائل من سيرفر النود ---
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

            const { messages, userId, characterName } = messagesData;

            if (!userId) {
                throw new Error("Node.js server did not return the user's ID.");
            }
            
            console.log(`Step 1 successful. Fetched ${messages.length} messages for user: ${userId}.`);

            // --- إرسال البيانات لسيرفر البايثون للمعالجة ---
            console.log(`Step 2: Sending data to Python server for processing...`);
            const processingResponse = await fetch(`${PREPROCESSING_API_URL}/preprocessing_whats_data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    characterName: characterName,
                    characterId: chatObject.id,
                    messages: messages
                })
            });

            const processingData = await processingResponse.json();
            console.log("Response from Python Server:", JSON.stringify(processingData, null, 2));
            
            if (!processingResponse.ok) {
                throw new Error(processingData.detail || "Failed to process data on Python server.");
            }

            console.log(`Step 2 successful. Received processed data.`);
            const { bio, answers } = processingData.processedData;

            // --- الخطوة الثالثة: الحفظ المحلي والانتقال ---
            const characterToSave = {
                id: chatObject.id, 
                name: characterName, 
                image: chatObject.picUrl, // هنبعت الرابط المؤقت للدالة اللي هتحمله
                bio: bio, 
                questionnaireAnswers: answers
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
            case 'qr_pending':
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
                                    <Image
                                        source={item.picUrl ? { uri: item.picUrl } : require('../assets/avatar-placeholder.png')}
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
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#128C7E', marginBottom: 25, textAlign: 'center' },
    statusText: { fontSize: 16, color: '#54656F', textAlign: 'center', marginTop: 15 },
    errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
    chatItem: { 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white', 
        padding: 20, 
        marginVertical: 8, 
        marginHorizontal: 16, 
        borderRadius: 12, 
        elevation: 2, 
        borderWidth: 1, 
        borderColor: '#E0E0E0' 
    },
    chatImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#e0e0e0',
    },
    chatName: { fontSize: 18, fontWeight: '500', color: '#111B21' },
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

