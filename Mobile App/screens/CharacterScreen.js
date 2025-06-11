// import React, { useState } from 'react';
// import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as FileSystem from 'expo-file-system';
// import { useNavigation } from '@react-navigation/native';

// const CharacterScreen = () => {
//   const navigation = useNavigation();
//   const [isNewCharacter, setIsNewCharacter] = useState(null);
//   const [name, setName] = useState('');
//   const [image, setImage] = useState(null);
//   const [savedCharacter, setSavedCharacter] = useState(null);

//   const handleSaveCharacter = async () => {
//     if (image && name.trim()) {
//       const filename = image.split('/').pop();
//       const localUri = FileSystem.documentDirectory + filename;
//       await FileSystem.copyAsync({ from: image, to: localUri });

//       const newCharacter = { name, image: localUri };
//       const existingData = await AsyncStorage.getItem('characters');
//       const characters = existingData ? JSON.parse(existingData) : [];

//       characters.push(newCharacter);
//       await AsyncStorage.setItem('characters', JSON.stringify(characters));

//       navigation.navigate('Questionnaire', { selectedCharacter: newCharacter });
//     }
//   };


//   const handlePickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const [characterList, setCharacterList] = useState([]);

//   const handleLoadSavedCharacter = async () => {
//     const data = await AsyncStorage.getItem('characters');
//     if (data) {
//       const list = JSON.parse(data);
//       setCharacterList(list);
//     }
//   };


//   const renderNewCharacterForm = () => (
//     <View style={styles.formContainer}>
//       <Text style={styles.heading}>Create Your Character</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter character name"
//         value={name}
//         onChangeText={setName}
//         placeholderTextColor="#aaa"
//       />
//       <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
//         <Text style={styles.secondaryButtonText}>Pick Image</Text>
//       </TouchableOpacity>
//       {image && <Image source={{ uri: image }} style={styles.image} />}
//       <TouchableOpacity style={styles.primaryButton} onPress={handleSaveCharacter}>
//         <Text style={styles.primaryButtonText}>Save & Continue</Text>
//       </TouchableOpacity>
//     </View>
//   );

// const renderCharacterList = () => (
//   <View>
//     <Text style={styles.heading}>Select a Character</Text>
//     {characterList.map((char, index) => (
//       <TouchableOpacity
//         key={index}
//         style={styles.secondaryButton}
//         onPress={() => {
//           if (char.questionnaireAnswers) {
//             navigation.navigate('Chat', { selectedCharacter: char });
//           } else {
//             navigation.navigate('Questionnaire', { selectedCharacter: char });
//           }
//         }}
//       >
//         <Text style={styles.secondaryButtonText}>{char.name}</Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );



//   return (
//     <SafeAreaView style={styles.container}>
//       {isNewCharacter === null ? (
//         <View style={styles.optionContainer}>
//           <TouchableOpacity style={styles.primaryButton} onPress={() => setIsNewCharacter(true)}>
//             <Text style={styles.primaryButtonText}>Create New Character</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.secondaryButton} onPress={() => {
//             setIsNewCharacter(false);
//             handleLoadSavedCharacter();
//           }}>
//             <Text style={styles.secondaryButtonText}>Use Existing Character</Text>
//           </TouchableOpacity>
//         </View>
//       ) : isNewCharacter ? renderNewCharacterForm() : renderCharacterList()}
//     </SafeAreaView>
//   );

// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7f9fc',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   optionContainer: {
//     alignItems: 'center',
//     gap: 20,
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginBottom: 20,
//     color: '#333',
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 20,
//     fontSize: 16,
//     color: '#333',
//     backgroundColor: '#fff',
//   },
//   image: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     marginVertical: 20,
//   },
//   formContainer: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   savedContainer: {
//     alignItems: 'center',
//   },
//   primaryButton: {
//     backgroundColor: '#4c8bf5',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   secondaryButton: {
//     backgroundColor: '#e0e7ff',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   secondaryButtonText: {
//     color: '#4c8bf5',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

///////////////////////////////////////////////////////////////////////////////////////////////////////

// export default CharacterScreen;
// import React, { useState, useEffect } from 'react';
// import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, FlatList,ActivityIndicator  } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as FileSystem from 'expo-file-system';
// import { useNavigation, useIsFocused } from '@react-navigation/native';

