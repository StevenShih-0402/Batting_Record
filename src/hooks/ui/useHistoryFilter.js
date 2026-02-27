// src/hooks/ui/useHistoryFilter.js
// 管理打席紀錄篩選狀態與邏輯

import { useState, useMemo } from 'react';

export const useHistoryFilter = (history) => {
    const [filters, setFilters] = useState({
        title: '',
        startDate: '',
        endDate: '',
        minPitches: '',
        maxPitches: '',
        note: '',
        customFields: {} // { fieldId: value }
    });

    const [isFilterActive, setIsFilterActive] = useState(false);

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
        // 檢查是否有設定任何篩選條件
        const hasFilter = !!(
            newFilters.title ||
            newFilters.startDate ||
            newFilters.endDate ||
            newFilters.minPitches ||
            newFilters.maxPitches ||
            newFilters.note ||
            Object.values(newFilters.customFields || {}).some(val => !!val)
        );
        setIsFilterActive(hasFilter);
    };

    const clearFilters = () => {
        const emptyFilters = {
            title: '',
            startDate: '',
            endDate: '',
            minPitches: '',
            maxPitches: '',
            note: '',
            customFields: {}
        };
        setFilters(emptyFilters);
        setIsFilterActive(false);
    };

    const filteredHistory = useMemo(() => {
        if (!isFilterActive || !history) return history;

        return history.filter(item => {
            // 1. 標題篩選 (比對 atBatLabel 或 finalOutcome)
            if (filters.title) {
                const searchLower = filters.title.toLowerCase();
                const titleLower = item.atBatLabel?.toLowerCase() || '';
                const outcomeLower = item.finalOutcome?.toLowerCase() || '';
                if (!titleLower.includes(searchLower) && !outcomeLower.includes(searchLower)) {
                    return false;
                }
            }

            // 2. 日期篩選 (item.date 格式通常為 'YYYY-MM-DD')
            if (filters.startDate && item.date < filters.startDate) return false;
            if (filters.endDate && item.date > filters.endDate) return false;

            // 3. 球數篩選
            if (filters.minPitches !== '') {
                const min = parseInt(filters.minPitches, 10);
                if (!isNaN(min) && item.totalPitches < min) return false;
            }
            if (filters.maxPitches !== '') {
                const max = parseInt(filters.maxPitches, 10);
                if (!isNaN(max) && item.totalPitches > max) return false;
            }

            // 4. 備註篩選
            if (filters.note) {
                const noteLower = item.summaryNote?.toLowerCase() || '';
                if (!noteLower.includes(filters.note.toLowerCase())) return false;
            }

            // 5. 自訂欄位篩選
            if (filters.customFields && Object.keys(filters.customFields).length > 0) {
                const customValues = item.customSummaryValues || {};
                for (const [key, value] of Object.entries(filters.customFields)) {
                    if (value) {
                        const itemVal = customValues[key]?.toLowerCase() || '';
                        if (!itemVal.includes(value.toLowerCase())) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });
    }, [history, filters, isFilterActive]);

    return {
        filters,
        isFilterActive,
        filteredHistory,
        applyFilters,
        clearFilters
    };
};
