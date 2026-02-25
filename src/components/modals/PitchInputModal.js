// src/components/modals/PitchInputModal.js
// 輸入逐球紀錄的彈窗，支援動態自訂打席備註欄位
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Modal, Portal, TextInput, Chip } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';

// 匯入表單元件
import SelectionDropdown from '../forms/SelectionDropdown';
import SpeedInput from '../forms/SpeedInput';
import NoteInput from '../forms/NoteInput';

// 匯入 hook
import { usePitchInput } from '../../hooks/ui/usePitchInput';
import { getFieldQueue, pushToFieldQueue } from '../../hooks/ui/useCustomFieldQueue';

const PitchInputModal = ({ isVisible, onClose, onSave, cellInfo, atBatStatus, isSaving }) => {
    const theme = useTheme();

    // 引入 Hook
    const {
        form, setPitchType, setResult, setSpeed, setNote,
        getResultOptions, handleSave, pitchTypes,
        customPitchFields, customValues, setCustomValue,
    } = usePitchInput(isVisible, cellInfo, atBatStatus, onSave);

    // 每個 text 型欄位的 Queue 快速選項
    const [fieldQueues, setFieldQueues] = useState({});

    // 當 Modal 開啟或欄位定義變更時，載入各欄位的 Queue
    useEffect(() => {
        if (!isVisible) return;
        const loadQueues = async () => {
            const queues = {};
            for (const field of customPitchFields) {
                if (field.type === 'text') {
                    queues[field.id] = await getFieldQueue(field.id);
                }
            }
            setFieldQueues(queues);
        };
        loadQueues();
    }, [isVisible, customPitchFields]);

    // 儲存時同步 Queue
    const handleSaveWithQueue = async () => {
        for (const field of customPitchFields) {
            if (field.type === 'text' && customValues[field.id]) {
                await pushToFieldQueue(field.id, customValues[field.id]);
            }
        }
        await handleSave();
    };

    /**
     * 渲染單一自訂打席備註欄位
     */
    const renderCustomField = (field) => {
        const value = customValues[field.id] || '';

        if (field.type === 'dropdown') {
            return (
                <View key={field.id} style={styles.customFieldWrapper}>
                    <SelectionDropdown
                        label={field.label}
                        selectedValue={value}
                        options={field.options || []}
                        onSelect={(v) => setCustomValue(field.id, v)}
                    />
                </View>
            );
        }

        // text 型：TextInput + Queue 快速選項
        const queue = fieldQueues[field.id] || [];
        return (
            <View key={field.id} style={styles.customFieldWrapper}>
                <TextInput
                    mode="outlined"
                    label={field.label}
                    value={value}
                    onChangeText={(v) => setCustomValue(field.id, v)}
                    style={{ backgroundColor: theme.colors.surface }}
                    dense
                />
                {queue.length > 0 && (
                    <View style={styles.queueRow}>
                        {queue.map((item) => (
                            <Chip
                                key={item}
                                compact
                                onPress={() => setCustomValue(field.id, item)}
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
                <ScrollView style={{ marginBottom: 20 }} showsVerticalScrollIndicator={false}>
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
                        options={pitchTypes}
                        onSelect={setPitchType}
                    />

                    {/* 結果 - 內嵌表單式 */}
                    <SelectionDropdown
                        label="結果"
                        icon='baseball-bat'
                        selectedValue={form.result}
                        options={getResultOptions()}
                        onSelect={setResult}
                        disabled={atBatStatus.lastResult === '打擊出去'}
                    />

                    {/* 球速 */}
                    <SpeedInput value={form.speed} onChangeText={setSpeed} />

                    {/* 一般備註 */}
                    <NoteInput value={form.note} onChangeText={setNote} />

                    {/* 自訂打席備註欄位 */}
                    {customPitchFields.map((field) => renderCustomField(field))}
                </ScrollView>

                {/* 按鈕放在 ScrollView 外，保持在底部固定位置 */}
                <Button
                    mode="contained"
                    onPress={handleSaveWithQueue}
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

export default PitchInputModal;