// import React, { useState,useEffect  } from 'react';
// import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const questions = [
//   { question: "What is your name?", key: "name", type: "text" },
//   { question: "How old are you?", key: "age", type: "text" },
//   { question: "Where do you live?", key: "location", type: "text" },
//   { question: "What makes you happy?", key: "happy_things", type: "text" },
//   { question: "What usually makes you sad?", key: "sad_things", type: "text" },
//   { question: "What is your biggest dream?", key: "biggest_dream", type: "text" },
//   { question: "What are you passionate about?", key: "passions", type: "text" },
//   { question: "What scares you the most?", key: "biggest_fear", type: "text" },
//   { question: "If you could change one thing about yourself, what would it be?", key: "change_about_self", type: "text" },
//   { question: "What is something you're very proud of?", key: "proud_of", type: "text" },
//   { question: "What helps you calm down when you're stressed?", key: "stress_relief", type: "text" },
//   { question: "How would you describe yourself?", key: "self_description", type: "mcq", choices: ["Introverted", "Extroverted", "Ambivert", "Depends on mood"] },
//   { question: "What is your love language?", key: "love_language", type: "mcq", choices: ["Words of affirmation", "Acts of service", "Receiving gifts", "Quality time", "Physical touch"] },
//   { question: "Are you more emotional or logical?", key: "thinking_style", type: "mcq", choices: ["Emotional", "Logical", "Balanced"] },
//   { question: "Do you prefer to plan everything or be spontaneous?", key: "planning_style", type: "mcq", choices: ["Planner", "Spontaneous", "Depends"] },
//   { question: "What are your hobbies?", key: "hobbies", type: "mcq", choices: ["Painting", "Reading", "Swimming", "Cooking", "Traveling", "Photography", "Dancing", "Writing", "Gaming", "Hiking"] },
//   { question: "How do you usually spend your weekends?", key: "weekend_activities", type: "mcq", choices: ["Going out", "Staying at home", "Hanging out with friends", "Working on hobbies", "Studying"] },
//   { question: "Do you like outdoor activities?", key: "likes_outdoor", type: "mcq", choices: ["Yes", "No", "Sometimes"] },
//   { question: "Are you currently in a relationship?", key: "relationship_status", type: "mcq", choices: ["Yes", "No", "It's complicated"] },
//   { question: "What kind of relationship are you looking for?", key: "relationship_goal", type: "mcq", choices: ["Friendship", "Romantic", "Mentorship", "Just chatting", "Not sure"] },
//   { question: "How important is trust for you in a relationship?", key: "importance_of_trust", type: "mcq", choices: ["Very important", "Somewhat important", "Not very important"] },
//   { question: "Where would you like to live in the future?", key: "future_residence", type: "mcq", choices: ["City", "Countryside", "Another country", "Near the beach", "In the mountains"] },
//   { question: "What is your dream job?", key: "dream_job", type: "text" },
//   { question: "Do you want to have children someday?", key: "wants_children", type: "mcq", choices: ["Yes", "No", "Maybe"] },
//   { question: "What is your favorite season?", key: "favorite_season", type: "mcq", choices: ["Spring", "Summer", "Autumn", "Winter"] },
//   { question: "Do you prefer cats or dogs?", key: "pet_preference", type: "mcq", choices: ["Cats", "Dogs", "Both", "Neither"] },
//   { question: "What is your favorite type of music?", key: "music_preference", type: "mcq", choices: ["Pop", "Rock", "Classical", "Hip-hop", "Jazz", "Other"] },
// ];

// export default function Questionnaire({ navigation }) {
//   const [personaName, setPersonaName] = useState('');
//   const [personaBio, setPersonaBio] = useState('');
//   const [showIntro, setShowIntro] = useState(true);

//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState({});

//   const current = questions[index];

//   const handleNext = async () => {
//     if (!answers[current.key]) {
//       Alert.alert("Please answer the question before continuing.");
//       return;
//     }
//     if (index + 1 < questions.length) {
//       setIndex(index + 1);
//     } else {
//       const fullData = {
//         persona: {
//           name: personaName,
//           bio: personaBio
//         },
//         answers
//       };
//       await AsyncStorage.setItem("questionnaire_answers", JSON.stringify(fullData));
//       await sendToServer(fullData);
//       navigation.navigate("Chat");
//     }
//   };
//   const sendToServer = async (data) => {
//     try {
//       const response = await fetch("https://20d0-34-82-142-230.ngrok-free.app/store_data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data)
//       });

//       const result = await response.json();
//       console.log("Response from server:", result);
//     } catch (error) {
//       console.error("Error sending data:", error);
//     }
//   };

