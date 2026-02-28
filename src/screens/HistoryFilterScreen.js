// src/screens/HistoryFilterScreen.js
// 歷史紀錄篩選彈出視窗 (Native Stack Screen)

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreferences } from '../context/PreferencesContext';

const HistoryFilterScreen = ({ navigation, route }) => {
    const theme = useTheme();
    const { customSummaryFields } = usePreferences();

    const { onApply, onClear, initialFilters } = route.params || {};

    const [localFilters, setLocalFilters] = useState({
        title: '',
        startDate: '',
        endDate: '',
        minPitches: '',
        maxPitches: '',
        note: '',
        customFields: {}
    });

    // 初始化篩選器狀態
    useEffect(() => {
        setLocalFilters(initialFilters || {
            title: '', startDate: '', endDate: '',
            minPitches: '', maxPitches: '', note: '', customFields: {}
        });
    }, [initialFilters]);

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
        if (onApply) onApply(localFilters);
        navigation.goBack();
    };

    const handleClear = () => {
        if (onClear) onClear();
        navigation.goBack();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ padding: 20, paddingTop: 32, paddingBottom: 36 }}
                    >
                        <Text style={[styles.title, { color: theme.colors.primary }]}>篩選紀錄</Text>

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
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
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

export default HistoryFilterScreen;
