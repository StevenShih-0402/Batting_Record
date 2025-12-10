// src/services/firebaseService.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  writeBatch, 
  getDocs 
} from 'firebase/firestore';
import { 
  getAuth, 
  initializeAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  inMemoryPersistence 
} from 'firebase/auth';
import { firebaseConfig, PITCH_RECORDS_PATH, AT_BAT_SUMMARY_PATH } from '../config/FirebaseConfig';
import { Alert } from 'react-native';


let firebaseApp, auth, db;

try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = initializeAuth(firebaseApp, {
        persistence: inMemoryPersistence 
    });
    db = getFirestore(firebaseApp);
} catch (e) {
    console.error("Firebase Initialization Error:", e.message);
    // 提供假的物件以防程式崩潰
    auth = { onAuthStateChanged: (cb) => { console.warn("Auth failed."); cb(null); return () => {}; }, currentUser: null, app: null };
    db = { app: null }; 
}

export const firebaseStatus = {
    isReady: !!db.app,
    auth: auth,
    db: db,
    PITCH_RECORDS_PATH,
    AT_BAT_SUMMARY_PATH,
};


export const initAuthAndGetRecords = (setRecordsCallback, setLoadingCallback, user) => {
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
             console.error("Auth Sign-in Attempt Failed:", error.message);
             Alert.alert("認證失敗", "無法登入 Firebase 服務。");
         }
    };
    
    // Auth Listener 在 Hook 中處理

    // 設置 Pitch Records 的即時監聽
    const q = query(collection(db, PITCH_RECORDS_PATH));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const rawRecords = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() 
        }));
        
        setRecordsCallback(rawRecords);
        setLoadingCallback(false); 

    }, (error) => {
        console.error("Firestore Error:", error);
        setLoadingCallback(false);
        Alert.alert("資料錯誤", "無法讀取歷史紀錄");
    });

    // 初次載入時執行認證邏輯
    if (!user) {
         handleAuth();
    }
    
    return unsubscribe;
};


export const savePitchRecord = async (data, user) => {
    if (!user || !firebaseStatus.isReady) {
        throw new Error("Database or User not ready.");
    }
    
    await addDoc(collection(db, PITCH_RECORDS_PATH), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
    });
};

export const deletePitchRecord = async (id) => {
    if (!firebaseStatus.isReady) {
        throw new Error("Database not ready.");
    }
    await deleteDoc(doc(db, PITCH_RECORDS_PATH, id));
};

export const saveAtBatSummaryAndClearRecords = async (summaryData, user, currentRecordsAscending) => {
    if (!user || !firebaseStatus.isReady) {
        throw new Error("Database or User not ready.");
    }

    // 1. 寫入彙整紀錄
    // **已修正：確保 startAt 的值為 Date 物件或 null，避免傳入 undefined**
    const startAtValue = (currentRecordsAscending.length > 0 && currentRecordsAscending[0].createdAt) 
        ? currentRecordsAscending[0].createdAt 
        : null; 
        
    await addDoc(collection(db, AT_BAT_SUMMARY_PATH), {
        ...summaryData,
        userId: user.uid,
        startAt: startAtValue, 
        endAt: serverTimestamp(),
    });

    // 2. 批量刪除所有 pitch_records
    const q = query(collection(db, PITCH_RECORDS_PATH));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};