// import React, { useState, useEffect, useRef } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     FlatList,
//     KeyboardAvoidingView,
//     Platform,
//     ImageBackground,
//     Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const backgroundImage = require('../assets/45.jpg');

// export default function Chat() {
//     const [messages, setMessages] = useState([]);
//     const [inputText, setInputText] = useState('');
//     const [userName, setUserName] = useState('');
//     const [isSending, setIsSending] = useState(false);

//     // const userImageRef = useRef(null);
//     const [userImage, setUserImage] = useState(null);

//     const flatListRef = useRef(null);
//     const systemPromptRef = useRef('You are simulating a person.');

//     const loadUserData = async () => {
//         try {
//             const savedCharacter = await AsyncStorage.getItem('character'); // ← هنا غيرنا المفتاح
//             if (savedCharacter) {
//                 const data = JSON.parse(savedCharacter);
//                 setUserName(data.name || '');
//                 setUserImage(data.image || null);
//                 systemPromptRef.current = data; // لو بتستخدم البرومبت من الشخصية
//             }
//         } catch (error) {
//             console.error('Error loading user data:', error);
//         }
//     };




//     const loadMessages = async () => {
//         try {
//             const savedMessages = await AsyncStorage.getItem('chatMessages');
//             if (savedMessages) {
//                 setMessages(JSON.parse(savedMessages));
//             }
//         } catch (error) {
//             console.error('Error loading messages:', error);
//         }
//     };

//     const saveMessages = async (updatedMessages) => {
//         try {
//             await AsyncStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
//         } catch (error) {
//             console.error('Error saving messages:', error);
//         }
//     };

//     useEffect(() => {
//         loadUserData();
//         loadMessages();
//     }, []);

//     // const handlePickImage = async () => {
//     //     const result = await ImagePicker.launchImageLibraryAsync({
//     //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     //         allowsEditing: true,
//     //         aspect: [4, 3],
//     //         quality: 1,
//     //     });

//     //     if (!result.canceled) {
//     //         setUserImage(result.assets[0].uri);
//     //     }
//     // };

//     const sendMessage = async () => {
//         if (inputText.trim() === '' || isSending) return;

//         setIsSending(true);

//         const userMessage = {
//             id: Date.now().toString(),
//             text: inputText,
//             sender: 'user',
//             image: userImage.current,
//         };

//         setMessages(prevMessages => {
//             const newMessages = [userMessage, ...prevMessages];
//             saveMessages(newMessages);
//             return newMessages;
//         });

//         setInputText('');

//         try {
//             const response = await fetch('https://59c8-34-142-255-56.ngrok-free.app/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ message: inputText }),
//             });

//             const data = await response.json();

//             const botReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: data.reply || 'No response',
//                 sender: 'bot',
//             };

//             setMessages(prevMessages => {
//                 const newMessages = [botReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } catch (error) {
//             console.error('Error:', error);
//             const errorReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: 'حدث خطأ أثناء الاتصال بالسيرفر.',
//                 sender: 'bot',
//             };
//             setMessages(prevMessages => {
//                 const newMessages = [errorReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } finally {
//             setIsSending(false);
//             setTimeout(() => {
//                 flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//             }, 100);
//         }
//     };

//     const renderItem = ({ item }) => (
//         <View
//             style={[
//                 styles.messageContainer,
//                 item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
//             ]}
//         >
//             {item.sender === 'bot' && item.image && (
//                 <Image source={{ uri: item.image }} style={styles.profileImage} />
//             )}
//             <View
//                 style={[
//                     styles.messageBubble,
//                     item.sender === 'user' ? styles.userBubble : styles.botBubble,
//                 ]}
//             >
//                 <Text style={styles.messageText}>{item.text}</Text>
//             </View>
//         </View>
//     );

//     return (
//         <ImageBackground source={backgroundImage} style={styles.container}>
//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
//             >
//                 <SafeAreaView edges={['top']} style={styles.safeArea}>
//                     <View style={styles.header}>

//                         {userImage ? (
//                             <Image source={{ uri: userImage }} style={styles.avatar} />
//                         ) : (
//                             <View style={styles.placeholderAvatar} />
//                         )}
//                         <Text style={styles.username}>{userName}</Text>
//                     </View>

//                 </SafeAreaView>

//                 <FlatList
//                     ref={flatListRef}
//                     data={messages}
//                     renderItem={renderItem}
//                     keyExtractor={item => item.id}
//                     inverted
//                     contentContainerStyle={{ padding: 10, flexGrow: 1 }}
//                     style={{ flex: 1 }}
//                     keyboardShouldPersistTaps="handled"
//                 />

//                 <View style={styles.inputContainer}>
//                     <TextInput
//                         value={inputText}
//                         onChangeText={setInputText}
//                         placeholder="Type a message..."
//                         style={styles.input}
//                     />
//                     <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//                         <Text style={styles.sendText}>Send</Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </ImageBackground>
//     );
// }

// const styles = StyleSheet.create({
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderColor: '#ddd',
//       },
//       avatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 10,
//       },
//       placeholderAvatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#ccc',
//         marginRight: 10,
//       },
//       username: {
//         fontSize: 18,
//         fontWeight: 'bold',
//       },

