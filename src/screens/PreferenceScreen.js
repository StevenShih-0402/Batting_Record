// src/screens/PreferenceScreen.js
// 偏好設定頁面：自訂主題色、球種、自訂打席備註欄位與自訂打席彙整欄位
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, useTheme, Chip, Divider, IconButton, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { usePreferences } from '../context/PreferencesContext';
import { useFieldEditor } from '../hooks/ui/useFieldEditor';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../context/AlertContext';
import { v4 as uuidv4 } from 'uuid';

// 預設提供的主題色選項
const THEME_COLORS = [
    '#E81416', // 紅色 (Red)
    '#EF2B7C', // 粉紅色 (Fuchsia)
    '#FEF250', // 黃色 (Lemon Yellow)
    '#339C5E', // 綠色 (Kelly Green)
    '#00E5FF', // 預設青色 (Cyan)
    '#B026FF', // 紫色 (Neon Purple)
    '#F2D3BC', // 膚色 (Skin)
    '#FFCED5', // 淺粉紅色 (Light Pink)
    '#F8F1AE', // 淺黃色 (Pastel Yellow)
    '#75D09A', // 淺綠色 (Mint Green)
    '#ADD8E6', // 淺藍色 (Light Blue)
    '#DCD0FF', // 淺紫色 (Lilac)
];

const PreferenceScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { showSuccess, showError } = useAlert();
    const {
        pitchTypes, primaryColor,
        customPitchFields, customSummaryFields,
        savePreferences, isLoading
    } = usePreferences();

    // 本地狀態管理，直到按下儲存
    const [localPitchTypes, setLocalPitchTypes] = useState([...pitchTypes]);
    const [localColor, setLocalColor] = useState(primaryColor);
    const [localPitchFields, setLocalPitchFields] = useState([...customPitchFields]);
    const [localSummaryFields, setLocalSummaryFields] = useState([...customSummaryFields]);

    const [newPitchType, setNewPitchType] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 自訂打席備註欄位編輯器
    const pitchEditor = useFieldEditor();
    // 自訂打席彙整欄位編輯器
    const summaryEditor = useFieldEditor();

    // 處理球種更新
    const addPitchType = () => {
        if (!newPitchType.trim()) return;
        if (localPitchTypes.includes(newPitchType.trim())) {
            showError('重複項目', '此球種已存在');
            return;
        }
        setLocalPitchTypes([...localPitchTypes, newPitchType.trim()]);
        setNewPitchType('');
    };

    const removePitchType = (index) => {
        const newList = [...localPitchTypes];
        newList.splice(index, 1);
        setLocalPitchTypes(newList);
    };

    /**
     * 將編輯器的欄位定義加入指定的欄位清單。
     */
    const addCustomField = (editor, setList) => {
        if (!editor.label.trim()) {
            showError('欄位名稱不得為空', '請輸入欄位名稱');
            return;
        }
        if (editor.type === 'dropdown' && editor.options.length === 0) {
            showError('請新增選項', '下拉選單型欄位至少需要一個選項');
            return;
        }
        const newField = {
            id: uuidv4(),
            label: editor.label.trim(),
            type: editor.type,
            options: editor.type === 'dropdown' ? [...editor.options] : [],
        };
        setList((prev) => [...prev, newField]);
        editor.reset();
    };

    const removeCustomField = (setList, id) => {
        setList((prev) => prev.filter((f) => f.id !== id));
    };

    // 儲存所有變更
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await savePreferences(
                localPitchTypes,
                localColor,
                localPitchFields,
                localSummaryFields
            );
            if (success) {
                showSuccess('儲存成功', '偏好設定已更新');
                navigation.goBack();
            } else {
                showError('儲存失敗', '請稍後再試');
            }
        } catch (error) {
            console.error(error);
            showError('發生錯誤', error.message);
        } finally {
            setIsSaving(false);
        }
    };

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
                            自訂打席備註欄位
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                            出現在每球的輸入 Modal，顯示於打席詳情的「球種(位置)」下方
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
                            出現在結束打席 Modal，顯示於歷史紀錄的「日期｜球數」下方
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
