// src/hooks/ui/usePitchInput.js
// PitchInputModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { PITCH_RESULTS, PITCH_TYPES_ZH } from '../../constants/GameConstants';

export const usePitchInput = (isVisible, cellInfo, atBatStatus, onSave) => {
    const [pitchType, setPitchType] = useState(PITCH_TYPES_ZH[0]); // 假設初始值
    const [result, setResult] = useState(PITCH_RESULTS[0]);
    const [speed, setSpeed] = useState('');
    const [note, setNote] = useState('');

    // 重置表單
    useEffect(() => {
        if (!isVisible) {
            setPitchType(PITCH_TYPES_ZH[0]);
            setResult(PITCH_RESULTS[0]);
            setSpeed('');
            setNote('');
        }
    }, [isVisible]);

    // 業務邏輯：過濾可選結果
    const getResultOptions = (PITCH_RESULTS) => {
        if (atBatStatus.strikes >= 3) return PITCH_RESULTS.filter(r => r !== '好球');
        if (atBatStatus.balls >= 4) return PITCH_RESULTS.filter(r => r !== '壞球');
        return PITCH_RESULTS;
    };

    const handleSave = async () => {
        // 1. 判定打席是否已結束
        if (atBatStatus.isFinished) {
            let reason = atBatStatus.balls >= 4 ? '保送' : 
                         atBatStatus.strikes >= 3 ? '三振' : '打擊出去';
            Alert.alert("打席已結束", `請先儲存紀錄後再開始新的。`);
            return;
        }

        // 2. 判定邏輯衝突
        if (result === '好球' && atBatStatus.strikes >= 3) {
            Alert.alert("無法儲存", "好球數已滿。");
            return;
        }
        if (result === '壞球' && atBatStatus.balls >= 4) {
            Alert.alert("無法儲存", "壞球數已滿。");
            return;
        }

        // 3. 資料準備與執行
        const finalSpeed = parseFloat(speed) || 0;
        const data = {
            pitchType,
            result,
            speed: finalSpeed,
            cellNumber: cellInfo.cellNumber,
            gridX: cellInfo.gridX, // 確保這兩行存在
            gridY: cellInfo.gridY,
            note,
        };

        await onSave(data);
    };

    return {
        form: { pitchType, result, speed, note },
        setPitchType, setResult, setSpeed, setNote,
        getResultOptions,
        handleSave
    };
};