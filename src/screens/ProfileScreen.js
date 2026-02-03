// src/screens/ProfileScreen.js
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, Button, List, Divider, useTheme } from 'react-native-paper';
import { auth, sendVerification } from '../services/authService';
import { useAuth } from '../hooks/auth/useAuth';

const ProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();

    const handleLogout = async () => {
        const { signOutUser } = require('../services/authService');
        try {
            const success = await signOutUser();
            if (success) {
                Alert.alert("已登出");
            } else {
                Alert.alert("提示", "訪客用戶無法登出，請先綁定 Google 或 Email 帳號");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendVerification = async () => {
        try {
            await sendVerification();
            Alert.alert("成功", "已發送驗證信至您的信箱");
        } catch (error) {
            Alert.alert("錯誤", error.message);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                {/* 修正點：移除不存在的 focused 判斷，直接根據 user 狀態決定顏色 */}
                {user?.photoURL ? (
                    <Avatar.Image size={100} source={{ uri: user.photoURL }} />
                ) : (
                    <Avatar.Icon
                        size={100}
                        icon="account"
                        style={{
                            // 這裡直接用 theme.colors.primary 或固定深色
                            backgroundColor: user?.isAnonymous ? '#333' : theme.colors.primary
                        }}
                    />
                )}

                <Text variant="headlineMedium" style={styles.userName}>
                    {user?.isAnonymous ? "訪客用戶" : (user?.displayName || "未命名用戶")}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    UID: {user?.uid.slice(0, 8)}...
                </Text>
            </View>

            <Divider />

            <List.Section style={styles.listSection}>
                {/* 1. 訪客專屬：顯示登入/綁定按鈕 */}
                {user?.isAnonymous && (
                    <List.Item
                        title="登入 / 註冊帳戶"
                        description="綁定後可查詢歷史打席紀錄"
                        left={props => <List.Icon {...props} icon="login" color="#4285F4" />}
                        onPress={() => navigation.navigate('Login')}
                        titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
                    />
                )}

                {/* 2. 正式用戶專屬：顯示編輯與登出 */}
                {!user?.isAnonymous && (
                    <>
                        <List.Item
                            title="編輯個人資料"
                            description="修改頭貼、名稱與帳號設定"
                            left={props => <List.Icon {...props} icon="account-edit" />}
                            onPress={() => navigation.navigate('EditProfile')}
                        />

                        {!user?.emailVerified && (
                            <List.Item
                                title="驗證電子郵件"
                                titleStyle={{ color: theme.colors.error }}
                                left={props => <List.Icon {...props} icon="email-alert" color={theme.colors.error} />}
                                onPress={handleSendVerification}
                            />
                        )}

                        <List.Item
                            title="登出"
                            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
                            onPress={handleLogout}
                        />
                    </>
                )}
            </List.Section>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    userName: {
        marginTop: 15,
        fontWeight: 'bold',
    },
    listSection: {
        paddingHorizontal: 10,
    }
});

export default ProfileScreen;