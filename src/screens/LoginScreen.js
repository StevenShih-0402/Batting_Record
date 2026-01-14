// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Text, Button, useTheme, Surface, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Paper 預設圖標庫

import { signInWithGoogle, signInAsGuest } from '../services/authService';

const LoginScreen = () => {
    const theme = useTheme(); // 使用你的自訂主題
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            // 登入成功後，App.js 的 onAuthStateChanged 會自動切換頁面，不用 navigation.navigate
        } catch (error) {
            Alert.alert("登入失敗", error.message);
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            await signInAsGuest();
        } catch (error) {
            Alert.alert("錯誤", "無法進入訪客模式");
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.logoContainer}>
                {/* 這裡可以放你的 App Logo，現在先用 Icon 代替 */}
                <MaterialCommunityIcons name="baseball" size={100} color={theme.colors.primary} />
                <Text variant="displaySmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 20 }}>
                    Strike Zone
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
                    專業棒球紀錄助手
                </Text>
            </View>

            <Surface style={[styles.loginCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
                <Text variant="titleMedium" style={{ marginBottom: 20, textAlign: 'center', color: theme.colors.onSurface }}>
                    請選擇登入方式
                </Text>

                {loading ? (
                    <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={{ margin: 20 }} />
                ) : (
                    <>
                        {/* Google 按鈕 */}
                        <Button 
                            mode="contained" 
                            icon="google" 
                            onPress={handleGoogleLogin}
                            style={[styles.button, { backgroundColor: '#DB4437' }]} // Google 紅
                            contentStyle={{ height: 50 }}
                        >
                            使用 Google 登入
                        </Button>

                        {/* LINE 按鈕 (預留位置，LINE 實作較複雜，建議先用 Google) */}
                        <Button 
                            mode="contained" 
                            icon="chat-processing" 
                            onPress={() => Alert.alert("Coming Soon", "LINE 登入功能開發中")}
                            style={[styles.button, { backgroundColor: '#06C755' }]} // LINE 綠
                            contentStyle={{ height: 50 }}
                        >
                            使用 LINE 登入
                        </Button>

                        <View style={styles.divider}>
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>或是</Text>
                        </View>

                        {/* 訪客按鈕 */}
                        <Button 
                            mode="outlined" 
                            icon="incognito" 
                            onPress={handleGuestLogin}
                            style={[styles.button, { borderColor: theme.colors.outline }]}
                            textColor={theme.colors.onSurface}
                        >
                            訪客試用 (資料僅存本機)
                        </Button>
                    </>
                )}
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    loginCard: {
        padding: 20,
        borderRadius: 16,
    },
    button: {
        marginBottom: 16,
        borderRadius: 8,
    },
    divider: {
        alignItems: 'center',
        marginVertical: 10,
    }
});

export default LoginScreen;