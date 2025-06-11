import 'react-native-gesture-handler';

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Chat from "./screens/ChatScreen";
import Questionnaire from "./screens/QuestionnaireScreen";
import CharacterPage from './screens/CharacterScreen';
import CallScreen from './screens/CallScreen'
import WhatsappImportScreen from './screens/WhatsappImportScreen'
import TelegramLoginScreen from './screens/TelegramLoginScreen';
import TelegramImportScreen from './screens/TelegramImportScreen';

const Stack = createStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CharacterPage" component={CharacterPage} />
      <Stack.Screen name="Questionnaire" component={Questionnaire} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="WhatsappImportScreen" component={WhatsappImportScreen} />
      <Stack.Screen name="TelegramLoginScreen" component={TelegramLoginScreen} />
<Stack.Screen name="TelegramImportScreen" component={TelegramImportScreen} />
    </Stack.Navigator>

  );
}

// import AsyncStorage from '@react-native-async-storage/async-storage';

// const clearStorage = async () => {
//   try {
//     await AsyncStorage.clear(); // مسح جميع البيانات المخزنة
//     console.log('All AsyncStorage data cleared!');
//   } catch (error) {
//     console.error('Error clearing AsyncStorage:', error);
//   }
// };

// clearStorage();

function RootNavigator() {
  return (
    <NavigationContainer>
      <ChatStack />
    </NavigationContainer>
  );
}

export default function App() {
  return <RootNavigator />;
}
