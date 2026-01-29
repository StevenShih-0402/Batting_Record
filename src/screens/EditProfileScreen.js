// src/screens/EditProfileScreen.js
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Avatar, useTheme, List, Switch, HelperText, Text, Divider } from 'react-native-paper';
import { useEditProfile } from '../hooks/useEditProfile';

const EditProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const {
        user,
        isGoogleUser,
        loading,
        form,
        actions
    } = useEditProfile(navigation);

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
                            <TouchableOpacity onPress={form.pickImage}>
                                {form.photoURL ? (
                                    <Avatar.Image size={100} source={{ uri: form.photoURL }} />
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
                                value={form.displayName}
                                onChangeText={form.setDisplayName}
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
                                    value={form.password}
                                    onChangeText={form.setPassword}
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
                            onPress={actions.handleSave}
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
                            onPress={actions.handleDeleteAccount}
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