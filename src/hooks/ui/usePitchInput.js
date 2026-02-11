// src/hooks/ui/usePitchInput.js
// PitchInputModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { usePreferences } from '../../context/PreferencesContext';

export const usePitchInput = (isVisible, cellInfo, atBatStatus, onSave) => {
    const { pitchTypes, pitchResults } = usePreferences();

    // 初始化狀態
    const [pitchType, setPitchType] = useState(pitchTypes[0]);
    const [result, setResult] = useState(pitchResults[0]);
    const [speed, setSpeed] = useState('');
    const [note, setNote] = useState('');

    // 當 context 載入完成或 isVisible 變更時，重置/更新預設值
    useEffect(() => {
        if (!isVisible) {
            setPitchType(pitchTypes[0]);
            setResult(pitchResults[0]);
            setSpeed('');
            setNote('');
        }
    }, [isVisible, pitchTypes, pitchResults]);

    // 業務邏輯：過濾可選結果
    const getResultOptions = () => {
        // 使用 context 中的 pitchResults
        let options = [...pitchResults];

        // 根據好壞球數過濾
        if (atBatStatus.strikes >= 3) {
            options = options.filter(r => r !== '好球');
        }
        if (atBatStatus.balls >= 4) {
            options = options.filter(r => r !== '壞球');
        }
        return options;
    };

    const handleSave = async () => {
        // 1. 判定打席是否已結束
        if (atBatStatus.isFinished) {
            showWarning("打席已結束", `請先儲存紀錄後再開始新的。`);
            return;
        }

        // 2. 判定邏輯衝突
        if (result === '好球' && atBatStatus.strikes >= 3) {
            showWarning("無法儲存", "好球數已滿。");
            return;
        }
        if (result === '壞球' && atBatStatus.balls >= 4) {
            showWarning("無法儲存", "壞球數已滿。");
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
        handleSave,
        pitchTypes, // 回傳給 UI 使用
        pitchResults
    };
};