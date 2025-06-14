import React, { useState } from 'react';
import { 
    SafeAreaView, View, Text, TextInput, 
    TouchableOpacity, StyleSheet, Alert, 
    ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // لاستخدام الأيقونات

const PYTHON_API_URL = 'https://1dfe-34-34-115-170.ngrok-free.app'; 

const TelegramLoginScreen = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState('phone'); // 'phone', 'code', 'password'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!phoneNumber.trim().startsWith('+')) {
            Alert.alert("خطأ", "الرجاء إدخال رقم الهاتف مع رمز الدولة (مثال: +201012345678)");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${PYTHON_API_URL}/telegram/send_code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'فشل إرسال الكود. تأكد من الرقم والمحاولة مرة أخرى.');
            
            Alert.alert("نجاح", "تم إرسال كود التحقق إلى حسابك في تطبيق تيليجرام.");
            setStep('code');
        } catch (error) {
            Alert.alert("خطأ", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!code.trim()) {
            Alert.alert("خطأ", "الرجاء إدخال الكود الذي وصلك.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${PYTHON_API_URL}/telegram/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, code, password })
            });
            const data = await response.json();

            if (!response.ok) {
                if(data.status === 'password_required') {
                    setStep('password');
                    Alert.alert("مطلوب التحقق بخطوتين", "هذا الحساب محمي بكلمة سر. الرجاء إدخالها.");
                    return; // لا تتوقف عن التحميل، لأننا ننتظر إدخال كلمة السر
                }
                throw new Error(data.detail || 'فشل تسجيل الدخول. تأكد من الكود.');
            }
            
            if (data.status === 'login_successful') {
                const { sessionString } = data;
                Alert.alert("نجاح", "تم تسجيل الدخول بنجاح!");
                navigation.replace('TelegramImportScreen', { sessionString });
            }
        } catch (error) { 
            Alert.alert("خطأ", error.message);
        } finally { 
            setIsLoading(false); 
        }
    };

    const getTitleForStep = () => {
        if (step === 'phone') return "تسجيل الدخول إلى تيليجرام";
        if (step === 'code') return "أدخل كود التحقق";
        if (step === 'password') return "أدخل كلمة المرور";
    };

    return ( 
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.formContainer}>
                    <Ionicons name="paper-plane" size={80} color="#0088cc" style={styles.icon} />
                    <Text style={styles.title}>{getTitleForStep()}</Text>
                    <Text style={styles.subtitle}>
                        {step === 'phone' ? 'أدخل رقم هاتفك بالصيغة الدولية لبدء المزامنة.' : 'تحقق من الرسائل في تطبيق تيليجرام.'}
                    </Text>
                    
                    {step === 'phone' && (
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., +201012345678"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            placeholderTextColor="#999"
                        />
                    )}

                    {step === 'code' && (
                        <TextInput
                            style={styles.input}
                            placeholder="الكود المرسل إليك"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                            placeholderTextColor="#999"
                        />
                    )}

                    {step === 'password' && (
                        <TextInput
                            style={styles.input}
                            placeholder="كلمة سر التحقق بخطوتين (2FA)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#999"
                        />
                    )}
                    
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0088cc" style={styles.loader} />
                    ) : (
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={step === 'phone' ? handleSendCode : handleLogin}
                        >
                            <Text style={styles.buttonText}>
                                {step === 'phone' ? 'إرسال الكود' : 'متابعة'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView> 
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5', // خلفية رمادية فاتحة
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
    },
    formContainer: {
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
        textAlign: 'left', // مهم للأرقام الإنجليزية
    },
    button: {
        width: '100%',
        backgroundColor: '#0088cc', // لون تيليجرام الأزرق
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3, // ظل للأندرويد
        shadowColor: '#000', // ظل للآيفون
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 20,
    }
});

export default TelegramLoginScreen;