// const API_BASE_URL = 'https://3b76-34-125-3-76.ngrok-free.app';

// const Character = () => {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const [isNewCharacterFlow, setIsNewCharacterFlow] = useState(null); // null: initial, true: new, false: existing
//   const [name, setName] = useState('');
//   const [image, setImage] = useState(null); // URI for the image picker
//   const [characterList, setCharacterList] = useState([]);
//   const [isLoading, setIsLoading] = useState(false); // حالة للتحميل

//   // Load characters when the screen is focused or when switching to existing character flow
//   useEffect(() => {
//     if (isFocused || isNewCharacterFlow === false) {
//       handleLoadCharacters();
//     }
//   }, [isFocused, isNewCharacterFlow]);

//   const dataForBackendUpdate = {
//     characterId: character.id,
//     characterName: character.name,
//     bio: character.bio, // تأكد من أن هذا محدث
//     answers: character.questionnaireAnswers
// };
//   const sendDataToAPI = async (questionnaireData) => {
//     if (!API_BASE_URL || API_BASE_URL === 'YOUR_NGROK_PUBLIC_URL') {
//         Alert.alert('API Error', 'Please set the API_BASE_URL in CharacterScreen.js');
//         return false;
//     }
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/store_data`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(questionnaireData),
//       });
//       const responseData = await response.json();
//       setIsLoading(false);
//       if (response.ok && responseData.status === 'success') {
//         // Alert.alert('API Success', responseData.message); // اختياري: إظهار رسالة نجاح
//         return true;
//       } else {
//         Alert.alert('API Error', responseData.message || 'Failed to store data in backend.');
//         return false;
//       }
//     } catch (error) {
//       setIsLoading(false);
//       console.error('API call error:', error);
//       Alert.alert('API Call Error', `Failed to connect to the backend: ${error.message}. Make sure the backend server and ngrok are running.`);
//       return false;
//     }
//   };



//   const handleSaveNewCharacter = async () => {
//     if (!name.trim()) {
//       Alert.alert('Missing Name', 'Please enter a character name.');
//       return;
//     }
//     if (!image) {
//       Alert.alert('Missing Image', 'Please pick an image for the character.');
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const filename = image.split('/').pop();
//       const localImageUri = FileSystem.documentDirectory + `char_image_${Date.now()}_${filename}`; // Ensure unique image name
//       await FileSystem.copyAsync({ from: image, to: localImageUri });

//       const newCharacter = {
//         id: `char_${Date.now()}_${name.replace(/\s+/g, '_')}`, // Unique ID for the character
//         name: name.trim(),
//         image: localImageUri,
//         // questionnaireAnswers will be added later
//       };

//       const existingCharacters = await AsyncStorage.getItem('characters');
//       const characters = existingCharacters ? JSON.parse(existingCharacters) : [];

//       // Check if character with the same name already exists (optional, based on your needs)
//       if (characters.some(char => char.name === newCharacter.name)) {
//         Alert.alert('Duplicate Name', 'A character with this name already exists. Please choose a different name.');
//         setIsLoading(false);
//         return;
//       }

//       characters.push(newCharacter);
//       await AsyncStorage.setItem('characters', JSON.stringify(characters));
//       setIsLoading(false);

//       Alert.alert('Character Saved', `${newCharacter.name} has been saved.`);
//       navigation.navigate('Questionnaire', { characterId: newCharacter.id }); // Pass ID to questionnaire

//       // Reset form
//       setName('');
//       setImage(null);
//       // لا تعيد isNewCharacterFlow إلى null هنا، دع المستخدم يرى قائمة الشخصيات أو يعود يدويًا
//       // setIsNewCharacterFlow(null); // أو اجعلها تعود للقائمة الرئيسية إذا أردت

//     } catch (error) {
//       setIsLoading(false);
//       console.error('Error saving character:', error);
//       Alert.alert('Error', 'Failed to save character data locally.');
//     }
//   };

//   const handlePickImage = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (permissionResult.granted === false) {
//       Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5, // Reduced quality for faster storage/loading
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const handleLoadCharacters = async () => {
//     setIsLoading(true);
//     try {
//       const data = await AsyncStorage.getItem('characters');
//       if (data) {
//         const loadedCharacters = JSON.parse(data);
//         setCharacterList(loadedCharacters);
//       } else {
//         setCharacterList([]);
//       }
//     } catch (error) {
//       console.error('Error loading characters:', error);
//       Alert.alert('Error', 'Failed to load characters.');
//       setCharacterList([]);
//     }
//     setIsLoading(false);
//   };

//   const handleSelectExistingCharacter = async (character) => {
//     if (character.questionnaireAnswers && Object.keys(character.questionnaireAnswers).length > 0) {
//       const success = await sendDataToAPI(dataForBackendUpdate);
//       if (success) {
//         navigation.navigate('Chat', { selectedCharacter: character });
//       } else {
//         // يمكن للمستخدم محاولة مرة أخرى أو إعلامه بأن الدردشة قد لا تعمل بشكل صحيح
//         Alert.alert("Backend Sync Failed", "Could not sync character data with the backend. Chat functionality might be limited. You can try again.");
//       }
//     } else {
//       navigation.navigate('Questionnaire', { characterId: character.id });
//     }
//   };
//   if (isLoading) {
//     return (
//       <SafeAreaView style={[styles.container, styles.loadingContainer]}>
//         <ActivityIndicator size="large" color="#4c8bf5" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </SafeAreaView>
//     );
//   }
//   const renderNewCharacterForm = () => (
//     <View style={styles.formContainer}>
//       <Text style={styles.heading}>Create Your Character</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter character name"
//         value={name}
//         onChangeText={setName}
//         placeholderTextColor="#aaa"
//       />
//       <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
//         <Text style={styles.secondaryButtonText}>Pick Image</Text>
//       </TouchableOpacity>
//       {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
//       <TouchableOpacity style={styles.primaryButton} onPress={handleSaveNewCharacter} disabled={isLoading}>
//         <Text style={styles.primaryButtonText}>Save & Continue to Questionnaire</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.linkButton} onPress={() => setIsNewCharacterFlow(null)} disabled={isLoading}>
//         <Text style={styles.linkButtonText}>Back to Options</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderCharacterListItem = ({ item }) => (
//     <TouchableOpacity
//     style={styles.characterItem}
//     onPress={() => handleSelectExistingCharacter(item)}
//     disabled={isLoading}
//   >
//       {item.image && <Image source={{ uri: item.image }} style={styles.characterItemImage} />}
//       <Text style={styles.characterItemText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   const renderExistingCharacterList = () => (
//     <View style={styles.listContainer}>
//       <Text style={styles.heading}>Select a Character</Text>
//       {characterList.length > 0 ? (
//         <FlatList
//           data={characterList}
//           renderItem={renderCharacterListItem}
//           keyExtractor={(item) => item.id}
//           style={styles.list}
//         />
//       ) : (
//         <Text style={styles.emptyListText}>No characters found. Create a new one!</Text>
//       )}
//       <TouchableOpacity style={styles.linkButton} onPress={() => setIsNewCharacterFlow(null)} disabled={isLoading}>
//         <Text style={styles.linkButtonText}>Back to Options</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (isNewCharacterFlow === null) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.optionContainer}>
//           <Text style={styles.title}>Welcome!</Text>
//           <TouchableOpacity style={styles.primaryButtonWide} onPress={() => setIsNewCharacterFlow(true)} disabled={isLoading}>
//             <Text style={styles.primaryButtonText}>Create New Character</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.secondaryButtonWide}
//             onPress={() => {
//               setIsNewCharacterFlow(false);
//             }}
//             disabled={isLoading}
//           >
//             <Text style={styles.secondaryButtonText}>Use Existing Character</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {isLoading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#4c8bf5" />
//         </View>
//       )}
//       {isNewCharacterFlow ? renderNewCharacterForm() : renderExistingCharacterList()}
//     </SafeAreaView>
//   );
// };


// const styles = StyleSheet.create({
//   loadingContainer: { // For full screen loading indicator
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f7f9fc',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#333',
//   },
//   loadingOverlay: { // For overlay loading indicator
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//     zIndex: 10, // Ensure it's on top
//   },
//     container: {
//     flex: 1,
//     backgroundColor: '#f7f9fc',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 40,
//   },
//   optionContainer: {
//     width: '100%',
//     alignItems: 'center',
//     gap: 15,
//   },
//   formContainer: {
//     width: '100%',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   listContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 20,
//     fontSize: 16,
//     color: '#333',
//     backgroundColor: '#fff',
//   },
//   imagePreview: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     marginVertical: 20,
//     borderWidth: 2,
//     borderColor: '#4c8bf5',
//   },
//   primaryButton: {
//     backgroundColor: '#4c8bf5',
//     paddingVertical: 14,
//     paddingHorizontal: 30,
//     borderRadius: 10,
//     marginTop: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   primaryButtonWide: {
//     backgroundColor: '#4c8bf5',
//     paddingVertical: 16,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   secondaryButton: {
//     backgroundColor: '#e0e7ff',
//     paddingVertical: 14,
//     paddingHorizontal: 30,
//     borderRadius: 10,
//     marginTop: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   secondaryButtonWide: {
//     backgroundColor: '#e0e7ff',
//     paddingVertical: 16,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   secondaryButtonText: {
//     color: '#4c8bf5',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   linkButton: {
//     marginTop: 20,
//     padding: 10,
//   },
//   linkButtonText: {
//     color: '#4c8bf5',
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   list: {
//     width: '100%',
//   },
//   characterItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },
//   characterItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 15,
//   },
//   characterItemText: {
//     fontSize: 18,
//     color: '#333',
//   },
//   emptyListText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: '#777',
//   },
// });

// export default Character;
























































































//working before whatsapp
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// تأكد من أن هذا هو عنوان ngrok URL الخاص بك النشط للباك إند
// const API_BASE_URL = 'https://YOUR_NGROK_SUBDOMAIN.ngrok-free.app'; // مثال، استبدله بعنوان URL الفعلي الخاص بك
const API_BASE_URL = 'https://3b3f-34-125-53-190.ngrok-free.app'; // ضع هنا عنوان الـ ngrok الخاص بك


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








//////////////////////////////////////////////////////////////////////////////////////////
///////// test codeeeee
// import React, { useState, useEffect, useRef } from 'react';
// import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as FileSystem from 'expo-file-system';
// import { useNavigation, useIsFocused } from '@react-navigation/native';

// // --- URLs ---
// // URL الخاص بسيرفر موديل الذكاء الاصطناعي (الذي تستخدم له ngrok)
// const AI_MODEL_API_URL = 'https://0860-34-82-46-40.ngrok-free.app';

// // URL الخاص بسيرفر واتساب الذي يعمل على جهازك المحلي
// // - إذا كنت تستخدم محاكي أندرويد (Android Emulator)، استخدم http://10.0.2.2:3000 (حيث 3000 هو البورت الذي يعمل عليه سيرفر Node.js)
// // - إذا كنت تستخدم جهازًا حقيقيًا، استبدل 10.0.2.2 بالـ IP المحلي لجهاز الكمبيوتر الخاص بك (مثال: http://192.168.1.5:3000)
// const WHATSAPP_API_URL = 'http://192.168.59.1:3000'; // مثال لمحاكي أندرويد، غيره حسب الحاجة


// const CharacterScreen = () => {
//     const navigation = useNavigation();
//     const isFocused = useIsFocused();
//     const [isNewCharacterFlow, setIsNewCharacterFlow] = useState(null); // null: initial, true: new, false: existing
//     const [name, setName] = useState('');
//     const [image, setImage] = useState(null);
//     const [characterList, setCharacterList] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);

//     // --- States for WhatsApp Import Flow ---
//     const [whatsAppFlowStep, setWhatsAppFlowStep] = useState('idle'); // 'idle', 'linking', 'selectingChat', 'importing'
//     const [linkingCode, setLinkingCode] = useState('');
//     const [whatsAppChats, setWhatsAppChats] = useState([]);
//     const pollIntervalRef = useRef(null);

//     // --- Effects ---
//     useEffect(() => {
//         // Load characters when the screen is focused or when returning from creating a new one
//         if (isFocused && isNewCharacterFlow === false) {
//             handleLoadCharacters();
//         }
//         // Reset flow if screen is not focused and we are in a WA flow
//         if(!isFocused && whatsAppFlowStep !== 'idle') {
//             resetWhatsAppFlow();
//         }
//     }, [isFocused, isNewCharacterFlow]);

//     // Cleanup interval on component unmount
//     useEffect(() => {
//         return () => {
//             if (pollIntervalRef.current) {
//                 clearInterval(pollIntervalRef.current);
//             }
//         };
//     }, []);

//     // --- Core Functions (Backend Communication) ---
//     const sendCharacterDataToBackend = async (characterDataPayload) => {
//         // This function now uses the AI_MODEL_API_URL
//         if (!AI_MODEL_API_URL || AI_MODEL_API_URL.includes('YOUR_NGROK_SUBDOMAIN')) {
//             Alert.alert('API Error', 'AI_MODEL_API_URL is not configured correctly.');
//             return false;
//         }
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${AI_MODEL_API_URL}/store_data`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(characterDataPayload),
//             });
//             const responseData = await response.json();
//             if (response.ok && responseData.status === 'success') {
//                 return true;
//             } else {
//                 Alert.alert('Backend Error', responseData.message || 'Failed to store data on the backend.');
//                 return false;
//             }
//         } catch (error) {
//             console.error('API call error:', error);
//             Alert.alert('API Call Error', `Failed to connect to the backend: ${error.message}.`);
//             return false;
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // --- WhatsApp Import Functions ---
//     const resetWhatsAppFlow = () => {
//         if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
//         setWhatsAppFlowStep('idle');
//         setLinkingCode('');
//         setWhatsAppChats([]);
//         setIsLoading(false);
//     };

