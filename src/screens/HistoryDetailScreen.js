// src/screens/HistoryDetailScreen.js
// 顯示單一打席詳細資料的頁面 (九宮格與逐球列表)

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, useTheme, Divider, Surface } from 'react-native-paper';
import { useAlert } from '../context/AlertContext';
import { getColorByResult } from '../constants/Colors';
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../services/atBatSummaryService'; // Added import

// 使用與 StrikeZoneScreen 相同的九宮格組件
import PitchGrid from '../components/common/PitchGrid';
import PitchHistoryDots from '../components/PitchHistoryDots';

// 沿用現有的編輯 Modal
import PitchEditModal from '../components/modals/PitchEditModal';

/**
 * 打席詳細資料的 Screen，顯示九宮格與逐球詳細數據。
 * 透過 route.params 接收 record。
 */
const HistoryDetailScreen = ({ navigation, route }) => {
    const theme = useTheme();
    const { record } = route.params || {}; // Removed callbacks
    const { showWarning } = useAlert();
    const [localPitches, setLocalPitches] = useState([]);
    const [gridLayout, setGridLayout] = useState(null);

    // 編輯 Modal 狀態
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPitchIndex, setSelectedPitchIndex] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (record && record.pitchRecords) {
            setLocalPitches(record.pitchRecords);
        }
    }, [record]);

    if (!record) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.emptyContainer}>
                    <Text style={{ color: theme.colors.onSurface }}>無資料</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 處理九宮格佈局回傳
    const handleGridLayout = (e) => {
        const { width, height } = e.nativeEvent.layout;
        setGridLayout({ width, height });
    };

    // 處理單顆球的刪除
    const handleDeleteSinglePitch = (index) => {
        showWarning("刪除球點", "確定要刪除這顆球嗎？", [
            { text: "取消", style: "cancel" },
            {
                text: "刪除",
                // style: "destructive", // CustomAlertModal 對應 style
                onPress: async () => {
                    const newPitches = [...localPitches];
                    newPitches.splice(index, 1);
                    setLocalPitches(newPitches);
                    await updateAtBatSummaryPitches(record.id, newPitches);
                }
            }
        ]);
    };

    // 處理整筆紀錄刪除
    const handleDeleteWholeRecord = () => {
        showWarning("刪除整筆紀錄", "確定要刪除這個打席的所有資料嗎？", [
            { text: "取消", style: "cancel" },
            {
                text: "確認刪除",
                // style: "destructive", // CustomAlertModal 對應 style
                onPress: async () => {
                    await deleteAtBatSummary(record.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    // 處理編輯單球 - 開啟 Modal
    const handleEditPitch = (index) => {
        setSelectedPitchIndex(index);
        setEditModalVisible(true);
    };

    // 處理編輯 Modal 關閉
    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setSelectedPitchIndex(null);
    };

    // 處理編輯儲存
    const handleSaveEditedPitch = async (updatedData) => {
        if (selectedPitchIndex === null) return;

        setIsSaving(true);
        try {
            const newPitches = [...localPitches];
            // 更新選中的球資料
            newPitches[selectedPitchIndex] = {
                ...newPitches[selectedPitchIndex],
                ...updatedData,
            };
            setLocalPitches(newPitches);

            await updateAtBatSummaryPitches(record.id, newPitches);
            handleEditModalClose();
        } finally {
            setIsSaving(false);
        }
    };

    // 處理從 Modal 中刪除單球
    const handleDeleteFromModal = async () => {
        if (selectedPitchIndex === null) return;

        // 關閉 Modal 後執行刪除
        const indexToDelete = selectedPitchIndex;
        handleEditModalClose();
        handleDeleteSinglePitch(indexToDelete);
    };

    // 渲染投球列表的每一列
    const renderPitchRow = (pitch, index) => {
        const pitchNumber = localPitches.length - index;
        const color = getColorByResult(pitch.result);

        return (
            <TouchableOpacity
                key={index}
                onPress={() => handleEditPitch(index)}
                activeOpacity={0.7}
            >
                <Surface style={[styles.rowContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
                    {/* 左側顏色條指示器 */}
                    <View style={[styles.indicatorBar, { backgroundColor: color }]} />

                    <View style={styles.rowContent}>
                        {/* 左側大容器 */}
                        <View style={styles.leftMainContainer}>
                            {/* 上層：球號與結果 */}
                            <View style={styles.upperSection}>
                                <View style={styles.pitchNumberBadge}>
                                    <Text style={styles.pitchNumberText}>{pitchNumber}</Text>
                                </View>
                                <Text variant="bodyLarge" style={{ color: color, fontWeight: 'bold', marginRight: 12 }}>
                                    {pitch.result}
                                </Text>
                            </View>

                            {/* 下層：球速、球種與落點 */}
                            <View style={styles.lowerSection}>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                    {pitch.speed ? `${pitch.speed} km/h` : '--'}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 12 }}>
                                    {pitch.pitchType || '未紀錄'} ({pitch.cellNumber == 0 ? `九宮格外` : `${pitch.cellNumber} 號位`})
                                </Text>
                            </View>
                        </View>

                        {/* 右側：編輯圖示 + 刪除按鈕 */}
                        <View style={styles.rightActionContainer}>
                            <IconButton
                                icon="pencil"
                                iconColor={theme.colors.primary}
                                size={20}
                                onPress={() => handleEditPitch(index)}
                            />
                        </View>
                    </View>
                </Surface>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 標題 */}
                <Text variant="titleLarge" style={[styles.title, { color: theme.colors.primary }]}>
                    {record.atBatLabel || '打席詳情'}
                </Text>

                {/* 九宮格區域 - 使用與 StrikeZoneScreen 相同的組件 */}
                <View style={styles.gridWrapper}>
                    <View style={styles.gridContainer}>
                        <PitchGrid onLayout={handleGridLayout} />

                        {/* 球點畫布 */}
                        {gridLayout && (
                            <View
                                style={{
                                    position: 'absolute',
                                    width: gridLayout.width,
                                    height: gridLayout.height,
                                }}
                                pointerEvents="none"
                            >
                                <PitchHistoryDots
                                    records={localPitches}
                                    pitchZoneHeight={gridLayout.height}
                                    gridLayout={gridLayout}
                                />
                            </View>
                        )}
                    </View>
                </View>

                <Divider style={{ marginVertical: 15 }} />

                {/* 球數列表 */}
                <View style={{ paddingHorizontal: 15 }}>
                    <Text variant="titleMedium" style={{ marginBottom: 10 }}>
                        投球詳細數據 ({localPitches.length})
                    </Text>
                    {localPitches.map((pitch, index) => renderPitchRow(pitch, index))}
                </View>
            </ScrollView>

            {/* 底部動作列 */}
            <View style={[styles.footer, { borderTopColor: theme.colors.surfaceVariant }]}>
                <Button
                    mode="contained"
                    buttonColor={theme.colors.error}
                    icon="delete"
                    onPress={handleDeleteWholeRecord}
                >
                    刪除此打席紀錄
                </Button>
            </View>

            {/* 編輯單球 Modal - 沿用 PitchEditModal */}
            <PitchEditModal
                isVisible={editModalVisible}
                record={selectedPitchIndex !== null ? localPitches[selectedPitchIndex] : null}
                onClose={handleEditModalClose}
                onSave={handleSaveEditedPitch}
                onDelete={handleDeleteFromModal}
                isSaving={isSaving}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        padding: 16,
    },
    gridWrapper: {
        alignItems: 'center',
        marginVertical: 20,
    },
    gridContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    leftMainContainer: {
        flex: 1,
    },
    upperSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    lowerSection: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
    rightActionContainer: {
        justifyContent: 'center',
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
    },
});

export default HistoryDetailScreen;
