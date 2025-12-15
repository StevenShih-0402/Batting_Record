// src/components/common/Dot.js
// 球
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { DOT_SIZE } from '../../constants/GameConstants';

/* 
input: 
x: 球的 X 座標
y: 球的 Y 座標
color: 球的顏色
pitchIndex:第幾顆球
*/

const Dot = ({ x, y, color, pitchIndex }) => {
    const theme = useTheme();
    
    // 動態計算的樣式 (位置、大小、顏色) 保持在元件內部
    const dynamicStyle = {
        left: x - DOT_SIZE / 2,             // 為了找到球的中心點
        top: y - DOT_SIZE / 2, 
        width: DOT_SIZE, 
        height: DOT_SIZE, 
        borderRadius: DOT_SIZE / 2, 
        backgroundColor: color, 
        
        // 主題相關樣式
        borderColor: theme.colors.surface,
    };
    
    // 文字樣式也使用主題顏色
    const textStyle = {
        color: theme.colors.background,
    };

    return (
        // 組合靜態樣式 (styles.dot) 和動態樣式 (dynamicStyle)
        <View style={[styles.dot, dynamicStyle]}> 
            <Text style={[styles.text, textStyle]}>
                {pitchIndex}
            </Text>
        </View>
    );
};

export default Dot;

// ----------------------------------------------------
// 靜態樣式定義 (標準 Expo/RN 做法)
// ----------------------------------------------------
const styles = StyleSheet.create({
    dot: {
        // 這些屬性是靜態的，與 props 或 theme 無關
        position: 'absolute', 
        zIndex: 10,
        borderWidth: 2,
        justifyContent: 'center', 
        alignItems: 'center',
    },
    text: {
        // 文字的靜態屬性
        fontSize: 10, 
        fontWeight: 'bold',
    },
});