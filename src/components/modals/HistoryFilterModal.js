// src/components/modals/HistoryFilterModal.js
// 歷史紀錄篩選彈出視窗

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Modal, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { usePreferences } from '../../context/PreferencesContext';

const HistoryFilterModal = ({ visible, onDismiss, onApply, onClear, initialFilters }) => {
    const theme = useTheme();
    const { customSummaryFields } = usePreferences();

    const [localFilters, setLocalFilters] = useState({
        title: '',
        startDate: '',
        endDate: '',
        minPitches: '',
        maxPitches: '',
        note: '',
        customFields: {}
    });

    // 當 modal 打開時，同步傳入的初始篩選器狀態
    useEffect(() => {
        if (visible) {
            setLocalFilters(initialFilters || {
                title: '', startDate: '', endDate: '',
                minPitches: '', maxPitches: '', note: '', customFields: {}
            });
        }
    }, [visible, initialFilters]);

    const handleCustomFieldChange = (id, value) => {
        setLocalFilters(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [id]: value
            }
        }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onDismiss();
    };

    const handleClear = () => {
        onClear();
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
            >
                <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>篩選紀錄</Text>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* 標題與結果 */}
                    <TextInput
                        label="標題或結果包含"
                        mode="outlined"
                        value={localFilters.title}
                        onChangeText={(txt) => setLocalFilters({ ...localFilters, title: txt })}
                        style={styles.inputItem}
                    />

                    {/* 日期區間 */}
                    <View style={styles.row}>
                        <TextInput
                            label="開始日期 (YYYY-MM-DD)"
                            mode="outlined"
                            value={localFilters.startDate}
                            onChangeText={(txt) => setLocalFilters({ ...localFilters, startDate: txt })}
                            style={[styles.inputItem, { flex: 1, marginRight: 4 }]}
                            keyboardType="numeric"
                            placeholder="例: 2026-01-01"
                        />
                        <TextInput
                            label="結束日期 (YYYY-MM-DD)"
                            mode="outlined"
                            value={localFilters.endDate}
                            onChangeText={(txt) => setLocalFilters({ ...localFilters, endDate: txt })}
                            style={[styles.inputItem, { flex: 1, marginLeft: 4 }]}
                            keyboardType="numeric"
                            placeholder="例: 2026-12-31"
                        />
                    </View>

                    {/* 球數區間 */}
                    <View style={styles.row}>
                        <TextInput
                            label="最少球數"
                            mode="outlined"
                            value={localFilters.minPitches}
                            onChangeText={(txt) => setLocalFilters({ ...localFilters, minPitches: txt })}
                            style={[styles.inputItem, { flex: 1, marginRight: 4 }]}
                            keyboardType="number-pad"
                        />
                        <TextInput
                            label="最多球數"
                            mode="outlined"
                            value={localFilters.maxPitches}
                            onChangeText={(txt) => setLocalFilters({ ...localFilters, maxPitches: txt })}
                            style={[styles.inputItem, { flex: 1, marginLeft: 4 }]}
                            keyboardType="number-pad"
                        />
                    </View>

                    {/* 備註 */}
                    <TextInput
                        label="備註包含"
                        mode="outlined"
                        value={localFilters.note}
                        onChangeText={(txt) => setLocalFilters({ ...localFilters, note: txt })}
                        style={styles.inputItem}
                    />

                    {/* 動態自訂欄位 */}
                    {customSummaryFields && customSummaryFields.length > 0 && (
                        <View style={styles.customFieldsContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                                自訂欄位
                            </Text>
                            {customSummaryFields.map(field => (
                                <TextInput
                                    key={field.id}
                                    label={`${field.label}包含`}
                                    mode="outlined"
                                    value={localFilters.customFields?.[field.id] || ''}
                                    onChangeText={(val) => handleCustomFieldChange(field.id, val)}
                                    style={styles.inputItem}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>

                <View style={styles.buttonRow}>
                    <Button
                        mode="outlined"
                        onPress={handleClear}
                        style={styles.actionButton}
                        textColor={theme.colors.error}
                    >
                        清除
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleApply}
                        style={styles.actionButton}
                    >
                        套用
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        borderRadius: 8,
        padding: 20,
        maxHeight: '80%' // 避免超出螢幕
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    scrollContent: {
        paddingBottom: 10
    },
    inputItem: {
        marginBottom: 12,
        backgroundColor: 'transparent'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    customFieldsContainer: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16
    },
    actionButton: {
        marginLeft: 12,
        minWidth: 80
    }
});

export default HistoryFilterModal;
