// src/services/authService.js
// Google 登入相關方法
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
    GoogleAuthProvider,
    signInWithCredential,
    linkWithCredential,
    signInAnonymously,
    createUserWithEmailAndPassword,  // 信箱登入
    signInWithEmailAndPassword,      // 信箱登入 
    updateProfile,
    updatePassword,
    deleteUser,
} from 'firebase/auth';
import { auth } from './firebaseService'; //

// 1. 設定 Google Sign-In (請去 Firebase Console -> Auth 啟用 Google 並拿 Web Client ID)
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
});

/**
 * Google 登入流程
 * 如果使用者當前是匿名，會嘗試將 Google 帳號「綁定」到該匿名帳號，實現資料無痛轉移。
 */
export const signInWithGoogle = async () => {
    try {
        // A. 檢查是否支援
        await GoogleSignin.hasPlayServices();

        // B. 跳出 Google 選擇帳號視窗
        const userInfo = await GoogleSignin.signIn();
        const idToken = userInfo.data?.idToken;

        if (!idToken) throw new Error('無法取得 Google Token');

        // C. 建立 Firebase 憑證
        const credential = GoogleAuthProvider.credential(idToken);
        const currentUser = auth.currentUser;

        // D. 關鍵邏輯：綁定 vs 直接登入
        if (currentUser && currentUser.isAnonymous) {
            try {
                // 老油條密技：嘗試把 Google 綁定到現在的匿名帳號
                await linkWithCredential(currentUser, credential);
                console.log("匿名帳號成功升級為 Google 帳號");
                return currentUser;
            } catch (linkError) {
                // 如果綁定失敗 (通常是因為該 Google 帳號已經有別的資料了)
                // 這裡看你的產品策略，通常是切換過去該 Google 帳號
                if (linkError.code === 'auth/credential-already-in-use') {
                    console.log("此 Google 帳號已有資料，將切換帳號");
                    return await signInWithCredential(auth, credential);
                }
                throw linkError;
            }
        } else {
            // 如果沒登入，就直接用 Google 登入
            return await signInWithCredential(auth, credential);
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

/**
 * 登出 (記得要連同 Google SDK 一起登出)
 */
export const signOutUser = async () => {
    try {
        await GoogleSignin.signOut(); // 清除 Google 登入狀態
        await auth.signOut();         // 清除 Firebase 狀態
    } catch (error) {
        console.error("Sign Out Error:", error);
    }
};

// 1. Email 註冊
export const signUpWithEmail = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        // 可以把 Firebase 醜醜的錯誤代碼轉成中文
        if (error.code === 'auth/email-already-in-use') throw new Error('此 Email 已被註冊');
        if (error.code === 'auth/weak-password') throw new Error('密碼強度不足');
        if (error.code === 'auth/invalid-email') throw new Error('Email 格式錯誤');
        throw error;
    }
};

// 2. Email 登入
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        if (error.code === 'auth/user-not-found') throw new Error('找不到此帳號');
        if (error.code === 'auth/wrong-password') throw new Error('密碼錯誤');
        throw error;
    }
};

/**
 * 訪客登入 (原本的邏輯)
 */
export const signInAsGuest = async () => {
    try {
        await signInAnonymously(auth);
    } catch (error) {
        console.error("Anonymous Auth Error:", error);
        throw error;
    }
};

// 綁定 (升級) 成 Google 帳號
export const linkGoogleAccount = async () => {
    const currentUser = auth.currentUser;
    // 檢查：只有匿名用戶需要被升級
    if (!currentUser || !currentUser.isAnonymous) {
        console.log("不需要升級或未登入");
        return;
    }

    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const idToken = userInfo.data?.idToken;
        const credential = GoogleAuthProvider.credential(idToken);

        // 執行連結
        await linkWithCredential(currentUser, credential);
        Alert.alert("同步成功", "你的歷史紀錄已與 Google 帳號綁定！");
    } catch (error) {
        if (error.code === 'auth/credential-already-in-use') {
            // 這代表該 Google 帳號已經註冊過了，此時可詢問用戶是否要切換帳號（但舊資料會不見）
            Alert.alert("提醒", "此 Google 帳號已有其他紀錄，是否切換？");
        }
    }
};

// 3. 更新個人資料
export const updateUserProfile = async (updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    // updates 應為 { displayName, photoURL }
    if (Object.keys(updates).length > 0) {
        await updateProfile(user, updates);
    }
    return user;
};

// 4. 更新密碼
export const updateUserPassword = async (password) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    await updatePassword(user, password);
};

// 5. 刪除帳號
export const deleteUserAccount = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    await deleteUser(user);
};