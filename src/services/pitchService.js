// src/services/pitchService.js
// Firebase 的身分驗證與球數 CRUD
import { 
    collection, addDoc, query, onSnapshot, serverTimestamp, 
    deleteDoc, updateDoc, doc, orderBy 
} from 'firebase/firestore';
import { signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { Alert } from 'react-native';
import { db, auth, firebaseStatus } from './firebaseService';

// 3.1 檢查身分與即時抓取資料
export const initAuthAndGetRecords = (setRecordsCallback, setLoadingCallback, user) => {
    // 加上空值保護：如果 firebaseStatus 還沒準備好，先回傳
    if (!firebaseStatus || !firebaseStatus.isReady) {
        // 如果還沒準備好，稍後 Hook 重新渲染時會再次觸發此處
        setLoadingCallback(true); 
        return () => {};
    }
    
    const path = firebaseStatus.PITCH_RECORDS_PATH;
    
    if (!firebaseStatus.isReady) {
        setLoadingCallback(false);
        return () => {};
    }

    const handleAuth = async () => {
         try {
            const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (token) {
                await signInWithCustomToken(auth, token); 
            } else {
                await signInAnonymously(auth);
            }
         } catch (error) {
             Alert.alert("認證失敗", "無法登入 Firebase 服務。");
         }
    };
    
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const rawRecords = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date() 
        }));
        setRecordsCallback(rawRecords);
        setLoadingCallback(false); 
    }, (error) => {
        setLoadingCallback(false);
        Alert.alert("資料錯誤", "無法讀取歷史紀錄");
    });

    if (!user) handleAuth();
    return unsubscribe;
};

// 3.2 新增單次投球紀錄
export const savePitchRecord = async (data, user) => {
    // 呼叫時才從實體獲取路徑
    if (!user || !firebaseStatus?.isReady) throw new Error("Database not ready.");
    
    await addDoc(collection(db, firebaseStatus.PITCH_RECORDS_PATH), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
    });
};

// 3.3 編輯單次紀錄
export const updatePitchRecord = async (id, updatedData) => {
    const path = firebaseStatus.PITCH_RECORDS_PATH;
    const docRef = doc(db, path, id);
    return await updateDoc(docRef, {
        ...updatedData,
        updatedAt: new Date()
    });
};

// 3.4 刪除單次紀錄
export const deletePitchRecord = async (id) => {
    const path = firebaseStatus.PITCH_RECORDS_PATH;
    if (!firebaseStatus.isReady) throw new Error("Database not ready.");
    await deleteDoc(doc(db, path, id));
};