//     container: {
//         flex: 1,
//     },
//     safeArea: {
//         backgroundColor: '#fff',
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderColor: '#ddd',
//     },
//     headerImage: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 10,
//     },
//     headerText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     messageContainer: {
//         flexDirection: 'row',
//         marginVertical: 5,
//     },
//     profileImage: {
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         marginRight: 10,
//         alignSelf: 'flex-start',
//     },
//     messageBubble: {
//         padding: 10,
//         borderRadius: 10,
//         maxWidth: '80%',
//     },
//     userMessageContainer: {
//         flexDirection: 'row-reverse',
//         alignSelf: 'flex-end',
//     },
//     botMessageContainer: {
//         flexDirection: 'row',
//         alignSelf: 'flex-start',
//     },
//     userBubble: {
//         backgroundColor: '#005c4b',
//     },
//     botBubble: {
//         backgroundColor: '#363636',
//     },
//     messageText: {
//         color: '#fff',
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         padding: 10,
//         backgroundColor: '#ffffffcc',
//     },
//     input: {
//         flex: 1,
//         backgroundColor: '#fff',
//         paddingHorizontal: 15,
//         paddingVertical: 10,
//         borderRadius: 25,
//         borderWidth: 1,
//         borderColor: '#ccc',
//     },
//     sendButton: {
//         justifyContent: 'center',
//         paddingHorizontal: 15,
//     },
//     sendText: {
//         color: '#007AFF',
//         fontWeight: 'bold',
//     },
// });






//2
// import React, { useState, useEffect, useRef } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     FlatList,
//     KeyboardAvoidingView,
//     Platform,
//     ImageBackground,
//     Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Audio } from 'expo-av';  // استيراد مكتبة تسجيل الصوت

// const backgroundImage = require('../assets/45.jpg');

// export default function Chat() {
//     const [messages, setMessages] = useState([]);
//     const [inputText, setInputText] = useState('');
//     const [userName, setUserName] = useState('');
//     const [isSending, setIsSending] = useState(false);
//     const [recording, setRecording] = useState(null);      // لتخزين تسجيل الصوت
//     const [isRecording, setIsRecording] = useState(false);   // لتتبع حالة التسجيل
//     const [userImage, setUserImage] = useState(null);

//     const flatListRef = useRef(null);
//     const systemPromptRef = useRef('You are simulating a person.');

//     // تحميل بيانات المستخدم والرسائل
//     const loadUserData = async () => {
//         try {
//             const savedCharacter = await AsyncStorage.getItem('character');
//             if (savedCharacter) {
//                 const data = JSON.parse(savedCharacter);
//                 setUserName(data.name || '');
//                 setUserImage(data.image || null);
//                 systemPromptRef.current = data; // لو بتستخدم البرومبت من الشخصية
//             }
//         } catch (error) {
//             console.error('Error loading user data:', error);
//         }
//     };

//     const loadMessages = async () => {
//         try {
//             const savedMessages = await AsyncStorage.getItem('chatMessages');
//             if (savedMessages) {
//                 setMessages(JSON.parse(savedMessages));
//             }
//         } catch (error) {
//             console.error('Error loading messages:', error);
//         }
//     };

//     const saveMessages = async (updatedMessages) => {
//         try {
//             await AsyncStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
//         } catch (error) {
//             console.error('Error saving messages:', error);
//         }
//     };

//     useEffect(() => {
//         loadUserData();
//         loadMessages();
//     }, []);

//     // دالة إرسال الرسائل النصية
//     const sendMessage = async () => {
//         if (inputText.trim() === '' || isSending) return;

//         setIsSending(true);

//         const userMessage = {
//             id: Date.now().toString(),
//             text: inputText,
//             sender: 'user',
//             // image: userImage.current, // إذا كنت تستخدم صورة المستخدم
//         };

//         setMessages(prevMessages => {
//             const newMessages = [userMessage, ...prevMessages];
//             saveMessages(newMessages);
//             return newMessages;
//         });

//         const textToSend = inputText; // تخزين النص قبل مسحه
//         setInputText('');

//         try {
//             const response = await fetch('https://85cf-35-196-143-154.ngrok-free.app/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ message: textToSend }),
//             });

//             const data = await response.json();

//             const botReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: data.reply || 'No response',
//                 sender: 'bot',
//             };

//             setMessages(prevMessages => {
//                 const newMessages = [botReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } catch (error) {
//             console.error('Error:', error);
//             const errorReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: 'حدث خطأ أثناء الاتصال بالسيرفر.',
//                 sender: 'bot',
//             };
//             setMessages(prevMessages => {
//                 const newMessages = [errorReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } finally {
//             setIsSending(false);
//             setTimeout(() => {
//                 flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//             }, 100);
//         }
//     };

//     // دوال تسجيل الصوت باستخدام expo-av
//     const startRecording = async () => {
//         try {
//             // طلب صلاحية الميكروفون
//             const permission = await Audio.requestPermissionsAsync();
//             if (permission.status !== 'granted') {
//                 alert('Permission to access microphone is required!');
//                 return;
//             }

//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true,
//             });

//             const { recording } = await Audio.Recording.createAsync(
//                 Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//             );
//             setRecording(recording);
//             setIsRecording(true);
//         } catch (err) {
//             console.error('Failed to start recording', err);
//         }
//     };

//     const stopRecording = async () => {
//         try {
//             if (!recording) return;
//             setIsRecording(false);
//             await recording.stopAndUnloadAsync();
//             const uri = recording.getURI();
//             console.log('Recording stopped and stored at', uri);
//             setRecording(null);

//             // إرسال ملف الصوت إلى الباك اند من خلال نقطة نهاية "/chat/audio"
//             await sendAudioMessage(uri);
//         } catch (err) {
//             console.error('Failed to stop recording', err);
//         }
//     };

//     // دالة إرسال ملف الصوت إلى الباك اند
//     const sendAudioMessage = async (audioUri) => {
//         try {
//             setIsSending(true);

//             // إنشاء FormData لإرسال ملف الصوت
//             const formData = new FormData();
//             formData.append('file', {
//                 uri: audioUri,
//                 name: 'recording.m4a', // أو أي امتداد مناسب حسب نظام التسجيل
//                 type: 'audio/x-m4a',
//             });

//             const response = await fetch('https://85cf-35-196-143-154.ngrok-free.app/chat', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//                 body: formData,
//             });

//             const data = await response.json();

//             // نفترض أن الباك اند بيرجع حقل "reply" والـ "whisper_text"
//             const botReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: data.reply || 'No response',
//                 sender: 'bot',
//             };

