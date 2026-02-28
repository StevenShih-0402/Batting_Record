// src/hooks/ui/useHistoryDetail.js
// HistoryDetailScreen 的狀態與業務邏輯管理
import { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../../services/atBatSummaryService';

export const useHistoryDetail = (record, navigation) => {
    const { showWarning } = useAlert();
    const [localPitches, setLocalPitches] = useState([]);
    const [gridLayout, setGridLayout] = useState(null);

    // 當收到的 record 更新時同步本地端顯示的球點
    useEffect(() => {
        if (record && record.pitchRecords) {
            setLocalPitches(record.pitchRecords);
        }
    }, [record]);

    // 處理九宮格佈局回傳
    const handleGridLayout = (e) => {
        const { width, height } = e.nativeEvent.layout;
        setGridLayout({ width, height });
    };

    // 處理單顆球的刪除
    const handleDeleteSinglePitch = (index) => {
        showWarning('刪除球點', '確定要刪除這顆球嗎？', [
            { text: '取消', style: 'cancel' },
            {
                text: '刪除',
                onPress: async () => {
                    const newPitches = [...localPitches];
                    newPitches.splice(index, 1);
                    setLocalPitches(newPitches);
                    await updateAtBatSummaryPitches(record.id, newPitches);
                }
            }
        ]);
    };

    // 處理整筆紀錄刪除
    const handleDeleteWholeRecord = () => {
        showWarning('刪除整筆紀錄', '確定要刪除這個打席的所有資料嗎？', [
            { text: '取消', style: 'cancel' },
            {
                text: '確認刪除',
                onPress: async () => {
                    await deleteAtBatSummary(record.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    // 處理編輯單球 - 導航至 PitchEdit
    const handleEditPitch = (index) => {
        const pitchToEdit = localPitches[index];
        navigation.navigate('PitchEdit', {
            record: pitchToEdit,
            onSave: async (updatedData) => {
                const newPitches = [...localPitches];
                newPitches[index] = {
                    ...newPitches[index],
                    ...updatedData,
                };
                setLocalPitches(newPitches);
                await updateAtBatSummaryPitches(record.id, newPitches);
            },
            onDelete: () => {
                handleDeleteSinglePitch(index);
            }
        });
    };

    return {
        localPitches,
        gridLayout,
        handleGridLayout,
        handleDeleteSinglePitch,
        handleDeleteWholeRecord,
        handleEditPitch,
    };
};
