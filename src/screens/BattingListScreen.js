// src/screens/BattingListScreen.js
// 顯示當前打席的逐球紀錄列表頁面

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableRipple, Text, useTheme, Button, ActivityIndicator } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import { getColorByResult } from '../constants/Colors';

// 導入 Modal 組件
import PitchEditModal from '../components/modals/PitchEditModal';
import EndAtBatModal from '../components/modals/EndAtBatModal';

// 導入 Hook
import useAtBatRecords from '../hooks/useAtBatRecords';

/**
 * 打席逐球紀錄的 Screen，顯示當前打席的所有投球紀錄。
 * 改為獨立使用 Hook 獲取資料，不再依賴 navigation params。
 */
const BattingListScreen = ({ navigation }) => {
    const theme = useTheme();

    // 使用 Hook 獲取資料與操作方法
    const {
        loading,
        atBatRecords: records,
        atBatStatus,
        handleUpdatePitch: onUpdatePitch,
        handleDeletePitch: onDeletePitch,
        handleSaveSummary: onSaveSummary
    } = useAtBatRecords();

    // Modal 狀態管理
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [endModalVisible, setEndModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // 渲染空狀態
    if (records.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                        尚無打席紀錄。
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // 處理編輯點擊 - 開啟 Modal
    const handleEditPress = (record) => {
        setSelectedRecord(record);
        setEditModalVisible(true);
    };

    // 處理編輯 Modal 關閉
    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setSelectedRecord(null);
    };

    // 處理更新投球 - 需傳遞 (id, updatedData) 給 onUpdatePitch
    const handleUpdatePitch = async (updatedData) => {
        setIsSaving(true);
        try {
            if (onUpdatePitch && selectedRecord) {
                await onUpdatePitch(selectedRecord.id, updatedData);
            }
            handleEditModalClose();
            // 返回上一頁讓資料刷新
            navigation.goBack();
        } finally {
            setIsSaving(false);
        }
    };

    // 處理刪除投球
    const handleDeletePitch = async (recordId) => {
        setIsSaving(true);
        try {
            if (onDeletePitch) {
                await onDeletePitch(recordId);
            }
            handleEditModalClose();
            // 返回上一頁讓資料刷新
            navigation.goBack();
        } finally {
            setIsSaving(false);
        }
    };

    // 處理開啟儲存彙整 Modal
    const handleOpenEndModal = () => {
        setEndModalVisible(true);
    };

    // 處理儲存彙整完成
    const handleSaveSummaryComplete = async (summaryData) => {
        try {
            if (onSaveSummary) {
                await onSaveSummary(summaryData);
            }
            setEndModalVisible(false);
            navigation.goBack();
        } catch (error) {
            console.error('儲存彙整失敗:', error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
            {/* 儲存紀錄按鈕 */}
            <View style={styles.saveRecordButtonContainer}>
                <Button
                    mode="contained"
                    onPress={handleOpenEndModal}
                    disabled={records.length === 0}
                    icon="archive-arrow-up"
                >
                    儲存紀錄 (彙整)
                </Button>
            </View>

            <ScrollView style={styles.scrollContainer}>
                <Text style={[styles.listTitle, { color: theme.colors.onSurface }]}>
                    當前球數 ( {records.length} )
                </Text>

                {/* 逐球紀錄列表 */}
                {records.map((record, index) => {
                    const finalOutcome = record.atBatEndOutcome;
                    const displayResult = finalOutcome === '三振' || finalOutcome === '保送' ? finalOutcome : record.result;
                    const itemColor = getColorByResult(record.result, finalOutcome);

                    return (
                        <TouchableRipple
                            key={record.id}
                            onPress={() => handleEditPress(record)}
                            rippleColor={theme.colors.primary + '20'}
                            style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}
                        >
                            <View style={[styles.recordItem, { backgroundColor: theme.colors.surfaceVariant, borderBottomColor: theme.colors.outline }]}>
                                {/* 左側數字圓圈 */}
                                <View style={[styles.pitchIndexCircle, { backgroundColor: itemColor }]}>
                                    <Text style={{ color: theme.colors.background, fontWeight: 'bold' }}>
                                        {records.length - index}
                                    </Text>
                                </View>

                                {/* 中間內容 */}
                                <View style={styles.recordContent}>
                                    <Text style={[styles.recordResult, { color: itemColor }]}>
                                        {displayResult}
                                    </Text>
                                    <Text style={[styles.recordDetails, { color: theme.colors.onSurface }]}>
                                        {record.pitchType}
                                        {record.speed && record.speed > 0 ? `\n${record.speed.toFixed(1)} km/h` : ''}
                                        {record.note ? `\n備註: ${record.note}` : ''}
                                    </Text>
                                </View>

                                {/* 右側狀態 */}
                                <View style={styles.recordCount}>
                                    <Text style={[styles.recordCountText, { color: theme.colors.onSurface }]}>
                                        {finalOutcome ? 'END' : `${record.runningBalls}-${record.runningStrikes}`}
                                    </Text>
                                    <Icon name="edit" size={16} color={theme.colors.onSurfaceVariant} />
                                </View>
                            </View>
                        </TouchableRipple>
                    );
                })}
            </ScrollView>

            {/* PitchEditModal - 編輯單球紀錄 */}
            <PitchEditModal
                isVisible={editModalVisible}
                record={selectedRecord}
                onClose={handleEditModalClose}
                onSave={handleUpdatePitch}
                onDelete={handleDeletePitch}
                isSaving={isSaving}
            />

            {/* EndAtBatModal - 儲存彙整 */}
            <EndAtBatModal
                isVisible={endModalVisible}
                onClose={() => setEndModalVisible(false)}
                onSave={handleSaveSummaryComplete}
                atBatRecords={records}
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
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
    saveRecordButtonContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    scrollContainer: {
        flex: 1,
        // paddingHorizontal: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
        paddingHorizontal: 16,
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        paddingHorizontal: 16,
    },
    pitchIndexCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        flexShrink: 0,
        marginTop: 4,
    },
    recordContent: {
        flex: 1,
        minWidth: 0,
    },
    recordResult: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    recordDetails: {
        fontSize: 12,
        marginTop: 2,
    },
    recordCount: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexShrink: 0,
        marginLeft: 10,
    },
    recordCountText: {
        fontSize: 18,
        fontWeight: 'bold',
        minWidth: 40,
        textAlign: 'right',
    },
});

export default BattingListScreen;
