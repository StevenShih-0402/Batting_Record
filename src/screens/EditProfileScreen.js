// src/screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Avatar, useTheme, List, Switch, HelperText, Text, Divider } from 'react-native-paper';
import { auth } from '../services/firebaseService'; // 引入 auth
import { updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker'; // 圖片選取器

const EditProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const user = auth.currentUser;

    // 表單狀態
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [password, setPassword] = useState('');
    const [photoURL, setPhotoURL] = useState(user?.photoURL);
    const [loading, setLoading] = useState(false);
    
    // 判斷是否為 Google 登入 (Google 登入無法修改密碼)
    const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

    // 1. 選取圖片邏輯
    const pickImage = async () => {
        // 請求權限
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("權限不足", "需要相簿權限才能更換頭貼");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
            // 💡 注意：真實環境中，這裡應該要呼叫 Firebase Storage 上傳圖片
            // 並取得 downloadURL 後再 setPhotoURL。
            // 這裡暫時只做本地預覽效果。
        }
    };

    // 2. 儲存變更邏輯
    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = {};
            // 如果名稱有變
            if (displayName !== user.displayName) {
                updates.displayName = displayName;
            }
            // 如果圖片有變 (這裡假設 photoURL 已經是上傳後的網址，或是本地 URI)
            // 實務上 Firebase Auth 的 photoURL 必須是網際網路連結 (https)
            if (photoURL !== user.photoURL) {
                updates.photoURL = photoURL; 
            }

            // 更新 Profile
            if (Object.keys(updates).length > 0) {
                await updateProfile(user, updates);
            }

            // 更新密碼 (如果是 Email 用戶且有輸入新密碼)
            if (!isGoogleUser && password.length > 0) {
                await updatePassword(user, password);
            }

            Alert.alert("成功", "個人資料已更新", [
                { text: "確定", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            // Firebase 安全機制：修改密碼等敏感操作需要「近期登入」
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert("需要重新登入", "為了安全起見，修改密碼前請先登出並重新登入。");
            } else {
                Alert.alert("更新失敗", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // 3. 刪除帳號邏輯 (Modern APP 必備)
    const handleDeleteAccount = () => {
        Alert.alert(
            "危險操作",
            "確定要永久刪除帳號嗎？此動作無法復原，所有紀錄將被清除。",
            [
                { text: "取消", style: "cancel" },
                { 
                    text: "確認刪除", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteUser(user);
                            // 刪除後 App.js 會自動偵測到 user null，跳回 Login
                        } catch (error) {
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert("需要驗證", "刪除帳號屬於敏感操作，請先登出後重新登入再試。");
                            } else {
                                Alert.alert("錯誤", error.message);
                            }
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        // 第一層：背景容器 (處理安全區域)
        <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: theme.colors.background }]}>
            {/* 第二層：處理鍵盤推擠 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0} // 視 Header 高度調整
            >
                {/* 第三層：點擊背景收起鍵盤 */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        style={{ backgroundColor: theme.colors.background }}
                        showsVerticalScrollIndicator={false}        // 隱藏滾動條
                    >       
                        {/* 頭像編輯區 */}
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={pickImage}>
                                {photoURL ? (
                                    <Avatar.Image size={100} source={{ uri: photoURL }} />
                                ) : (
                                    <Avatar.Icon size={100} icon="account" style={{ backgroundColor: theme.colors.primary }} />
                                )}
                                <View style={[styles.editIconBadge, { backgroundColor: theme.colors.secondary }]}>
                                    <List.Icon icon="camera" color="white" style={{ margin: 0, height: 20, width: 20 }} />
                                </View>
                            </TouchableOpacity>
                            <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.secondary }}>點擊更換頭貼</Text>
                        </View>

                        {/* 基本資料表單 */}
                        <List.Section title="基本資料">
                            <TextInput
                                label="顯示名稱"
                                value={displayName}
                                onChangeText={setDisplayName}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="account" />}
                            />
                            <TextInput
                                label="電子郵件"
                                value={user?.email}
                                mode="outlined"
                                style={styles.input}
                                disabled={true} // Email 通常不給隨意改，因為是帳號 ID
                                right={<TextInput.Icon icon="lock" />}
                            />
                        </List.Section>

                        {/* 安全性設定 (僅限 Email 用戶顯示修改密碼) */}
                        {!isGoogleUser && (
                            <List.Section title="安全性">
                                <TextInput
                                    label="設定新密碼"
                                    value={password}
                                    onChangeText={setPassword}
                                    mode="outlined"
                                    secureTextEntry
                                    style={styles.input}
                                    placeholder="若不修改請留空"
                                    left={<TextInput.Icon icon="key" />}
                                />
                                <HelperText type="info">
                                    修改密碼後下次登入生效。
                                </HelperText>
                            </List.Section>
                        )}

                        {/* 連結帳號狀態 (僅顯示資訊，實作綁定/解綁邏輯較複雜，建議先做顯示) */}
                        <List.Section title="連結帳號">
                            <List.Item
                                title="Google 帳號"
                                description={isGoogleUser ? "已連結" : "未連結"}
                                left={props => <List.Icon {...props} icon="google" color={isGoogleUser ? "#4285F4" : "gray"} />}
                                right={props => <Switch value={isGoogleUser} disabled={true} />} 
                            />
                        </List.Section>

                        {/* 儲存按鈕 */}
                        <Button 
                            mode="contained" 
                            onPress={handleSave} 
                            loading={loading}
                            style={styles.saveBtn}
                            contentStyle={{ height: 48 }}
                        >
                            儲存變更
                        </Button>

                        <Divider style={{ marginVertical: 20 }} />

                        {/* 危險區域 */}
                        <Button 
                            mode="text" 
                            textColor={theme.colors.error} 
                            onPress={handleDeleteAccount}
                            icon="delete"
                        >
                            刪除帳號
                        </Button>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 25,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 15,
        padding: 4,
        borderWidth: 2,
        borderColor: '#121212', // Match background color
    },
    input: {
        marginBottom: 10,
        backgroundColor: 'transparent'
    },
    saveBtn: {
        marginTop: 20,
        borderRadius: 8,
    }
});

export default EditProfileScreen;