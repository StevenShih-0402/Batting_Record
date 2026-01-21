// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, Surface, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 假設你在 authService 已經新增了這些對應的方法 (稍後會說明)
import { 
    signInWithGoogle, 
    signInAsGuest, 
    signInWithEmail,   // 需新增
    signUpWithEmail,   // 需新增
    // signInWithFacebook, // 需新增 (視需求實作)
    // signInWithGitHub    // 需新增 (視需求實作)
} from '../services/authService';

const LoginScreen = ({ navigation }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    
    // Email 登入狀態管理
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true); // 切換 登入 or 註冊 模式
    const [showPassword, setShowPassword] = useState(false);

    // 處理 Email 登入/註冊
    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert("提示", "請輸入電子郵件和密碼");
            return;
        }
        setLoading(true);
        try {
            if (isLoginMode) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
                // 註冊成功後，通常 Firebase 會自動登入該帳號
            }
            // 成功後建議也補一個
            setLoading(false);
        } catch (error) {
            setLoading(false);
            Alert.alert(isLoginMode ? "登入失敗" : "註冊失敗", error.message);
        }
    };

    // 統一處理第三方登入
    const handleSocialLogin = async (providerName, loginFunction) => {
        if (!loginFunction) {
            Alert.alert("提示", `${providerName} 登入功能尚未實作`);
            return;
        }

        setLoading(true);
        try {
            await loginFunction();
            // ⚡ 關鍵：有些情況下 Firebase 登入成功但頁面還沒跳轉，
            // 我們必須在這裡主動關閉 Loading
            setLoading(false); 
        } catch (error) {
            setLoading(false); // 發生錯誤更要關閉
            Alert.alert(`${providerName} 登入失敗`, error.message);
        }
    };

    const SocialButton = ({ icon, color, onPress }) => (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.socialBtn, { borderColor: theme.colors.outline }]}
        >
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* <View style={styles.header}>
                <MaterialCommunityIcons name="baseball" size={60} color={theme.colors.primary} />
                <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginLeft: 10 }}>
                    Strike Zone
                </Text>
            </View> */}

            <Surface style={[styles.loginCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 20, fontWeight: 'bold' }}>
                    {isLoginMode ? '歡迎回來' : '建立新帳戶'}
                </Text>

                {/* Email 表單區域 */}
                <TextInput
                    label="電子郵件"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    disabled={loading}
                />
                <TextInput
                    label="密碼"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                    style={styles.input}
                    disabled={loading}
                />

                <Button 
                    mode="contained" 
                    onPress={handleEmailAuth} 
                    loading={loading}
                    style={styles.mainBtn}
                    contentStyle={{ height: 48 }}
                >
                    {isLoginMode ? '登入' : '註冊'}
                </Button>

                <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={styles.switchMode}>
                    <Text style={{ color: theme.colors.primary }}>
                        {isLoginMode ? '還沒有帳號？點此註冊' : '已有帳號？點此登入'}
                    </Text>
                </TouchableOpacity>

                {/* 分隔線 */}
                <View style={styles.dividerContainer}>
                    <Divider style={{ flex: 1 }} />
                    <Text style={{ marginHorizontal: 10, color: theme.colors.onSurfaceVariant }}>或是</Text>
                    <Divider style={{ flex: 1 }} />
                </View>

                {/* 社群登入按鈕列 */}
                <View style={styles.socialRow}>
                    {/* Google */}
                    <SocialButton 
                        icon="google" 
                        color="#DB4437" 
                        onPress={() => handleSocialLogin('Google', signInWithGoogle)} 
                    />
                    
                    {/* Facebook (預留) */}
                    {/*
                    <SocialButton 
                        icon="facebook" 
                        color="#4267B2" 
                        onPress={() => handleSocialLogin('Facebook', null)} 
                    />
                    */}

                    {/* GitHub (預留) */}
                    {/*
                    <SocialButton 
                        icon="github" 
                        color="#333" 
                        onPress={() => handleSocialLogin('GitHub', null)} 
                    />
                    */}
                    
                </View>

                {/* 訪客按鈕 */}
                {/* <Button 
                    mode="text" 
                    icon="incognito" 
                    onPress={() => handleSocialLogin('Guest', signInAsGuest)}
                    textColor={theme.colors.secondary}
                    style={{ marginTop: 10 }}
                >
                    先逛逛 (訪客模式)
                </Button> */}

            </Surface>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    loginCard: {
        padding: 20,
        borderRadius: 16,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    mainBtn: {
        marginTop: 10,
        borderRadius: 8,
    },
    switchMode: {
        alignItems: 'center',
        marginTop: 15,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 10,
    },
    socialBtn: {
        borderWidth: 1,
        borderRadius: 50,
        padding: 10,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LoginScreen;