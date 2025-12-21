// src/screens/StrikeZoneScreen.js
// 打席數據輸入的介面
import React, { useState, useCallback, useRef } from 'react'; 
import { View, Alert, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Animated, PanResponder } from 'react-native'; 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, Button } from 'react-native-paper'; 
import { Feather as Icon } from '@expo/vector-icons';

// 導入 Hook 與工具
import useAtBatRecords from '../hooks/useAtBatRecords';
import { getCellNumber } from '../utils/PitchUtils';
import { getColorByResult, COLOR_BALL, COLOR_STRIKE } from '../constants/Colors';
import { Layout } from '../constants/Layout';

// 導入組件
import PitchGrid from '../components/common/PitchGrid';
import Dot from '../components/common/Dot';
import HistoryList from '../components/HistoryList';
import PitchInputModal from '../components/modals/PitchInputModal';
import EndAtBatModal from '../components/modals/EndAtBatModal';
import BallIndicator from '../components/common/BallIndicator';


const StrikeZoneScreen = () => {
    const theme = useTheme();               // 取得自訂主題實體
    const insets = useSafeAreaInsets();     // 取得 SaveAreaView 裡面的事件設定實體
    
    // 使用 Custom Hook 獲取所有資料和持久化邏輯
    const { 
        loading, 
        atBatRecords, 
        atBatStatus, 
        handleSavePitch, 
        handleDeletePitch, 
        handleSaveSummary,
    } = useAtBatRecords();
    
    // 用於 Modal 內部 loading 狀態
    const [isSaving, setIsSaving] = useState(false); 
    
    // 儲存與設定 Modal 的數據
    const [isPitchModalVisible, setIsPitchModalVisible] = useState(false); 
    const [isEndModalVisible, setIsEndModalVisible] = useState(false); 
    
    const [selectedCellInfo, setSelectedCellInfo] = useState({ 
        cellNumber: 0, 
        gridX: 0, 
        gridY: 0,
        isInside: false,
    });
    const [gridLayout, setGridLayout] = useState(null);         // 位置資訊的狀態變數
    const [pitchZoneHeight, setPitchZoneHeight] = useState(0); 
    
    const gridRef = useRef(null);                               // 用來收集位置資訊，並向下傳遞給子元件的變數，通稱"引用" (ref)

    // --- 抽屜狀態與動畫 ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(Layout.WINDOW.WIDTH)).current; 
    
    const toggleDrawer = useCallback(() => {
        const targetValue = isDrawerOpen ? Layout.WINDOW.WIDTH : 0; 
        
        Animated.timing(slideAnim, {
            toValue: targetValue,
            duration: 350,
            useNativeDriver: true,
        }).start(() => {
            setIsDrawerOpen(prev => !prev);
        });
    }, [isDrawerOpen, slideAnim]);
    
    // --- PanResponder (保持不變) ---
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return isDrawerOpen && gestureState.dx > 5;
            },
            onPanResponderMove: (evt, gestureState) => {
                const newX = Math.max(0, gestureState.dx);
                slideAnim.setValue(newX);
            },
            onPanResponderRelease: (evt, gestureState) => {
                const swipeThreshold = 0.3 * Layout.DRAWER_WIDTH; 
                const swipeSpeedThreshold = 0.5; 

                if (gestureState.dx > swipeThreshold || gestureState.vx > swipeSpeedThreshold) {
                    Animated.timing(slideAnim, {
                        toValue: Layout.WINDOW.WIDTH,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => setIsDrawerOpen(false));
                } else {
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => setIsDrawerOpen(true));
                }
            },
        })
    ).current;
    
    // 處理九宮格佈局測量
    // 1, 當九宮格 View 在畫面上確定位置和大小後，onLayout 事件被觸發。
    // 2, handleLayout 函式接收到 event 數據，並從中提取 x, y, width, height 資訊。
    const handleGridLayout = useCallback(() => {
        if (gridRef.current) {
            gridRef.current.measure((fx, fy, width, height, px, py) => {
                setGridLayout({
                    x: px, 
                    y: py, 
                    width: width,
                    height: height,
                });
            });
        }
    }, []);

    // 處理螢幕點擊事件 
    const handleScreenPress = useCallback((event) => {
        if (atBatStatus.isFinished) {
            Alert.alert("打席已結束", "請先儲存或刪除紀錄，才能新增下一球。");
            return;
        }

        const { pageX: absoluteX, pageY: absoluteY } = event.nativeEvent;
        
        if (gridLayout) {
            const { cellNumber, isInside, relX: rx, relY: ry } = getCellNumber(absoluteX, absoluteY, gridLayout);
            
            // 在 log 輸出點擊的座標位置
            console.log(`[Pitch Click] ${cellNumber > 0 ? cellNumber + ' 號位' : '框外'}, 座標: (${rx.toFixed(2)}, ${ry.toFixed(2)})`);

            setSelectedCellInfo({
                cellNumber,
                isInside,
                gridX: rx, 
                gridY: ry, 
            });

            setIsPitchModalVisible(true); 
        }
    }, [gridLayout, atBatStatus]);
    
    // 關閉 PitchInputModal
    const handlePitchModalClose = useCallback(() => {
        setIsPitchModalVisible(false); 
    }, []);
    
    // 處理單一球數數據儲存 (傳遞給 Modal 的 prop)
    const onSavePitch = useCallback(async (data) => {
        setIsSaving(true);
        try {
            await handleSavePitch(data);
        } catch (error) {
            // 錯誤在 hook 中已經 Alert
        } finally {
            setIsSaving(false);
            handlePitchModalClose();
        }
    }, [handleSavePitch, handlePitchModalClose]);

    // 將歷史紀錄的每一筆資料渲染成九宮格上的球
    const renderHistoryDots = () => {
        if (!pitchZoneHeight || !gridLayout) return null;

        const gridW = Layout.WINDOW.WIDTH * 0.7;
        const gridH = gridW * (4/3);

        const offsetX = (Layout.WINDOW.WIDTH - gridW) / 2;
        const offsetY = (pitchZoneHeight - gridH) / 2; 

        return atBatRecords.map((record, index) => {
            if (typeof record.gridX !== 'number' || typeof record.gridY !== 'number') return null;

            const dotX_grid = record.gridX * gridW; 
            const dotY_grid = record.gridY * gridH; 
            
            const finalX = offsetX + dotX_grid;
            const finalY = offsetY + dotY_grid;

            const dotColor = getColorByResult(record.result, record.atBatEndOutcome);
            
            const pitchNumber = atBatRecords.length - index;

            return (
                <Dot
                    key={record.id}
                    x={finalX}
                    y={finalY}
                    color={dotColor}
                    pitchIndex={pitchNumber} 
                />
            );
        });
    };
    
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
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
                    onTouchEnd={handleScreenPress}
                    onLayout={(e) => setPitchZoneHeight(e.nativeEvent.layout.height)}
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

                    {/* 歷史紀錄點 (持久化) */}
                    {renderHistoryDots()}

                    {/* 九宮格 (置中) */}
                    <View style={styles.gridOverlay}>
                        <PitchGrid ref={gridRef} onLayout={handleGridLayout} />
                    </View>
                        
                </View>
            )}

            {/* Floating Toggle Button */}
            {!isDrawerOpen && ( 
                <TouchableOpacity
                    style={[
                        styles.toggleButton, 
                        { 
                            backgroundColor: theme.colors.primary, 
                            right: 15, 
                            bottom: 15 + insets.bottom 
                        } 
                    ]}
                    onPress={toggleDrawer}
                >
                    <Icon 
                        name="menu" 
                        size={24} 
                        color={theme.colors.onPrimary} 
                    />
                </TouchableOpacity>
            )}

            {/* 打席紀錄抽屜 */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.drawerContainer,
                    { 
                        width: Layout.DRAWER_WIDTH, 
                        backgroundColor: theme.colors.surfaceVariant,
                        transform: [{ translateX: slideAnim }],
                        top: insets.top,
                        bottom: insets.bottom,
                        height: Layout.WINDOW.HEIGHT - insets.top - insets.bottom,
                    }
                ]}
                pointerEvents={isDrawerOpen ? 'auto' : 'none'}
            >
                <View style={[styles.drawerHeader, {backgroundColor: theme.colors.surface}]}>
                     <Text style={[styles.drawerTitle, { color: theme.colors.primary }]}>打席紀錄</Text>
                     <TouchableOpacity onPress={toggleDrawer} style={{padding: 5, position: 'absolute', right: 16}}>
                        <Icon name="x" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                </View>

                {/* 儲存紀錄按鈕 */}
                <View style={styles.saveRecordButtonContainer}>
                     <Button 
                        mode="contained" 
                        onPress={() => setIsEndModalVisible(true)} 
                        disabled={atBatRecords.length === 0}
                        icon="archive-arrow-up"
                    >
                        儲存紀錄 (彙整並清空)
                    </Button>
                </View>

                <ScrollView 
                    style={styles.drawerScroll} 
                    contentContainerStyle={styles.drawerContent}
                    showsVerticalScrollIndicator={true}
                >
                    
                    <Text style={[styles.listTitle, { color: theme.colors.onSurface, paddingTop: 16 }]}>當前打席球數 ( {atBatRecords.length} 球 )</Text>
                    
                    <HistoryList records={atBatRecords} onDelete={handleDeletePitch} />

                </ScrollView>
            </Animated.View>

            
            {/* 打席數據輸入彈窗 */}
            <PitchInputModal 
                isVisible={isPitchModalVisible}
                onClose={handlePitchModalClose} 
                onSave={onSavePitch} 
                cellInfo={selectedCellInfo}
                atBatStatus={atBatStatus}
                isSaving={isSaving}
            />

            {/* 打席結束/彙整彈窗 */}
            <EndAtBatModal
                isVisible={isEndModalVisible}
                onClose={() => setIsEndModalVisible(false)}
                onSave={handleSaveSummary}
                atBatRecords={atBatRecords}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
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
        flex: 1,
        minHeight: 300,
        backgroundColor: 'black', 
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', 
        alignItems: 'center',    
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
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
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    drawerScroll: {
        flex: 1,
    },
    drawerContent: {
        paddingBottom: 20,
    },
    toggleButton: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 30, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    saveRecordButtonContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        paddingHorizontal: 16,
    },
});

export default StrikeZoneScreen;