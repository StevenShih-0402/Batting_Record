// src/screens/ProfileScreen.js
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, Button, List, Divider, useTheme } from 'react-native-paper';
import { auth } from '../services/firebaseService';
import { useAuth } from '../hooks/auth/useAuth';
import { signOut } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // 登出後通常會觸發 useAuth 的監聽，自動回到匿名或 Login
            Alert.alert("已登出");
        } catch (error) {
            console.error(error);
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
                {user?.isAnonymous && (
                    <List.Item
                        title="綁定 Google 帳戶"
                        description="同步數據，更換手機不遺失紀錄"
                        left={props => <List.Icon {...props} icon="google" color="#4285F4" />}
                        onPress={() => navigation.navigate('Login')}
                        titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
                    />
                )}
                
                <List.Item
                    title="編輯個人資料"
                    left={props => <List.Icon {...props} icon="account-edit" />}
                    onPress={() => Alert.alert("開發中")}
                />

                <List.Item
                    title="登出"
                    left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
                    onPress={handleLogout}
                />
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