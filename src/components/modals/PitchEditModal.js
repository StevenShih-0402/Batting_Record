// src/components/modals/PitchEditModal.js
// 編輯與刪除逐球紀錄的彈窗

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { getColorByResult } from '../../constants/Colors';
import { PITCH_TYPES_ZH } from '../../constants/GameConstants';

// 匯入表單元件
import SelectionDropdown from '../forms/SelectionDropdown';
import SpeedInput from '../forms/SpeedInput';
import NoteInput from '../forms/NoteInput';

// 匯入 hook
import { usePitchEdit } from '../../hooks/ui/usePitchEdit';

const PitchEditModal = ({ isVisible, record, onClose, onSave, onDelete, isSaving }) => {
    const theme = useTheme();

    // 使用自定義 Hook
    const { formState, setSpeed, setPitchType, setNote, handleSave } = 
        usePitchEdit(record, isVisible, onSave);

    if (!record) return null;

    const dotColor = getColorByResult(record.result, record.atBatEndOutcome);

    return (
        <Portal>
            <Modal
                visible={isVisible}
                onDismiss={onClose}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
            >
                {/* 標題與關閉按鈕 */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={[styles.colorIndicator, { backgroundColor: dotColor }]} />
                        <Text variant="headlineSmall" style={styles.title}>編輯投球紀錄</Text>
                    </View>
                    <IconButton icon="close" size={24} onPress={onClose} />
                </View>

                <ScrollView style={styles.content}>
                    {/* 1. 頂部資訊卡 (保持不變) */}
                    <View style={styles.infoSection}>
                        <Text variant="labelLarge" style={{ color: dotColor }}>當前結果：{record.result}</Text>
                        <Text variant="bodySmall">位置：{record.cellNumber > 0 ? `${record.cellNumber} 號位` : '九宮格外'}</Text>
                    </View>

                    {/* 2. 球種表單選單 (Inline) */}
                    <SelectionDropdown 
                        label="球種"
                        selectedValue={formState.pitchType}
                        options={PITCH_TYPES_ZH}
                        onSelect={setPitchType}
                    />

                    {/* 3. 球速輸入 (數值輸入優化) */}
                    <SpeedInput 
                        value={formState.speed}
                        onChangeText={setSpeed}
                    />

                    {/* 4. 備註輸入 */}
                    <NoteInput 
                        value={formState.note}
                        onChangeText={setNote}
                    />
                </ScrollView>

                {/* 按鈕區域 */}
                <View style={styles.footer}>
                    {/* 左側：刪除按鈕 (危險操作) */}
                    <Button 
                        mode="text" 
                        onPress={() => onDelete(record.id)} 
                        textColor={theme.colors.error}
                        icon="trash-can-outline"
                    >
                        刪除
                    </Button>

                    {/* 右側：儲存 */}     
                    <Button 
                        mode="contained" 
                        onPress={handleSave} 
                        loading={isSaving}
                        disabled={isSaving}
                        icon="pen"
                    >
                        更新
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        margin: 20,
        padding: 0, // 內部自行配制 padding
        borderRadius: 28, // MD3 標準圓角
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 8,
        paddingVertical: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    title: {
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    infoSection: {
        marginBottom: 20,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
});

export default PitchEditModal;