//   const handleSelect = (value) => {
//     setAnswers({ ...answers, [current.key]: value });
//   };

//   if (showIntro) {
//     return (
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.question}>Enter the persona's name:</Text>
//         <TextInput
//           style={styles.input}
//           value={personaName}
//           onChangeText={setPersonaName}
//           placeholder="e.g. Layla, Mark..."
//         />

//         <Text style={styles.question}>Enter a short bio (description):</Text>
//         <TextInput
//           style={[styles.input, { height: 100 }]}
//           value={personaBio}
//           onChangeText={setPersonaBio}
//           placeholder="Describe this character in a few lines..."
//           multiline
//         />

//         <TouchableOpacity
//           style={styles.nextBtn}
//           onPress={() => {
//             if (!personaName || !personaBio) {
//               Alert.alert("Please fill out both the name and bio.");
//               return;
//             }
//             setShowIntro(false);
//           }}
//         >
//           <Text style={styles.nextBtnText}>Start Questions</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.question}>{current.question}</Text>

//       {current.type === "text" ? (
//         <TextInput
//           style={styles.input}
//           value={answers[current.key] || ""}
//           onChangeText={(text) => handleSelect(text)}
//           placeholder="Type your answer..."
//         />
//       ) : (
//         current.choices.map((choice, i) => (
//           <TouchableOpacity
//             key={i}
//             style={[
//               styles.choice,
//               answers[current.key] === choice && styles.choiceSelected,
//             ]}
//             onPress={() => handleSelect(choice)}
//           >
//             <Text>{choice}</Text>
//           </TouchableOpacity>
//         ))
//       )}

//       <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
//         <Text style={styles.nextBtnText}>{index + 1 === questions.length ? "Finish" : "Next"}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   question: {
//     fontSize: 18,
//     marginBottom: 20,
//     fontWeight: '600',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 20,
//   },
//   choice: {
//     padding: 12,
//     marginVertical: 5,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//   },
//   choiceSelected: {
//     backgroundColor: '#d0f0c0',
//     borderColor: '#4CAF50',
//   },
//   nextBtn: {
//     backgroundColor: '#007BFF',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   nextBtnText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });


/////////////////////////////////////////////////////////////////////////////////////////////


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   ActivityIndicator
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation, useRoute } from '@react-navigation/native';

// const API_BASE_URL = 'https://3b76-34-125-3-76.ngrok-free.app';


// const questions = [
//   // Your questions array remains the same...
//   // For brevity, I'm omitting it here, but keep it as it is in your original code.
//   // { question: "What is your name?", key: "name_q", type: "text" }, // Renamed key to avoid conflict if needed elsewhere
//   { question: "How old are you?", key: "age", type: "text" },
//   { question: "Where do you live?", key: "location", type: "text" },
//   { question: "What makes you happy?", key: "happy_things", type: "text" },
//   { question: "What usually makes you sad?", key: "sad_things", type: "text" },
//   { question: "What is your biggest dream?", key: "biggest_dream", type: "text" },
//   { question: "What are you passionate about?", key: "passions", type: "text" },
//   { question: "What scares you the most?", key: "biggest_fear", type: "text" },
//   { question: "If you could change one thing about yourself, what would it be?", key: "change_about_self", type: "text" },
//   { question: "What is something you're very proud of?", key: "proud_of", type: "text" },
//   { question: "What helps you calm down when you're stressed?", key: "stress_relief", type: "text" },
//   { question: "How would you describe yourself?", key: "self_description", type: "mcq", choices: ["Introverted", "Extroverted", "Ambivert", "Depends on mood"] },
//   { question: "What is your love language?", key: "love_language", type: "mcq", choices: ["Words of affirmation", "Acts of service", "Receiving gifts", "Quality time", "Physical touch"] },
//   { question: "Are you more emotional or logical?", key: "thinking_style", type: "mcq", choices: ["Emotional", "Logical", "Balanced"] },
//   { question: "Do you prefer to plan everything or be spontaneous?", key: "planning_style", type: "mcq", choices: ["Planner", "Spontaneous", "Depends"] },
//   { question: "What are your hobbies?", key: "hobbies", type: "mcq", choices: ["Painting", "Reading", "Swimming", "Cooking", "Traveling", "Photography", "Dancing", "Writing", "Gaming", "Hiking"] },
//   { question: "How do you usually spend your weekends?", key: "weekend_activities", type: "mcq", choices: ["Going out", "Staying at home", "Hanging out with friends", "Working on hobbies", "Studying"] },
//   { question: "Do you like outdoor activities?", key: "likes_outdoor", type: "mcq", choices: ["Yes", "No", "Sometimes"] },
//   { question: "Are you currently in a relationship?", key: "relationship_status", type: "mcq", choices: ["Yes", "No", "It's complicated"] },
//   { question: "What kind of relationship are you looking for?", key: "relationship_goal", type: "mcq", choices: ["Friendship", "Romantic", "Mentorship", "Just chatting", "Not sure"] },
//   { question: "How important is trust for you in a relationship?", key: "importance_of_trust", type: "mcq", choices: ["Very important", "Somewhat important", "Not very important"] },
//   { question: "Where would you like to live in the future?", key: "future_residence", type: "mcq", choices: ["City", "Countryside", "Another country", "Near the beach", "In the mountains"] },
//   { question: "What is your dream job?", key: "dream_job", type: "text" },
//   { question: "Do you want to have children someday?", key: "wants_children", type: "mcq", choices: ["Yes", "No", "Maybe"] },
//   { question: "What is your favorite season?", key: "favorite_season", type: "mcq", choices: ["Spring", "Summer", "Autumn", "Winter"] },
//   { question: "Do you prefer cats or dogs?", key: "pet_preference", type: "mcq", choices: ["Cats", "Dogs", "Both", "Neither"] },
//   { question: "What is your favorite type of music?", key: "music_preference", type: "mcq", choices: ["Pop", "Rock", "Classical", "Hip-hop", "Jazz", "Other"] },
// ];

