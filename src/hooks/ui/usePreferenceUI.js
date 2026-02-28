// src/hooks/ui/usePreferenceUI.js
import { useState } from 'react';
import { useAlert } from '../../context/AlertContext';
import { usePreferences } from '../../context/PreferencesContext';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const usePreferenceUI = (navigation) => {
    const { showSuccess, showError } = useAlert();
    const {
        pitchTypes, primaryColor,
        customPitchFields, customSummaryFields,
        savePreferences, isLoading
    } = usePreferences();

    const [localPitchTypes, setLocalPitchTypes] = useState([...pitchTypes]);
    const [localColor, setLocalColor] = useState(primaryColor);
    const [localPitchFields, setLocalPitchFields] = useState([...customPitchFields]);
    const [localSummaryFields, setLocalSummaryFields] = useState([...customSummaryFields]);

    const [newPitchType, setNewPitchType] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const addPitchType = () => {
        if (!newPitchType.trim()) return;
        if (localPitchTypes.includes(newPitchType.trim())) {
            showError('重複項目', '此球種已存在');
            return;
        }
        setLocalPitchTypes([...localPitchTypes, newPitchType.trim()]);
        setNewPitchType('');
    };

    const removePitchType = (index) => {
        const newList = [...localPitchTypes];
        newList.splice(index, 1);
        setLocalPitchTypes(newList);
    };

    const addCustomField = (editor, setList) => {
        if (!editor.label.trim()) {
            showError('欄位名稱不得為空', '請輸入欄位名稱');
            return;
        }
        if (editor.type === 'dropdown' && editor.options.length === 0) {
            showError('請新增選項', '下拉選單型欄位至少需要一個選項');
            return;
        }
        const newField = {
            id: uuidv4(),
            label: editor.label.trim(),
            type: editor.type,
            options: editor.type === 'dropdown' ? [...editor.options] : [],
        };
        setList((prev) => [...prev, newField]);
        editor.reset();
    };

    const removeCustomField = (setList, id) => {
        setList((prev) => prev.filter((f) => f.id !== id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await savePreferences(
                localPitchTypes,
                localColor,
                localPitchFields,
                localSummaryFields
            );
            if (success) {
                showSuccess('儲存成功', '偏好設定已更新');
                navigation.goBack();
            } else {
                showError('儲存失敗', '請稍後再試');
            }
        } catch (error) {
            console.error(error);
            showError('發生錯誤', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        localColor,
        setLocalColor,
        localPitchTypes,
        newPitchType,
        setNewPitchType,
        addPitchType,
        removePitchType,
        localPitchFields,
        setLocalPitchFields,
        localSummaryFields,
        setLocalSummaryFields,
        addCustomField,
        removeCustomField,
        handleSave,
    };
};
