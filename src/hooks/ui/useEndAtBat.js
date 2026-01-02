// src/hooks/ui/useEndAtBat.js
// EndAtBatModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useEndAtBat = (isVisible, atBatRecords, onSave, onClose) => {
    const [summaryNote, setSummaryNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 當開啟時重置狀態
    useEffect(() => {
        if (isVisible) {
            setSummaryNote('');
        }
    }, [isVisible]);

    // 儲存結算資料的方法
    const handleSave = async () => {
        // 使用 Optional Chaining 或檢查是否存在
        if (!atBatRecords || atBatRecords.length === 0) return;

        setIsSaving(true);
        try {
            // 1. 執行原本的儲存邏輯
            // 這裡傳出去的 onSave，其實就是 useAtBatRecords 的 handleSaveSummaryAction
            await onSave({ summaryNote });

            // 2. 儲存成功後，顯示 Alert
            Alert.alert("儲存成功", "打席紀錄已彙整存入資料庫。",[
                    // 3. 使用者按下確定後，執行原本傳進來的 onClose，並清空輸入框
                    { text: "確定", onPress: () => { onClose(); setSummaryNote(''); }}
                ],
                { cancelable: false } // 強制使用者點擊按鈕
            );
        } catch (error) {
            console.error("Save Summary Error:", error);
            Alert.alert("儲存失敗", "請檢查網路連線後再試一次。");
        } finally {
            setIsSaving(false);
        }
    };

    return { 
        summaryNote, 
        setSummaryNote, 
        isSaving, 
        handleSave,
    };
};