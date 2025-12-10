// src/components/common/PitchGrid.js
import React, { forwardRef } from 'react';
import { View, Dimensions } from 'react-native';
import { GRID_CELL_SIZE } from '../../constants/GameConstants';
import { SCREEN_WIDTH } from '../../utils/PitchUtils';

const PitchGrid = forwardRef(({ onLayout, theme }, ref) => {
    const gridStyle = {
        width: SCREEN_WIDTH * 0.7, 
        height: SCREEN_WIDTH * 0.7 * (4/3), 
        borderWidth: 1,
        borderColor: 'white',
    };
    
    const cellStyles = {
        flex: 1, 
        borderWidth: 0.5, 
        borderColor: 'rgba(255, 255, 255, 0.5)',
    };

    return (
        <View 
            ref={ref} 
            style={gridStyle} 
            onLayout={onLayout}
            pointerEvents="none" 
        >
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