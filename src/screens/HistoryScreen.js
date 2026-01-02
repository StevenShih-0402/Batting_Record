import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Card, List } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import { useHistoryData } from '../hooks/api/useHistoryData'; // 導入 Hook

const HistoryScreen = () => {
    const theme = useTheme();
    const { history, loading } = useHistoryData(); // 使用真實資料

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
                    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <List.Item
                            title={`結果：${item.finalOutcome || '未完成'}`}
                            titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
                            description={`日期：${item.date} | 球數：${item.totalPitches}P`}
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
    safeArea: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    header: { fontSize: 24, fontWeight: 'bold' },
    listContent: { padding: 16 },
    card: { marginBottom: 12, elevation: 2 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#888' }
});

export default HistoryScreen;