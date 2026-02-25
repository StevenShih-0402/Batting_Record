// src/hooks/ui/useEndAtBat.js
// EndAtBatModal 的狀態管理與業務邏輯
import { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { usePreferences } from '../../context/PreferencesContext';

export const useEndAtBat = (isVisible, atBatRecords, onSave, onClose) => {
    const [summaryNote, setSummaryNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [atBatTitle, setAtBatTitle] = useState('');
    const { showSuccess, showError } = useAlert();
    const { customSummaryFields } = usePreferences();

    /**
     * 自訂打席彙整欄位的輸入值，key 為 fieldId。
     */
    const [summaryCustomValues, setSummaryCustomValues] = useState({});

    // Modal 開啟時清空內容，重置狀態
    useEffect(() => {
        if (isVisible) {
            setAtBatTitle('');
            setSummaryNote('');
            setSummaryCustomValues({});
        }
    }, [isVisible]);

    /**
     * 設定單一自訂彙整欄位的值。
     */
    const setSummaryCustomValue = (fieldId, value) => {
        setSummaryCustomValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    // 儲存結算資料的方法
    const handleSave = async () => {
        // 使用 Optional Chaining 或檢查是否存在
        if (!atBatRecords || atBatRecords.length === 0) return;

        setIsSaving(true);
        try {
            // 如果標題沒填，給一個預設文字
            const finalTitle = atBatTitle.trim() || `${new Date().toLocaleTimeString()}`;
            // 1. 執行原本的儲存邏輯
            // 這裡傳出去的 onSave，其實就是 useAtBatRecords 的 handleSaveSummaryAction
            await onSave({
                atBatTitle: finalTitle,
                summaryNote,
                customSummaryValues: summaryCustomValues,
            });

            showSuccess('儲存成功', '打席紀錄已彙整存入資料庫。', [
                {
                    text: '確定', onPress: () => {
                        onClose();
                        setSummaryNote('');
                        setAtBatTitle('');
                        setSummaryCustomValues({});
                    }
                }
            ]);
        } catch (error) {
            console.error('Save Summary Error:', error);
            showError('儲存失敗', '請檢查網路連線後再試一次。');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        atBatTitle,
        setAtBatTitle,
        summaryNote,
        setSummaryNote,
        isSaving,
        handleSave,
        customSummaryFields,
        summaryCustomValues,
        setSummaryCustomValue,
    };
};