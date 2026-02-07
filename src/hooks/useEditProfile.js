import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../services/firebaseService';
import { updateUserProfile, updateUserPassword, deleteUserAccount, linkGoogleAccount, unlinkGoogleAccount } from '../services/authService';
import { uploadProfileImage } from '../services/storageService';

export const useEditProfile = (navigation) => {
    const user = auth.currentUser;
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [password, setPassword] = useState('');
    const [photoURL, setPhotoURL] = useState(user?.photoURL);
    const [loading, setLoading] = useState(false);

    // 判斷是否為 Google 登入
    const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

    // 1. 選取圖片邏輯
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("權限不足", "需要相簿權限才能更換頭貼");
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setPhotoURL(result.assets[0].uri);
            }
        } catch (error) {
            console.error('選取圖片失敗:', error);
            Alert.alert("錯誤", "無法開啟相簿，請稍後再試");
        }
    };

    // 2. 儲存變更邏輯
    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = {};
            if (displayName !== user.displayName) {
                updates.displayName = displayName;
            }

            // 檢查是否為本地圖片 URI，需要上傳至 Firebase Storage
            if (photoURL !== user.photoURL) {
                if (photoURL && (photoURL.startsWith('file://') || photoURL.startsWith('content://'))) {
                    // 上傳至 Firebase Storage
                    const downloadURL = await uploadProfileImage(photoURL, user.uid);
                    updates.photoURL = downloadURL;
                } else {
                    updates.photoURL = photoURL;
                }
            }

            if (Object.keys(updates).length > 0) {
                await updateUserProfile(updates);
            }

            if (!isGoogleUser && password.length > 0) {
                await updateUserPassword(password);
            }

            Alert.alert("成功", "個人資料已更新", [
                { text: "確定", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert("需要重新登入", "為了安全起見，修改密碼前請先登出並重新登入。");
            } else {
                Alert.alert("更新失敗", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // 3. 連結 Google 帳號
    const handleLinkGoogle = async () => {
        if (isGoogleUser) {
            Alert.alert("提示", "您的帳號已連結 Google");
            return;
        }

        try {
            setLoading(true);
            await linkGoogleAccount();
            // 連結成功後返回上一頁，讓 ProfileScreen 重新載入使用者狀態
            Alert.alert("成功", "已成功連結 Google 帳號！", [
                { text: "確定", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('連結 Google 失敗:', error);
            if (error.code === 'auth/credential-already-in-use') {
                Alert.alert("提醒", "此 Google 帳號已有其他紀錄，請登出後再重新嘗試。");
            } else {
                Alert.alert("連結失敗", error.message || "無法連結 Google 帳號");
            }
        } finally {
            setLoading(false);
        }
    };

    // 4. 解除連結 Google 帳號
    const handleUnlinkGoogle = async () => {
        if (!isGoogleUser) {
            Alert.alert("提示", "您的帳號尚未連結 Google");
            return;
        }

        Alert.alert(
            "解除連結",
            "確定要解除與 Google 帳號的連結嗎？解除後將無法使用 Google 一鍵登入此帳號。",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "確認解除",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await unlinkGoogleAccount();
                            Alert.alert("成功", "已成功解除 Google 帳號連結！", [
                                { text: "確定", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('解除連結失敗:', error);
                            Alert.alert("錯誤", error.message || "無法解除連結");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // 5. 刪除帳號邏輯
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
                            await deleteUserAccount();
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

    return {
        user,
        isGoogleUser,
        loading,
        form: {
            displayName,
            setDisplayName,
            password,
            setPassword,
            photoURL,
            pickImage,
        },
        actions: {
            handleSave,
            handleLinkGoogle,
            handleUnlinkGoogle,
            handleDeleteAccount
        }
    };
};
