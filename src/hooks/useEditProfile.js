import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../services/firebaseService';
import { updateUserProfile, updateUserPassword, deleteUserAccount } from '../services/authService';

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
            if (photoURL !== user.photoURL) {
                updates.photoURL = photoURL;
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

    // 3. 刪除帳號邏輯
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
            handleDeleteAccount
        }
    };
};