//     const handleStartWhatsAppImport = async () => {
//         setIsLoading(true);
//         setWhatsAppFlowStep('linking');
//         try {
//             // This function now uses the WHATSAPP_API_URL
//             const response = await fetch(`${WHATSAPP_API_URL}/whatsapp/start-linking`, { method: 'POST' });
//             if (response.ok) {
//                 const data = await response.json();
//                 setLinkingCode(data.code);
//                 pollWhatsAppStatus(); // Start polling for status
//             } else {
//                 const errorData = await response.json();
//                 Alert.alert('Error', errorData.message || 'Failed to start linking process.');
//                 resetWhatsAppFlow();
//             }
//         } catch (error) {
//             Alert.alert('Connection Error', `Could not connect to the local WhatsApp server: ${error.message}`);
//             resetWhatsAppFlow();
//         }
//     };

//     const pollWhatsAppStatus = () => {
//         pollIntervalRef.current = setInterval(async () => {
//             try {
//                 // This function now uses the WHATSAPP_API_URL
//                 const response = await fetch(`${WHATSAPP_API_URL}/whatsapp/status`);
//                 const data = await response.json();
//                 if (data.status === 'ready') {
//                     clearInterval(pollIntervalRef.current);
//                     Alert.alert('Success', 'WhatsApp connected successfully!');
//                     await handleFetchWhatsAppChats();
//                 }
//             } catch (error) {
//                 console.error('Polling error:', error);
//                 // Optional: stop polling after a few errors
//             }
//         }, 5000); // Poll every 5 seconds
//     };

