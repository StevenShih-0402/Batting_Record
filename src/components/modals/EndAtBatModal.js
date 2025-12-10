// src/components/modals/EndAtBatModal.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';

const EndAtBatModal = ({ isVisible, onClose, onSave, atBatRecords }) => {
    const theme = useTheme();
    const [summaryNote, setSummaryNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setSummaryNote('');
        }
    }, [isVisible]);

    const handleSave = async () => {
        setIsSaving(true);
        const totalPitches = atBatRecords.length;
        
        // 需求 2: 移除「最終結果」的區塊，固定 outcome
        const finalOutcomeForSave = '未選擇/已彙整'; 
        
        const data = {
            finalOutcome: finalOutcomeForSave, // 固定值
            summaryNote: summaryNote,
            totalPitches: totalPitches,
            pitchRecords: atBatRecords.map(r => ({ 
                pitchType: r.pitchType,
                result: r.result,
                speed: r.speed,
                cellNumber: r.cellNumber,
                note: r.note,
            })),
            finalBalls: atBatRecords.length > 0 ? atBatRecords[0].runningBalls : 0,
            finalStrikes: atBatRecords.length > 0 ? atBatRecords[0].runningStrikes : 0,
        };

        try {
            await onSave(data);
            onClose();
        } catch (error) {
            // 錯誤由父層 hook 處理
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Portal>
            <Modal visible={isVisible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>儲存打席紀錄</Text>
                    <TouchableOpacity onPress={onClose} style={{padding: 5}}>
                        <Icon name="x" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                </View>
                
                <Text style={{marginBottom: 10}}>當前球數: B {atBatRecords.length > 0 ? atBatRecords[0].runningBalls : 0}, S {atBatRecords.length > 0 ? atBatRecords[0].runningStrikes : 0}</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>主觀描述/備註</Text>
                    <TextInput
                        mode="outlined"
                        value={summaryNote}
                        onChangeText={setSummaryNote}
                        placeholder="Ex: 三振出局 (外角低滑球揮棒落空)"
                        multiline
                        numberOfLines={4}
                        style={{ minHeight: 100 }}
                    />
                </View>

                <View style={styles.footerButtons}>
                    <Button mode="outlined" onPress={onClose} style={{ marginRight: 10 }}>取消</Button>
                    <Button 
                        mode="contained" 
                        onPress={handleSave} 
                        loading={isSaving} 
                        disabled={isSaving}
                    >
                        儲存並清空
                    </Button>
                </View>
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
    footerButtons: {
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        marginTop: 15
    },
});

export default EndAtBatModal;