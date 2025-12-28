// src/components/forms/NoteInput.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

const NoteInput = ({ 
    label = "備註", 
    value, 
    onChangeText, 
    placeholder = "紀錄細節...", 
    numberOfLines = 3, 
    style, 
    disabled = false 
}) => {
    const theme = useTheme();

    return (
        <TextInput
            label={label}
            outlineColor={ theme.colors.onSurfaceVariant }         // 未聚焦時的顏色
            activeOutlineColor={ theme.colors.primary }            // 聚焦時的顏色
            mode="outlined"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline
            numberOfLines={numberOfLines}
            style={[styles.defaultStyle, style]} // 合併預設樣式與傳入的自訂樣式
            disabled={disabled}
        />
    );
};

const styles = StyleSheet.create({
    defaultStyle: {
        minHeight: 120,
        marginBottom: 16
    },
});

export default NoteInput;