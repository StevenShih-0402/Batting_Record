// hooks/usePitchEdit.js
// PitchEditModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';

export const usePitchEdit = (record, isVisible, onSave) => {
    const [speed, setSpeed] = useState('');
    const [pitchType, setPitchType] = useState('');
    const [note, setNote] = useState('');
    const [result, setResult] = useState('');

    // 當 record 改變或 Modal 開啟時，初始化表單
    useEffect(() => {
        if (record && isVisible) {
            setSpeed(record.speed ? record.speed.toString() : '');
            setPitchType(record.pitchType || '');
            setNote(record.note || '');
            setResult(record.result || '');
        }
    }, [record, isVisible]);

    const handleSave = () => {
        onSave({
            speed: parseFloat(speed) || 0,
            pitchType,
            note,
            result, 
        });
    };

    return {
        formState: { speed, pitchType, note, result },
        setSpeed,
        setPitchType,
        setNote,
        setResult,
        handleSave
    };
};