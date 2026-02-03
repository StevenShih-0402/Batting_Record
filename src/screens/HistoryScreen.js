// src/screens/HistoryScreen.js
// 讀取彙整後打席數據的介面

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Card, List, ActivityIndicator } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';

// 導入 Service
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../services/atBatSummaryService';

// 導入 Hook
import { useHistoryData } from '../hooks/api/useHistoryData';
import { useAuth } from '../hooks/auth/useAuth';

/**
 * 歷史紀錄頁面，顯示已彙整的打席列表。
 * 點擊卡片時導航到 HistoryDetailScreen 查看詳情。
 */
const HistoryScreen = ({ navigation }) => {
    const theme = useTheme();
    const { history, loading } = useHistoryData();
    const { user } = useAuth();

    // 點擊卡片，導航到詳情頁
    const handleCardPress = (item) => {
        navigation.navigate('HistoryDetail', {
            record: item,
            onDeleteAtBat: handleDeleteAtBat,
            onUpdatePitches: handleUpdatePitches,
        });
    };

    // 處理 Service 呼叫
    const handleUpdatePitches = async (docId, newPitches) => {
        await updateAtBatSummaryPitches(docId, newPitches);
    };

    const handleDeleteAtBat = async (docId) => {
        await deleteAtBatSummary(docId);
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
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        尚無歷史紀錄{user?.isAnonymous ? '\n(登入才能查看彙整的打席紀錄)' : ''}
                    </Text>
                }
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