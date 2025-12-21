// src/components/common/PitchGrid.js
// 九宮格
import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper'; // 導入 useTheme
import { GRID_CELL_SIZE } from '../../constants/GameConstants';
import { Layout } from '../../constants/Layout';

/*
input:
ref: 通往九宮格 View 實例的傳送門，可以想像成 Mapping 用的橋樑。
onLayout: 主動提供九宮格 View 準確位置和尺寸的事件 (event)。
*/

// 在 StrikeZoneScreen 的 PitchGrid View 被渲染時，forwardRef 將 gridRef 指向 PitchGrid 內部的 <View>。
const PitchGrid = forwardRef(({ onLayout }, ref) => {
    // 獲取主題
    const theme = useTheme();
    
    // 九宮格的外部框線
    const gridStyle = {
        width: Layout.WINDOW.WIDTH * 0.7, 
        height: Layout.WINDOW.WIDTH * 0.7 * (4/3), 
        borderWidth: 2,
        borderColor: theme.colors.outline,           // 使用主題的輪廓色 (Outline) 作為邊框
    };
    
    // 九宮格的內部格線
    const cellStyles = {
        flex: 1, 
        borderWidth: 0.5, 
        borderColor: theme.colors.onSurfaceVariant || 'rgba(255, 255, 255, 0.5)',       // 使用主題的次要顏色或帶透明度的顏色
    };

    return (
        <View 
            ref={ref}               // 允許父元件 (screen) 訪問這個 View，用以取得精準座標
            style={gridStyle}       
            onLayout={onLayout}     // 在 View 完成佈局時呼叫，父元件用來獲取 View 的尺寸和座標。
            pointerEvents="none"    // 非常重要！這個屬性確保這個網格本身不會阻擋觸摸事件。觸摸事件會穿透網格，直接傳遞給下面的層次（通常是負責點擊判斷的父元件）。
        >

            {/* 創造 3 x 3 的表格 */}
            {Array.from({ length: GRID_CELL_SIZE }).map((_, rowIndex) => (
                <View key={rowIndex} style={{ flex: 1, flexDirection: 'row' }}>
                    {Array.from({ length: GRID_CELL_SIZE }).map((__, colIndex) => (
                        <View key={`${rowIndex}-${colIndex}`} style={cellStyles} />
                    ))}
                </View>
            ))}
        </View>
    );
});

export default PitchGrid;