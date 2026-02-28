// src/screens/EndAtBatScreen.js
// 儲存打席紀錄的彈窗，支援動態自訂打席彙整欄位
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Text, useTheme, TextInput, Button, IconButton, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 匯入表單元件
import NoteInput from '../components/forms/NoteInput';
import SelectionDropdown from '../components/forms/SelectionDropdown';

// 匯入 hook
import { useEndAtBat } from '../hooks/ui/useEndAtBat';

const EndAtBatScreen = ({ navigation, route }) => {
    const theme = useTheme();

    const { onSave, atBatRecords = [] } = route.params || {};

    const {
        atBatTitle, setAtBatTitle,
        summaryNote, setSummaryNote,
        isSaving, handleSave,
        customSummaryFields,
        summaryCustomValues,
        setSummaryCustomValue,
        fieldQueues,
    } = useEndAtBat(true, atBatRecords, async (summary) => {
        if (onSave) await onSave(summary);
        navigation.goBack();
    }, () => navigation.goBack());

    const strikes = atBatRecords.length > 0 ? atBatRecords[0].runningStrikes : 0;
    const balls = atBatRecords.length > 0 ? atBatRecords[0].runningBalls : 0;

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
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>儲存打席紀錄</Text>
                            <IconButton icon="close" onPress={() => navigation.goBack()} />
                        </View>

                        <Text variant="bodyLarge" style={{ marginBottom: 15 }}>
                            當前球數: <Text style={{ fontWeight: 'bold' }}>{strikes} 好 {balls} 壞</Text>
                        </Text>

                        {/* 標題輸入框 */}
                        <TextInput
                            label="標題"
                            placeholder="例如：這是誰的打席?"
                            value={atBatTitle}
                            onChangeText={setAtBatTitle}
                            mode="outlined"
                            style={{ marginTop: 15, marginBottom: 10 }}
                        />

                        <NoteInput
                            label="總結備註"
                            value={summaryNote}
                            onChangeText={setSummaryNote}
                            placeholder="例如: 一壘軟弱滚地球"
                            numberOfLines={4}
                            style={{ minHeight: 150 }}
                        />

                        {/* 自訂打席彙整欄位 */}
                        {customSummaryFields.map((field) => renderCustomField(field))}

                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={isSaving}
                            disabled={isSaving}
                            icon="content-save-check"
                            style={{ marginTop: 16 }}
                        >
                            儲存並清空
                        </Button>
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

export default EndAtBatScreen;