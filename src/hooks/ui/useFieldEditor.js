// src/hooks/ui/useFieldEditor.js
// 管理自訂欄位（備註或彙整）的新增表單狀態，含欄位名稱、類型與下拉選項。
import { useState } from 'react';

export const useFieldEditor = () => {
    const [label, setLabel] = useState('');
    const [type, setType] = useState('text');
    const [newOption, setNewOption] = useState('');
    const [options, setOptions] = useState([]);

    const reset = () => {
        setLabel('');
        setType('text');
        setNewOption('');
        setOptions([]);
    };

    const addOption = () => {
        const trimmed = newOption.trim();
        if (!trimmed || options.includes(trimmed)) return;
        setOptions([...options, trimmed]);
        setNewOption('');
    };

    const removeOption = (idx) => {
        const next = [...options];
        next.splice(idx, 1);
        setOptions(next);
    };

    return { label, setLabel, type, setType, newOption, setNewOption, options, addOption, removeOption, reset };
};
