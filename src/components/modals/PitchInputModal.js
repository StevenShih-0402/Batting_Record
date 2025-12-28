// src/components/modals/PitchInputModal.js
// 輸入逐球紀錄的彈窗
import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import { PITCH_TYPES_ZH, PITCH_RESULTS } from '../../constants/GameConstants';

// 匯入表單元件
import SelectionDropdown from '../forms/SelectionDropdown';
import SpeedInput from '../forms/SpeedInput';
import NoteInput from '../forms/NoteInput';

// 匯入 hook
import { usePitchInput } from '../../hooks/ui/usePitchInput';

const PitchInputModal = ({ isVisible, onClose, onSave, cellInfo, atBatStatus, isSaving }) => {
    const theme = useTheme();
    
    // 引入 Hook
    const { 
        form, setPitchType, setResult, setSpeed, setNote, 
        getResultOptions, handleSave 
    } = usePitchInput(isVisible, cellInfo, atBatStatus, onSave);


    return (
        <Portal>
            <Modal visible={isVisible} onDismiss={onClose} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                {/* 使用 ScrollView 確保展開選單時可以滑動 */}
                <ScrollView style={{ marginBottom: 20, }} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.primary, flexShrink: 1 }]}>
                            {cellInfo.cellNumber > 0 ? `${cellInfo.cellNumber} 號位` : '九宮格外'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                            <Icon name="x" size={24} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                    </View>

                    {/* 球種 - 內嵌表單式 */}
                    <SelectionDropdown 
                        label="球種"
                        selectedValue={form.pitchType}
                        options={PITCH_TYPES_ZH}
                        onSelect={setPitchType}
                    />

                    {/* 結果 - 內嵌表單式 */}
                    <SelectionDropdown 
                        label="結果"
                        icon='baseball-bat'
                        selectedValue={form.result}
                        options={getResultOptions(PITCH_RESULTS)} 
                        onSelect={setResult}
                        disabled={atBatStatus.lastResult === '打擊出去'} 
                    />

                    {/* 球速 - 佈局優化 */}
                    <SpeedInput 
                        value={form.speed}
                        onChangeText={setSpeed}
                    />

                    {/* 備註 */}
                    <NoteInput 
                        value={form.note}
                        onChangeText={setNote}
                    />

                </ScrollView>

                {/* 按鈕放在 ScrollView 外，保持在底部固定位置 */}
                <Button 
                    mode="contained" 
                    onPress={handleSave} 
                    loading={isSaving} 
                    disabled={isSaving || atBatStatus.lastResult === '打擊出去'}
                    style={styles.saveButton}
                >
                    儲存打席球數
                </Button>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        width: '90%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    saveButton: {
        marginTop: 10,
        paddingVertical: 5,
    },
});

export default PitchInputModal;