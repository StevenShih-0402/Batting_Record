// hooks/useEndAtBat.js
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

    const handleSave = async () => {
        if (atBatRecords.length === 0) return;

        setIsSaving(true);
        try {
            // 1. 執行原本的儲存邏輯
            await onSave({ summaryNote });

            // 2. 儲存成功後，顯示 Alert
            Alert.alert(
                "儲存成功",
                "打席紀錄已彙整存入資料庫。",
                [
                    { 
                        text: "確定", 
                        onPress: () => {
                            // 3. 使用者按下確定後，執行原本傳進來的 onClose
                            onClose();
                            setSummaryNote(''); // 清空輸入框
                        } 
                    }
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

    return { summaryNote, setSummaryNote, isSaving, handleSave };
};

// 輔助函式：將資料格式化的邏輯抽離（這也可以放在 service 層）
const formatAtBatData = (note, records) => {
    const latest = records.length > 0 ? records[0] : { runningBalls: 0, runningStrikes: 0 };
    return {
        finalOutcome: '未選擇/已彙整',
        summaryNote: note,
        totalPitches: records.length,
        pitchRecords: records.map(r => ({
            pitchType: r.pitchType,
            result: r.result,
            speed: r.speed,
            cellNumber: r.cellNumber,
            note: r.note,
        })),
        finalBalls: latest.runningBalls,
        finalStrikes: latest.runningStrikes,
    };
};