//             // إضافة رسالة الويسبر (النص الذي تم تحويله من التسجيل)
//             const whisperMessage = {
//                 id: Date.now().toString() + '_whisper',
//                 text: data.whisper_text || 'No transcript',
//                 sender: 'user',
//             };

//             // حفظ كل من رسالة الويسبر ورد البوت في الشات
//             setMessages(prevMessages => {
//                 const newMessages = [whisperMessage, botReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } catch (error) {
//             console.error('Error sending audio:', error);
//             const errorReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: 'حدث خطأ أثناء إرسال التسجيل للسيرفر.',
//                 sender: 'bot',
//             };
//             setMessages(prevMessages => {
//                 const newMessages = [errorReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } finally {
//             setIsSending(false);
//             setTimeout(() => {
//                 flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//             }, 100);
//         }
//     };

//     // دالة عرض الرسائل
//     const renderItem = ({ item }) => (
//         <View
//             style={[
//                 styles.messageContainer,
//                 item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
//             ]}
//         >
//             {item.sender === 'bot' && item.image && (
//                 <Image source={{ uri: item.image }} style={styles.profileImage} />
//             )}
//             <View
//                 style={[
//                     styles.messageBubble,
//                     item.sender === 'user' ? styles.userBubble : styles.botBubble,
//                 ]}
//             >
//                 <Text style={styles.messageText}>{item.text}</Text>
//             </View>
//         </View>
//     );

//     return (
//         <ImageBackground source={backgroundImage} style={styles.container}>
//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
//             >
//                 <SafeAreaView edges={['top']} style={styles.safeArea}>
//                     <View style={styles.header}>
//                         {userImage ? (
//                             <Image source={{ uri: userImage }} style={styles.avatar} />
//                         ) : (
//                             <View style={styles.placeholderAvatar} />
//                         )}
//                         <Text style={styles.username}>{userName}</Text>
//                     </View>
//                 </SafeAreaView>

//                 <FlatList
//                     ref={flatListRef}
//                     data={messages}
//                     renderItem={renderItem}
//                     keyExtractor={item => item.id}
//                     inverted
//                     contentContainerStyle={{ padding: 10, flexGrow: 1 }}
//                     style={{ flex: 1 }}
//                     keyboardShouldPersistTaps="handled"
//                 />

//                 <View style={styles.inputContainer}>
//                     <TextInput
//                         value={inputText}
//                         onChangeText={setInputText}
//                         placeholder="Type a message..."
//                         style={styles.input}
//                     />
//                     <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//                         <Text style={styles.sendText}>Send</Text>
//                     </TouchableOpacity>
//                     {/* زر لتسجيل الصوت */}
//                     <TouchableOpacity
//                         onPress={isRecording ? stopRecording : startRecording}
//                         style={[styles.sendButton, { marginLeft: 10 }]}
//                     >
//                         <Text style={styles.sendText}>
//                             {isRecording ? 'Stop Recording' : 'Record'}
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </ImageBackground>
//     );
// }

// const styles = StyleSheet.create({
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderColor: '#ddd',
//     },
//     avatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 10,
//     },
//     placeholderAvatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#ccc',
//         marginRight: 10,
//     },
//     username: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     container: {
//         flex: 1,
//     },
//     safeArea: {
//         backgroundColor: '#fff',
//     },
//     headerImage: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 10,
//     },
//     headerText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     messageContainer: {
//         flexDirection: 'row',
//         marginVertical: 5,
//     },
//     profileImage: {
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         marginRight: 10,
//         alignSelf: 'flex-start',
//     },
//     messageBubble: {
//         padding: 10,
//         borderRadius: 10,
//         maxWidth: '80%',
//     },
//     userMessageContainer: {
//         flexDirection: 'row-reverse',
//         alignSelf: 'flex-end',
//     },
//     botMessageContainer: {
//         flexDirection: 'row',
//         alignSelf: 'flex-start',
//     },
//     userBubble: {
//         backgroundColor: '#005c4b',
//     },
//     botBubble: {
//         backgroundColor: '#363636',
//     },
//     messageText: {
//         color: '#fff',
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         padding: 10,
//         backgroundColor: '#ffffffcc',
//     },
//     input: {
//         flex: 1,
//         backgroundColor: '#fff',
//         paddingHorizontal: 15,
//         paddingVertical: 10,
//         borderRadius: 25,
//         borderWidth: 1,
//         borderColor: '#ccc',
//     },
//     sendButton: {
//         justifyContent: 'center',
//         paddingHorizontal: 15,
//     },
//     sendText: {
//         color: '#007AFF',
//         fontWeight: 'bold',
//     },
// });













// //3
// // Chat.js
// import React, { useState, useEffect, useRef } from 'react';
// import {
//     View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
//     KeyboardAvoidingView, Platform, ImageBackground, Image
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import LottieView from 'lottie-react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';


// const API_BASE_URL = 'YOUR_NGROK_PUBLIC_URL'; 

// const backgroundImage = require('../assets/45.jpg');
// const botTalkingAnimation = require('../assets/bot-talking.json');

// export default function Chat() {
//     const [messages, setMessages] = useState([]);
//     const [inputText, setInputText] = useState('');
//     const [userName, setUserName] = useState('');
//     const [userImage, setUserImage] = useState(null);



//     const [recording, setRecording] = useState(null);
//     const [isRecording, setIsRecording] = useState(false);
//     const [isSending, setIsSending] = useState(false);
//     const [isBotSpeaking, setIsBotSpeaking] = useState(false);

//     const navigation = useNavigation();
//     const flatListRef = useRef(null);
//     const lottieRef = useRef();

//     useEffect(() => {
//         loadUserData();
//         loadMessages();
//     }, []);

