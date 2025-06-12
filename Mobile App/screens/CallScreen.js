// import React, { useState, useRef } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// import { Audio } from 'expo-av';
// import LottieView from 'lottie-react-native';
// import axios from 'axios';
// import * as FileSystem from 'expo-file-system';


// export default function VoiceChat() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [replyText, setReplyText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [sound, setSound] = useState(null);
//   const lottieRef = useRef();

//   const recordRef = useRef(null);

//   const startRecording = async () => {
//     try {
//       setReplyText('');
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const recording = new Audio.Recording();
//       await recording.prepareToRecordAsync(
//         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//       );
//       await recording.startAsync();
//       recordRef.current = recording;
//       setIsRecording(true);
//     } catch (err) {
//       console.error('Failed to start recording', err);
//     }
//   };

//   const stopRecording = async () => {
//     setIsRecording(false);
//     try {
//       const recording = recordRef.current;
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();

//       setLoading(true);

//       const formData = new FormData();
//       formData.append('file', {
//         uri,
//         name: 'voice.mp3',
//         type: 'audio/mp3',
//       });

//       const response = await axios.post('https://3b76-34-125-3-76.ngrok-free.app/call', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         responseType: 'blob',
//       });
      
//       const blob = response.data;
//       const reader = new FileReader();
      
//       reader.onload = async () => {
//         const base64data = reader.result.split(',')[1];
      
//         const fileUri = FileSystem.documentDirectory + 'response.wav';
//         await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
      
//         const soundObject = new Audio.Sound();
//         await soundObject.loadAsync({ uri: fileUri });
//         await soundObject.playAsync();
//         lottieRef.current?.play();

//         setReplyText("✅ Reply played!");
//         setSound(soundObject);
//       };
      
//       reader.readAsDataURL(blob);
//     } catch (error) {
//       console.error('Error during call:', error);
//       setReplyText("❌ Error processing the voice.");
//     } finally {
//       setLoading(false);
//       lottieRef.current?.reset();
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>🎙️ Voice Mood</Text>

//       <LottieView
//         ref={lottieRef}
//         source={require('../assets/character.json')}
//         autoPlay={false}
//         loop
//         style={{ width: 500, height: 500 }}
//       />

//       <TouchableOpacity
//         style={[styles.button, isRecording ? styles.buttonStop : styles.buttonStart]}
//         onPress={isRecording ? stopRecording : startRecording}
//       >
//         <Text style={styles.buttonText}>
//           {isRecording ? '🛑 Stop Recording' : '🎤 Start Talking'}
//         </Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
//       {replyText !== '' && <Text style={styles.reply}>{replyText}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
//   title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
//   button: { padding: 15, borderRadius: 10 },
//   buttonStart: { backgroundColor: '#007AFF' },
//   buttonStop: { backgroundColor: 'red' },
//   buttonText: { color: '#fff', fontSize: 18 },
//   reply: { marginTop: 20, fontSize: 16, color: 'green' },
// });
























































































import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
    ImageBackground, Image, Alert,Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import axios from 'axios'; // ستستخدمه لإرسال الطلب
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // أيقونات إضافية
import { useNavigation, useRoute } from '@react-navigation/native';

// !!! تأكد أن هذا هو الرابط الصحيح لـ Ngrok الخاص بك !!!
const API_BASE_URL = 'https://da65-34-125-204-7.ngrok-free.app'; // نفس الرابط المستخدم في ChatScreen

const backgroundImage = require('../assets/45.jpg'); // نفس الخلفية
const botTalkingAnimation = require('../assets/bot-talking.json'); // أنيميشن تحدث البوت
const characterLottie = require('../assets/character.json'); // الأنيميشن الأصلي للشخصية

