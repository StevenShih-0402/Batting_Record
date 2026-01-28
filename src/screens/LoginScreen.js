// src/screens/LoginScreen.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, Surface, TextInput, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLogin } from '../hooks/auth/useLogin';

const LoginScreen = ({ navigation }) => {
    const theme = useTheme();
    const { state, actions } = useLogin();
    const {
        loading, email, setEmail, password, setPassword,
        isLoginMode, setIsLoginMode, showPassword, setShowPassword
    } = state;

    const SocialButton = ({ icon, color, onPress, testID }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.socialBtn, { borderColor: theme.colors.outline }]}
            testID={testID}
        >
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                    onPress={actions.handleEmailAuth}
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
                        onPress={() => actions.handleSocialLogin('Google', actions.signInWithGoogle)}
                        testID="google-login-btn"
                    />
                </View>
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