//     const loadUserData = async () => {
//         const savedCharacter = await AsyncStorage.getItem('character');
//         if (savedCharacter) {
//             const data = JSON.parse(savedCharacter);
//             setUserName(data.name || '');
//             setUserImage(data.image || null);
//         }
//     };

//     const loadMessages = async () => {
//         const savedMessages = await AsyncStorage.getItem('chatMessages');
//         if (savedMessages) {
//             setMessages(JSON.parse(savedMessages));
//         }
//     };

//     const saveMessages = async (updatedMessages) => {
//         await AsyncStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
//     };

//     const sendMessage = async () => {
//         if (inputText.trim() === '' || isSending) return;

//         const userMessage = {
//             id: Date.now().toString(),
//             text: inputText,
//             sender: 'user',
//         };

//         const updated = [userMessage, ...messages];
//         setMessages(updated);
//         saveMessages(updated);
//         setInputText('');
//         setIsSending(true);

//         try {
//             const formData = new FormData();
//             formData.append('message', userMessage.text);
//             const response = await fetch('https://20d0-34-82-142-230.ngrok-free.app/chat', {
//                 method: 'POST',
//                 // headers: { 'Content-Type': 'application/json' },
//                 body: formData
//             });
//             const data = await response.json();
//             const botReply = {
//                 id: Date.now().toString() + '_bot',
//                 text: data.reply || 'No response',
//                 sender: 'bot',
//             };
//             const updatedMessages = [botReply, ...updated];
//             setMessages(updatedMessages);
//             saveMessages(updatedMessages);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setIsSending(false);
//         }
//     };

//     // دوال تسجيل الصوت باستخدام expo-av
//     const startRecording = async () => {
//         try {
//             // طلب صلاحية الميكروفون
//             const permission = await Audio.requestPermissionsAsync();
//             if (permission.status !== 'granted') {
//                 alert('Permission to access microphone is required!');
//                 return;
//             }

//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true,
//             });

//             const { recording } = await Audio.Recording.createAsync(
//                 Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//             );
//             setRecording(recording);
//             setIsRecording(true);
//         } catch (err) {
//             console.error('Failed to start recording', err);
//         }
//     };

//     const stopRecording = async () => {
//         try {
//             if (!recording) return;
//             setIsRecording(false);
//             await recording.stopAndUnloadAsync();
//             const uri = recording.getURI();
//             console.log('Recording stopped and stored at', uri);
//             setRecording(null);

//             // إرسال ملف الصوت إلى الباك اند من خلال نقطة نهاية "/chat/audio"
//             await sendAudioMessage(uri);
//         } catch (err) {
//             console.error('Failed to stop recording', err);
//         }
//     };


//     const sendAudioMessage = async (audioUri) => {
//         try {
//             setIsSending(true);

//             const formData = new FormData();
//             formData.append('file', {
//                 uri: audioUri,
//                 name: 'recording.m4a',
//                 type: 'audio/x-m4a',
//             });

//             const response = await fetch('https://20d0-34-82-142-230.ngrok-free.app/chat', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//                 body: formData,
//             });

//             const data = await response.json();

//             // ✅ أضف رسالة صوتية كمستخدم
//             const audioMessage = {
//                 id: Date.now().toString() + '_audio',
//                 audio: audioUri,
//                 transcript: data.transcript, 
//                 sender: 'user',
//             };

//             // ✅ أضف رد البوت
//             const botReply = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 text: data.reply || 'No response',
//                 sender: 'bot',
//             };

//             setMessages(prevMessages => {
//                 const newMessages = [audioMessage, botReply, ...prevMessages];
//                 saveMessages(newMessages);
//                 return newMessages;
//             });
//         } catch (error) {
//             console.error('Error sending audio:', error);
//         } finally {
//             setIsSending(false);
//             setTimeout(() => {
//                 flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//             }, 100);
//         }
//     };
//     ///////////////////////////////////////
//     const AudioPlayer = ({ uri }) => {
//         const sound = useRef(new Audio.Sound());
//         const [isPlaying, setIsPlaying] = useState(false);

//         const playSound = async () => {
//             try {
//                 if (!isPlaying) {
//                     await sound.current.loadAsync({ uri }, {}, true);
//                     await sound.current.playAsync();
//                     setIsPlaying(true);
//                     sound.current.setOnPlaybackStatusUpdate(status => {
//                         if (!status.isPlaying) {
//                             setIsPlaying(false);
//                             sound.current.unloadAsync();
//                         }
//                     });
//                 } else {
//                     await sound.current.stopAsync();
//                     await sound.current.unloadAsync();
//                     setIsPlaying(false);
//                 }
//             } catch (e) {
//                 console.log('Error playing sound:', e);
//             }
//         };

//         return (
//             <TouchableOpacity onPress={playSound}>
//                 <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
//             </TouchableOpacity>
//         );
//     };

//     const renderItem = ({ item }) => {
//         if (item.audio) {
//             return (
//                 <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
//                     <View style={styles.messageBubble}>
//                         <AudioPlayer uri={item.audio} />
//                         {item.transcript && (
//                             <Text style={[styles.messageText, { marginTop: 5, fontSize: 12, color: '#ccc' }]}>
//                                 {item.transcript}
//                             </Text>
//                         )}
//                     </View>
//                 </View>
//             );
//         }


//         return (
//             <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
//                 <View style={styles.messageBubble}>
//                     <Text style={styles.messageText}>{item.text}</Text>
//                 </View>
//             </View>
//         );
//     };


