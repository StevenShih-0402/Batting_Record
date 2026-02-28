// src/screens/PitchEditScreen.js
// 編輯與刪除逐球紀錄的畫面，支援自訂打席備註欄位的編輯

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Text, Button, useTheme, IconButton, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColorByResult } from '../constants/Colors';
import { usePreferences } from '../context/PreferencesContext';

// 匯入表單元件
import SelectionDropdown from '../components/forms/SelectionDropdown';
import SpeedInput from '../components/forms/SpeedInput';
import NoteInput from '../components/forms/NoteInput';

// 匯入 hook
import { usePitchEdit } from '../hooks/ui/usePitchEdit';

const PitchEditScreen = ({ navigation, route }) => {
    const theme = useTheme();
    const { pitchTypes, customPitchFields } = usePreferences();

    const { record, onSave, onDelete } = route.params || {};

    const { formState, setSpeed, setPitchType, setNote, handleSave, customPitchValues, setCustomValue, isSaving } =
        usePitchEdit(record, true, async (savedRecord) => {
            if (onSave) await onSave(savedRecord);
            navigation.goBack();
        });

    if (!record) return null;

    const dotColor = getColorByResult(record.result, record.atBatEndOutcome);

    /**
     * 渲染單一自訂打席備註欄位（顯示現有值供編輯）。
     */
    const renderCustomField = (field) => {
        const value = customPitchValues[field.id] || '';

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
            </View>
        );
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
                        contentContainerStyle={{ padding: 16, paddingTop: 32, paddingBottom: 36 }}
                    >
                        {/* 標題與關閉按鈕 */}
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <View style={[styles.colorIndicator, { backgroundColor: dotColor }]} />
                                <Text variant="headlineSmall" style={styles.title}>編輯投球紀錄</Text>
                            </View>
                            <IconButton icon="close" size={24} onPress={() => navigation.goBack()} />
                        </View>

                        {/* 1. 頂部資訊卡 */}
                        <View style={styles.infoSection}>
                            <Text variant="labelLarge" style={{ color: dotColor }}>當前結果：{record.result}</Text>
                            <Text variant="bodySmall">位置：{record.cellNumber > 0 ? `${record.cellNumber} 號位` : '九宮格外'}</Text>
                        </View>

                        {/* 2. 球種 */}
                        <SelectionDropdown
                            label="球種"
                            selectedValue={formState.pitchType}
                            options={pitchTypes}
                            onSelect={setPitchType}
                        />

                        {/* 3. 球速 */}
                        <SpeedInput
                            value={formState.speed}
                            onChangeText={setSpeed}
                        />

                        {/* 4. 備註 */}
                        <NoteInput
                            value={formState.note}
                            onChangeText={setNote}
                        />

                        {/* 5. 自訂打席備註欄位 */}
                        {customPitchFields.map((field) => renderCustomField(field))}

                        {/* 按鈕區域 */}
                        <View style={styles.footer}>
                            <Button
                                mode="text"
                                onPress={() => {
                                    if (onDelete) onDelete(record.id);
                                    navigation.goBack();
                                }}
                                textColor={theme.colors.error}
                                icon="trash-can-outline"
                            >
                                刪除
                            </Button>

                            <Button
                                mode="contained"
                                onPress={handleSave}
                                loading={isSaving}
                                disabled={isSaving}
                                icon="pen"
                            >
                                更新
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 8,
        paddingVertical: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    title: {
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    infoSection: {
        marginBottom: 20,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    customFieldWrapper: {
        marginTop: 12,
    },
});

export default PitchEditScreen;