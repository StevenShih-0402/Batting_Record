// src/hooks/useAtBatRecords.js
// 核心業務邏輯 (重要!)
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { firebaseStatus, initAuthAndGetRecords, savePitchRecord, deletePitchRecord, saveAtBatSummaryAndClearRecords } from '../services/firebaseService';
import { Alert } from 'react-native';

const useAtBatRecords = () => {
    // 1. 狀態管理：定義 App 運作所需的關鍵數據
    const [user, setUser] = useState(null);                     // 記錄目前是誰在操作（包含匿名登入資訊）。
    const [loading, setLoading] = useState(true);               // 追蹤資料是否還在傳輸中，避免在資料還沒準備好時，執行需要資料的運算。
    const [rawRecords, setRawRecords] = useState([]);           // 直接從 Firebase 拿到的「原始資料」。
    const [atBatRecords, setAtBatRecords] = useState([]);       // 經過處理、計算過 B/S 球數後的「顯示用資料」。
    const [atBatStatus, setAtBatStatus] = useState({            // 紀錄目前打席的總結（幾好幾壞、打席是否結束）。
        balls: 0, 
        strikes: 0, 
        isFinished: false,
        lastResult: null,
        atBatRecordsCount: 0,
    });
    
    // 2. Auth listener: 監聽用戶狀態，確保 App 的資料永遠是最新的
    // 2.1. 身分監聽：透過 onAuthStateChanged 監控使用者是否登入。
    useEffect(() => {
        if (!firebaseStatus.isReady) {
             setLoading(false); 
             return;
        }
        
        const unsubscribeAuth = onAuthStateChanged(firebaseStatus.auth, (u) => {
            setUser(u);
        });
        
        return () => unsubscribeAuth();
    }, []);


    // 2.2. Firestore 監聽：當使用者身分確認後，它會呼叫 initAuthAndGetRecords。
    // 這是一個「即時連線」，只要資料庫一有變動（例如另一台手機新增了紀錄），你的 App 畫面會自動更新，不需要重新整理。
    useEffect(() => {
        // 如果 Firebase 服務未準備好，則跳過，讓上面的 useEffect 處理 loading 狀態。
        if (!firebaseStatus.isReady) return; 

        // 呼叫 Service 層來設置即時監聽。
        // 當 user 為 null 時， initAuthAndGetRecords 會在內部啟動匿名登入。
        const unsubscribeFirestore = initAuthAndGetRecords(setRawRecords, setLoading, user);

        return () => unsubscribeFirestore();
        
    }, [user]); // 依賴 user 狀態，確保登入完成後會重新執行，並將 user 傳入 initAuthAndGetRecords。
    
    // 3. 棒球球數規則計算邏輯
    // 資料庫只存了「這球是好球」，它並不存「這球是第幾個好球」。
    // 因此這個 Hook 幫你把這些邏輯算好，並產出 runningBalls 和 runningStrikes 給畫面顯示。
    useEffect(() => {
        if (loading) return;
        
        // 按照時間升序排序
        const sortedAscending = rawRecords.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));

        let balls = 0;
        let strikes = 0;
        let isAtBatFinished = false;
        
        // 計算每一球之後的 B/S 狀態
        const processedRecords = sortedAscending.map(record => {
            const pitchResult = record.result;
            let atBatEndOutcome = null;

            if (isAtBatFinished) {
                return {
                    ...record,
                    runningBalls: balls,
                    runningStrikes: strikes,
                    atBatEndOutcome: record.atBatEndOutcome || null,
                };
            }

            if (pitchResult === '好球') {
                if (strikes < 2) {
                    strikes += 1;
                } else if (strikes === 2) {
                    strikes += 1; 
                    atBatEndOutcome = '三振';
                    isAtBatFinished = true;
                }
            } else if (pitchResult === '壞球') {
                if (balls < 3) {
                    balls += 1;
                } else if (balls === 3) {
                    balls += 1; 
                    atBatEndOutcome = '保送';
                    isAtBatFinished = true;
                }
            } else if (pitchResult === '界外') {
                if (strikes < 2) {
                    strikes += 1;
                }
            } else if (pitchResult === '打擊出去') {
                atBatEndOutcome = '打擊出去'; 
                isAtBatFinished = true;
            }
            
            const runningBalls = balls;
            const runningStrikes = strikes;

            return {
                ...record,
                runningBalls,
                runningStrikes,
                atBatEndOutcome: atBatEndOutcome, 
            };
        });

        // 顯示最新投球在頂部 (降序)
        const sortedDescending = processedRecords.reverse();
        
        // 更新狀態
        setAtBatStatus({
            balls, 
            strikes,
            isFinished: isAtBatFinished,
            lastResult: sortedDescending.length > 0 ? sortedDescending[0].result : null,
            atBatRecordsCount: sortedDescending.length,
        });
        setAtBatRecords(sortedDescending);

    }, [rawRecords, loading]);
    
    // 4. 資料庫操作介面 (Database Handlers)，提供了三個簡單的函數給介面（UI）使用
    // 4.1. 把新的一球丟進資料庫。
    const handleSavePitch = async (data) => {
        try {
            await savePitchRecord(data, user);
        } catch (error) {
            Alert.alert("儲存失敗", `寫入數據庫時發生錯誤: ${error.message}`);
            throw error; 
        }
    };
    
    // 4.2. 從資料庫刪除錯誤的紀錄。
    const handleDeletePitch = async (id) => {
        try {
            await deletePitchRecord(id);
        } catch (error) {
            Alert.alert("錯誤", `刪除失敗: ${error.message}`);
        }
    };

    // 4.3. 當打席結束，點擊「儲存紀錄」時，把這組球數打包存入「彙整表」並清空當前畫面。
    const handleSaveSummary = async (summaryData) => {
        try {
            const currentRecordsAscending = [...atBatRecords].reverse();
            await saveAtBatSummaryAndClearRecords(summaryData, user, currentRecordsAscending);
            Alert.alert("儲存成功", "打席紀錄已彙整並清空當前球數。");
        } catch (error) {
            Alert.alert("儲存失敗", `彙整數據庫時發生錯誤: ${error.message}`);
            throw error;
        }
    };

    return {
        loading,
        atBatRecords,
        atBatStatus,
        handleSavePitch,
        handleDeletePitch,
        handleSaveSummary,
        userReady: !!user,
    };
};

export default useAtBatRecords;