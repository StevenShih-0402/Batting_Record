// src/components/forms/SpeedInput.js
// 表單的球速輸入框
import React from 'react';
import { TextInput, useTheme } from 'react-native-paper';

const SpeedInput = ({ value, onChangeText, style, disabled }) => {
    const theme = useTheme();
    
    return (
        <TextInput
            label="球速"
            outlineColor={ theme.colors.onSurfaceVariant }         // 未聚焦時的顏色
            activeOutlineColor={ theme.colors.primary }            // 聚焦時的顏色
            value={value}
            onChangeText={(text) => onChangeText(text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            mode="outlined"
            style={[style, { marginBottom: 16 }]}
            left={<TextInput.Icon icon="speedometer" />}
            right={<TextInput.Affix text="km/h" />}
            disabled={disabled}
        />
    );
};

export default SpeedInput;