// src/components/common/Dot.js
import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

const Dot = ({ x, y, size = 24, color, pitchIndex }) => {
    const theme = useTheme();
    return (
        <View 
            style={{ 
                position: 'absolute', 
                left: x - size / 2, 
                top: y - size / 2, 
                width: size, 
                height: size, 
                borderRadius: size / 2, 
                backgroundColor: color, 
                zIndex: 10,
                borderWidth: 2,
                borderColor: theme.colors.surface, 
                justifyContent: 'center', 
                alignItems: 'center',
            }} 
        >
            <Text style={{ 
                color: theme.colors.background, 
                fontSize: 10, 
                fontWeight: 'bold' 
            }}>
                {pitchIndex}
            </Text>
        </View>
    );
};

export default Dot;