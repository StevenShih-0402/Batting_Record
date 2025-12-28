// src/components/modals/EndAtBatModal.js
// 儲存打席紀錄的彈窗
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button, IconButton, Modal, Portal } from 'react-native-paper';

// 匯入表單元件
import NoteInput from '../forms/NoteInput';

// 匯入 hook
import { useEndAtBat } from '../../hooks/ui/useEndAtBat';

const EndAtBatModal = ({ isVisible, onClose, onSave, atBatRecords }) => {
    const theme = useTheme();
    
    // 將邏輯委託給 Hook
    const { summaryNote, setSummaryNote, isSaving, handleSave } = 
        useEndAtBat(isVisible, atBatRecords, onSave, onClose);

    const strikes = atBatRecords.length > 0 ? atBatRecords[0].runningStrikes : 0;
    const balls = atBatRecords.length > 0 ? atBatRecords[0].runningBalls : 0;

    return (
        <Portal>
            <Modal visible={isVisible} onDismiss={onClose} contentContainerStyle={[styles.modalContainer, {backgroundColor: theme.colors.surface}]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>儲存打席紀錄</Text>
                    <IconButton icon="close" onPress={onClose} />
                </View>
                
                <Text variant="bodyLarge" style={{marginBottom: 15}}>
                    當前球數: <Text style={{fontWeight: 'bold'}}>{strikes} 好 {balls} 壞</Text>
                </Text>
                
                <NoteInput 
                    label="總結備註"
                    value={summaryNote}
                    onChangeText={setSummaryNote}
                    placeholder="例如: 一壘軟弱滾地球"
                    numberOfLines={4}
                    style={{ minHeight: 150 }}
                />

                <Button 
                    mode="contained" 
                    onPress={handleSave} 
                    loading={isSaving} 
                    disabled={isSaving}
                    icon="content-save-check"
                >
                    儲存並清空
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
});

export default EndAtBatModal;