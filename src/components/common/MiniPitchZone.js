// src/components/common/MiniPitchZone.js
// 小型九宮格組件
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { getColorByResult } from '../../constants/Colors';

const MINI_ZONE_WIDTH = 200;
const MINI_ZONE_HEIGHT = 250;
const BALL_SIZE = 24;

const MiniPitchZone = ({ pitches }) => {
    const theme = useTheme();

    return (
        <View style={styles.zoneWrapper}>
            <View style={[
                styles.miniZone,
                {
                    width: MINI_ZONE_WIDTH,
                    height: MINI_ZONE_HEIGHT,
                    borderColor: theme.colors.outline
                }
            ]}>
                {/* 1. 先畫格線 (背景層) */}
                <View style={[styles.gridLineH, { top: MINI_ZONE_HEIGHT * 0.33, backgroundColor: theme.colors.onSurfaceVariant }]} />
                <View style={[styles.gridLineH, { top: MINI_ZONE_HEIGHT * 0.66, backgroundColor: theme.colors.onSurfaceVariant }]} />
                <View style={[styles.gridLineV, { left: MINI_ZONE_WIDTH * 0.33, backgroundColor: theme.colors.onSurfaceVariant }]} />
                <View style={[styles.gridLineV, { left: MINI_ZONE_WIDTH * 0.66, backgroundColor: theme.colors.onSurfaceVariant }]} />

                {/* 2. 再畫球 (前景層) */}
                {pitches.map((pitch, index) => {
                    // 確保 gridX/Y 有值，如果是舊資料沒有 gridX，可能需要防呆 
                    // (假設後端都有存)
                    const x = (pitch.gridX || 0.5) * MINI_ZONE_WIDTH;
                    const y = (pitch.gridY || 0.5) * MINI_ZONE_HEIGHT;
                    const color = getColorByResult(pitch.result);
                    const pitchNumber = pitches.length - index;

                    return (
                        <View
                            key={index}
                            style={[
                                styles.ball,
                                {
                                    left: x - (BALL_SIZE / 2),
                                    top: y - (BALL_SIZE / 2),
                                    backgroundColor: color,
                                    borderColor: theme.colors.surface,
                                }
                            ]}
                        >
                            <Text style={styles.ballText}>{pitchNumber}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    zoneWrapper: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        zIndex: 1,
    },
    miniZone: {
        borderWidth: 2,
        position: 'relative',
    },
    gridLineH: { position: 'absolute', height: 1, width: '100%', zIndex: 0 },
    gridLineV: { position: 'absolute', width: 1, height: '100%', zIndex: 0 },
    ball: {
        position: 'absolute',
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        zIndex: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    ballText: {
        fontSize: 10,
        color: '#000',
        fontWeight: '900',
    },
});

export default MiniPitchZone;