//     return (
//         <ImageBackground source={backgroundImage} style={styles.container}>
//             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
//                 <SafeAreaView style={{ flex: 1 }}>
//                     <View style={styles.header}>
//                         {userImage ? <Image source={{ uri: userImage }} style={styles.avatar} /> : <View style={styles.avatar} />}
//                         <Text style={styles.username}>{userName}</Text>
//                         <TouchableOpacity onPress={() => navigation.navigate('Call')}>
//                             <MaterialIcons name="call" size={24} color="green" style={{ marginLeft: 10 }} />
//                         </TouchableOpacity>
//                         {isBotSpeaking && (
//                             <LottieView
//                                 ref={lottieRef}
//                                 source={botTalkingAnimation}
//                                 loop
//                                 autoPlay
//                                 style={{ width: 40, height: 40, marginLeft: 10 }}
//                             />
//                         )}
//                     </View>
//                     <FlatList
//                         ref={flatListRef}
//                         data={messages}
//                         renderItem={renderItem}
//                         keyExtractor={item => item.id}
//                         inverted
//                         contentContainerStyle={{ padding: 10 }}
//                     />
//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             value={inputText}
//                             onChangeText={setInputText}
//                             placeholder="Type a message"
//                             style={styles.input}
//                         />
//                         {inputText.trim() === '' ? (
//                             <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.iconButton}>
//                                 <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={28} color="#007AFF" />
//                             </TouchableOpacity>
//                         ) : (
//                             <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
//                                 <Ionicons name="send" size={28} color="#007AFF" />
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                 </SafeAreaView>
//             </KeyboardAvoidingView>
//         </ImageBackground>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     header: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff' },
//     avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 10 },
//     username: { fontSize: 18, fontWeight: 'bold' },
//     messageContainer: { marginVertical: 5 },
//     userMessage: { alignSelf: 'flex-end' },
//     botMessage: { alignSelf: 'flex-start' },
//     messageBubble: { padding: 10, borderRadius: 10, backgroundColor: '#444', maxWidth: '80%' },
//     messageText: { color: '#fff' },
//     inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
//     input: { flex: 1, paddingHorizontal: 15, borderRadius: 25, borderWidth: 1, borderColor: '#ccc', height: 40 },
//     iconButton: { marginLeft: 10 },
// });








///////////////////////////////////////////////////////////////////////////




// const sendAudioMessage = async (audioUri) => {
//     try {
//         setIsSending(true);

//         // إنشاء FormData لإرسال ملف الصوت
//         const formData = new FormData();
//         formData.append('file', {
//             uri: audioUri,
//             name: 'recording.m4a', // أو أي امتداد مناسب حسب نظام التسجيل
//             type: 'audio/x-m4a',
//         });

//         const response = await fetch('https://85cf-35-196-143-154.ngrok-free.app/chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//             body: formData,
//         });

//         const data = await response.json();

//         // نفترض أن الباك اند بيرجع حقل "reply" والـ "whisper_text"
//         const botReply = {
//             id: Math.random().toString(36).substr(2, 9),
//             text: data.reply || 'No response',
//             sender: 'bot',
//         };

//         // إضافة رسالة الويسبر (النص الذي تم تحويله من التسجيل)
//         const whisperMessage = {
//             id: Date.now().toString() + '_whisper',
//             text: data.whisper_text || 'No transcript',
//             sender: 'user',
//         };

//         // حفظ كل من رسالة الويسبر ورد البوت في الشات
//         setMessages(prevMessages => {
//             const newMessages = [whisperMessage, botReply, ...prevMessages];
//             saveMessages(newMessages);
//             return newMessages;
//         });
//     } catch (error) {
//         console.error('Error sending audio:', error);
//         const errorReply = {
//             id: Math.random().toString(36).substr(2, 9),
//             text: 'حدث خطأ أثناء إرسال التسجيل للسيرفر.',
//             sender: 'bot',
//         };
//         setMessages(prevMessages => {
//             const newMessages = [errorReply, ...prevMessages];
//             saveMessages(newMessages);
//             return newMessages;
//         });
//     } finally {
//         setIsSending(false);
//         setTimeout(() => {
//             flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//         }, 100);
//     }
// };

//     const startCall = async () => {
//         const permission = await Audio.requestPermissionsAsync();
//         if (permission.status !== 'granted') return;
//         await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
//         const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
//         setRecording(recording);
//         setIsRecording(true);
//     };

//     const stopCall = async () => {
//         if (!recording) return;
//         setIsRecording(false);
//         await recording.stopAndUnloadAsync();
//         const uri = recording.getURI();
//         setRecording(null);
//         sendVoiceCall(uri);
//     };

//     const sendVoiceCall = async (audioUri) => {
//         setIsSending(true);
//         const formData = new FormData();
//         formData.append('file', {
//             uri: audioUri,
//             name: 'call.m4a',
//             type: 'audio/x-m4a',
//         });

//         try {
//             const response = await fetch('https://85cf-35-196-143-154.ngrok-free.app/call', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'multipart/form-data' },
//                 body: formData,
//             });
//             if (response.ok) {
//                 await playBotAudio(response);
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setIsSending(false);
//         }
//     };

//     const playBotAudio = async (response) => {
//         const blob = await response.blob();
//         const fileUri = FileSystem.documentDirectory + 'response.wav';
//         await FileSystem.writeAsStringAsync(fileUri, await blobToBase64(blob), { encoding: FileSystem.EncodingType.Base64 });

//         setIsBotSpeaking(true);
//         lottieRef.current?.play();

//         const soundObject = new Audio.Sound();
//         await soundObject.loadAsync({ uri: fileUri });
//         await soundObject.playAsync();
//         soundObject.setOnPlaybackStatusUpdate(status => {
//             if (status.didJustFinish) {
//                 soundObject.unloadAsync();
//                 setIsBotSpeaking(false);
//                 lottieRef.current?.reset();
//             }
//         });
//     };

//     const blobToBase64 = (blob) => new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result.split(',')[1]);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//     });

// const renderItem = ({ item }) => (
//     <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
//         <View style={styles.messageBubble}>
//             <Text style={styles.messageText}>{item.text}</Text>
//         </View>
//     </View>
// );



///////////////////////////////////////////////////////////////////////////




