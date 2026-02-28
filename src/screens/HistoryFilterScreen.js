// src/screens/HistoryFilterScreen.js
// 歷史紀錄篩選彈出視窗 (Native Stack Screen)

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import { usePreferences } from '../context/PreferencesContext';
import { useHistoryFilterUI } from '../hooks/ui/useHistoryFilterUI';

const HistoryFilterScreen = ({ navigation, route }) => {
    const theme = useTheme();
    const { customSummaryFields } = usePreferences();

    const { onApply, onClear, initialFilters } = route.params || {};

    const {
        localFilters,
        setLocalFilters,
        handleCustomFieldChange,
        handleApply,
        handleClear,
        datePickerConfig,
        openDatePicker,
        onDateChange,
        confirmIOSDate
    } = useHistoryFilterUI(initialFilters, onApply, onClear, navigation);

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
                        <Text style={[styles.title, { color: theme.colors.primary }]}>篩選器</Text>

                        {/* 標題與結果 */}
                        <TextInput
                            label="標題"
                            mode="outlined"
                            value={localFilters.title}
                            onChangeText={(txt) => setLocalFilters({ ...localFilters, title: txt })}
                            style={styles.inputItem}
                        />

                        {/* 日期區間 */}
                        <View style={styles.row}>
                            <TouchableOpacity testID="btn-開始日期" style={{ flex: 1, marginRight: 4 }} onPress={() => openDatePicker('start')}>
                                <View pointerEvents="none">
                                    <TextInput
                                        label="開始日期"
                                        mode="outlined"
                                        value={localFilters.startDate}
                                        style={styles.inputItem}
                                        placeholder="未選擇"
                                        right={<TextInput.Icon icon="calendar" />}
                                    />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity testID="btn-結束日期" style={{ flex: 1, marginLeft: 4 }} onPress={() => openDatePicker('end')}>
                                <View pointerEvents="none">
                                    <TextInput
                                        label="結束日期"
                                        mode="outlined"
                                        value={localFilters.endDate}
                                        style={styles.inputItem}
                                        placeholder="未選擇"
                                        right={<TextInput.Icon icon="calendar" />}
                                    />
                                </View>
                            </TouchableOpacity>
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
                            label="備註"
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
                                        label={`${field.label}`}
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

            {/* Android 的 DatePicker (非 Modal) */}
            {Platform.OS === 'android' && datePickerConfig.show && (
                <DateTimePicker
                    value={datePickerConfig.date}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                />
            )}

            {/* iOS 的 DatePicker (Modal 呈現) */}
            {Platform.OS === 'ios' && (
                <Modal
                    isVisible={datePickerConfig.show}
                    onBackdropPress={confirmIOSDate}
                    style={styles.iosModal}
                >
                    <View style={[styles.iosPickerContainer, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.iosPickerHeader}>
                            <TouchableOpacity onPress={confirmIOSDate}>
                                <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' }}>完成</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={datePickerConfig.date}
                            mode="date"
                            display="spinner"
                            onChange={onDateChange}
                            textColor={theme.colors.onSurface}
                        />
                    </View>
                </Modal>
            )}
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
    },
    iosModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    iosPickerContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 40,
        paddingTop: 10,
    },
    iosPickerHeader: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    }
});

export default HistoryFilterScreen;