//     const handleFetchWhatsAppChats = async () => {
//         setIsLoading(true);
//         setWhatsAppFlowStep('selectingChat');
//         try {
//             // This function now uses the WHATSAPP_API_URL
//             const response = await fetch(`${WHATSAPP_API_URL}/whatsapp/chats`);
//             const chats = await response.json();
//             if (response.ok) {
//                 setWhatsAppChats(chats);
//             } else {
//                 Alert.alert('Error', chats.error || 'Failed to fetch chats.');
//                 resetWhatsAppFlow();
//             }
//         } catch (error) {
//             Alert.alert('Connection Error', `Could not fetch chats: ${error.message}`);
//             resetWhatsAppFlow();
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSelectWhatsAppChat = async (chat) => {
//         setIsLoading(true);
//         setWhatsAppFlowStep('importing');
//         try {
//             // This function now uses the WHATSAPP_API_URL
//             const response = await fetch(`${WHATSAPP_API_URL}/whatsapp/messages/${chat.id}`);
//             const data = await response.json();
//             if (response.ok) {
//                 await createCharacterFromWhatsApp(data.contactName, data.messages);
//             } else {
//                 Alert.alert('Error', data.error || 'Failed to fetch messages.');
//                 setWhatsAppFlowStep('selectingChat');
//             }
//         } catch (error) {
//             Alert.alert('Connection Error', `Could not fetch messages: ${error.message}`);
//             setWhatsAppFlowStep('selectingChat');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const createCharacterFromWhatsApp = async (characterName, messages) => {
//         // 1. Save chat to a local JSON file
//         const fileName = `chat_${characterName.replace(/\s+/g, '_')}_${Date.now()}.json`;
//         const fileUri = FileSystem.documentDirectory + fileName;
//         try {
//             await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(messages, null, 2));
//             console.log(`Chat saved locally to: ${fileUri}`);
//         } catch(e) {
//             console.error("Failed to save chat file locally", e);
//             Alert.alert("File System Error", "Could not save the chat history locally.");
//         }

//         // 2. Create character object and save to AsyncStorage
//         const newCharacter = {
//             id: `char_wa_${Date.now()}_${characterName.replace(/\s+/g, '_')}`,
//             name: characterName,
//             image: null, // User can add image later
//             bio: `Character created from a WhatsApp chat saved at: ${fileName}`,
//             questionnaireAnswers: { importedChat: messages },
//         };

//         const existingCharactersJSON = await AsyncStorage.getItem('characters');
//         const characters = existingCharactersJSON ? JSON.parse(existingCharactersJSON) : [];
//         characters.push(newCharacter);
//         await AsyncStorage.setItem('characters', JSON.stringify(characters));

//         // 3. Send data to the AI model backend
//         const characterDataForBackend = {
//             characterId: newCharacter.id,
//             characterName: newCharacter.name,
//             bio: newCharacter.bio,
//             answers: newCharacter.questionnaireAnswers,
//         };

//         const success = await sendCharacterDataToBackend(characterDataForBackend);
//         if (success) {
//             Alert.alert('Success!', `Character "${characterName}" was created and synced.`);
//         } else {
//             Alert.alert('Sync Failed', 'Character was saved locally, but failed to sync with the backend.');
//         }

//         // 4. Reset flow and navigate
//         resetWhatsAppFlow();
//         setIsNewCharacterFlow(false); // Go to existing characters list
//     };

//     // --- Regular Character Management Functions (Keep existing implementations) ---
//     const handleSaveNewCharacter = async () => {
//         if (!name.trim() || !image) {
//             Alert.alert('Missing Info', 'Please provide a name and an image.');
//             return;
//         }
//         setIsLoading(true);
//         try {
//             const filename = image.split('/').pop();
//             const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
//             const localImageUri = FileSystem.documentDirectory + `char_image_${Date.now()}_${sanitizedFilename}`;
//             await FileSystem.copyAsync({ from: image, to: localImageUri });

//             const newCharacter = {
//                 id: `char_${Date.now()}_${name.trim().replace(/\s+/g, '_')}`,
//                 name: name.trim(),
//                 image: localImageUri,
//                 bio: "",
//                 questionnaireAnswers: {},
//             };
//             const existingCharacters = JSON.parse(await AsyncStorage.getItem('characters') || '[]');
//             if (existingCharacters.some(char => char.name === newCharacter.name)) {
//                 Alert.alert('Duplicate Name', 'A character with this name already exists.');
//                 setIsLoading(false);
//                 return;
//             }
//             existingCharacters.push(newCharacter);
//             await AsyncStorage.setItem('characters', JSON.stringify(existingCharacters));
//             Alert.alert('Character Saved', 'Please complete the questionnaire.');
//             navigation.navigate('Questionnaire', { characterId: newCharacter.id });
//             setName('');
//             setImage(null);
//         } catch (error) {
//             Alert.alert('Error', 'Failed to save character.');
//         } finally {
//             setIsLoading(false);
//         }
//      };

//     const handlePickImage = async () => {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== 'granted') {
//             Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
//             return;
//         }
//         let result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: true,
//             aspect: [1, 1],
//             quality: 0.5,
//         });
//         if (!result.canceled) {
//             setImage(result.assets[0].uri);
//         }
//      };

//     const handleLoadCharacters = async () => {
//         setIsLoading(true);
//         try {
//             const data = await AsyncStorage.getItem('characters');
//             setCharacterList(data ? JSON.parse(data) : []);
//         } catch (error) {
//             Alert.alert('Error', 'Failed to load characters.');
//         }
//         setIsLoading(false);
//     };

//     const handleSelectExistingCharacter = async (character) => {
//         if (character.bio && character.questionnaireAnswers && Object.keys(character.questionnaireAnswers).length > 0) {
//             const payload = {
//                 characterId: character.id,
//                 characterName: character.name,
//                 bio: character.bio,
//                 answers: character.questionnaireAnswers,
//             };
//             const success = await sendCharacterDataToBackend(payload);
//             if (success) {
//                 navigation.navigate('Chat', { selectedCharacter: character });
//             } else {
//                 Alert.alert("Sync Failed", "Could not sync character with backend. You can try again.");
//             }
//         } else {
//             Alert.alert("Incomplete Profile", "Please complete the questionnaire for this character.");
//             navigation.navigate('Questionnaire', { characterId: character.id });
//         }
//     };


//     // --- UI Rendering ---

//     const renderInitialOptions = () => (
//         <View style={styles.optionContainer}>
//             <Text style={styles.title}>إعداد الشخصية</Text>
//             <TouchableOpacity style={styles.primaryButtonWide} onPress={() => setIsNewCharacterFlow(true)}>
//                 <Text style={styles.primaryButtonText}>إنشاء شخصية جديدة</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.secondaryButtonWide} onPress={() => setIsNewCharacterFlow(false)}>
//                 <Text style={styles.secondaryButtonText}>استخدام شخصية موجودة</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.tertiaryButtonWide} onPress={handleStartWhatsAppImport}>
//                 <Text style={styles.tertiaryButtonText}>استيراد شخصية من واتساب</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const renderWhatsAppLinkingScreen = () => (
//         <View style={styles.formContainer}>
//             <Text style={styles.heading}>ربط واتساب</Text>
//             <Text style={styles.instructions}>
//                 1. افتح واتساب على هاتفك.{"\n"}
//                 2. اذهب إلى الإعدادات {'>'} الأجهزة المرتبطة.{"\n"}
//                 3. اضغط على "ربط جهاز".{"\n"}
//                 4. اختر "الربط باستخدام رقم الهاتف" وأدخل الكود التالي:
//             </Text>
//             {linkingCode ? <Text style={styles.linkingCode}>{linkingCode}</Text> : <ActivityIndicator size="large" color="#4c8bf5" style={{ marginVertical: 20 }}/>}
//             <Text style={styles.waitingText}>في انتظار تأكيد الربط...</Text>
//             <TouchableOpacity style={styles.linkButton} onPress={() => { resetWhatsAppFlow(); setIsNewCharacterFlow(null); }}>
//                 <Text style={styles.linkButtonText}>إلغاء والعودة</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const renderWhatsAppChatList = () => (
//         <View style={styles.listContainer}>
//             <Text style={styles.heading}>اختر محادثة لاستيرادها</Text>
//             {isLoading ? <ActivityIndicator size="large" color="#4c8bf5" /> :
//                 <FlatList
//                     data={whatsAppChats}
//                     keyExtractor={(item) => item.id}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity style={styles.characterItem} onPress={() => handleSelectWhatsAppChat(item)}>
//                             <Text style={styles.characterItemText}>{item.name}</Text>
//                         </TouchableOpacity>
//                     )}
//                     ListEmptyComponent={<Text style={styles.emptyListText}>لم يتم العثور على محادثات.</Text>}
//                 />
//             }
//             <TouchableOpacity style={styles.linkButton} onPress={() => { resetWhatsAppFlow(); setIsNewCharacterFlow(null); }}>
//                 <Text style={styles.linkButtonText}>إلغاء والعودة</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const renderNewCharacterForm = () => (
//         <View style={styles.formContainer}>
//             <Text style={styles.heading}>إنشاء شخصية جديدة</Text>
//             <TextInput style={styles.input} placeholder="أدخل اسم الشخصية" value={name} onChangeText={setName} placeholderTextColor="#aaa" />
//             <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
//                 <Text style={styles.secondaryButtonText}>اختر صورة للشخصية</Text>
//             </TouchableOpacity>
//             {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
//             <TouchableOpacity style={[styles.primaryButton, isLoading ? styles.disabledButton : {}]} onPress={handleSaveNewCharacter} disabled={isLoading}>
//                 <Text style={styles.primaryButtonText}>حفظ ومتابعة إلى الاستبيان</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.linkButton, isLoading ? styles.disabledButton : {}]} onPress={() => setIsNewCharacterFlow(null)} disabled={isLoading}>
//                 <Text style={styles.linkButtonText}>العودة إلى الخيارات</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const renderExistingCharacterList = () => (
//         <View style={styles.listContainer}>
//             <Text style={styles.heading}>اختر شخصية موجودة</Text>
//             {characterList.length > 0 ? (
//                 <FlatList
//                     data={characterList}
//                     renderItem={({item}) => (
//                         <TouchableOpacity style={styles.characterItem} onPress={() => handleSelectExistingCharacter(item)} disabled={isLoading}>
//                             {item.image && <Image source={{ uri: item.image }} style={styles.characterItemImage} />}
//                             <Text style={styles.characterItemText}>{item.name}</Text>
//                         </TouchableOpacity>
//                     )}
//                     keyExtractor={(item) => item.id}
//                     style={styles.list}
//                 />
//             ) : (
//                 <Text style={styles.emptyListText}>لم يتم العثور على شخصيات. قم بإنشاء واحدة جديدة!</Text>
//             )}
//             <TouchableOpacity style={[styles.linkButton, isLoading ? styles.disabledButton : {}]} onPress={() => setIsNewCharacterFlow(null)} disabled={isLoading}>
//                 <Text style={styles.linkButtonText}>العودة إلى الخيارات</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const renderMainContent = () => {
//         // WhatsApp Flow
//         if (whatsAppFlowStep === 'linking') return renderWhatsAppLinkingScreen();
//         if (whatsAppFlowStep === 'selectingChat') return renderWhatsAppChatList();
//         if (whatsAppFlowStep === 'importing') {
//             return (
//                 <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="large" color="#4c8bf5" />
//                     <Text style={styles.loadingText}>جاري استيراد المحادثة...</Text>
//                 </View>
//             );
//         }

//         // Regular Flow
//         if (isNewCharacterFlow === null) return renderInitialOptions();
//         if (isNewCharacterFlow === true) return renderNewCharacterForm();
//         if (isNewCharacterFlow === false) return renderExistingCharacterList();

//         return null;
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             {isLoading && whatsAppFlowStep === 'idle' && (
//                 <View style={styles.loadingOverlay}>
//                     <ActivityIndicator size="large" color="#4c8bf5" />
//                 </View>
//             )}
//             {renderMainContent()}
//         </SafeAreaView>
//     );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f0f2f5' },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
//     loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
//     formContainer: { flex: 1, padding: 20, justifyContent: 'center' },
//     listContainer: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
//     optionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//     title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 40, textAlign: 'center' },
//     heading: { fontSize: 22, fontWeight: '600', color: '#3b3b3b', marginBottom: 25, textAlign: 'center' },
//     input: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', color: '#333' },
//     imagePreview: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginVertical: 20, borderWidth: 2, borderColor: '#4c8bf5' },
//     primaryButton: { backgroundColor: '#4c8bf5', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, elevation: 2 },
//     primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//     secondaryButton: { backgroundColor: '#eef2f7', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#d0d7e0' },
//     secondaryButtonText: { color: '#4c8bf5', fontSize: 16, fontWeight: '500' },
//     primaryButtonWide: { backgroundColor: '#4c8bf5', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 8, alignItems: 'center', marginBottom: 15, width: '90%', elevation: 2 },
//     secondaryButtonWide: { backgroundColor: '#eef2f7', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 8, alignItems: 'center', marginBottom: 15, width: '90%', borderWidth: 1, borderColor: '#d0d7e0' },
//     tertiaryButtonWide: { backgroundColor: '#25D366', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 8, alignItems: 'center', marginBottom: 20, width: '90%', elevation: 2 },
//     tertiaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//     linkButton: { marginTop: 15, alignItems: 'center', padding: 10 },
//     linkButtonText: { color: '#4c8bf5', fontSize: 15, fontWeight: '500' },
//     disabledButton: { opacity: 0.6 },
//     list: { marginTop: 10 },
//     characterItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', elevation: 1 },
//     characterItemImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
//     characterItemText: { fontSize: 17, color: '#333', fontWeight: '500' },
//     emptyListText: { textAlign: 'center', fontSize: 16, color: '#777', marginTop: 30 },
//     // Styles for WhatsApp Flow
//     instructions: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 20, lineHeight: 24 },
//     linkingCode: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', letterSpacing: 8, marginVertical: 20, padding: 10, backgroundColor: '#eef2f7', borderRadius: 8 },
//     waitingText: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 10 },
// });

// export default CharacterScreen;