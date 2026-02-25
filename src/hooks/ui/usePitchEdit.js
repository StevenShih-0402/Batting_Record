// src/hooks/ui/usePitchEdit.js
// PitchEditModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';

export const usePitchEdit = (record, isVisible, onSave) => {
    const [speed, setSpeed] = useState('');
    const [pitchType, setPitchType] = useState('');
    const [note, setNote] = useState('');
    const [result, setResult] = useState('');

    /**
     * 自訂打席備註欄位的編輯值，key 為 fieldId。
     */
    const [customPitchValues, setCustomPitchValues] = useState({});

    // 當 record 改變或 Modal 開啟時，初始化表單（含自訂欄位的現有值）
    useEffect(() => {
        if (record && isVisible) {
            setSpeed(record.speed ? record.speed.toString() : '');
            setPitchType(record.pitchType || '');
            setNote(record.note || '');
            setResult(record.result || '');
            setCustomPitchValues(record.customPitchValues || {});
        }
    }, [record, isVisible]);

    /**
     * 設定單一自訂欄位的值。
     */
    const setCustomValue = (fieldId, value) => {
        setCustomPitchValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleSave = () => {
        onSave({
            speed: parseFloat(speed) || 0,
            pitchType,
            note,
            result,
            customPitchValues,
        });
    };

    return {
        formState: { speed, pitchType, note, result },
        setSpeed,
        setPitchType,
        setNote,
        setResult,
        customPitchValues,
        setCustomValue,
        handleSave,
    };
};