// const Questionnaire = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { characterId } = route.params; // Expecting characterId
//   const [answers, setAnswers] = useState({});
//   const [characterName, setCharacterName] = useState(''); // To display character name
//   const [isLoading, setIsLoading] = useState(false); // حالة للتحميل
//   const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
//   const [bio, setBio] = useState(''); // لإدارة نص النبذة الشخصية

//   useEffect(() => {
//     const loadCharacterData = async () => {
//       if (!characterId) {
//         Alert.alert('Error', 'Character ID is missing.');
//         setIsFetchingInitialData(false);
//         navigation.goBack();
//         return;
//       }
//       setIsFetchingInitialData(true);
//       try {
//         const existingCharactersJson = await AsyncStorage.getItem('characters');
//         if (existingCharactersJson) {
//           const characters = JSON.parse(existingCharactersJson);
//           const currentChar = characters.find(char => char.id === characterId);
//           if (currentChar) {
//             setCharacterName(currentChar.name);
//             if (currentChar.bio) {
//               setBio(currentChar.bio);
//             }
//             if (currentChar.questionnaireAnswers) {
//               setAnswers(currentChar.questionnaireAnswers);
//             }
//           } else {
//             Alert.alert('Error', 'Character not found in local storage.');
//             navigation.goBack();
//           }
//         } else {
//           Alert.alert('Error', 'No characters found in local storage.');
//           navigation.goBack();
//         }
//       } catch (error) {
//         console.error('Error loading character for questionnaire:', error);
//         Alert.alert('Error', 'Could not load character data locally.');
//         navigation.goBack();
//       }
//       setIsFetchingInitialData(false);
//     };

//     loadCharacterData();
//   }, [characterId, navigation]);

//   const handleTextChange = (key, value) => {
//     setAnswers(prev => ({ ...prev, [key]: value }));
//   };

//   const handleMCQSelect = (key, choice) => {
//     setAnswers(prev => ({ ...prev, [key]: choice }));
//   };

//   const handleSubmit = async () => {
//     if (!bio.trim()) {
//       Alert.alert('Bio Required', `Please write a short bio for ${characterName}.`);
//       // setIsLoading(false); // أوقف التحميل إذا كنت قد بدأته قبل هذا التحقق
//       return;
//     }
//     if (Object.keys(answers).length < 1) { // Require at least 1 answer, adjust as needed
//       Alert.alert('Incomplete', 'Please answer at least one question.');
//       return;
//     }
//     if (!API_BASE_URL || API_BASE_URL === 'YOUR_NGROK_PUBLIC_URL') {
//       Alert.alert('API Error', 'Please set the API_BASE_URL in QuestionnaireScreen.js');
//       return;
//     }

//     setIsLoading(true);
//     try {

//       // 1. Save to AsyncStorage
//       const existingCharactersJson = await AsyncStorage.getItem('characters');
//       let characters = existingCharactersJson ? JSON.parse(existingCharactersJson) : [];
//       let updatedCharacterForChat = null;

//       const updatedCharacters = characters.map(char => {
//         if (char.id === characterId) {
//           updatedCharacterForChat = { ...char, bio: bio.trim(), questionnaireAnswers: answers }; return updatedCharacterForChat;
//         }
//         return char;
//       });

