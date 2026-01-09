// src/screens/HistoryScreen.js
// 讀取彙整後打席數據的介面

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Card, List } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';

// 導入元件
import HistoryDataModal from '../components/modals/HistoryDataModal';
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../services/atBatSummaryService';

// 導入 Hook
import { useHistoryData } from '../hooks/api/useHistoryData'; 

const HistoryScreen = () => {
    const theme = useTheme();
    const { history, loading } = useHistoryData(); // 使用真實資料

    // 管理 Modal 的狀態
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // 點擊卡片，開啟 Modal
    const handleCardPress = (item) => {
        setSelectedRecord(item);
        setModalVisible(true);
    };

    // 關閉 Modal
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedRecord(null);
    };

    // 處理 Service 呼叫 (這兩個函式會傳給 Modal)
    const handleUpdatePitches = async (docId, newPitches) => {
        // UI 已經樂觀更新了，這裡只要負責打 API
        await updateAtBatSummaryPitches(docId, newPitches);
        // 注意：這裡 Firebase onSnapshot 會自動更新 history 列表，所以不用手動改 history state
    };

    const handleDeleteAtBat = async (docId) => {
        await deleteAtBatSummary(docId);
        // 同樣，onSnapshot 會自動移除該筆資料
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.header, { color: theme.colors.primary }]}>
                    <Icon name="list" size={24} />  打席歷史紀錄
                </Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>尚無歷史紀錄</Text>}
                renderItem={({ item }) => (
                    <Card 
                        style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
                        onPress={() => handleCardPress(item)}    // 觸發 HistoryDataModal 的點擊事件
                    >
                        <List.Item
                            title={item.atBatLabel || `打席結果：${item.finalOutcome}`}
                            titleStyle={{ 
                                color: theme.colors.primary, 
                                fontWeight: 'bold',
                                fontSize: 16 
                            }}
                            description={`${item.date} | ${item.totalPitches} 球 \n${item.summaryNote}`}
                            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                            left={props => <List.Icon {...props} icon="calendar-check" color={theme.colors.primary} />}
                            right={props => <Icon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} style={{ alignSelf: 'center' }} />}
                        />
                    </Card>
                )}
            />

            {/* 詳細資料 Modal */}
            <HistoryDataModal
                visible={modalVisible}
                onClose={handleCloseModal}
                record={selectedRecord}
                onDeleteAtBat={handleDeleteAtBat}
                onUpdatePitches={handleUpdatePitches}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1 
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerContainer: {
        paddingVertical: 15, 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255,255,255,0.1)' 
    },
    header: { 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
    listContent: { 
        padding: 16 
    },
    card: { 
        marginBottom: 12, 
        elevation: 2 
    },
    emptyText: { 
        textAlign: 'center', 
        marginTop: 50, 
        color: '#888' 
    }
});

export default HistoryScreen;