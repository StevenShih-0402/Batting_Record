// src/screens/StrikeZoneScreen.js
// 打席數據輸入的介面
import React, { useState, useCallback, useRef } from 'react'; 
import { View, Alert, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Animated, PanResponder } from 'react-native'; 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, Button } from 'react-native-paper'; 
import { Feather as Icon } from '@expo/vector-icons';

// 導入 Hook 與工具
import useAtBatRecords from '../hooks/useAtBatRecords';
import { useStrikeZoneUI } from '../hooks/useStrikeZoneUI';
import { getColorByResult, COLOR_BALL, COLOR_STRIKE } from '../constants/Colors';
import { Layout } from '../constants/Layout';

// 導入組件
import PitchGrid from '../components/common/PitchGrid';
import BallIndicator from '../components/common/BallIndicator';
import PitchInputModal from '../components/modals/PitchInputModal';
import EndAtBatModal from '../components/modals/EndAtBatModal';
import PitchEditModal from '../components/modals/PitchEditModal';
import HistoryList from '../components/HistoryList';
import PitchHistoryDots from '../components/PitchHistoryDots';


const StrikeZoneScreen = () => {
    const theme = useTheme();               // 取得自訂主題實體
    const insets = useSafeAreaInsets();     // 取得 SaveAreaView 裡面的事件設定實體
    
    // 1. 數據層：負責 Firebase 與棒球規則邏輯
    const { 
        loading, 
        atBatRecords, 
        atBatStatus, 
        handleSavePitch, 
        handleDeletePitch, 
        handleUpdatePitch, 
        handleSaveSummary 
    } = useAtBatRecords();
    
    // 2. UI 互動層：負責動畫、座標計算與 Modal 流程控制
    // 我們將數據層的 function 傳入，讓 UI Hook 處理「存檔後自動關閉 Modal」的連動行為
    const ui = useStrikeZoneUI({
        atBatStatus,
        handleSavePitch,
        handleUpdatePitch,
        handleDeletePitch
    });
    
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }] }>
                <Text style={[styles.header, { color: theme.colors.primary }]}>
                    <Icon name="activity" size={24} color={theme.colors.primary} />
                    {'  '}打席數據輸入
                </Text>
            </View>

            {/* 打席數據區域 */}
            {loading ? (
                 <View style={[styles.loadingContainer, {backgroundColor: theme.colors.background}]}>
                    <ActivityIndicator 
                        animating={true} 
                        size="large" 
                        color={theme.colors.primary}
                    />
                    <Text style={{color: theme.colors.onSurface, marginTop: 10}}>資料庫連線中...</Text>
                 </View>
            ) : (
                <View 
                    style={[styles.pitchZoneContainer, {backgroundColor: theme.colors.background}]} 
                    onTouchEnd={ui.handleScreenPress}
                    onLayout={(e) => ui.layout.setPitchZoneHeight(e.nativeEvent.layout.height)}
                >
                    
                    {/* 頂部狀態列：好壞球燈號 */}
                    <View style={[styles.statusBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                        {/* S: 好球燈 (上限 2 個燈，因為第 3 個燈就結束了) */}
                        <View style={styles.indicatorGroup}>
                            <Text style={styles.indicatorLabel}>S</Text>
                            <BallIndicator 
                                count={atBatStatus.strikes} 
                                max={2} 
                                activeColor={COLOR_STRIKE} 
                                inactiveColor="#333" 
                            />
                        </View>

                        {/* B: 壞球燈 (上限 3 個燈) */}
                        <View style={styles.indicatorGroup}>
                            <Text style={styles.indicatorLabel}>B</Text>
                            <BallIndicator 
                                count={atBatStatus.balls} 
                                max={3} 
                                activeColor={COLOR_BALL} 
                                inactiveColor="#333" 
                            />
                        </View>

                        {/* P: 總球數 */}
                        <View style={styles.indicatorGroup}>
                            <Text style={styles.indicatorLabel}>P</Text>
                            <Text style={styles.pitchCountText}>{atBatRecords.length}</Text>
                        </View>

                        {/* 最新紀錄文字 */}
                        <View style={styles.latestRecordContainer}>
                            {atBatRecords.length > 0 && (
                                <Text 
                                    style={[
                                        styles.latestRecordText, 
                                        { color: getColorByResult(atBatRecords[0].result, atBatRecords[0].atBatEndOutcome) }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {/* 顯示最後一球的結果，若有結算則顯示結算文字 */}
                                    {atBatStatus.isFinished 
                                        ? (atBatStatus.balls >= 4 ? '保送' : atBatStatus.strikes >= 3 ? '三振' : '打席結束')
                                        : atBatRecords[0].result
                                    }
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* B. 九宮格與歷史點：這部分是重點，它們會被 pitchZoneContainer 的 justifyContent: 'center' 置中 */}
                    <View style={styles.centerContentWrapper}>
                        {/* 確保九宮格渲染在這裡 */}
                        <PitchGrid 
                            ref={ui.layout.gridRef} 
                            onLayout={(e) => {
                                // 必須把 e 傳進去
                                ui.layout.handleGridLayout(e);
                                ui.layout.setPitchZoneHeight(e.nativeEvent.layout.height);
                            }}
                        />
                        
                        {/* 球點畫布 */}
                        {ui.layout.gridLayout && (
                            <View 
                                style={{
                                    position: 'absolute', // 覆蓋在 Grid 上
                                    width: ui.layout.gridLayout.width,
                                    height: ui.layout.gridLayout.height,
                                }} 
                                pointerEvents="none"
                            >
                                <PitchHistoryDots 
                                    records={atBatRecords} 
                                    pitchZoneHeight={ui.layout.pitchZoneHeight} 
                                    gridLayout={ui.layout.gridLayout} 
                                />
                            </View>
                        )}
                    </View>
                        
                </View>
            )}

            {/* 右側側拉抽屜 */}
            <Animated.View
                {...ui.panResponder.panHandlers}
                style={[
                    styles.drawerContainer,
                    { 
                        backgroundColor: theme.colors.surfaceVariant,
                        transform: [{ translateX: ui.drawer.anim }],
                        top: insets.top,
                        bottom: insets.bottom + 60,
                        width: Layout.WINDOW.WIDTH,
                        height: Layout.WINDOW.HEIGHT - insets.top - insets.bottom - 60
                    }
                ]}
                pointerEvents={ui.drawer.isOpen ? 'auto' : 'none'}
            >
                <View style={styles.drawerHeader}>
                    <Text style={[styles.drawerTitle, { color: theme.colors.primary }]}><Icon name="archive" size={24} />  打席紀錄</Text>
                    <TouchableOpacity onPress={ui.drawer.toggle} style={styles.drawerCloseBtn}>
                        <Icon name="x" size={24} color="white"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.saveRecordButtonContainer}>
                    <Button 
                        mode="contained" 
                        onPress={() => ui.modals.end.set(true)} 
                        disabled={atBatRecords.length === 0}
                        icon="archive-arrow-up"
                    >
                        儲存紀錄 (彙整)
                    </Button>
                </View>

                <ScrollView style={styles.drawerScroll}>
                    <Text style={styles.listTitle}>當前球數 ( {atBatRecords.length} )</Text>
                    <HistoryList 
                        records={atBatRecords} 
                        onDelete={handleDeletePitch} 
                        onEdit={ui.actions.handleEditPress} 
                    />
                </ScrollView>
            </Animated.View>

            {/* 懸浮抽屜按鈕 */}
            {!ui.drawer.isOpen && (
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: theme.colors.primary, bottom: insets.bottom - 35}]}
                    onPress={ui.drawer.toggle}
                >
                    <Icon name="menu" size={24} color={theme.colors.onPrimary} />
                </TouchableOpacity>
            )}

            
            {/* 各式功能彈窗 (使用 ui.actions 接管 UI 流程) */}
            <PitchInputModal 
                isVisible={ui.modals.pitch.visible}
                onClose={ui.actions.handlePitchModalClose}
                onSave={ui.actions.onSavePitch}
                cellInfo={ui.selectedCellInfo}
                isSaving={ui.isSaving}
                atBatStatus={atBatStatus}
            />

            <PitchEditModal
                isVisible={ui.modals.edit.visible}
                record={ui.modals.edit.record}
                onClose={() => ui.modals.edit.set(false)}
                onSave={ui.actions.onUpdatePitch}
                onDelete={ui.actions.onDeletePitch}
                isSaving={ui.isSaving}
            />

            <EndAtBatModal
                isVisible={ui.modals.end.visible}
                onClose={() => ui.modals.end.set(false)}
                onSave={handleSaveSummary}
                atBatRecords={atBatRecords || []}     // 確保即使 atBatRecords 還沒算出來，至少傳入空陣列 []
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    headerContainer: {
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    header: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pitchZoneContainer: {
        flex: 1,                // 撐開 Header 之後的所有空間
        justifyContent: 'center', // 【關鍵】垂直置中子元素
        alignItems: 'center',     // 【關鍵】水平置中子元素
        position: 'relative',
    },
    gridOverlay: {
        // 確保九宮格在容器內絕對置中
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', 
        alignItems: 'center',    
    },
    statusBar: {
        position: 'absolute',    // 絕對定位在最頂端
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#333',
    },
    centerContentWrapper: {
        // 這個容器會被父層 center 
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // 確保子元素 absolute 定位以此為基準
    },
    indicatorGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    indicatorLabel: {
        color: '#AAA',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 8,
        width: 12,
    },
    pitchCountText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 20,
    },
    latestRecordContainer: {
        flex: 1, // 佔滿剩餘空間
        alignItems: 'flex-end',
    },
    latestRecordText: {
        fontSize: 16,
        fontWeight: '900',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
    drawerContainer: {
        position: 'absolute',
        right: 0,
        zIndex: 20, 
        shadowColor: "#000",
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 1,
        borderLeftColor: '#ddd',
        borderRadius: 0,
        overflow: 'hidden', 
    },
    drawerHeader: {
        height: 60,                // 固定高度較好對齊
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        position: 'relative',      // 確保子元素絕對定位是參考此容器
        borderBottomColor: '#ddd',
    },
    drawerCloseBtn: {
        position: 'absolute',      // 絕對定位
        right: 15,                 // 靠右對齊，留 15 的間距
        padding: 10,               // 增加點擊區域
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    drawerScroll: {
        flex: 1,
    },
    drawerContent: {
        paddingBottom: 20,
    },
    toggleButton: {
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
    saveRecordButtonContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
        paddingHorizontal: 16,
    },
});

export default StrikeZoneScreen;