// import React, { useState, useEffect, useRef } from 'react';
// import {
//     View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
//     KeyboardAvoidingView, Platform, ImageBackground, Image, Alert, ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Audio } from 'expo-av';
// // import * as FileSystem from 'expo-file-system'; // FileSystem is not directly used in this version of the code
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import LottieView from 'lottie-react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';

// // !!! استبدل هذا الرابط بالرابط العام الذي يظهر من Ngrok عند تشغيل الخادم الخلفي !!!
// const API_BASE_URL = 'https://3b76-34-125-3-76.ngrok-free.app'; // مثال: 'https://abcdef123456.ngrok.io'


// const backgroundImage = require('../assets/45.jpg'); // تأكد أن المسار صحيح
// const botTalkingAnimation = require('../assets/bot-talking.json'); // تأكد أن المسار صحيح

// export default function Chat() {
//     const [messages, setMessages] = useState([]);
//     const [inputText, setInputText] = useState('');
//     const [characterName, setCharacterName] = useState(''); // Changed from userName
//     const [characterImage, setCharacterImage] = useState(null); // Changed from userImage
//     const [characterId, setCharacterId] = useState(null);

//     const [recording, setRecording] = useState(null);
//     const [isRecording, setIsRecording] = useState(false);
//     const [isSending, setIsSending] = useState(false); // For general sending state (text or audio)
//     const [isBotSpeaking, setIsBotSpeaking] = useState(false); // For Lottie animation

//     const navigation = useNavigation();
//     const route = useRoute();
//     const flatListRef = useRef(null);
//     const lottieRef = useRef(null); // No direct manipulation needed if autoPlay={isBotSpeaking}

//     useEffect(() => {
//         const { selectedCharacter } = route.params || {};
//         if (selectedCharacter) {
//             setCharacterName(selectedCharacter.name || 'Character');
//             setCharacterImage(selectedCharacter.image || null);
//             setCharacterId(selectedCharacter.id);
//             loadMessages(selectedCharacter.id);
//         } else {
//             Alert.alert("Error", "Character data not found. Please go back and select a character.", [{ text: "OK", onPress: () => navigation.goBack() }]);
//         }
//     }, [route.params]);

//     const getMessagesKey = (charId) => `chatMessages_${charId}`;

//     const loadMessages = async (charId) => {
//         if (!charId) return;
//         try {
//             const savedMessages = await AsyncStorage.getItem(getMessagesKey(charId));
//             if (savedMessages) {
//                 setMessages(JSON.parse(savedMessages));
//             } else {
//                 setMessages([]); // Initialize with empty array if no messages saved
//             }
//         } catch (error) {
//             console.error("Failed to load messages:", error);
//             setMessages([]);
//         }
//     };

//     const saveMessages = async (updatedMessages, charId) => {
//         if (!charId) return;
//         try {
//             await AsyncStorage.setItem(getMessagesKey(charId), JSON.stringify(updatedMessages));
//         } catch (error) {
//             console.error("Failed to save messages:", error);
//         }
//     };

//     const sendMessage = async () => {
//         if (inputText.trim() === '' || isSending || !characterId) return;
//         if (!API_BASE_URL || API_BASE_URL === 'YOUR_NGROK_PUBLIC_URL') {
//             Alert.alert('API Error', 'Please set the API_BASE_URL in Chat.js');
//             return;
//         }

//         const userMessage = {
//             id: Date.now().toString(),
//             text: inputText,
//             sender: 'user',
//         };

//         // Optimistically update UI
//         const updatedMessagesWithUser = [userMessage, ...messages];
//         setMessages(updatedMessagesWithUser);
//         saveMessages(updatedMessagesWithUser, characterId); // Save immediately
//         setInputText('');
//         setIsSending(true);
//         setIsBotSpeaking(true);

//         try {
//             const formData = new FormData();
//             formData.append('message', userMessage.text);
//             formData.append('characterId', characterId);
//             const response = await fetch(`${API_BASE_URL}/chat`, {
//                 method: 'POST',
//                 body: formData
//                 // 'Content-Type': 'multipart/form-data' is usually set automatically by fetch for FormData
//             });

//             if (!response.ok) {
//                 const errorData = await response.text(); // Or response.json() if backend sends JSON error
//                 throw new Error(`Server error: ${response.status} - ${errorData}`);
//             }

//             const data = await response.json();
//             const botReply = {
//                 id: Date.now().toString() + '_bot',
//                 text: data.reply || 'Sorry, I could not process that.',
//                 sender: 'bot',
//             };

//             // Update messages with bot reply
//             setMessages(prevMessages => {
//                 // Ensure userMessage is still the latest if multiple sends happened fast (though UI usually prevents this)
//                 const currentMessages = [botReply, ...prevMessages.filter(m => m.id !== userMessage.id), userMessage];
//                 // More robust: find user message and insert bot reply before it.
//                 // For simplicity here, just adding bot reply and then the user message (which was already added)
//                 const finalMessages = [botReply, ...updatedMessagesWithUser];
//                 saveMessages(finalMessages, characterId);
//                 return finalMessages;
//             });

//         } catch (err) {
//             console.error("Error sending message:", err);
//             Alert.alert("Error", `Failed to get response: ${err.message}`);
//             // Optionally, remove the user's message or mark it as failed
//         } finally {
//             setIsSending(false);
//             setIsBotSpeaking(false);
//             scrollToBottom();
//         }
//     };

//     const startRecording = async () => {
//         try {
//             const permission = await Audio.requestPermissionsAsync();
//             if (permission.status !== 'granted') {
//                 Alert.alert('Permission Required', 'Permission to access microphone is required!');
//                 return;
//             }

//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true, // Important for recording while phone is silent
//                 // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // consider this
//                 // shouldDuckAndroid: true, // consider this
//                 // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, // consider this
//                 // playThroughEarpieceAndroid: false, // consider this
//             });

