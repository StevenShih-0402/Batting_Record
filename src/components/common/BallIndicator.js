// src/components/common/BallIndicator.js
// 圓形燈號組件
import React from 'react';
import { View, StyleSheet } from 'react-native';

const BallIndicator = ({ count, max, activeColor, inactiveColor = '#333' }) => {
    return (
        <View style={styles.container}>
            {[...Array(max)].map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.indicator,
                        { 
                            // 這裡處理動態變色邏輯
                            backgroundColor: i < count ? activeColor : inactiveColor 
                        }
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        // 如果你的 React Native 版本較舊不支援 gap，可以使用 marginRight
        // gap: 4, 
        marginRight: 12,
        alignItems: 'center',
    },
    indicator: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 2, // 代替 gap 的方案
    }
});

export default BallIndicator;