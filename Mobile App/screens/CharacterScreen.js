//working before whatsapp
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// تأكد من أن هذا هو عنوان ngrok URL الخاص بك النشط للباك إند
// const API_BASE_URL = 'https://YOUR_NGROK_SUBDOMAIN.ngrok-free.app'; // مثال، استبدله بعنوان URL الفعلي الخاص بك
const API_BASE_URL = 'https://1dfe-34-34-115-170.ngrok-free.app'; // ضع هنا عنوان الـ ngrok الخاص بك


const CharacterScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isNewCharacterFlow, setIsNewCharacterFlow] = useState(null); // null: initial, true: new, false: existing
    const [name, setName] = useState('');
    const [image, setImage] = useState(null); // URI for the image picker
    const [characterList, setCharacterList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isFocused || isNewCharacterFlow === false) {
            handleLoadCharacters();
        }
    }, [isFocused, isNewCharacterFlow]);

    // هذه الدالة مسؤولة عن إرسال بيانات الشخصية إلى الباك إند
    // سيتم استدعاؤها من QuestionnaireScreen بعد ملء تفاصيل الشخصية الجديدة,
    // ومن هذه الشاشة (CharacterScreen) عند اختيار شخصية موجودة ببيانات كاملة.
    const sendCharacterDataToBackend = async (characterDataPayload) => {
        if (!API_BASE_URL || API_BASE_URL.includes('YOUR_NGROK_SUBDOMAIN') || API_BASE_URL === '') {
            Alert.alert('خطأ في الـ API', 'لم يتم تكوين API_BASE_URL بشكل صحيح. يرجى التحقق منه.');
            return false;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/store_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(characterDataPayload), // هذا هو الكائن المطابق لـ CharacterProfileData
            });
            const responseData = await response.json();
            setIsLoading(false);
            if (response.ok && responseData.status === 'success') {
                // Alert.alert('مزامنة مع الباك إند', responseData.message); // رسالة نجاح اختيارية
                return true;
            } else {
                Alert.alert('خطأ من الباك إند', responseData.message || 'فشل تخزين البيانات في الباك إند.');
                return false;
            }
        } catch (error) {
            setIsLoading(false);
            console.error('خطأ في استدعاء الـ API:', error);
            Alert.alert('خطأ في استدعاء الـ API', `فشل الاتصال بالباك إند: ${error.message}. تأكد من أن خادم الباك إند و ngrok يعملان.`);
            return false;
        }
    };

    const handleSaveNewCharacter = async () => {
        if (!name.trim()) {
            Alert.alert('الاسم مفقود', 'الرجاء إدخال اسم للشخصية.');
            return;
        }
        if (!image) {
            Alert.alert('الصورة مفقودة', 'الرجاء اختيار صورة للشخصية.');
            return;
        }
        setIsLoading(true);
        try {
            const filename = image.split('/').pop();
            // تنقية اسم الملف من الأحرف غير الصالحة المحتملة
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
            const localImageUri = FileSystem.documentDirectory + `char_image_${Date.now()}_${sanitizedFilename}`;
            await FileSystem.copyAsync({ from: image, to: localImageUri });

            const newCharacter = {
                // هذا الـ 'id' سيُستخدم كـ 'characterId' للباك إند
                id: `char_${Date.now()}_${name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`, // تنقية الـ ID أيضًا
                name: name.trim(),
                image: localImageUri,
                bio: "", // سيتم إضافة السيرة الذاتية في شاشة Questionnaire
                questionnaireAnswers: {}, // سيتم إضافة إجابات الاستبيان في شاشة Questionnaire
            };

            const existingCharactersJSON = await AsyncStorage.getItem('characters');
            const characters = existingCharactersJSON ? JSON.parse(existingCharactersJSON) : [];

            if (characters.some(char => char.name === newCharacter.name)) {
                Alert.alert('اسم مكرر', 'توجد شخصية بهذا الاسم بالفعل. الرجاء اختيار اسم مختلف.');
                setIsLoading(false);
                return;
            }

            characters.push(newCharacter);
            await AsyncStorage.setItem('characters', JSON.stringify(characters));
            setIsLoading(false);

            Alert.alert('تم حفظ الشخصية محليًا', `تم حفظ ${newCharacter.name}. الرجاء إكمال الاستبيان.`);
            // تمرير كائن الشخصية الجديد (أو على الأقل الـ ID الخاص به) إلى شاشة Questionnaire
            // شاشة Questionnaire ستكون مسؤولة عن إضافة السيرة الذاتية والإجابات،
            // ثم استدعاء sendCharacterDataToBackend.
            navigation.navigate('Questionnaire', { characterId: newCharacter.id });

            setName('');
            setImage(null);
            // setIsNewCharacterFlow(false); // اختياري: الانتقال إلى قائمة الشخصيات الموجودة بعد الإنشاء
        } catch (error) {
            setIsLoading(false);
            console.error('خطأ في حفظ الشخصية:', error);
            Alert.alert('خطأ', 'فشل حفظ بيانات الشخصية محليًا.');
        }
    };

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("الإذن مطلوب", "لقد رفضت السماح لهذا التطبيق بالوصول إلى صورك!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const handleLoadCharacters = async () => {
        setIsLoading(true);
        try {
            const data = await AsyncStorage.getItem('characters');
            if (data) {
                const loadedCharacters = JSON.parse(data);
                setCharacterList(loadedCharacters);
            } else {
                setCharacterList([]);
            }
        } catch (error) {
            console.error('خطأ في تحميل الشخصيات:', error);
            Alert.alert('خطأ', 'فشل تحميل الشخصيات.');
            setCharacterList([]);
        }
        setIsLoading(false);
    };

    const handleSelectExistingCharacter = async (character) => {
        // تأكد من أن كائن الشخصية يحتوي على جميع الحقول الضرورية من AsyncStorage
        // يجب أن تكون حقول `bio` و `questionnaireAnswers` قد أضيفت بواسطة شاشة Questionnaire سابقًا
        // وحُفظت مرة أخرى في AsyncStorage.

        if (character.bio && character.questionnaireAnswers && Object.keys(character.questionnaireAnswers).length > 0) {
            // تجهيز البيانات لإرسالها إلى الباك إند
            const characterDataForBackend = {
                characterId: character.id, // استخدام الـ ID المحلي الفريد للشخصية
                characterName: character.name,
                bio: character.bio,
                answers: character.questionnaireAnswers, // هذا هو كائن الإجابات
            };

            const success = await sendCharacterDataToBackend(characterDataForBackend);
            if (success) {
                // الانتقال إلى شاشة الدردشة مع كائن الشخصية الكامل، حيث قد يكون مطلوبًا هناك
                // أو فقط characterId إذا كانت شاشة الدردشة تعيد جلبه أو تحتاج فقط إلى الـ ID
                navigation.navigate('Chat', { selectedCharacter: character });
            } else {
                Alert.alert("فشل المزامنة مع الباك إند", "تعذر مزامنة بيانات الشخصية مع الباك إند. قد تكون وظيفة الدردشة محدودة. يمكنك المحاولة مرة أخرى أو المتابعة إلى الدردشة مع بيانات قد تكون غير متزامنة.");
                // اختياريًا، لا يزال بإمكانك الانتقال إلى الدردشة ولكن مع تحذير، أو منع الانتقال.
                // navigation.navigate('Chat', { selectedCharacter: character }); // كمثال، إذا سمحت بالانتقال
            }
        } else {
            // إذا كانت السيرة الذاتية أو إجابات الاستبيان مفقودة، انتقل إلى شاشة Questionnaire لملئها.
            Alert.alert("تفاصيل مفقودة", "السيرة الذاتية للشخصية أو الاستبيان غير مكتمل. الرجاء إكمال الاستبيان.");
            navigation.navigate('Questionnaire', { characterId: character.id });
        }
    };

    // مؤشر تحميل بملء الشاشة عند التحميل الأولي فقط
    if (isLoading && isNewCharacterFlow === null) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#4c8bf5" />
                <Text style={styles.loadingText}>جاري تحميل الشخصيات...</Text>
            </SafeAreaView>
        );
    }

    const renderNewCharacterForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.heading}>إنشاء شخصية جديدة</Text>
            <TextInput
                style={styles.input}
                placeholder="أدخل اسم الشخصية"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
                <Text style={styles.secondaryButtonText}>اختر صورة للشخصية</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            <TouchableOpacity
                style={[styles.primaryButton, isLoading ? styles.disabledButton : {}]}
                onPress={handleSaveNewCharacter}
                disabled={isLoading}
            >
                <Text style={styles.primaryButtonText}>حفظ ومتابعة إلى الاستبيان</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.linkButton, isLoading ? styles.disabledButton : {}]}
                onPress={() => setIsNewCharacterFlow(null)}
                disabled={isLoading}
            >
                <Text style={styles.linkButtonText}>العودة إلى الخيارات</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCharacterListItem = ({ item }) => (
        <TouchableOpacity
            style={styles.characterItem}
            onPress={() => handleSelectExistingCharacter(item)}
            disabled={isLoading}
        >
            {item.image && <Image source={{ uri: item.image }} style={styles.characterItemImage} />}
            <Text style={styles.characterItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderExistingCharacterList = () => (
        <View style={styles.listContainer}>
            <Text style={styles.heading}>اختر شخصية موجودة</Text>
            {characterList.length > 0 ? (
                <FlatList
                    data={characterList}
                    renderItem={renderCharacterListItem}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                />
            ) : (
                <Text style={styles.emptyListText}>لم يتم العثور على شخصيات. قم بإنشاء واحدة جديدة!</Text>
            )}
            <TouchableOpacity
                style={[styles.linkButton, isLoading ? styles.disabledButton : {}]}
                onPress={() => setIsNewCharacterFlow(null)}
                disabled={isLoading}>
                <Text style={styles.linkButtonText}>العودة إلى الخيارات</Text>
            </TouchableOpacity>
        </View>
    );

    // شاشة الاختيار الأولية
    if (isNewCharacterFlow === null) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.optionContainer}>
                    <Text style={styles.title}>إعداد الشخصية</Text>
                    <TouchableOpacity
                        style={[styles.primaryButtonWide, isLoading ? styles.disabledButton : {}]}
                        onPress={() => setIsNewCharacterFlow(true)}
                        disabled={isLoading}>
                        <Text style={styles.primaryButtonText}>إنشاء شخصية جديدة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondaryButtonWide, isLoading ? styles.disabledButton : {}]}
                        onPress={() => {
                            setIsNewCharacterFlow(false); // هذا سيؤدي إلى استدعاء useEffect لتحميل الشخصيات
                        }}
                        disabled={isLoading}
                    >
                        <Text style={styles.secondaryButtonText}>استخدام شخصية موجودة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondaryButtonWide, { backgroundColor: '#25D366' }]} // لون أخضر شبيه بواتساب
                        onPress={() => navigation.navigate('WhatsappImportScreen')} // اسم الشاشة الجديدة
                        disabled={isLoading}
                    >
                        <Text style={[styles.primaryButtonText, { color: '#fff' }]}>سحب شات لإنشاء شخصية</Text>
                    </TouchableOpacity>

                    {/* --- الزر الجديد الذي تمت إضافته --- */}
                    <TouchableOpacity
                        style={[styles.secondaryButtonWide, { backgroundColor: '#0088cc' }]} // لون تيليجرام
                        onPress={() => navigation.navigate('TelegramLoginScreen')} // سينتقل إلى شاشة تسجيل الدخول
                        disabled={isLoading}
                    >
                        <Text style={[styles.primaryButtonText, { color: '#fff' }]}>سحب شات من تيليجرام</Text>
                    </TouchableOpacity>
                    {/* --- نهاية الإضافة --- */}

                </View>
            </SafeAreaView>
        );
    }

    // شاشة نموذج الشخصية الجديدة أو قائمة الشخصيات الموجودة
    return (
        <SafeAreaView style={styles.container}>
            {isLoading && ( // مؤشر تحميل مدمج للإجراءات داخل النماذج
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4c8bf5" />
                </View>
            )}
            {isNewCharacterFlow ? renderNewCharacterForm() : renderExistingCharacterList()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    formContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 15, // مسافة أفقية للقائمة
        paddingTop: 20,
    },
    optionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
        textAlign: 'center',
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        color: '#3b3b3b',
        marginBottom: 25,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#333',
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginVertical: 20,
        borderWidth: 2,
        borderColor: '#4c8bf5',
    },
    primaryButton: {
        backgroundColor: '#4c8bf5',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#eef2f7',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#d0d7e0',
    },
    secondaryButtonText: {
        color: '#4c8bf5',
        fontSize: 16,
        fontWeight: '500',
    },
    primaryButtonWide: {
        backgroundColor: '#4c8bf5',
        paddingVertical: 18,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '90%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    secondaryButtonWide: {
        backgroundColor: '#eef2f7',
        paddingVertical: 18,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: '#d0d7e0',
    },
    linkButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    linkButtonText: {
        color: '#4c8bf5',
        fontSize: 15,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.6,
    },
    list: {
        marginTop: 10,
    },
    characterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    characterItemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    characterItemText: {
        fontSize: 17,
        color: '#333',
        fontWeight: '500',
    },
    emptyListText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 30,
    },
});

export default CharacterScreen;
/////////////////////////////////////////////////////////////////







