// src/components/common/Dot.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { DOT_SIZE } from '../../constants/GameConstants';

const Dot = ({ x, y, color, pitchIndex }) => {
    const theme = useTheme();
    
    // 動態樣式
    const dynamicStyle = {
        // 使用 left/top 配合父層的 absolute 畫布
        left: x - DOT_SIZE / 2, 
        top: y - DOT_SIZE / 2, 
        width: DOT_SIZE, 
        height: DOT_SIZE, 
        borderRadius: DOT_SIZE / 2, 
        backgroundColor: color, 
        borderColor: theme.colors.onSurfaceVariant,
    };
    
    const textStyle = {
        color: '#000000ff', // 通常球點文字用純白在深色或亮色球點上較清晰
    };

    return (
        <View style={[styles.dot, dynamicStyle]}> 
            <Text style={[styles.text, textStyle]}>
                {pitchIndex}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    dot: {
        position: 'absolute', // 關鍵：確保它在畫布容器內自由定位
        zIndex: 10,
        borderWidth: 2,
        justifyContent: 'center', 
        alignItems: 'center',
        // 增加陰影防止球點在淺色背景消失
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    text: {
        fontSize: 12, // 稍微調小一點點確保兩位數球數不溢出
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Dot;