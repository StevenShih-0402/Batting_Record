// src/hooks/useAtBatRecords.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { firebaseStatus, initAuthAndGetRecords, savePitchRecord, deletePitchRecord, saveAtBatSummaryAndClearRecords } from '../services/firebaseService';
import { Alert } from 'react-native';

const useAtBatRecords = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [rawRecords, setRawRecords] = useState([]);
    const [atBatRecords, setAtBatRecords] = useState([]); 
    const [atBatStatus, setAtBatStatus] = useState({ 
        balls: 0, 
        strikes: 0, 
        isFinished: false,
        lastResult: null,
        atBatRecordsCount: 0,
    });
    
    // Auth listener: 監聽用戶狀態
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


    // Data listener: 監聽 Firestore 資料 & 處理登入 (已修正邏輯)
    useEffect(() => {
        // 如果 Firebase 服務未準備好，則跳過，讓上面的 useEffect 處理 loading 狀態。
        if (!firebaseStatus.isReady) return; 

        // 呼叫 Service 層來設置即時監聽。
        // 當 user 為 null 時， initAuthAndGetRecords 會在內部啟動匿名登入。
        const unsubscribeFirestore = initAuthAndGetRecords(setRawRecords, setLoading, user);

        return () => unsubscribeFirestore();
        
    }, [user]); // 依賴 user 狀態，確保登入完成後會重新執行，並將 user 傳入 initAuthAndGetRecords。
    
    // B/S Calculation Logic: 根據 rawRecords 計算球數狀態
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
    
    // Handlers for persistence (保持不變)
    const handleSavePitch = async (data) => {
        try {
            await savePitchRecord(data, user);
        } catch (error) {
            Alert.alert("儲存失敗", `寫入數據庫時發生錯誤: ${error.message}`);
            throw error; 
        }
    };
    
    const handleDeletePitch = async (id) => {
        try {
            await deletePitchRecord(id);
        } catch (error) {
            Alert.alert("錯誤", `刪除失敗: ${error.message}`);
        }
    };

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