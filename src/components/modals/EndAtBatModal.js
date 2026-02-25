// src/components/modals/EndAtBatModal.js
// 儲存打席紀錄的彈窗，支援動態自訂打席彙整欄位
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, TextInput, Button, IconButton, Modal, Portal, Chip } from 'react-native-paper';

// 匯入表單元件
import NoteInput from '../forms/NoteInput';
import SelectionDropdown from '../forms/SelectionDropdown';

// 匯入 hook
import { useEndAtBat } from '../../hooks/ui/useEndAtBat';
import { getFieldQueue, pushToFieldQueue } from '../../hooks/ui/useCustomFieldQueue';

const EndAtBatModal = ({ isVisible, onClose, onSave, atBatRecords = [] }) => {
    const theme = useTheme();

    const {
        atBatTitle, setAtBatTitle,
        summaryNote, setSummaryNote,
        isSaving, handleSave,
        customSummaryFields,
        summaryCustomValues,
        setSummaryCustomValue,
    } = useEndAtBat(isVisible, atBatRecords, onSave, onClose);

    // 每個 text 型彙整欄位的 Queue 快速選項
    const [fieldQueues, setFieldQueues] = useState({});

    // 當 Modal 開啟或欄位定義變更時，載入各欄位的 Queue
    useEffect(() => {
        if (!isVisible) return;
        const loadQueues = async () => {
            const queues = {};
            for (const field of customSummaryFields) {
                if (field.type === 'text') {
                    queues[field.id] = await getFieldQueue(field.id);
                }
            }
            setFieldQueues(queues);
        };
        loadQueues();
    }, [isVisible, customSummaryFields]);

    const strikes = atBatRecords.length > 0 ? atBatRecords[0].runningStrikes : 0;
    const balls = atBatRecords.length > 0 ? atBatRecords[0].runningBalls : 0;

    // 儲存時同步 Queue
    const handleSaveWithQueue = async () => {
        for (const field of customSummaryFields) {
            if (field.type === 'text' && summaryCustomValues[field.id]) {
                await pushToFieldQueue(field.id, summaryCustomValues[field.id]);
            }
        }
        await handleSave();
    };

    /**
     * 渲染單一自訂打席彙整欄位。
     */
    const renderCustomField = (field) => {
        const value = summaryCustomValues[field.id] || '';

        if (field.type === 'dropdown') {
            return (
                <View key={field.id} style={styles.customFieldWrapper}>
                    <SelectionDropdown
                        label={field.label}
                        selectedValue={value}
                        options={field.options || []}
                        onSelect={(v) => setSummaryCustomValue(field.id, v)}
                    />
                </View>
            );
        }

        const queue = fieldQueues[field.id] || [];
        return (
            <View key={field.id} style={styles.customFieldWrapper}>
                <TextInput
                    mode="outlined"
                    label={field.label}
                    value={value}
                    onChangeText={(v) => setSummaryCustomValue(field.id, v)}
                    style={{ backgroundColor: theme.colors.surface }}
                    dense
                />
                {queue.length > 0 && (
                    <View style={styles.queueRow}>
                        {queue.map((item) => (
                            <Chip
                                key={item}
                                compact
                                onPress={() => setSummaryCustomValue(field.id, item)}
                                style={[styles.queueChip, { backgroundColor: theme.colors.surfaceVariant }]}
                                textStyle={{ fontSize: 11 }}
                            >
                                {item}
                            </Chip>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Portal>
            <Modal
                visible={isVisible}
                onDismiss={onClose}
                contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
            >
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>儲存打席紀錄</Text>
                    <IconButton icon="close" onPress={onClose} />
                </View>

                <Text variant="bodyLarge" style={{ marginBottom: 15 }}>
                    當前球數: <Text style={{ fontWeight: 'bold' }}>{strikes} 好 {balls} 壞</Text>
                </Text>

                {/* 標題輸入框 */}
                <TextInput
                    label="標題"
                    placeholder="這是誰的打席?"
                    value={atBatTitle}
                    onChangeText={setAtBatTitle}
                    mode="outlined"
                    style={{ marginTop: 15, marginBottom: 10 }}
                />

                <NoteInput
                    label="總結備註"
                    value={summaryNote}
                    onChangeText={setSummaryNote}
                    placeholder="例如: 一壘軟弱滾地球"
                    numberOfLines={4}
                    style={{ minHeight: 150 }}
                />

                {/* 自訂打席彙整欄位 */}
                {customSummaryFields.map((field) => renderCustomField(field))}

                <Button
                    mode="contained"
                    onPress={handleSaveWithQueue}
                    loading={isSaving}
                    disabled={isSaving}
                    icon="content-save-check"
                    style={{ marginTop: 16 }}
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
    customFieldWrapper: {
        marginTop: 12,
    },
    queueRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    queueChip: {
        marginBottom: 2,
    },
});

export default EndAtBatModal;