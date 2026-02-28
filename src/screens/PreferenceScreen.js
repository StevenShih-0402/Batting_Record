// src/screens/PreferenceScreen.js
// 偏好設定頁面：自訂主題色、球種、自訂打席備註欄位與自訂打席彙整欄位
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, useTheme, Chip, Divider, IconButton, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useFieldEditor } from '../hooks/ui/useFieldEditor';
import { useNavigation } from '@react-navigation/native';
import { usePreferenceUI } from '../hooks/ui/usePreferenceUI';
import { THEME_COLORS } from '../constants/Colors';

const PreferenceScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();

    const {
        isLoading,
        isSaving,
        localColor,
        setLocalColor,
        localPitchTypes,
        newPitchType,
        setNewPitchType,
        addPitchType,
        removePitchType,
        localPitchFields,
        setLocalPitchFields,
        localSummaryFields,
        setLocalSummaryFields,
        addCustomField,
        removeCustomField,
        handleSave,
    } = usePreferenceUI(navigation);

    // 自訂打席備註欄位編輯器
    const pitchEditor = useFieldEditor();
    // 自訂打席彙整欄位編輯器
    const summaryEditor = useFieldEditor();

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    /**
     * 渲染自訂欄位的新增表單（共用於備註欄位與彙整欄位）。
     */
    const renderFieldEditor = (editor, list, setList) => (
        <View>
            {/* 欄位名稱 */}
            <View style={styles.inputRow}>
                <TextInput
                    mode="outlined"
                    label="欄位名稱"
                    value={editor.label}
                    onChangeText={editor.setLabel}
                    style={{ flex: 1, backgroundColor: theme.colors.surface }}
                    dense
                />
            </View>

            {/* 欄位類型 */}
            <SegmentedButtons
                value={editor.type}
                onValueChange={editor.setType}
                buttons={[
                    { value: 'text', label: '文字輸入' },
                    { value: 'dropdown', label: '下拉選單' },
                ]}
                style={{ marginBottom: 10 }}
            />

            {/* 下拉選項管理 */}
            {editor.type === 'dropdown' && (
                <View>
                    <View style={styles.inputRow}>
                        <TextInput
                            mode="outlined"
                            label="新增選項"
                            value={editor.newOption}
                            onChangeText={editor.setNewOption}
                            style={{ flex: 1, backgroundColor: theme.colors.surface }}
                            dense
                        />
                        <IconButton
                            icon="plus"
                            mode="contained"
                            containerColor={theme.colors.secondary}
                            iconColor={theme.colors.onSecondary}
                            onPress={editor.addOption}
                        />
                    </View>
                    <View style={styles.chipRow}>
                        {editor.options.map((opt, idx) => (
                            <Chip
                                key={idx}
                                onClose={() => editor.removeOption(idx)}
                                style={styles.chip}
                            >
                                {opt}
                            </Chip>
                        ))}
                    </View>
                </View>
            )}

            {/* 新增按鈕 */}
            <Button
                mode="outlined"
                icon="plus"
                onPress={() => addCustomField(editor, setList)}
                style={{ marginBottom: 14 }}
            >
                新增此欄位
            </Button>

            {/* 已新增的欄位列表 */}
            <View style={styles.chipRow}>
                {list.map((field) => (
                    <Chip
                        key={field.id}
                        onClose={() => removeCustomField(setList, field.id)}
                        style={styles.chip}
                        icon={field.type === 'dropdown' ? 'chevron-down' : 'text'}
                    >
                        {field.label}
                    </Chip>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* 1. 主題色選擇 */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 10 }}>
                            主題顏色
                        </Text>
                        <View style={styles.colorRow}>
                            {THEME_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        localColor === color && { borderWidth: 3, borderColor: '#FFF' }
                                    ]}
                                    onPress={() => setLocalColor(color)}
                                />
                            ))}
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* 2. 自訂球種 */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 10 }}>
                            自訂球種
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                mode="outlined"
                                label="新增球種 (例如: 指叉球)"
                                value={newPitchType}
                                onChangeText={setNewPitchType}
                                style={{ flex: 1, backgroundColor: theme.colors.surface }}
                                dense
                            />
                            <IconButton
                                icon="plus"
                                mode="contained"
                                containerColor={theme.colors.primary}
                                iconColor={theme.colors.onPrimary}
                                onPress={addPitchType}
                            />
                        </View>
                        <View style={styles.chipRow}>
                            {localPitchTypes.map((type, index) => (
                                <Chip
                                    key={index}
                                    onClose={() => removePitchType(index)}
                                    style={styles.chip}
                                >
                                    {type}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* 3. 自訂打席備註欄位 */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 4 }}>
                            自訂打席記錄欄位
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            {/* 出現在每球的輸入 Modal，顯示於打席詳情的「球種(位置)」下方 */}
                            可在九宮格紀錄好壞球時，加上想要額外紀錄的欄位，例如：擊球仰角、飛行距離等。
                        </Text>
                        {renderFieldEditor(pitchEditor, localPitchFields, setLocalPitchFields)}
                    </View>

                    <Divider style={styles.divider} />

                    {/* 4. 自訂打席彙整欄位 */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 4 }}>
                            自訂打席彙整欄位
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            打席結束彙整資料時，除了預設的標題與文字備註，也可以自訂欄位，例如：選手姓名、擊球方向等。
                        </Text>
                        {renderFieldEditor(summaryEditor, localSummaryFields, setLocalSummaryFields)}
                    </View>

                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={isSaving}
                            disabled={isSaving}
                            style={{ backgroundColor: localColor }}
                        >
                            儲存變更
                        </Button>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    divider: {
        marginVertical: 15,
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    chip: {
        marginBottom: 4,
    },
    footer: {
        marginTop: 20,
        marginBottom: 50,
    }
});

export default PreferenceScreen;