//       if (!updatedCharacterForChat) {
//         Alert.alert('Error', 'Could not find the character to update locally.');
//         setIsLoading(false);
//         return;
//       }
//       await AsyncStorage.setItem('characters', JSON.stringify(updatedCharacters));
//       // Alert.alert('Success', 'Questionnaire saved locally!'); // اختياري
//       const dataToSendToApi = {
//         characterId: characterId,     // متوفر من route.params
//         characterName: characterName, // متوفر من state
//         bio: bio.trim(),
//         answers: answers              // إجابات الاستبيان
//       };
//       // 2. Send to API
//       const response = await fetch(`${API_BASE_URL}/store_data`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(dataToSendToApi), // Send only answers as per backend
//       });
//       const responseData = await response.json();

//       setIsLoading(false);
//       if (response.ok && responseData.status === 'success') {
//         // Alert.alert('API Success', responseData.message); // اختياري
//         navigation.navigate('Chat', { selectedCharacter: updatedCharacterForChat });
//       } else {
//         Alert.alert('API Error', responseData.message || 'Failed to store data in backend. Data is saved locally.');
//         // يمكن اختيار الانتقال للدردشة حتى لو فشل الإرسال للـ API، أو منعه
//         // navigation.navigate('Chat', { selectedCharacter: updatedCharacterForChat }); // إذا أردت السماح بالدردشة
//       }

//     } catch (error) {
//       setIsLoading(false);
//       console.error('Error saving questionnaire or sending to API:', error);
//       Alert.alert('Operation Error', `An error occurred: ${error.message}. Data might be saved locally only.`);
//     }
//   };

//   if (isFetchingInitialData) {
//     return (
//       <View style={[styles.container, styles.loadingContainer]}>
//         <ActivityIndicator size="large" color="#4c8bf5" />
//         <Text>Loading Character Info...</Text>
//       </View>
//     );
//   }

//   if (!characterName && !isFetchingInitialData) { // Check after fetching is done
//     // This case should ideally be handled by navigation.goBack() in useEffect
//     return (
//       <View style={styles.container}>
//         <Text>Character not found or ID missing.</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.submitButton}>
//           <Text style={styles.submitButtonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }


//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {isLoading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#4c8bf5" />
//         </View>
//       )}
//       <Text style={styles.title}>Tell us about {characterName}</Text>
//       {/* حقل النبذة الشخصية (Bio) */}
//       <View style={styles.questionContainer}>
//         <Text style={styles.questionText}>About {characterName} (Bio):</Text>
//         <TextInput
//           style={[styles.input, styles.bioInput]} // يمكن إضافة style خاص للـ bio إذا أردت
//           placeholder={`Tell us a bit about ${characterName}... (e.g., interests, personality traits)`}
//           placeholderTextColor="#aaa"
//           value={bio}
//           onChangeText={setBio}
//           editable={!isLoading}
//           multiline={true}
//           numberOfLines={4} // يمكنك تعديل عدد الأسطر الظاهرة
//         />
//       </View>
//       {questions.map((q, idx) => (
//         <View key={idx} style={styles.questionContainer}>
//           <Text style={styles.questionText}>{q.question}</Text>
//           {q.type === 'text' ? (
//             <TextInput
//               style={styles.input}
//               placeholder="Type your answer"
//               placeholderTextColor="#aaa"
//               value={answers[q.key] || ''}
//               onChangeText={text => handleTextChange(q.key, text)}
//               editable={!isLoading}
//             />
//           ) : (
//             <View style={styles.choicesContainer}>
//               {q.choices.map((choice, i) => (
//                 <TouchableOpacity
//                   key={i}
//                   style={[
//                     styles.choiceButton,
//                     answers[q.key] === choice && styles.choiceButtonSelected,
//                     isLoading && styles.disabledButton // لتعتيم الأزرار أثناء التحميل
//                   ]}
//                   onPress={() => !isLoading && handleMCQSelect(q.key, choice)}
//                   disabled={isLoading}
//                 >
//                   <Text
//                     style={[
//                       styles.choiceText,
//                       answers[q.key] === choice && styles.choiceTextSelected,
//                     ]}
//                   >
//                     {choice}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         </View>
//       ))}
//       <TouchableOpacity style={[styles.submitButton, isLoading && styles.disabledButton]} onPress={handleSubmit} disabled={isLoading}>
//         <Text style={styles.submitButtonText}>Continue to Chat</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// // ... (styles remain the same, add styles for loading if needed)
// const styles = StyleSheet.create({
//   // ... (all your existing styles)
//   loadingContainer: { // For full screen loading indicator
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
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
//     zIndex: 10,
//   },
//   disabledButton: {
//     backgroundColor: '#ccc',
//     borderColor: '#bbb',
//   },
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//     paddingBottom: 40,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 20,
//     color: '#333',
//     textAlign: 'center',
//   },
//   // في كائن styles
//   bioInput: {
//     height: 100, // مثال: ارتفاع مخصص
//     textAlignVertical: 'top', // لبدء النص من الأعلى في أندرويد
//   },
//   questionContainer: {
//     marginBottom: 20,
//   },
//   questionText: {
//     fontSize: 16,
//     marginBottom: 10,
//     color: '#444',
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     fontSize: 15,
//     backgroundColor: '#f9f9f9',
//     color: '#333',
//   },
//   choicesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   choiceButton: {
//     borderWidth: 1,
//     borderColor: '#4c8bf5',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   choiceButtonSelected: {
//     backgroundColor: '#4c8bf5',
//   },
//   choiceText: {
//     color: '#4c8bf5',
//     fontSize: 14,
//   },
//   choiceTextSelected: {
//     color: '#fff',
//   },
//   submitButton: {
//     backgroundColor: '#4c8bf5',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });


