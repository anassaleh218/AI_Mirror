import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, View, Text, StyleSheet, 
    ActivityIndicator, Alert, FlatList, 
    TouchableOpacity, Image, RefreshControl 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const PYTHON_API_URL = 'https://1dfe-34-34-115-170.ngrok-free.app'; 

// تأكد من وجود صورة افتراضية في هذا المسار
const placeholderImage = require('../assets/avatar-placeholder.png');

const TelegramImportScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { sessionString } = route.params;

    const [step, setStep] = useState('loading_chats');
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('جاري جلب المحادثات...');
    
    useEffect(() => {
        fetchChats();
    }, [sessionString]);

    const fetchChats = async () => {
        setIsLoading(true);
        setStatusMessage('جاري تحديث قائمة المحادثات...');
        if (!sessionString) {
            Alert.alert("خطأ", "لم يتم العثور على جلسة تسجيل الدخول.", [{ text: "العودة", onPress: () => navigation.goBack() }]);
            return;
        }
        try {
            const response = await fetch(`${PYTHON_API_URL}/telegram/chats/${sessionString}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "فشل جلب الشاتات");
            setChats(data.chats);
            setStep('chat_list');
        } catch (error) {
            Alert.alert("خطأ", error.message);
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const saveImportedCharacterLocally = async (characterData) => {
        try {
            // بما أن الصورة Base64، نحتاج لحفظها كملف أولاً
            let localImageUri = null;
            if (characterData.image) { // characterData.image is a base64 data URI
                const filename = `char_img_${characterData.id}.jpeg`;
                localImageUri = FileSystem.documentDirectory + filename;
                // استخلاص بيانات Base64 فقط بدون "data:image/jpeg;base64,"
                const base64Data = characterData.image.split(',')[1];
                await FileSystem.writeAsStringAsync(localImageUri, base64Data, { 
                    encoding: FileSystem.EncodingType.Base64 
                });
            }

            const finalCharacterObject = { ...characterData, image: localImageUri };
            const existingCharactersJSON = await AsyncStorage.getItem('characters');
            const characters = existingCharactersJSON ? JSON.parse(existingCharactersJSON) : [];
            
            const existingIndex = characters.findIndex(char => char.id === finalCharacterObject.id);
            if (existingIndex > -1) {
                console.log(`Character '${finalCharacterObject.name}' already exists. Updating info.`);
                characters[existingIndex] = finalCharacterObject; // تحديث الشخصية الموجودة
            } else {
                characters.push(finalCharacterObject); // إضافة شخصية جديدة
            }

            await AsyncStorage.setItem('characters', JSON.stringify(characters));
            console.log(`Character '${finalCharacterObject.name}' saved/updated locally.`);
            return finalCharacterObject;

        } catch (error) {
            console.error("Failed to save character locally:", error);
            Alert.alert("خطأ في الحفظ المحلي", "لم يتم حفظ الشخصية في قائمة الشخصيات الموجودة، ولكن يمكنك بدء المحادثة.");
            return characterData;
        }
    };

    const handleSelectChat = async (chatObject) => {
        setIsLoading(true);
        setStep('processing'); // تغيير الحالة لإظهار مؤشر التحميل
        setStatusMessage(`جاري معالجة شات ${chatObject.name}...`);
        try {
            const response = await fetch(`${PYTHON_API_URL}/telegram/process_chat/${sessionString}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: chatObject.id })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail);

            const { characterProfile } = data;

            const finalCharacter = await saveImportedCharacterLocally({
                ...characterProfile,
                image: chatObject.picUrl, // تمرير رابط الصورة Base64 للحفظ
            });

            Alert.alert('نجاح!', `تم إنشاء شخصية "${finalCharacter.name}" وحفظها.`, [
                { text: 'ابدأ المحادثة', onPress: () => navigation.replace('Chat', { selectedCharacter: finalCharacter }) },
            ]);

        } catch (error) { 
            Alert.alert('خطأ', error.message);
            setStep('chat_list'); // الرجوع لقائمة الشاتات في حالة الخطأ
        } finally { 
            setIsLoading(false); 
        }
    };

    if (isLoading || step !== 'chat_list') {
        return ( 
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0088cc" />
                <Text style={styles.statusText}>{statusMessage}</Text>
            </SafeAreaView> 
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="paper-plane" size={24} color="#0088cc" />
                <Text style={styles.title}>اختر محادثة تيليجرام</Text>
            </View>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.chatItem} onPress={() => handleSelectChat(item)}>
                        <Image 
                            source={item.picUrl ? { uri: item.picUrl } : placeholderImage} 
                            style={styles.chatImage} 
                        />
                        <Text style={styles.chatName}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" />
                    </TouchableOpacity>
                )}
                refreshing={isLoading}
                onRefresh={fetchChats}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    statusText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    listContent: {
        paddingVertical: 10,
    },
    chatItem: { 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white', 
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 4,
        marginHorizontal: 10,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    chatImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#e0e0e0',
    },
    chatName: {
        flex: 1, // لجعل النص يأخذ المساحة المتبقية
        fontSize: 17,
        fontWeight: '500',
        color: '#111B21',
    },
});

export default TelegramImportScreen;