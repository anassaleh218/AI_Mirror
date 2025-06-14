import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
    KeyboardAvoidingView, Platform, ImageBackground, Image, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// !!! تأكد أن هذا هو الرابط الصحيح لـ Ngrok الخاص بك !!!
const API_BASE_URL = 'https://1dfe-34-34-115-170.ngrok-free.app'; // تم استخدام الرابط الذي وفرته سابقًا

const backgroundImage = require('../assets/45.jpg'); // تأكد أن المسار صحيح أو قم بتعديله
const botTalkingAnimation = require('../assets/bot-talking.json'); // تأكد أن المسار صحيح أو قم بتعديله

export default function ChatScreen() { // تم تغيير اسم الكومبوننت ليتبع نمط CharacterScreen
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [characterImage, setCharacterImage] = useState(null);
    const [characterId, setCharacterId] = useState(null); // سيُستخدم لإرسال الطلبات ولـ AsyncStorage

    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const flatListRef = useRef(null);

    useEffect(() => {
        const { selectedCharacter } = route.params || {};
        if (selectedCharacter && selectedCharacter.id) {
            setCharacterName(selectedCharacter.name || 'Character');
            setCharacterImage(selectedCharacter.image || null); // يجب أن يكون selectedCharacter.image هو URI
            setCharacterId(selectedCharacter.id);
            loadMessages(selectedCharacter.id);
        } else {
            Alert.alert("خطأ", "لم يتم العثور على بيانات الشخصية. يرجى العودة واختيار شخصية.", [{ text: "موافق", onPress: () => navigation.goBack() }]);
        }
    }, [route.params, navigation]);

    const getMessagesKey = (charId) => `chatMessages_${charId}`;

    const loadMessages = async (charId) => {
        if (!charId) return;
        try {
            const savedMessages = await AsyncStorage.getItem(getMessagesKey(charId));
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            } else {
                // إرسال رسالة ترحيبية أولية من البوت إذا لم تكن هناك رسائل محفوظة
                const initialBotMessage = {
                    id: `bot_welcome_${Date.now()}`,
                    text: `مرحباً! أنا ${characterName || 'الشخصية'}. كيف يمكنني مساعدتك اليوم؟`,
                    sender: 'bot',
                };
                setMessages([initialBotMessage]); // ابدأ برسالة البوت
            }
        } catch (error) {
            console.error("فشل تحميل الرسائل:", error);
            setMessages([]); // ابدأ بمصفوفة فارغة في حالة الخطأ
        }
    };

    const saveMessages = async (updatedMessages, charId) => {
        if (!charId) return;
        try {
            await AsyncStorage.setItem(getMessagesKey(charId), JSON.stringify(updatedMessages));
        } catch (error) {
            console.error("فشل حفظ الرسائل:", error);
        }
    };

    const prepareChatHistory = (currentMessagesState) => {
        const historyForBackend = [];
        // currentMessagesState هي الأحدث أولاً: [msgN, msgN-1, ..., msg1]
        // الباك إند يتوقع السجل بترتيب زمني (الأقدم أولاً)
        for (let i = currentMessagesState.length - 1; i >= 0; i--) {
            const msg = currentMessagesState[i];
            let messageEntry = "";
            if (msg.sender === 'user') {
                const userText = msg.audio && msg.transcript ? msg.transcript : msg.text;
                if (userText && userText.trim() !== "") {
                    messageEntry = `user: ${userText}`;
                }
            } else if (msg.sender === 'bot' && msg.text && msg.text.trim() !== "") {
                 // لا نضيف رسالة الترحيب الأولية إذا كانت هي الرسالة الوحيدة للبوت
                if (msg.id.startsWith('bot_welcome_') && currentMessagesState.filter(m => m.sender === 'bot').length === 1 && currentMessagesState.length === 1) {
                    // Skip initial welcome message from history if it's the only bot message
                } else {
                    messageEntry = `bot: ${msg.text}`;
                }
            }
            if (messageEntry) {
                historyForBackend.push(messageEntry);
            }
        }
        return JSON.stringify(historyForBackend);
    };


    const sendMessage = async () => {
        if (inputText.trim() === '' || isSending || !characterId) return;
        if (!API_BASE_URL || API_BASE_URL.includes('YOUR_NGROK_SUBDOMAIN')) { // تحقق محسن
            Alert.alert('خطأ في الـ API', 'الرجاء التأكد من تكوين API_BASE_URL بشكل صحيح.');
            return;
        }

        const chatHistoryPayload = prepareChatHistory(messages);

        const userMessage = {
            id: `user_${Date.now()}`,
            text: inputText,
            sender: 'user',
        };

        const updatedMessagesWithUser = [userMessage, ...messages];
        setMessages(updatedMessagesWithUser);
        saveMessages(updatedMessagesWithUser, characterId);
        setInputText('');
        setIsSending(true);
        setIsBotSpeaking(true);

        try {
            const formData = new FormData();
            formData.append('characterId', characterId);
            formData.append('message', userMessage.text);
            formData.append('chat_history_str', chatHistoryPayload);

            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                body: formData,
                // 'Content-Type': 'multipart/form-data' يتم تعيينه تلقائيًا بواسطة fetch لـ FormData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`خطأ من الخادم: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const botReply = {
                id: `bot_${Date.now()}`,
                text: data.reply || 'عفواً، لم أستطع معالجة ذلك.',
                sender: 'bot',
            };

            setMessages(prevMessages => {
                const finalMessages = [botReply, ...prevMessages]; // prevMessages هنا هي updatedMessagesWithUser
                saveMessages(finalMessages, characterId);
                return finalMessages;
            });

        } catch (err) {
            console.error("خطأ في إرسال الرسالة:", err);
            Alert.alert("خطأ", `فشل الحصول على رد: ${err.message}`);
            // يمكنك هنا إعادة الرسالة التي فشل إرسالها أو تمييزها كفاشلة
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== userMessage.id)); // إزالة رسالة المستخدم إذا فشل الإرسال
        } finally {
            setIsSending(false);
            setIsBotSpeaking(false);
            scrollToBottom();
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('الإذن مطلوب', 'مطلوب إذن للوصول إلى الميكروفون!');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY // Expo SDK 49+
                // Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY // Expo SDK < 49
            );
            setRecording(newRecording);
            setIsRecording(true);
        } catch (err) {
            console.error('فشل بدء التسجيل', err);
            Alert.alert("خطأ في التسجيل", "لم يتمكن من بدء التسجيل.");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (uri) {
                await sendAudioMessage(uri);
            }
        } catch (err) {
            console.error('فشل إيقاف التسجيل أو إرسال الصوت', err);
            Alert.alert("خطأ في التسجيل", "لم يتمكن من إيقاف التسجيل أو معالجة الصوت.");
        }
    };

    const sendAudioMessage = async (audioUri) => {
        if (!characterId) return;
        if (!API_BASE_URL || API_BASE_URL.includes('YOUR_NGROK_SUBDOMAIN')) {
            Alert.alert('خطأ في الـ API', 'الرجاء التأكد من تكوين API_BASE_URL بشكل صحيح.');
            return;
        }

        setIsSending(true);
        setIsBotSpeaking(true);

        const chatHistoryPayload = prepareChatHistory(messages); // سجل الدردشة قبل الرسالة الصوتية الحالية

        // رسالة صوتية للمستخدم (تحديث واجهة المستخدم بشكل متفائل قبل النسخ)
        const userAudioMessageOptimistic = {
            id: `user_audio_${Date.now()}`,
            audio: audioUri,
            transcript: "جاري معالجة الصوت...", // نص مبدئي
            sender: 'user',
        };
        setMessages(prevMessages => [userAudioMessageOptimistic, ...prevMessages]);


        try {
            const formData = new FormData();
            const filename = audioUri.split('/').pop();
            const typeMatch = /\.(\w+)$/.exec(filename);
            const type = typeMatch ? `audio/${typeMatch[1]}` : 'audio/m4a'; // اضبط حسب الضرورة

            formData.append('characterId', characterId); // **مهم جداً للباك إند**
            formData.append('file', {
                uri: audioUri,
                name: filename,
                type: type,
            });
            formData.append('chat_history_str', chatHistoryPayload);

            const response = await fetch(`${API_BASE_URL}/chat`, { // استخدام نفس نقطة النهاية /chat
                method: 'POST',
                body: formData,
                 headers: { // مهم لـ FormData
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`خطأ من الخادم: ${response.status} - ${errorText}`);
            }

            const data = await response.json(); // الباك إند يعيد transcript و reply

            const userAudioMessageConfirmed = {
                id: userAudioMessageOptimistic.id, // استخدام نفس الـ ID للتحديث
                audio: audioUri,
                transcript: data.transcript || "رسالة صوتية (لا يوجد نص)",
                sender: 'user',
            };

            const botReply = {
                id: `bot_audio_reply_${Date.now()}`,
                text: data.reply || 'عفواً، لم أستطع معالجة هذا الصوت.',
                sender: 'bot',
            };

            setMessages(prevMessages => {
                // تحديث الرسالة الصوتية الفعلية للمستخدم بالنسخ الصحيح وإضافة رد البوت
                const updatedMessages = prevMessages.map(msg =>
                    msg.id === userAudioMessageConfirmed.id ? userAudioMessageConfirmed : msg
                );
                const finalMessages = [botReply, ...updatedMessages];
                saveMessages(finalMessages, characterId);
                return finalMessages;
            });

        } catch (error) {
            console.error('خطأ في إرسال الصوت:', error);
            Alert.alert("خطأ في إرسال الصوت", `فشل إرسال الصوت: ${error.message}`);
            // إزالة الرسالة الصوتية المتفائلة إذا فشل الإرسال
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== userAudioMessageOptimistic.id));
        } finally {
            setIsSending(false);
            setIsBotSpeaking(false);
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
    }

    const AudioPlayer = ({ uri }) => {
        const soundRef = useRef(new Audio.Sound());
        const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

        useEffect(() => {
            return () => { // Unload sound when component unmounts or URI changes
                soundRef.current.getStatusAsync().then(status => {
                    if (status.isLoaded) {
                        soundRef.current.unloadAsync();
                    }
                }).catch(() => {}); // Ignore errors on cleanup
            };
        }, [uri]);

        const playSound = async () => {
            try {
                const { isLoaded, isPlaying: currentlyPlaying } = await soundRef.current.getStatusAsync();
                if (isLoaded) {
                    if (currentlyPlaying) {
                        await soundRef.current.pauseAsync();
                        setIsPlayerPlaying(false);
                    } else {
                        await soundRef.current.playAsync();
                        setIsPlayerPlaying(true);
                    }
                } else {
                    await soundRef.current.loadAsync({ uri });
                    await soundRef.current.playAsync();
                    setIsPlayerPlaying(true);
                    soundRef.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
                }
            } catch (e) {
                console.log('خطأ في تشغيل الصوت:', e);
                setIsPlayerPlaying(false);
                soundRef.current.getStatusAsync().then(s => { if (s.isLoaded) soundRef.current.unloadAsync(); }).catch(() => {});
                Alert.alert("خطأ في التشغيل", "لم يتمكن من تشغيل الصوت.");
            }
        };

        const onPlaybackStatusUpdate = (playbackStatus) => {
            if (!playbackStatus.isLoaded) {
                if (playbackStatus.error) {
                    console.log(`خطأ فادح أثناء التشغيل: ${playbackStatus.error}`);
                }
            } else {
                if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
                    setIsPlayerPlaying(false);
                    soundRef.current.unloadAsync().catch(() => {}); // Unload after finishing
                } else if (playbackStatus.isPlaying !== isPlayerPlaying) {
                    setIsPlayerPlaying(playbackStatus.isPlaying);
                }

            }
        };

        return (
            <TouchableOpacity onPress={playSound} disabled={isSending}>
                <Ionicons name={isPlayerPlaying ? 'pause-circle' : 'play-circle'} size={32} color={styles.audioIcon.color} />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        if (item.audio) { // رسالة صوتية
            return (
                <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
                    {!isUser && characterImage && <Image source={{ uri: characterImage }} style={styles.messageAvatar} />}
                    <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble, styles.audioMessageBubble]}>
                        <AudioPlayer uri={item.audio} />
                        {item.transcript && (
                            <Text style={[styles.messageText, styles.transcriptText, isUser ? styles.userMessageText : styles.botMessageText]}>
                                {item.transcript}
                            </Text>
                        )}
                    </View>
                    {/* يمكن إضافة صورة المستخدم هنا إذا أردت */}
                </View>
            );
        }
        // رسالة نصية
        return (
            <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
                {!isUser && characterImage && <Image source={{ uri: characterImage }} style={styles.messageAvatar} />}
                <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble]}>
                    <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{item.text}</Text>
                </View>
                {/* يمكن إضافة صورة المستخدم هنا إذا أردت */}
            </View>
        );
    };

    if (!characterId) {
        return (
            <ImageBackground source={backgroundImage} style={styles.fullScreenLoader} resizeMode="cover">
                <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>جاري تحميل معلومات الشخصية...</Text>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        {characterImage ? (
                            <Image source={{ uri: characterImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={24} color="#fff" />
                            </View>
                        )}
                        <Text style={styles.characterNameHeader}>{characterName}</Text>
                        <View style={styles.headerIcons}>
                            {isBotSpeaking && (
                                <LottieView
                                    source={botTalkingAnimation}
                                    autoPlay
                                    loop
                                    style={styles.lottieAnimation}
                                />
                            )}
                            <TouchableOpacity onPress={() => navigation.navigate('Call', { selectedCharacter: route.params?.selectedCharacter })}>
                                <MaterialIcons name="call" size={28} color="lightgreen" style={styles.callIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        inverted
                        contentContainerStyle={styles.messageListContent}
                        keyboardShouldPersistTaps="handled"
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="اكتب رسالة..."
                            placeholderTextColor="#ccc"
                            style={styles.input}
                            editable={!isSending && !isRecording} // تعديل هنا
                            multiline
                        />
                        {isSending && !isRecording && !isBotSpeaking ? ( // عرض مؤشر تحميل عام أثناء الإرسال ما لم يكن يسجل أو البوت يتحدث
                            <ActivityIndicator size="small" color={styles.iconButton.color} style={styles.iconButton} />
                        ) : inputText.trim() === '' ? (
                            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.iconButton} disabled={isSending}>
                                <Ionicons name={isRecording ? 'stop-circle' : 'mic-circle'} size={36} color={isRecording ? "red" : styles.iconButton.color} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={sendMessage} style={styles.iconButton} disabled={isSending}>
                                <Ionicons name="send" size={30} color={styles.iconButton.color} />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // طبقة داكنة خفيفة فوق الخلفية لتحسين القراءة
    },
    fullScreenLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.2)', // خلفية شفافة قليلاً للهيدر
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarPlaceholder: {
        backgroundColor: '#888',
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterNameHeader: { // تم تغيير الاسم ليكون أوضح
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lottieAnimation: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    callIcon: {
        paddingLeft: 10, // مسافة بسيطة
    },
    messageListContent: {
        paddingHorizontal: 10,
        paddingBottom: 10, // مسافة سفلية للمحتوى لتجنب التداخل مع حقل الإدخال
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'flex-end', // لمحاذاة الصورة الرمزية مع أسفل الفقاعة
    },
    userMessageContainer: {
        justifyContent: 'flex-end', // رسائل المستخدم على اليمين
        marginLeft: 50, // مسافة لرسائل المستخدم
    },
    botMessageContainer: {
        justifyContent: 'flex-start', // رسائل البوت على اليسار
        marginRight: 50, // مسافة لرسائل البوت
    },
    messageAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 8,
        // marginBottom: 5, // إذا أردت أن تكون الصورة الرمزية محاذية تمامًا للفقاعة
    },
    messageBubble: {
        maxWidth: '80%', // عرض أقصى للفقاعة
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 18,
    },
    userMessageBubble: {
        backgroundColor: '#007AFF', // أزرق iMessage للمستخدم
        borderTopRightRadius: 5, // لجعلها تبدو مثل فقاعات iMessage
    },
    botMessageBubble: {
        backgroundColor: '#E5E5EA', // رمادي iMessage للبوت
        borderTopLeftRadius: 5,
    },
    audioMessageBubble: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row', // لوضع زر التشغيل والنص بجانب بعضهما
        alignItems: 'center',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userMessageText: {
        color: '#fff',
    },
    botMessageText: {
        color: '#000',
    },
    transcriptText: {
        marginLeft: 8, // مسافة بين زر التشغيل والنص
        fontSize: 13,
        fontStyle: 'italic',
        // لون النص للنسخ يمكن أن يكون نفس لون الرسالة أو مختلفًا قليلاً
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.1)', // خلفية شفافة قليلاً لحقل الإدخال
    },
    input: {
        flex: 1,
        minHeight: 40, // ارتفاع أدنى
        maxHeight: 120, // ارتفاع أقصى لتجنب أن يصبح كبيرًا جدًا
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10, // تعديل الحشو العمودي ليتناسب مع minHeight
        fontSize: 16,
        color: '#fff',
        marginRight: 10,
    },
    iconButton: {
        padding: 5,
        color: '#007AFF', // لون الأيقونات ليتناسب مع فقاعة المستخدم
    },
    audioIcon: { // لون أيقونة تشغيل الصوت
        color: '#fff', // إذا كانت داخل فقاعة المستخدم
        // color: '#000', // إذا كانت داخل فقاعة البوت (ستحتاج إلى تعديل منطق الألوان)
    },
});