// export default Questionnaire;


















































































import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

// تأكد من أن هذا هو عنوان ngrok URL الخاص بك النشط للباك إند
// const API_BASE_URL = 'https://YOUR_NGROK_SUBDOMAIN.ngrok-free.app'; // مثال
const API_BASE_URL = 'https://0860-34-82-46-40.ngrok-free.app'; // ضع هنا عنوان الـ ngrok الخاص بك


const questions = [
  // { question: "What is your name?", key: "name_q", type: "text" }, // مثال: الباك إند لا يستخدم هذا بشكل مباشر للـ RAG. الاسم يأتي من characterName.
  { question: "How old are you?", key: "age", type: "text" },
  { question: "Where do you live?", key: "location", type: "text" },
  { question: "What makes you happy?", key: "happy_things", type: "text" },
  { question: "What usually makes you sad?", key: "sad_things", type: "text" },
  { question: "What is your biggest dream?", key: "biggest_dream", type: "text" },
  { question: "What are you passionate about?", key: "passions", type: "text" },
  { question: "What scares you the most?", key: "biggest_fear", type: "text" },
  { question: "If you could change one thing about yourself, what would it be?", key: "change_about_self", type: "text" },
  { question: "What is something you're very proud of?", key: "proud_of", type: "text" },
  { question: "What helps you calm down when you're stressed?", key: "stress_relief", type: "text" },
  { question: "How would you describe yourself?", key: "self_description", type: "mcq", choices: ["Introverted", "Extroverted", "Ambivert", "Depends on mood"] },
  { question: "What is your love language?", key: "love_language", type: "mcq", choices: ["Words of affirmation", "Acts of service", "Receiving gifts", "Quality time", "Physical touch"] },
  { question: "Are you more emotional or logical?", key: "thinking_style", type: "mcq", choices: ["Emotional", "Logical", "Balanced"] },
  { question: "Do you prefer to plan everything or be spontaneous?", key: "planning_style", type: "mcq", choices: ["Planner", "Spontaneous", "Depends"] },
  { question: "What are your hobbies?", key: "hobbies", type: "mcq", choices: ["Painting", "Reading", "Swimming", "Cooking", "Traveling", "Photography", "Dancing", "Writing", "Gaming", "Hiking"] },
  { question: "How do you usually spend your weekends?", key: "weekend_activities", type: "mcq", choices: ["Going out", "Staying at home", "Hanging out with friends", "Working on hobbies", "Studying"] },
  { question: "Do you like outdoor activities?", key: "likes_outdoor", type: "mcq", choices: ["Yes", "No", "Sometimes"] },
  { question: "Are you currently in a relationship?", key: "relationship_status", type: "mcq", choices: ["Yes", "No", "It's complicated"] },
  { question: "What kind of relationship are you looking for?", key: "relationship_goal", type: "mcq", choices: ["Friendship", "Romantic", "Mentorship", "Just chatting", "Not sure"] },
  { question: "How important is trust for you in a relationship?", key: "importance_of_trust", type: "mcq", choices: ["Very important", "Somewhat important", "Not very important"] },
  { question: "Where would you like to live in the future?", key: "future_residence", type: "mcq", choices: ["City", "Countryside", "Another country", "Near the beach", "In the mountains"] },
  { question: "What is your dream job?", key: "dream_job", type: "text" },
  { question: "Do you want to have children someday?", key: "wants_children", type: "mcq", choices: ["Yes", "No", "Maybe"] },
  { question: "What is your favorite season?", key: "favorite_season", type: "mcq", choices: ["Spring", "Summer", "Autumn", "Winter"] },
  { question: "Do you prefer cats or dogs?", key: "pet_preference", type: "mcq", choices: ["Cats", "Dogs", "Both", "Neither"] },
  { question: "What is your favorite type of music?", key: "music_preference", type: "mcq", choices: ["Pop", "Rock", "Classical", "Hip-hop", "Jazz", "Other"] },
];

const QuestionnaireScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { characterId } = route.params; // توقع characterId من المسار

  const [answers, setAnswers] = useState({});
  const [characterName, setCharacterName] = useState('');
  const [bio, setBio] = useState(''); // لإدارة نص السيرة الذاتية
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل العامة
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true); // حالة تحميل البيانات الأولية

  useEffect(() => {
    const loadCharacterData = async () => {
      if (!characterId) {
        Alert.alert('خطأ', 'معرف الشخصية مفقود. لا يمكن تحميل البيانات.');
        setIsFetchingInitialData(false);
        if (navigation.canGoBack()) navigation.goBack(); // حاول العودة إذا أمكن
        return;
      }
      setIsFetchingInitialData(true);
      try {
        const existingCharactersJson = await AsyncStorage.getItem('characters');
        if (existingCharactersJson) {
          const characters = JSON.parse(existingCharactersJson);
          const currentChar = characters.find(char => char.id === characterId);
          if (currentChar) {
            setCharacterName(currentChar.name || ''); // تأكد أن الاسم ليس undefined
            setBio(currentChar.bio || ''); // تأكد أن السيرة الذاتية ليست undefined
            setAnswers(currentChar.questionnaireAnswers || {}); // تأكد أن الإجابات ليست undefined
          } else {
            Alert.alert('خطأ', 'لم يتم العثور على الشخصية في التخزين المحلي.');
            if (navigation.canGoBack()) navigation.goBack();
          }
        } else {
          Alert.alert('خطأ', 'لا توجد شخصيات محفوظة في التخزين المحلي.');
          if (navigation.canGoBack()) navigation.goBack();
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات الشخصية للاستبيان:', error);
        Alert.alert('خطأ', 'تعذر تحميل بيانات الشخصية محليًا.');
        if (navigation.canGoBack()) navigation.goBack();
      }
      setIsFetchingInitialData(false);
    };

    loadCharacterData();
  }, [characterId, navigation]); // الاعتماديات الصحيحة لـ useEffect

  const handleTextChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleMCQSelect = (key, choice) => {
    setAnswers(prev => ({ ...prev, [key]: choice }));
  };

  const handleSubmit = async () => {
    if (!bio.trim()) {
      Alert.alert('السيرة الذاتية مطلوبة', `الرجاء كتابة سيرة ذاتية مختصرة لـ ${characterName || 'الشخصية'}.`);
      return;
    }
    // يمكنك تعديل الحد الأدنى لعدد الإجابات المطلوبة.
    const answeredQuestionsCount = Object.values(answers).filter(ans => ans && String(ans).trim() !== "").length;
    if (answeredQuestionsCount < 1) { // يتطلب إجابة واحدة على الأقل
      Alert.alert('غير مكتمل', 'الرجاء الإجابة على سؤال واحد على الأقل من الاستبيان.');
      return;
    }

    if (!API_BASE_URL || API_BASE_URL.includes('YOUR_NGROK_SUBDOMAIN') || API_BASE_URL === '') {
      Alert.alert('خطأ في الـ API', 'لم يتم تكوين API_BASE_URL بشكل صحيح. يرجى التحقق منه.');
      return;
    }

    setIsLoading(true);
    let updatedCharacterForChat = null; // لتخزين بيانات الشخصية المحدثة للتمرير

    try {
      // 1. حفظ التحديثات في AsyncStorage
      const existingCharactersJson = await AsyncStorage.getItem('characters');
      let characters = existingCharactersJson ? JSON.parse(existingCharactersJson) : [];

      const updatedCharacters = characters.map(char => {
        if (char.id === characterId) {
          // قم بتحديث كائن الشخصية بالبيانات الجديدة
          updatedCharacterForChat = { ...char, name: characterName, bio: bio.trim(), questionnaireAnswers: answers };
          return updatedCharacterForChat;
        }
        return char;
      });

      if (!updatedCharacterForChat) {
        Alert.alert('خطأ', 'تعذر العثور على الشخصية لتحديثها محليًا.');
        setIsLoading(false);
        return;
      }
      await AsyncStorage.setItem('characters', JSON.stringify(updatedCharacters));
      // Alert.alert('نجاح', 'تم حفظ الاستبيان محليًا!'); // اختياري

      // تجهيز البيانات لإرسالها إلى الباك إند
      const dataToSendToApi = {
        characterId: characterId,
        characterName: characterName, // تأكد من أن characterName محدث (من state)
        bio: bio.trim(),
        answers: answers, // كائن الإجابات {key: value}
      };

      // 2. إرسال البيانات إلى الباك إند API
      const response = await fetch(`${API_BASE_URL}/store_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSendToApi),
      });
      const responseData = await response.json();

      setIsLoading(false); // إيقاف التحميل بعد محاولة استدعاء الـ API

      if (response.ok && responseData.status === 'success') {
        // Alert.alert('نجاح الـ API', responseData.message); // اختياري
        navigation.navigate('Chat', { selectedCharacter: updatedCharacterForChat });
      } else {
        Alert.alert('خطأ من الـ API', `${responseData.message || 'فشل تخزين البيانات في الباك إند.'} (تم حفظ البيانات محليًا)`);
        // يمكنك اختيار ما إذا كنت ستسمح بالانتقال إلى الدردشة حتى لو فشلت المزامنة
        // حاليًا، سنسمح بالانتقال لأن البيانات محفوظة محليًا.
         navigation.navigate('Chat', { selectedCharacter: updatedCharacterForChat });
      }

    } catch (error) {
      setIsLoading(false);
      console.error('خطأ في حفظ الاستبيان أو إرساله إلى الـ API:', error);
      Alert.alert('خطأ في العملية', `حدث خطأ: ${error.message}. قد تكون البيانات محفوظة محليًا فقط.`);
       // إذا حدث خطأ، من المحتمل أن البيانات قد حُفظت محليًا (إذا نجح جزء AsyncStorage)
       // قد ترغب في السماح بالانتقال أو توفير خيار لإعادة المحاولة.
       if (updatedCharacterForChat) { // إذا تم تجهيز الحفظ المحلي
           // navigation.navigate('Chat', { selectedCharacter: updatedCharacterForChat });
       }
    }
  };

  if (isFetchingInitialData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4c8bf5" />
        <Text style={styles.loadingText}>جاري تحميل معلومات الشخصية...</Text>
      </View>
    );
  }

  // هذا التحقق هو احتياطي؛ يجب أن يعالج useEffect التنقل إذا كان characterId غير صالح
  if (!characterName && !isFetchingInitialData) { // تحقق بعد انتهاء جلب البيانات
    return (
      <View style={[styles.container, styles.centeredMessageContainer]}>
        <Text style={styles.errorMessageText}>لم يتم العثور على الشخصية أو أن المعرف مفقود.</Text>
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {isLoading && ( // مؤشر تحميل عام للصفحة أثناء العمليات
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4c8bf5" />
        </View>
      )}
      <Text style={styles.title}>أخبرنا عن {characterName || "الشخصية"}</Text>

      {/* حقل السيرة الذاتية (Bio) */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>عن {characterName || "الشخصية"} (السيرة الذاتية - Bio):</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder={`اكتب نبذة مختصرة عن ${characterName || 'الشخصية'}... (مثال: الاهتمامات، السمات الشخصية)`}
          placeholderTextColor="#aaa"
          value={bio}
          onChangeText={setBio}
          editable={!isLoading} // تعطيل التحرير أثناء التحميل
          multiline={true}
          numberOfLines={4} // يمكنك تعديل عدد الأسطر الظاهرة
        />
      </View>

      {/* عرض الأسئلة */}
      {questions.map((q, idx) => (
        <View key={q.key || idx} style={styles.questionContainer}> {/* استخدام q.key كمفتاح إذا كان فريدًا */}
          <Text style={styles.questionText}>{idx + 1}. {q.question}</Text>
          {q.type === 'text' ? (
            <TextInput
              style={styles.input}
              placeholder="اكتب إجابتك هنا"
              placeholderTextColor="#aaa"
              value={answers[q.key] || ''}
              onChangeText={text => handleTextChange(q.key, text)}
              editable={!isLoading}
            />
          ) : ( // نوع السؤال MCQ
            <View style={styles.choicesContainer}>
              {q.choices.map((choice, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.choiceButton,
                    answers[q.key] === choice && styles.choiceButtonSelected,
                    isLoading && styles.disabledButton // تطبيق نمط التعطيل أثناء التحميل
                  ]}
                  onPress={() => !isLoading && handleMCQSelect(q.key, choice)} // منع الضغط أثناء التحميل
                  disabled={isLoading} // تعطيل الزر نفسه
                >
                  <Text
                    style={[
                      styles.choiceText,
                      answers[q.key] === choice && styles.choiceTextSelected,
                    ]}
                  >
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={[styles.submitButton, isLoading && styles.disabledButton]} onPress={handleSubmit} disabled={isLoading}>
        <Text style={styles.submitButtonText}>حفظ والمتابعة إلى الدردشة</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// الأنماط (styles) - تم تحسينها قليلاً عن النسخ السابقة
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40, // مسافة إضافية في الأسفل
    backgroundColor: '#f0f2f5', // لون خلفية فاتح متناسق
  },
  container: { // لحالات التحميل/الخطأ التي تملأ الشاشة
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: { // لتوسيط محتوى التحميل
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  centeredMessageContainer: { // لتوسيط رسائل الخطأ أو المعلومات
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessageText: {
    fontSize: 18,
    color: 'red', // لون أحمر لرسائل الخطأ
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingOverlay: { // غطاء تحميل شفاف فوق المحتوى
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // تأكد أنه فوق كل شيء
  },
  title: {
    fontSize: 22, // حجم خط العنوان
    fontWeight: 'bold',
    color: '#333', // لون نص داكن للعنوان
    marginBottom: 25, // مسافة أسفل العنوان
    textAlign: 'center', // توسيط العنوان
  },
  questionContainer: { // حاوية لكل سؤال وإجابة
    marginBottom: 20, // مسافة بين حاويات الأسئلة
    backgroundColor: '#fff', // خلفية بيضاء لحاوية السؤال
    padding: 15, // مسافة داخلية
    borderRadius: 8, // حواف دائرية
    elevation: 1, // ظل خفيف (Android)
    shadowColor: '#000', // ظل (iOS)
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  questionText: {
    fontSize: 17, // حجم خط السؤال
    fontWeight: '600', // وزن خط شبه عريض
    color: '#3b3b3b', // لون نص داكن للسؤال
    marginBottom: 12, // مسافة أسفل نص السؤال
  },
  input: {
    backgroundColor: '#f9f9f9', // خلفية رمادية فاتحة جدًا لحقل الإدخال
    paddingHorizontal: 15, // مسافة أفقية داخل حقل الإدخال
    paddingVertical: 10, // مسافة رأسية داخل حقل الإدخال
    borderRadius: 6, // حواف دائرية أخف
    fontSize: 16, // حجم خط الإدخال
    borderWidth: 1, // عرض إطار حقل الإدخال
    borderColor: '#ddd', // لون إطار فاتح
    color: '#333', // لون نص الإدخال
  },
  bioInput: {
    minHeight: 80, // ارتفاع أدنى لحقل السيرة الذاتية
    textAlignVertical: 'top', // محاذاة النص والعلامة المؤقتة للأعلى في الحقول متعددة الأسطر
  },
  choicesContainer: { // حاوية لأزرار الاختيار من متعدد
    flexDirection: 'row', // ترتيب أفقي
    flexWrap: 'wrap', // السماح للأزرار بالالتفاف إلى السطر التالي
    justifyContent: 'flex-start', // محاذاة الأزرار إلى البداية
  },
  choiceButton: { // زر اختيار من متعدد
    backgroundColor: '#eef2f7', // خلفية فاتحة لزر الاختيار
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // حواف دائرية أكثر لزر الاختيار
    marginRight: 10, // مسافة على يمين الزر
    marginBottom: 10, // مسافة أسفل الزر (للصفوف المتعددة)
    borderWidth: 1,
    borderColor: '#d0d7e0', // إطار فاتح لزر الاختيار
  },
  choiceButtonSelected: { // زر اختيار محدد
    backgroundColor: '#4c8bf5', // لون الخلفية الرئيسي عند الاختيار
    borderColor: '#4c8bf5', // لون الإطار الرئيسي عند الاختيار
  },
  choiceText: {
    fontSize: 15, // حجم خط نص الاختيار
    color: '#4c8bf5', // لون النص الرئيسي
  },
  choiceTextSelected: {
    color: '#fff', // لون نص أبيض عند الاختيار
    fontWeight: 'bold', // وزن خط عريض عند الاختيار
  },
  submitButton: { // زر الإرسال/الحفظ
    backgroundColor: '#28a745', // لون أخضر للإرسال
    padding: 18, // مسافة داخلية أكبر
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20, // مسافة فوق زر الإرسال
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17, // حجم خط أكبر
    fontWeight: 'bold',
  },
  disabledButton: { // نمط الأزرار المعطلة
    opacity: 0.6, // تقليل الشفافية
  },
});

export default QuestionnaireScreen;