export default function CallScreen() {
    const [characterName, setCharacterName] = useState('');
    const [characterImage, setCharacterImage] = useState(null);
    const [characterId, setCharacterId] = useState(null);
    const [messages, setMessages] = useState([]); // لتخزين سجل الدردشة من AsyncStorage

    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // تم تغيير اسم loading إلى isLoading لتجنب التعارض
    const [isBotSpeaking, setIsBotSpeaking] = useState(false); // لتشغيل أنيميشن تحدث البوت
    const [statusText, setStatusText] = useState(''); // لعرض حالة الرد

    const recordingRef = useRef(null); // لتخزين كائن التسجيل
    const soundRef = useRef(null); // لتخزين كائن الصوت للرد
    const lottieTalkingRef = useRef(null); // للتحكم في أنيميشن تحدث البوت
    const characterLottieRef = useRef(null); // للتحكم في أنيميشن الشخصية الافتراضي

    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        const { selectedCharacter } = route.params || {};
        if (selectedCharacter && selectedCharacter.id) {
            setCharacterName(selectedCharacter.name || 'Character');
            setCharacterImage(selectedCharacter.image || null);
            setCharacterId(selectedCharacter.id);
            loadMessages(selectedCharacter.id); // تحميل سجل الدردشة
            setStatusText(`اضغط لبدء التحدث مع ${selectedCharacter.name || 'الشخصية'}`);
        } else {
            Alert.alert("خطأ", "لم يتم العثور على بيانات الشخصية.", [{ text: "موافق", onPress: () => navigation.goBack() }]);
        }

        // إعداد وضع الصوت
        Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true, // مهم لتشغيل الصوت حتى لو كان الجهاز صامتًا
            // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // يمكنك تجربتها إذا واجهت مشاكل تداخل
            // playsInSilentModeIOS: true,
        });


        return () => {
            // تنظيف عند إلغاء تحميل الكومبوننت
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(e => console.log("Error unloading sound on unmount:", e));
            }
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(e => console.log("Error stopping/unloading recording on unmount:", e));
            }
        };
    }, [route.params, navigation]);

    const getMessagesKey = (charId) => `chatMessages_${charId}`;

    const loadMessages = async (charId) => {
        if (!charId) return;
        try {
            const savedMessages = await AsyncStorage.getItem(getMessagesKey(charId));
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            } else {
                setMessages([]); // لا توجد رسائل، لا بأس، الباك اند سيعالج هذا
            }
        } catch (error) {
            console.error("فشل تحميل الرسائل في شاشة الاتصال:", error);
            setMessages([]);
        }
    };

    // نفس دالة إعداد سجل الدردشة من ChatScreen
    const prepareChatHistory = (currentMessagesState) => {
        const historyForBackend = [];
        for (let i = currentMessagesState.length - 1; i >= 0; i--) {
            const msg = currentMessagesState[i];
            let messageEntry = "";
            if (msg.sender === 'user') {
                const userText = msg.audio && msg.transcript ? msg.transcript : msg.text;
                if (userText && userText.trim() !== "") {
                    messageEntry = `user: ${userText}`;
                }
            } else if (msg.sender === 'bot' && msg.text && msg.text.trim() !== "") {
                if (msg.id.startsWith('bot_welcome_') && currentMessagesState.filter(m => m.sender === 'bot').length === 1 && currentMessagesState.length === 1) {
                    // Skip initial welcome message
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


    const startRecording = async () => {
        if (isRecording || isLoading) return;
        setIsBotSpeaking(false); // أوقف أنيميشن البوت إذا كان يعمل
        lottieTalkingRef.current?.reset();

        try {
            setStatusText('جارٍ التسجيل...');
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('الإذن مطلوب', 'مطلوب إذن للوصول إلى الميكروفون!');
                setStatusText('فشل بدء التسجيل: الإذن مرفوض');
                return;
            }

            // تأكد من إيقاف وتفريغ أي تسجيل أو صوت سابق
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync().catch(e => console.log("Error stopping prev recording:", e));
                recordingRef.current = null;
            }
            if (soundRef.current) {
                await soundRef.current.stopAsync().catch(e => console.log("Error stopping prev sound:", e));
                await soundRef.current.unloadAsync().catch(e => console.log("Error unloading prev sound:", e));
                soundRef.current = null;
            }


            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY // Expo SDK 49+
                // Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY // Expo SDK < 49
            );
            recordingRef.current = newRecording; // قم بتعيين newRecording إلى recordingRef.current
            await recordingRef.current.startAsync();
            setIsRecording(true);
             
        } catch (err) {
            console.error('فشل بدء التسجيل', err);
            setStatusText(`خطأ: ${err.message}`);
            setIsRecording(false);
            characterLottieRef.current?.reset();
        }
    };

    const stopRecordingAndSend = async () => {
        if (!isRecording || !recordingRef.current) return; // تأكد أن هناك تسجيل لإيقافه
        setIsRecording(false);
        setIsLoading(true);
        characterLottieRef.current?.reset();
        setStatusText('جارٍ إيقاف التسجيل وإرسال الصوت...');

        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null; // مهم لتفريغ المورد

            if (!uri) {
                throw new Error("لم يتم الحصول على URI للتسجيل.");
            }

            setStatusText('جارٍ معالجة صوتك...');

            const formData = new FormData();
            formData.append('characterId', characterId); // **مهم جداً للباك إند**
            formData.append('file', {
                uri,
                name: `voice-${Date.now()}.mp3`, // اسم ملف فريد
                type: Platform.OS === 'ios' ? 'audio/x-m4a' : 'audio/mp3', // قد تحتاج لتعديل النوع حسب نظام التشغيل أو إعدادات التسجيل
            });
            const chatHistoryPayload = prepareChatHistory(messages);
            formData.append('chat_history_str', chatHistoryPayload); // **إرسال سجل الدردشة**

            const response = await axios.post(`${API_BASE_URL}/call`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // الباك اند يعيد ملف صوتي مباشرة
            });

            if (response.status !== 200) {
                throw new Error(`خطأ من الخادم: ${response.status}`);
            }
            setStatusText('تم استلام الرد، جارٍ التشغيل...');
            setIsBotSpeaking(true);
            lottieTalkingRef.current?.play();


            const blob = response.data;
            const reader = new FileReader();

            reader.onload = async () => {
                try {
                    const base64data = reader.result.split(',')[1];
                    const filename = `response-${Date.now()}.wav`; // اسم ملف فريد
                    const fileUri = FileSystem.documentDirectory + filename;

                    await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });

                    if (soundRef.current) { // تأكد من تفريغ الصوت السابق إذا كان موجودًا
                        await soundRef.current.unloadAsync().catch(e => console.log("Error unloading prev sound before playing new:", e));
                    }

                    const newSound = new Audio.Sound();
                    soundRef.current = newSound; // تخزين كائن الصوت الجديد

                    await newSound.loadAsync({ uri: fileUri });
                    newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
                    await newSound.playAsync();
                    characterLottieRef.current?.play();// لا تقم بتعيين isBotSpeaking هنا، دعه لـ onPlaybackStatusUpdate

                } catch (playbackError) {
                    console.error('خطأ أثناء إعداد أو تشغيل صوت الرد:', playbackError);
                    setStatusText(`خطأ في تشغيل الرد: ${playbackError.message}`);
                    setIsBotSpeaking(false);
                    lottieTalkingRef.current?.reset();
                }
            };

            reader.onerror = (error) => {
                console.error('خطأ FileReader:', error);
                setStatusText('خطأ في قراءة بيانات الرد.');
                setIsBotSpeaking(false);
                lottieTalkingRef.current?.reset();
            };

            reader.readAsDataURL(blob);

        } catch (error) {
            console.error('خطأ أثناء الاتصال أو معالجة الصوت:', error);
            let errorMessage = "خطأ في معالجة الصوت.";
            if (error.response) {
                // خطأ من الخادم (مثل 4xx, 5xx)
                // حاول قراءة الخطأ من الـ blob إذا كان الخادم يعيد JSON للخطأ
                // هذا الجزء معقد لأن responseType هو 'blob'
                console.error('بيانات الخطأ من الخادم:', error.response.data);
                errorMessage = `فشل الاتصال بالخادم (الكود: ${error.response.status}).`;
            } else if (error.request) {
                // الطلب تم ولكن لم يتم تلقي رد
                errorMessage = "لم يتم تلقي رد من الخادم. تحقق من الاتصال.";
            } else {
                // خطأ آخر (مشكلة في الإعداد، إلخ)
                errorMessage = error.message || "حدث خطأ غير متوقع.";
            }
            setStatusText(`❌ ${errorMessage}`);
            setIsBotSpeaking(false);
            lottieTalkingRef.current?.reset();
        } finally {
            setIsLoading(false);
            // لا تقم بإعادة تعيين lottieTalkingRef هنا إذا كان من المفترض أن يبدأ التشغيل
        }
    };

    const onPlaybackStatusUpdate = (playbackStatus) => {
        if (!playbackStatus.isLoaded) {
            if (playbackStatus.error) {
                console.log(`خطأ فادح أثناء التشغيل: ${playbackStatus.error}`);
                setStatusText(`خطأ أثناء تشغيل الصوت: ${playbackStatus.error}`);
            }
            // إذا لم يتم التحميل (بسبب خطأ أو انتهاء)، أوقف الأنيميشن
            setIsBotSpeaking(false);
            lottieTalkingRef.current?.reset();
            if (soundRef.current) {
                 soundRef.current.unloadAsync().catch(e => console.log("Error unloading sound on status update (not loaded):", e));
            }
        } else {
            if (playbackStatus.isPlaying) {
                setStatusText(`${characterName} يتحدث...`);
                // isBotSpeaking يجب أن يكون true بالفعل
            } else {
                 // توقف مؤقت أو اكتمل
            }

            if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
                setStatusText(`انتهى رد ${characterName}. اضغط للتحدث مرة أخرى.`);
                setIsBotSpeaking(false);
                lottieTalkingRef.current?.reset();
                if (soundRef.current) {
                     soundRef.current.unloadAsync().catch(e => console.log("Error unloading sound after finishing:", e));
                }
            }
        }
    };

    const handleHangUp = async () => {
        setStatusText("إنهاء المكالمة...");
        setIsRecording(false);
        setIsLoading(false);
        setIsBotSpeaking(false);

        if (recordingRef.current) {
            try {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            } catch (e) { console.log("Error stopping recording on hangup:", e); }
        }
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync(); // إيقاف التشغيل فوراً
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            } catch (e) { console.log("Error stopping/unloading sound on hangup:", e); }
        }
        lottieTalkingRef.current?.reset();
        characterLottieRef.current?.reset();
        navigation.goBack();
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
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    {characterImage ? (
                        <Image source={{ uri: characterImage }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={30} color="#fff" />
                        </View>
                    )}
                    <Text style={styles.characterNameHeader}>{characterName}</Text>
                    <View style={styles.headerIcons}>
                        {isBotSpeaking && (
                            <LottieView
                                ref={lottieTalkingRef}
                                source={botTalkingAnimation} // أنيميشن عندما يتحدث البوت
                                autoPlay={false} // سيتم التحكم به يدويًا
                                loop
                                style={styles.lottieAnimationSmall}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.lottieContainer}>
                    <LottieView
                        ref={characterLottieRef}
                        source={characterLottie} // الأنيميشن الرئيسي للشخصية
                        autoPlay={false}
                        loop
                        style={styles.lottieAnimationLarge}
                    />
                </View>

                <Text style={styles.statusText}>{statusText}</Text>

                {isLoading && <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />}

                <View style={styles.controlsContainer}>
                    <TouchableOpacity
                        style={[styles.button, isRecording ? styles.buttonStop : styles.buttonStart, (isLoading || (isBotSpeaking && !isRecording)) && styles.buttonDisabled]}
                        onPress={isRecording ? stopRecordingAndSend : startRecording}
                        disabled={isLoading || (isBotSpeaking && !isRecording)} // تعطيل الزر أثناء التحميل أو إذا كان البوت يتحدث ولم يكن المستخدم يسجل
                    >
                        <Ionicons name={isRecording ? "stop-circle-outline" : "mic-circle-outline"} size={40} color="#fff" />
                        <Text style={styles.buttonText}>
                            {isRecording ? 'أوقف التسجيل وأرسل' : (isBotSpeaking ? `${characterName} يتحدث...` : 'ابدأ التحدث')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.hangUpButton, isLoading && styles.buttonDisabled]}
                        onPress={handleHangUp}
                        disabled={isLoading}
                    >
                        <MaterialIcons name="call-end" size={36} color="#fff" />
                        <Text style={styles.buttonText}>إنهاء المكالمة</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between', // لتوزيع العناصر
        paddingVertical: 20,
    },
    fullScreenLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        marginBottom: 20, // مسافة أسفل الهيدر
    },
    backButton: {
        marginRight: 15,
        padding:5,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterNameHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1, // ليأخذ المساحة المتبقية ويدفع الأيقونات الأخرى لليمين
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lottieAnimationSmall: { // أنيميشن البوت الصغير في الهيدر
        width: 50,
        height: 50,
    },
    lottieContainer: {
        flex: 1, // يأخذ معظم المساحة المتاحة في الوسط
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    lottieAnimationLarge: { // الأنيميشن الرئيسي للشخصية
        width: 500, // أو الحجم الذي تراه مناسبًا
        height: 500,
    },
    statusText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginVertical: 15,
        paddingHorizontal: 20,
    },
    controlsContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 20, // مسافة سفلية
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        marginVertical: 10, // مسافة بين الأزرار
        width: '80%', // عرض الزر
        minHeight: 60, // ارتفاع أدنى للزر
    },
    buttonStart: {
        backgroundColor: '#4CAF50', // أخضر
    },
    buttonStop: {
        backgroundColor: '#f44336', // أحمر
    },
    hangUpButton: {
        backgroundColor: '#E91E63', // لون مختلف لإنهاء المكالمة
    },
    buttonDisabled: {
        backgroundColor: '#9E9E9E', // رمادي عند التعطيل
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});