//             const { recording: newRecording } = await Audio.Recording.createAsync(
//                 Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//             );
//             setRecording(newRecording);
//             setIsRecording(true);
//         } catch (err) {
//             console.error('Failed to start recording', err);
//             Alert.alert("Recording Error", "Could not start recording.");
//         }
//     };

//     const stopRecording = async () => {
//         if (!recording) return;
//         setIsRecording(false);
//         try {
//             await recording.stopAndUnloadAsync();
//             const uri = recording.getURI();
//             console.log('Recording stopped and stored at', uri);
//             setRecording(null); // Clear recording object

//             if (uri) {
//                 await sendAudioMessage(uri);
//             }
//         } catch (err) {
//             console.error('Failed to stop recording or send audio', err);
//             Alert.alert("Recording Error", "Could not stop recording or process audio.");
//         }
//     };

//     const sendAudioMessage = async (audioUri) => {
//         if (!characterId) return;
//         if (!API_BASE_URL || API_BASE_URL === 'YOUR_NGROK_PUBLIC_URL') {
//             Alert.alert('API Error', 'Please set the API_BASE_URL in Chat.js');
//             return;
//         }
//         setIsSending(true);
//         setIsBotSpeaking(true);

//         try {
//             const formData = new FormData();
//             const filename = audioUri.split('/').pop();
//             const typeMatch = /\.(\w+)$/.exec(filename);
//             const type = typeMatch ? `audio/${typeMatch[1]}` : 'audio/m4a'; // Adjust if necessary

//             formData.append('file', {
//                 uri: audioUri,
//                 name: filename, // e.g., 'recording.m4a' or from URI
//                 type: type, // e.g., 'audio/m4a' for iOS, 'audio/mpeg' for mp3, etc.
//             });

//             const response = await fetch(`${API_BASE_URL}/chat`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'multipart/form-data', // Important for file uploads
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.text();
//                 throw new Error(`Server error: ${response.status} - ${errorData}`);
//             }

//             const data = await response.json();

//             const userAudioMessage = {
//                 id: Date.now().toString() + '_audio',
//                 audio: audioUri,
//                 transcript: data.transcript || "Audio message (no transcript)",
//                 sender: 'user',
//             };

//             const botReply = {
//                 id: Date.now().toString() + '_bot_audio_reply',
//                 text: data.reply || 'Sorry, I could not process that audio.',
//                 sender: 'bot',
//             };

//             setMessages(prevMessages => {
//                 const newMessages = [botReply, userAudioMessage, ...prevMessages];
//                 saveMessages(newMessages, characterId);
//                 return newMessages;
//             });

//         } catch (error) {
//             console.error('Error sending audio:', error);
//             Alert.alert("Audio Send Error", `Failed to send audio: ${error.message}`);
//         } finally {
//             setIsSending(false);
//             setIsBotSpeaking(false);
//             scrollToBottom();
//         }
//     };

//     const scrollToBottom = () => {
//         setTimeout(() => { // Timeout helps ensure layout is complete
//             flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
//         }, 100);
//     }

//     const AudioPlayer = ({ uri }) => {
//         const soundRef = useRef(new Audio.Sound()); // Changed variable name
//         const [isPlaying, setIsPlayerPlaying] = useState(false); // Unique state name

//         useEffect(() => {
//             // Unload sound when component unmounts or URI changes
//             return () => {
//                 soundRef.current.getStatusAsync().then(status => {
//                     if (status.isLoaded) {
//                         soundRef.current.unloadAsync();
//                     }
//                 });
//             };
//         }, [uri]);

//         const playSound = async () => {
//             try {
//                 const status = await soundRef.current.getStatusAsync();
//                 if (status.isLoaded) { // If loaded, it means it might be playing or paused
//                     if (isPlaying) {
//                         await soundRef.current.pauseAsync(); // Use pauseAsync for better control
//                         setIsPlayerPlaying(false);
//                     } else {
//                         await soundRef.current.playAsync();
//                         setIsPlayerPlaying(true);
//                     }
//                 } else { // Not loaded, so load and play
//                     await soundRef.current.loadAsync({ uri });
//                     await soundRef.current.playAsync();
//                     setIsPlayerPlaying(true);
//                     soundRef.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
//                 }
//             } catch (e) {
//                 console.log('Error playing sound:', e);
//                 setIsPlayerPlaying(false); // Reset state on error
//                 // Attempt to unload if loading failed or another issue
//                 soundRef.current.getStatusAsync().then(s => { if (s.isLoaded) soundRef.current.unloadAsync(); });
//                 Alert.alert("Playback Error", "Could not play audio.");
//             }
//         };

//         const onPlaybackStatusUpdate = (playbackStatus) => {
//             if (!playbackStatus.isLoaded) {
//                 // Update UI states and soundRef cleanups
//                 if (playbackStatus.error) {
//                     console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
//                 }
//             } else {
//                 if (playbackStatus.isPlaying) {
//                     // Update something if needed
//                 } else {
//                     // Not playing (paused or stopped)
//                 }

//                 if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
//                     // The player has just finished playing
//                     setIsPlayerPlaying(false);
//                     soundRef.current.unloadAsync(); // Unload after finishing
//                 }
//             }
//         };

//         return (
//             <TouchableOpacity onPress={playSound} disabled={isSending}>
//                 <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={32} color="#fff" />
//             </TouchableOpacity>
//         );
//     };

