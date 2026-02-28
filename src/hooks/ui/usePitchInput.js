// src/hooks/ui/usePitchInput.js
// PitchInputModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { usePreferences } from '../../context/PreferencesContext';
import { getFieldQueue, pushToFieldQueue } from './useCustomFieldQueue';
import { PITCH_RESULTS } from '../../constants/GameConstants';

export const usePitchInput = (isVisible, cellInfo, atBatStatus, onSave) => {
    const { pitchTypes, customPitchFields } = usePreferences();
    const { showWarning } = useAlert();

    // 初始化狀態
    const [pitchType, setPitchType] = useState(pitchTypes[0]);
    const [result, setResult] = useState(PITCH_RESULTS[0]);
    const [speed, setSpeed] = useState('');
    const [note, setNote] = useState('');

    /**
     * 自訂打席備註欄位的輸入值，key 為 fieldId。
     */
    const [customValues, setCustomValues] = useState({});
    const [fieldQueues, setFieldQueues] = useState({});

    // 當 context 載入完成或 isVisible 變更時，重置/更新預設值
    useEffect(() => {
        if (!isVisible) {
            setPitchType(pitchTypes[0]);
            setResult(PITCH_RESULTS[0]);
            setSpeed('');
            setNote('');
            setCustomValues({});
        } else {
            const loadQueues = async () => {
                const queues = {};
                for (const field of customPitchFields) {
                    if (field.type === 'text') {
                        queues[field.id] = await getFieldQueue(field.id);
                    }
                }
                setFieldQueues(queues);
            };
            loadQueues();
        }
    }, [isVisible, pitchTypes, customPitchFields]);

    /**
     * 設定單一自訂欄位的值。
     */
    const setCustomValue = (fieldId, value) => {
        setCustomValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    // 業務邏輯：過濾可選結果
    const getResultOptions = () => {
        let options = [...PITCH_RESULTS];

        if (atBatStatus.strikes >= 3) {
            options = options.filter((r) => r !== '好球');
        }
        if (atBatStatus.balls >= 4) {
            options = options.filter((r) => r !== '壞球');
        }
        return options;
    };

    const handleSave = async () => {
        // 1. 判定打席是否已結束
        if (atBatStatus.isFinished) {
            showWarning('打席已結束', '請先儲存紀錄後再開始新的。');
            return;
        }

        // 2. 判定邏輯衝突
        if (result === '好球' && atBatStatus.strikes >= 3) {
            showWarning('無法儲存', '好球數已滿。');
            return;
        }
        if (result === '壞球' && atBatStatus.balls >= 4) {
            showWarning('無法儲存', '壞球數已滿。');
            return;
        }

        // 3. 儲存 Queue 與資料準備
        for (const field of customPitchFields) {
            if (field.type === 'text' && customValues[field.id]) {
                await pushToFieldQueue(field.id, customValues[field.id]);
            }
        }

        const finalSpeed = parseFloat(speed) || 0;
        const data = {
            pitchType,
            result,
            speed: finalSpeed,
            cellNumber: cellInfo.cellNumber,
            gridX: cellInfo.gridX,
            gridY: cellInfo.gridY,
            note,
            customPitchValues: customValues,
        };

        await onSave(data);
    };

    return {
        form: { pitchType, result, speed, note },
        setPitchType, setResult, setSpeed, setNote,
        customPitchFields,
        customValues,
        setCustomValue,
        getResultOptions,
        handleSave,
        pitchTypes,
        fieldQueues,
    };
};