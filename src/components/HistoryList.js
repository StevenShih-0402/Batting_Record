// src/components/HistoryList.js
// 邏輯組件，顯示逐球紀錄的側邊選單紀錄列
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple, Text, useTheme } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import { getColorByResult } from '../constants/Colors';

// 修正：將 records 設置為預設空陣列 records = []，以避免 'map' of undefined 錯誤。
const HistoryList = ({ records = [], onDelete, onEdit }) => {
    const theme = useTheme();

    if (records.length === 0) { 
        return (
            <View style={styles.container}>
                <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                    尚無打席紀錄。
                </Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            {/* 將 records 陣列裡的每一筆資料轉換成一個 <View>（紀錄列）。 */}
            {records.map((record, index) => {
                const finalOutcome = record.atBatEndOutcome;
                const displayResult = finalOutcome === '三振' || finalOutcome === '保送' ? finalOutcome : record.result;
                const itemColor = getColorByResult(record.result, finalOutcome);
                
                return (
                    <TouchableRipple
                        key={record.id}
                        onPress={() => onEdit(record)} // 點擊整列觸發編輯
                        rippleColor={theme.colors.primary + '20'} // 20 代表透明度
                        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}
                    >
                        <View key={record.id} style={[styles.recordItem, { backgroundColor: theme.colors.surfaceVariant, borderBottomColor: theme.colors.outline }]}>
                            {/* 1. 左側數字圓圈 */}
                            <View style={[styles.pitchIndexCircle, { backgroundColor: itemColor }]}>
                                <Text style={{ color: theme.colors.background, fontWeight: 'bold' }}>
                                    {records.length - index}
                                </Text> 
                            </View>

                            {/* 2. 中間內容 (自動撐開) */}
                            <View style={ styles.recordContent }>
                                <Text style={[styles.recordResult, { color: itemColor }]}>
                                    {displayResult}
                                </Text>
                                <Text style={[styles.recordDetails, { color: theme.colors.onSurface }]}> 
                                    {record.pitchType}
                                    {record.speed && record.speed > 0 ? `\n${record.speed.toFixed(1)} km/h` : ''} 
                                    {record.note ? `\n備註: ${record.note}` : ''}
                                </Text>
                            </View>

                            {/* 3. 右側狀態 (球數、編輯按鈕) */}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16 
    },
    emptyText: {
        textAlign: 'center', 
        marginTop: 20
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'stretch',              // 關鍵：讓所有子 View (左、中、右) 高度一致
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
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
        textAlign: 'right'
    },
});

export default HistoryList;