//     const renderItem = ({ item }) => {
//         const isUser = item.sender === 'user';
//         if (item.audio) {
//             return (
//                 <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
//                     {/* {!isUser && characterImage && <Image source={{ uri: characterImage }} style={styles.messageAvatar} />} */}
//                     <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble, { paddingVertical: 8, paddingHorizontal: 10 }]}>
//                         <AudioPlayer uri={item.audio} />
//                         {item.transcript && (
//                             <Text style={[styles.messageText, { marginTop: 5, fontSize: 12, color: isUser ? '#e0e0e0' : '#666' }]}>
//                                 {item.transcript}
//                             </Text>
//                         )}
//                     </View>
//                     {/* {isUser && <Image source={{ uri: MY_USER_AVATAR_IF_ANY }} style={styles.messageAvatar} />} */}
//                 </View>
//             );
//         }
//         return (
//             <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
//                 {!isUser && characterImage && <Image source={{ uri: characterImage }} style={styles.messageAvatar} />}
//                 <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble]}>
//                     <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{item.text}</Text>
//                 </View>
//                 {/* {isUser && <Image source={ DEFAULT_USER_AVATAR } style={styles.messageAvatar} />} */}
//             </View>
//         );
//     };

//     if (!characterId) { // Show loading or placeholder until characterId is set
//         return (
//             <ImageBackground source={backgroundImage} style={styles.container}>
//                 <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//                     <ActivityIndicator size="large" color="#fff" />
//                     <Text style={{ color: '#fff', marginTop: 10 }}>Loading Character...</Text>
//                 </SafeAreaView>
//             </ImageBackground>
//         );
//     }

//     return (
//         <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
//             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
//                 <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
//                     <View style={styles.header}>
//                         {characterImage ? (
//                             <Image source={{ uri: characterImage }} style={styles.avatar} />
//                         ) : (
//                             <View style={[styles.avatar, { backgroundColor: '#ccc' }]} >
//                                 <Ionicons name="person" size={24} color="#fff" />
//                             </View>
//                         )}
//                         <Text style={styles.username}>{characterName}</Text>
//                         <View style={styles.headerIcons}>
//                             {isBotSpeaking && (
//                                 <LottieView
//                                     source={botTalkingAnimation}
//                                     autoPlay
//                                     loop
//                                     style={styles.lottieAnimation}
//                                 />
//                             )}
//                             <TouchableOpacity onPress={() => navigation.navigate('Call', { selectedCharacter: route.params?.selectedCharacter })}>
//                                 <MaterialIcons name="call" size={28} color="lightgreen" />
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                     <FlatList
//                         ref={flatListRef}
//                         data={messages}
//                         renderItem={renderItem}
//                         keyExtractor={item => item.id}
//                         inverted
//                         contentContainerStyle={styles.messageListContent}
//                         keyboardShouldPersistTaps="handled"
//                     />
//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             value={inputText}
//                             onChangeText={setInputText}
//                             placeholder="Type a message..."
//                             placeholderTextColor="#ccc"
//                             style={styles.input}
//                             editable={!isSending}
//                             multiline
//                         />
//                         {isSending && !isRecording ? (
//                             <ActivityIndicator size="small" color="#007AFF" style={styles.iconButton} />
//                         ) : inputText.trim() === '' ? (
//                             <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.iconButton} disabled={isSending}>
//                                 <Ionicons name={isRecording ? 'stop-circle' : 'mic-circle'} size={36} color={isRecording ? "red" : "#007AFF"} />
//                             </TouchableOpacity>
//                         ) : (
//                             <TouchableOpacity onPress={sendMessage} style={styles.iconButton} disabled={isSending}>
//                                 <Ionicons name="send" size={30} color="#007AFF" />
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                 </SafeAreaView>
//             </KeyboardAvoidingView>
//         </ImageBackground>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent header
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.2)',
//     },
//     avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
//     username: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
//     headerIcons: { flexDirection: 'row', alignItems: 'center' },
//     lottieAnimation: { width: 40, height: 40, marginRight: 8 },
//     messageListContent: { paddingHorizontal: 10, paddingBottom: 5 },
//     messageContainer: {
//         marginVertical: 6,
//         flexDirection: 'row',
//         alignItems: 'flex-end',
//     },
//     userMessageContainer: { justifyContent: 'flex-end', marginLeft: 50 },
//     botMessageContainer: { justifyContent: 'flex-start', marginRight: 50 },
//     messageAvatar: {
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         marginHorizontal: 5,
//     },
//     messageBubble: {
//         paddingVertical: 10,
//         paddingHorizontal: 14,
//         borderRadius: 18,
//         maxWidth: '85%',
//     },
//     userMessageBubble: {
//         backgroundColor: '#007AFF',
//         borderTopRightRadius: 5,
//     },
//     botMessageBubble: {
//         backgroundColor: '#333',
//         borderTopLeftRadius: 5,
//     },
//     messageText: {},
//     userMessageText: { color: '#fff', fontSize: 15 },
//     botMessageText: { color: '#f0f0f0', fontSize: 15 },
//     inputContainer: {
//         flexDirection: 'row',
//         paddingVertical: 8,
//         paddingHorizontal: 10,
//         backgroundColor: 'rgba(0,0,0,0.7)', // Semi-transparent input area
//         borderTopWidth: 1,
//         borderTopColor: 'rgba(255,255,255,0.2)',
//         alignItems: 'flex-end', // Align items to bottom for multiline input
//     },
//     input: {
//         flex: 1,
//         paddingHorizontal: 15,
//         borderRadius: 22,
//         borderWidth: 1,
//         borderColor: 'rgba(255,255,255,0.3)',
//         minHeight: 44, // Min height for input
//         maxHeight: 120, // Max height for multiline
//         paddingTop: Platform.OS === 'ios' ? 12 : 10, // Adjust padding for text vertical alignment
//         paddingBottom: Platform.OS === 'ios' ? 12 : 10,
//         fontSize: 16,
//         color: '#fff',
//         backgroundColor: 'rgba(255,255,255,0.1)',
//     },
//     iconButton: {
//         marginLeft: 10,
//         height: 44, // Match input height
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 5,
//     },
// });




















































































































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
const API_BASE_URL = 'https://3b3f-34-125-53-190.ngrok-free.app'; // تم استخدام الرابط الذي وفرته سابقًا

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