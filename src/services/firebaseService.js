// src/services/firebaseService.js
// 處理 Firebase 的 CRUD 與其他連線互動
import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  updateDoc,
  doc,
  writeBatch, 
  getDocs,
  orderBy,
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

// 1. 初始化 App 與 Firebase 伺服器之間的連線
try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = initializeAuth(firebaseApp, {
        persistence: inMemoryPersistence 
    });
    db = getFirestore(firebaseApp);
} catch (e) {
    console.error("Firebase Initialization Error:", e.message);
    // 連線失敗或錯誤時，提供假的物件以防程式崩潰
    auth = { onAuthStateChanged: (cb) => { console.warn("Auth failed."); cb(null); return () => {}; }, currentUser: null, app: null };
    db = { app: null }; 
}

// 2. 回傳初始化判斷情形
// 例如：當 useAtBatRecords 或畫面載入時，如果檢查 firebaseStatus.isReady 是 false，表示初始化失敗，就要顯示「網路連線失敗」或「伺服器維護中」，避免程式去讀取不存在的資料而報錯。
export const firebaseStatus = {
    isReady: !!db.app,                  // 以 db.app 是否存在，判斷初始化是否成功 (!! 在 JavaScript 可以把任何東西轉換成布林值)。 
    auth: auth,                         // 統一的連線實體，可以用在其他需要判斷使用者登入的地方
    db: db,                             // Firestore 的實體
    PITCH_RECORDS_PATH,                 // 儲存逐球紀錄的路徑
    AT_BAT_SUMMARY_PATH,                // 儲存統整後打席完整記錄的路徑
};

// 3. 定義與資料庫互動的函式
// 3.1. 檢查連線使用者的身分，與即時抓取資料
export const initAuthAndGetRecords = (setRecordsCallback, setLoadingCallback, user) => {
    
    // 若初始化未完成，回傳等待的 callback
    if (!firebaseStatus.isReady) {
        setLoadingCallback(false);
        return () => {};
    }

    // 如果發現還沒登入 (!user)，它會自動發動匿名登入，確保你有權限讀寫。
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
    // 只要雲端資料庫一變動（例如別台手機存入一球），它會立刻被觸發，並透過 setRecordsCallback 把最新的列表回傳給 Hook。
    // 建議改為按時間降序排列 (最新的在最上面)
    const q = query(
        collection(db, PITCH_RECORDS_PATH), 
        orderBy('createdAt', 'desc') 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const rawRecords = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // 增加預防機制：如果雲端時間還沒回來，先給它現在時間，避免 toDate() 報錯
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date() 
            };
        });
        
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
    
    // 當你離開這個畫面時，React 會執行它來關閉連線，避免浪費網路流量。
    return unsubscribe;
};

// 3.2. 新增單次投球紀錄，按下「好球」、「壞球」或「打擊出去」時，會呼叫這個函式。
export const savePitchRecord = async (data, user) => {
    
    // 檢查 user 是否存在以及初始化是否成功，否則不准寫入
    if (!user || !firebaseStatus.isReady) {
        throw new Error("Database or User not ready.");
    }
    
    // 寫入集合，並加上資料的新增者與新增時間
    await addDoc(collection(db, PITCH_RECORDS_PATH), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
    });
};

// 3.3. 編輯單次紀錄
export const updatePitchRecord = async (id, updatedData) => {
    const docRef = doc(db, PITCH_RECORDS_PATH, id);
    return await updateDoc(docRef, {
        ...updatedData,
        updatedAt: new Date() // 紀錄一下最後修改時間
    });
};

// 3.4. 刪除單次紀錄 
export const deletePitchRecord = async (id) => {
    if (!firebaseStatus.isReady) {
        throw new Error("Database not ready.");
    }
    await deleteDoc(doc(db, PITCH_RECORDS_PATH, id));
};

// 4. 按下「結束打席」的時候彙整打席紀錄
// 保證了原子性 (Atomicity)。確保「存好總結」跟「清空畫面」這兩件事是一體發生的，不會出現總結存了但畫面沒清空的混亂狀況。
export const saveAtBatSummaryAndClearRecords = async (summaryData, user, currentRecordsAscending) => {
    if (!user || !firebaseStatus.isReady) {
        throw new Error("Database or User not ready.");
    }

    // 1. 寫入彙整紀錄 (存檔)
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

    // 2. 批量刪除所有 pitch_records (清空)
    const q = query(collection(db, PITCH_RECORDS_PATH));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};