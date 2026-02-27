// src/screens/HistoryScreen.js
// 讀取彙整後打席數據的介面

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, Card, List, ActivityIndicator, Badge } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// 導入 Service
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../services/atBatSummaryService';

// 導入 Hook
import { useHistoryData } from '../hooks/api/useHistoryData';
import { useHistoryFilter } from '../hooks/ui/useHistoryFilter';
import { useAuth } from '../hooks/auth/useAuth';
import { usePreferences } from '../context/PreferencesContext';

// 導入組件
import HistoryFilterModal from '../components/modals/HistoryFilterModal';

/**
 * 歷史紀錄頁面，顯示已彙整的打席列表。
 * 點擊卡片時導航到 HistoryDetailScreen 查看詳情。
 */
const HistoryScreen = ({ navigation }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { history, loading } = useHistoryData();
    const { user } = useAuth();
    const { customSummaryFields } = usePreferences();

    const { filters, isFilterActive, filteredHistory, applyFilters, clearFilters } = useHistoryFilter(history);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    // 點擊卡片，導航到詳情頁
    const handleCardPress = (item) => {
        navigation.navigate('HistoryDetail', {
            record: item,
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

    /**
     * 將自訂彙整欄位值組合成顯示用字串，換行分隔。
     */
    const buildCustomSummaryText = (summaryValues) => {
        if (!summaryValues || customSummaryFields.length === 0) return '';
        return customSummaryFields
            .map((field) => {
                const val = summaryValues[field.id];
                return val ? `${field.label}: ${val}` : null;
            })
            .filter(Boolean)
            .join('\n');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.header, { color: theme.colors.primary }]}>
                    <Icon name="list" size={24} />  打席歷史紀錄
                </Text>
            </View>

            <HistoryFilterModal
                visible={isFilterModalVisible}
                onDismiss={() => setFilterModalVisible(false)}
                onApply={applyFilters}
                onClear={clearFilters}
                initialFilters={filters}
            />

            <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        尚無歷史紀錄{user?.isAnonymous ? '\n(登入查看彙整的打席紀錄)' : ''}
                    </Text>
                }
                renderItem={({ item }) => {
                    const customText = buildCustomSummaryText(item.customSummaryValues);
                    const description = [
                        `日期：${item.date}`,
                        `球數：${item.totalPitches} 球`,
                        ...(item.summaryNote ? [`備註：${item.summaryNote}`] : []),
                        ...(customText ? [customText] : []),
                    ].join('\n');

                    return (
                        <Card
                            style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
                            onPress={() => handleCardPress(item)}
                        >
                            <List.Item
                                title={item.atBatLabel || `打席結果：${item.finalOutcome}`}
                                titleStyle={{
                                    color: theme.colors.primary,
                                    fontWeight: 'bold',
                                    fontSize: 16
                                }}
                                description={description}
                                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                                descriptionNumberOfLines={10}
                                left={props => <List.Icon {...props} icon="calendar-check" color={theme.colors.primary} />}
                                right={props => <Icon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} style={{ alignSelf: 'center' }} />}
                            />
                        </Card>
                    );
                }}
            />

            {/* 懸浮篩選按鈕 */}
            <TouchableOpacity
                style={[styles.filterFab, { backgroundColor: isFilterActive ? theme.colors.primaryContainer : theme.colors.primary, bottom: insets.bottom - 35 }]}
                onPress={() => setFilterModalVisible(true)}
            >
                <MaterialCommunityIcons
                    name={isFilterActive ? "filter-check" : "filter-variant"}
                    size={28}
                    color={isFilterActive ? theme.colors.onPrimaryContainer : theme.colors.onPrimary}
                />
                {isFilterActive && (
                    <Badge style={styles.fabBadge} size={10} visible={true} />
                )}
            </TouchableOpacity>
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
        padding: 16,
        paddingBottom: 80 // 給懸浮按鈕留空間
    },
    card: {
        marginBottom: 12,
        elevation: 2
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#888'
    },
    filterFab: {
        position: 'absolute',
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 30,
        elevation: 6,
    },
    fabBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
    }
});

export default HistoryScreen;