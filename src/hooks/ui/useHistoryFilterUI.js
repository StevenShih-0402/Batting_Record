// src/hooks/ui/useHistoryFilterUI.js
// 歷史紀錄篩選彈出視窗的狀態與業務邏輯管理
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export const useHistoryFilterUI = (initialFilters, onApply, onClear, navigation) => {
    const [localFilters, setLocalFilters] = useState({
        title: '',
        startDate: '',
        endDate: '',
        minPitches: '',
        maxPitches: '',
        note: '',
        customFields: {}
    });

    useEffect(() => {
        setLocalFilters(initialFilters || {
            title: '', startDate: '', endDate: '',
            minPitches: '', maxPitches: '', note: '', customFields: {}
        });
    }, [initialFilters]);

    const handleCustomFieldChange = (id, value) => {
        setLocalFilters(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [id]: value
            }
        }));
    };

    const handleApply = () => {
        if (onApply) onApply(localFilters);
        navigation.goBack();
    };

    const handleClear = () => {
        if (onClear) onClear();
        navigation.goBack();
    };

    // 日期選擇器狀態
    const [datePickerConfig, setDatePickerConfig] = useState({ show: false, mode: 'start', date: new Date() });

    const openDatePicker = (mode) => {
        const currentDateStr = mode === 'start' ? localFilters.startDate : localFilters.endDate;
        let pickedDate = new Date();
        if (currentDateStr) {
            const parsed = new Date(currentDateStr);
            if (!isNaN(parsed.getTime())) pickedDate = parsed;
        }
        setDatePickerConfig({ show: true, mode, date: pickedDate });
    };

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setDatePickerConfig(prev => ({ ...prev, show: false }));
        }
        if (event.type === 'dismissed') {
            setDatePickerConfig({ show: false, mode: 'start', date: new Date() });
            return;
        }
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            if (datePickerConfig.mode === 'start') {
                setLocalFilters(prev => ({ ...prev, startDate: dateStr }));
            } else {
                setLocalFilters(prev => ({ ...prev, endDate: dateStr }));
            }
            if (Platform.OS === 'ios') {
                setDatePickerConfig(prev => ({ ...prev, date: selectedDate }));
            }
        }
    };

    const confirmIOSDate = () => {
        setDatePickerConfig(prev => ({ ...prev, show: false }));
    };

    return {
        localFilters,
        setLocalFilters,
        handleCustomFieldChange,
        handleApply,
        handleClear,
        datePickerConfig,
        openDatePicker,
        onDateChange,
        confirmIOSDate
    };
};
