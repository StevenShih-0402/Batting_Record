// src/components/HistoryList.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';
import { getColorByResult } from '../constants/Colors';

// 修正：將 records 設置為預設空陣列 records = []，以避免 'map' of undefined 錯誤。
const HistoryList = ({ records = [], onDelete }) => {
    const theme = useTheme();

    if (records.length === 0) { 
        return (
            <View style={styles.container}>
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                    尚無打席紀錄。
                </Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            {records.map((record, index) => {
                const finalOutcome = record.atBatEndOutcome;
                const displayResult = finalOutcome === '三振' || finalOutcome === '保送' ? finalOutcome : record.result;
                const itemColor = getColorByResult(record.result, finalOutcome);
                
                return (
                    <View key={record.id} style={[styles.recordItem, { borderBottomColor: theme.colors.outline }]}>
                        <View style={[
                            styles.pitchIndexCircle, 
                            { backgroundColor: itemColor } 
                        ]}>
                            <Text style={{ color: theme.colors.background, fontWeight: 'bold' }}>
                                {records.length - index}
                            </Text> 
                        </View>

                        <View style={styles.recordContent}>
                            <Text style={[styles.recordResult, {color: itemColor}]}>
                                {displayResult} {finalOutcome === '打擊出去' && ' (結束打席)'}
                            </Text>
                            <Text style={styles.recordDetails}> 
                                {record.pitchType} | {typeof record.speed === 'number' && record.speed > 0 ? `${record.speed.toFixed(1)} km/h ` : ''} 
                                {record.note ? `\n備註: ${record.note}` : ''}
                            </Text>
                        </View>

                        <View style={styles.recordCount}>
                            {finalOutcome ? (
                                 <Text style={[styles.recordCountText, {color: theme.colors.error, fontSize: 14, fontWeight: 'bold'}]}>
                                    已結束
                                </Text>
                            ) : (
                                <Text style={[styles.recordCountText, {color: theme.colors.onSurface}]}>
                                    {record.runningBalls}-{record.runningStrikes}
                                </Text>
                            )}
                            
                            <TouchableOpacity onPress={() => onDelete(record.id)} style={{ paddingLeft: 10 }}>
                                <Icon name="trash-2" size={16} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
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
        alignItems: 'flex-start',
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
        color: '#666',
        marginTop: 2,
    },
    recordCount: {
        flexDirection: 'column', 
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