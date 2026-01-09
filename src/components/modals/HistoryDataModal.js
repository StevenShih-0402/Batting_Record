import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, Button, IconButton, useTheme, Divider, Surface } from 'react-native-paper';
import { getColorByResult } from '../../constants/Colors';

// 迷你九宮格的尺寸配置
const MINI_ZONE_WIDTH = 200;
const MINI_ZONE_HEIGHT = 250; 
const BALL_SIZE = 24; // 球的大小

const HistoryDataModal = ({ visible, onClose, record, onDeleteAtBat, onUpdatePitches }) => {
    const theme = useTheme();
    const [localPitches, setLocalPitches] = useState([]);

    useEffect(() => {
        if (record && record.pitchRecords) {
            setLocalPitches(record.pitchRecords);
        }
    }, [record]);

    if (!record) return null;

    // 處理單顆球的刪除
    const handleDeleteSinglePitch = (index) => {
        Alert.alert("刪除球點", "確定要刪除這顆球嗎？", [
            { text: "取消", style: "cancel" },
            { 
                text: "刪除", 
                style: "destructive", 
                onPress: async () => {
                    const newPitches = [...localPitches];
                    newPitches.splice(index, 1);
                    setLocalPitches(newPitches);
                    await onUpdatePitches(record.id, newPitches);
                }
            }
        ]);
    };

    // 處理整筆紀錄刪除
    const handleDeleteWholeRecord = () => {
        Alert.alert("刪除整筆紀錄", "確定要刪除這個打席的所有資料嗎？", [
            { text: "取消", style: "cancel" },
            { 
                text: "確認刪除", 
                style: "destructive", 
                onPress: async () => {
                    await onDeleteAtBat(record.id);
                    onClose();
                }
            }
        ]);
    };

    // 渲染列表的每一列 (模仿 HistoryList 的設計)
    const renderPitchRow = (pitch, index) => {
        // 倒序顯示：最新的球在上面，或是保持順序但顯示球號
        // 這裡顯示的是球數編號：總數 - index
        const pitchNumber = localPitches.length - index;
        const color = getColorByResult(pitch.result);

        return (
            <Surface key={index} style={[styles.rowContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
                {/* 左側顏色條指示器 (維持原狀) */}
                <View style={[styles.indicatorBar, { backgroundColor: color }]} />
                
                <View style={styles.rowContent}>
                    {/* 左側大容器：改為垂直佈局 */}
                    <View style={styles.leftMainContainer}>
                        
                        {/* 上層：球號與球速 */}
                        <View style={styles.upperSection}>
                            <View style={styles.pitchNumberBadge}>
                                <Text style={styles.pitchNumberText}>{pitchNumber}</Text>
                            </View>
                            <Text variant="bodyLarge" style={{ color: color, fontWeight: 'bold', marginRight: 12 }}>
                                {pitch.result}
                            </Text>
                        </View>

                        {/* 下層：結果、球種與落點 */}
                        <View style={styles.lowerSection}>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                {pitch.speed ? `${pitch.speed} km/h` : '--'}
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 12 }}>
                                {pitch.pitchType || '未紀錄'}
                            </Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {pitch.cellNumber == 0 ? `九宮格外` : `${pitch.cellNumber} 號位`}
                            </Text>
                        </View>
                    </View>

                    {/* 右側：刪除按鈕 */}
                    <View style={styles.rightActionContainer}>
                        <IconButton 
                            icon="delete-outline" 
                            iconColor={theme.colors.error}
                            size={22}
                            onPress={() => handleDeleteSinglePitch(index)}
                        />
                    </View>
                </View>
            </Surface>
        );
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
                
                {/* 標題列 */}
                <View style={styles.header}>
                    <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        {record.atBatLabel || '打席詳情'}
                    </Text>
                    <IconButton icon="close" iconColor={theme.colors.onSurface} onPress={onClose} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    {/* --- 迷你九宮格區域 --- */}
                    {/* 增加 paddingVertical 讓出界的球不會被卡住 */}
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
                            {localPitches.map((pitch, index) => {
                                const x = pitch.gridX * MINI_ZONE_WIDTH;
                                const y = pitch.gridY * MINI_ZONE_HEIGHT;
                                const color = getColorByResult(pitch.result);
                                const pitchNumber = localPitches.length - index;

                                return (
                                    <View 
                                        key={index}
                                        style={[
                                            styles.ball,
                                            {
                                                left: x - (BALL_SIZE / 2),
                                                top: y - (BALL_SIZE / 2),
                                                backgroundColor: color,
                                                borderColor: theme.colors.surface, // 給球加一個與背景同色的邊框，增加對比
                                            }
                                        ]}
                                    >
                                        <Text style={styles.ballText}>{pitchNumber}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <Divider style={{ marginVertical: 15 }} />

                    {/* --- 球數列表 --- */}
                    <View style={{ paddingHorizontal: 15 }}>
                        <Text variant="titleMedium" style={{ marginBottom: 10 }}>
                            投球詳細數據 ({localPitches.length})
                        </Text>
                        {localPitches.map((pitch, index) => renderPitchRow(pitch, index))}
                    </View>

                </ScrollView>

                {/* 底部動作列 */}
                <View style={[styles.footer, { borderTopColor: theme.colors.surfaceVariant, fontWeight: 'bold' }]}>
                     <Button 
                        mode="contained" 
                        buttonColor={theme.colors.error} 
                        icon="delete"
                        onPress={handleDeleteWholeRecord}
                    >
                        刪除此打席紀錄
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 20,
        borderRadius: 8,
        flex: 1,
        maxHeight: '90%',
        overflow: 'hidden', // 這是 Modal 本身的裁切，避免內容跑出圓角
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    zoneWrapper: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        zIndex: 1, // 確保九宮格區域層級較高
    },
    miniZone: {
        borderWidth: 2,
        position: 'relative', 
        // 關鍵修正：移除 overflow: hidden，讓壞球可以顯示在框框外
        // backgroundColor: 'rgba(255,255,255,0.05)', // 可選：給好球帶一點點背景色
    },
    gridLineH: { position: 'absolute', height: 1, width: '100%', zIndex: 0 },
    gridLineV: { position: 'absolute', width: 1, height: '100%', zIndex: 0 },
    
    // 球的樣式
    ball: {
        position: 'absolute',
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1, // 讓球有個細邊框，在重疊時比較好看
        zIndex: 10,     // 關鍵修正：確保球浮在線條上方
        elevation: 3,   // Android 陰影
        shadowColor: "#000", // iOS 陰影
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    ballText: {
        fontSize: 10,
        color: '#000',
        fontWeight: '900',
    },
    
    // 列表樣式
    rowContainer: {
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    indicatorBar: {
        width: 6,
        height: '100%',
    },
    rowContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
    },
    pitchNumberBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    pitchNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },
    rowCenter: {
        flex: 2,
        alignItems: 'flex-start', // 或 center
        paddingHorizontal: 5,
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
    }
});

export default HistoryDataModal;