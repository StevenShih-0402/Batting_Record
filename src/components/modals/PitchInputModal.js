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

const PitchInputModal = ({ isVisible, onClose, onSave, cellInfo, atBatStatus, isSaving }) => {
    const theme = useTheme();
    const [pitchType, setPitchType] = useState(PITCH_TYPES_ZH[0]);
    const [result, setResult] = useState(PITCH_RESULTS[0]); 
    const [speed, setSpeed] = useState(''); 
    const [note, setNote] = useState(''); 
    
    useEffect(() => {
        if (!isVisible) {
            setPitchType(PITCH_TYPES_ZH[0]);
            setResult(PITCH_RESULTS[0]);
            setSpeed('');
            setNote('');
        }
    }, [isVisible]);

    const handleSave = async () => {
        if (atBatStatus.isFinished) {
            let finishReason = '';
            if (atBatStatus.balls >= 4) finishReason = '四壞球保送';
            else if (atBatStatus.strikes >= 3) finishReason = '三振';
            else if (atBatStatus.lastResult === '打擊出去') finishReason = '打擊出去';

            Alert.alert(
                "打席已結束", 
                `當前打席已因 ${finishReason} 而結束。請先在抽屜中點擊「儲存紀錄」按鈕，結束此打席後才能開始新的紀錄。`,
            );
            return;
        }

        if (result === '好球' && atBatStatus.strikes >= 3) {
            Alert.alert("無法儲存", "好球數已達 3 個（三振）。請改選其他結果或結束打席。");
            return;
        }
        if (result === '壞球' && atBatStatus.balls >= 4) {
            Alert.alert("無法儲存", "壞球數已達 4 個（保送）。請改選其他結果或結束打席。");
            return;
        }
        
        // 需求 1: 移除「打擊出去」的提示彈窗
        if (result === '打擊出去' && atBatStatus.atBatRecordsCount > 0) {
            performSave(); 
            return;
        }

        performSave();
    };

    const performSave = async () => {
        const safeGridX = typeof cellInfo.gridX === 'number' ? cellInfo.gridX : 0.5;
        const safeGridY = typeof cellInfo.gridY === 'number' ? cellInfo.gridY : 0.5;
        
        let finalSpeed = parseFloat(speed);
        if (isNaN(finalSpeed) || speed.trim() === '') {
            finalSpeed = 0; 
        }

        const data = {
            pitchType,
            result, 
            speed: finalSpeed, 
            cellNumber: cellInfo.cellNumber,
            gridX: safeGridX, 
            gridY: safeGridY,
            note: note, 
        };
        
        try {
            await onSave(data);
        } catch (error) {
            // 錯誤由父層 hook 處理
        }
    };

    const getResultOptions = () => {
        if (atBatStatus.strikes >= 3) {
            return PITCH_RESULTS.filter(r => r !== '好球');
        }
        if (atBatStatus.balls >= 4) {
            return PITCH_RESULTS.filter(r => r !== '壞球');
        }
        return PITCH_RESULTS;
    };


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
                        selectedValue={pitchType}
                        options={PITCH_TYPES_ZH}
                        onSelect={setPitchType}
                    />

                    {/* 結果 - 內嵌表單式 */}
                    <SelectionDropdown 
                        label="結果"
                        icon='baseball-bat'
                        selectedValue={result}
                        options={getResultOptions()} 
                        onSelect={setResult}
                        disabled={atBatStatus.lastResult === '打擊出去'} 
                    />

                    {/* 球速 - 佈局優化 */}
                    <SpeedInput 
                        value={speed}
                        onChangeText={setSpeed}
                    />

                    {/* 備註 */}
                    <NoteInput 
                        value={note}
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
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    saveButton: {
        marginTop: 10,
        paddingVertical: 5,
    },
});

export default PitchInputModal;