// src/screens/PreferenceScreen.js
// 偏好設定頁面：自訂主題色、球種與結果
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, useTheme, Chip, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { usePreferences } from '../context/PreferencesContext';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../context/AlertContext';

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
        pitchTypes, pitchResults, primaryColor,
        savePreferences, isLoading
    } = usePreferences();

    // 本地狀態管理，直到按下儲存
    const [localPitchTypes, setLocalPitchTypes] = useState([...pitchTypes]);
    const [localPitchResults, setLocalPitchResults] = useState([...pitchResults]);
    const [localColor, setLocalColor] = useState(primaryColor);

    const [newPitchType, setNewPitchType] = useState('');
    const [newPitchResult, setNewPitchResult] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 處理球種更新
    const addPitchType = () => {
        if (!newPitchType.trim()) return;
        if (localPitchTypes.includes(newPitchType.trim())) {
            showError("重複項目", "此球種已存在");
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

    // 處理結果更新
    const addPitchResult = () => {
        if (!newPitchResult.trim()) return;
        if (localPitchResults.includes(newPitchResult.trim())) {
            showError("重複項目", "此結果已存在");
            return;
        }
        setLocalPitchResults([...localPitchResults, newPitchResult.trim()]);
        setNewPitchResult('');
    };

    const removePitchResult = (index) => {
        const newList = [...localPitchResults];
        newList.splice(index, 1);
        setLocalPitchResults(newList);
    };

    // 儲存所有變更
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await savePreferences(localPitchTypes, localPitchResults, localColor);
            if (success) {
                showSuccess("儲存成功", "偏好設定已更新");
                navigation.goBack();
            } else {
                showError("儲存失敗", "請稍後再試");
            }
        } catch (error) {
            console.error(error);
            showError("發生錯誤", error.message);
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

                    {/* 3. 自訂結果 */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 10 }}>
                            自訂投球結果
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                mode="outlined"
                                label="新增結果 (例如: 觸身球)"
                                value={newPitchResult}
                                onChangeText={setNewPitchResult}
                                style={{ flex: 1, backgroundColor: theme.colors.surface }}
                                dense
                            />
                            <IconButton
                                icon="plus"
                                mode="contained"
                                containerColor={theme.colors.primary}
                                iconColor={theme.colors.onPrimary}
                                onPress={addPitchResult}
                            />
                        </View>
                        <View style={styles.chipRow}>
                            {localPitchResults.map((result, index) => (
                                <Chip
                                    key={index}
                                    onClose={() => removePitchResult(index)}
                                    style={styles.chip}
                                >
                                    {result}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={isSaving}
                            disabled={isSaving}
                            style={{ backgroundColor: localColor }} // 使用預覽顏色
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
