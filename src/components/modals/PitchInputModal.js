// src/components/modals/PitchInputModal.js
import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import SelectionDropdown from '../common/SelectionDropdown';
import { PITCH_TYPES_ZH, PITCH_RESULTS } from '../../constants/GameConstants';


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
            <Modal visible={isVisible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text 
                        style={[styles.modalTitle, { 
                            color: theme.colors.primary, 
                            flexShrink: 1 
                        }]}
                    >
                        {cellInfo.cellNumber > 0 ? `${cellInfo.cellNumber} 號位` : '九宮格外'} 
                        <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
                            ({cellInfo.gridX ? cellInfo.gridX.toFixed(2) : 'N/A'}, {cellInfo.gridY ? cellInfo.gridY.toFixed(2) : 'N/A'})
                        </Text>
                    </Text>
                    <TouchableOpacity onPress={onClose} style={{padding: 5}}>
                        <Icon name="x" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                </View>

                <SelectionDropdown 
                    label="球種"
                    selectedValue={pitchType}
                    options={PITCH_TYPES_ZH}
                    onSelect={setPitchType}
                />

                <SelectionDropdown 
                    label="結果"
                    selectedValue={result}
                    options={getResultOptions()} 
                    onSelect={setResult}
                    disabled={atBatStatus.lastResult === '打擊出去'} 
                />
                
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>球速 (KM/H)</Text>
                    <TextInput
                        mode="outlined"
                        value={speed}
                        onChangeText={text => setSpeed(text.replace(/[^0-9.]/g, ''))}
                        keyboardType="numeric"
                        placeholder="可不輸入"
                        style={{ width: '50%' }}
                        right={<TextInput.Affix text="km/h" />}
                        disabled={atBatStatus.lastResult === '打擊出去'}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>備註 (Ex. 觸身球)</Text>
                    <TextInput
                        mode="outlined"
                        value={note}
                        onChangeText={setNote}
                        placeholder="輸入細部資訊"
                        multiline
                        numberOfLines={3}
                        style={{ minHeight: 80 }}
                        disabled={atBatStatus.lastResult === '打擊出去'}
                    />
                </View>

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
        backgroundColor: 'white',
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