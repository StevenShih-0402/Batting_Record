// src/screens/StrikeZoneScreen.js
import React, { useState, useCallback, useRef } from 'react'; 
import { View, Alert, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Animated, PanResponder } from 'react-native'; 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, Button } from 'react-native-paper'; 
import { Feather as Icon } from '@expo/vector-icons';

// 導入 Hook 與工具
import useAtBatRecords from '../hooks/useAtBatRecords';
import { getCellNumber, SCREEN_WIDTH, SCREEN_HEIGHT, DRAWER_WIDTH } from '../utils/PitchUtils';
import { getColorByResult } from '../constants/Colors';

// 導入組件
import PitchGrid from '../components/common/PitchGrid';
import Dot from '../components/common/Dot';
import HistoryList from '../components/HistoryList';
import PitchInputModal from '../components/modals/PitchInputModal';
import EndAtBatModal from '../components/modals/EndAtBatModal';


const StrikeZoneScreen = () => {
    const theme = useTheme();
    const insets = useSafeAreaInsets(); 
    
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
    const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current; 
    
    const toggleDrawer = useCallback(() => {
        const targetValue = isDrawerOpen ? SCREEN_WIDTH : 0; 
        
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
                const swipeThreshold = 0.3 * DRAWER_WIDTH; 
                const swipeSpeedThreshold = 0.5; 

                if (gestureState.dx > swipeThreshold || gestureState.vx > swipeSpeedThreshold) {
                    Animated.timing(slideAnim, {
                        toValue: SCREEN_WIDTH,
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
            
            setSelectedCellInfo({
                cellNumber,
                isInside,
                gridX: rx, 
                gridY: ry, 
            });

            setIsPitchModalVisible(true); 
        }
    }, [gridLayout, atBatStatus]);
      
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

    // 渲染歷史紀錄點
    const renderHistoryDots = () => {
        if (!pitchZoneHeight || !gridLayout) return null;

        const gridW = SCREEN_WIDTH * 0.7;
        const gridH = gridW * (4/3);

        const offsetX = (SCREEN_WIDTH - gridW) / 2;
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
            <View style={styles.headerContainer}>
                <Text style={[styles.header, { color: theme.colors.primary }]}>
                    <Icon name="activity" size={24} color={theme.colors.primary} />
                    {'  '}打席數據輸入
                </Text>
            </View>

            {/* 打席數據區域 */}
            {loading ? (
                 <View style={styles.loadingContainer}>
                    <ActivityIndicator 
                        animating={true} 
                        size="large" 
                        color={theme.colors.primary} 
                    />
                    <Text style={{color: theme.colors.onSurfaceVariant, marginTop: 10}}>資料庫連線中...</Text>
                 </View>
            ) : (
                <View 
                    style={[styles.pitchZoneContainer, {backgroundColor: 'black'}]} 
                    onTouchEnd={handleScreenPress}
                    onLayout={(e) => setPitchZoneHeight(e.nativeEvent.layout.height)}
                >
                    
                    {/* B-S 狀態顯示 */}
                    <View style={styles.scoreBoard}>
                        <Text style={[styles.scoreText, { color: theme.colors.onPrimaryContainer, backgroundColor: theme.colors.primaryContainer }]}>
                            B: {atBatStatus.balls}
                        </Text>
                        <Text style={[styles.scoreText, { color: theme.colors.onErrorContainer, backgroundColor: theme.colors.errorContainer }]}>
                            S: {atBatStatus.strikes}
                        </Text>
                        <Text style={[styles.scoreText, { color: theme.colors.onSurfaceVariant }]}>
                            P: {atBatRecords.length}
                        </Text>
                        {atBatStatus.isFinished && (
                            <Text style={[styles.finishedText, { color: theme.colors.error }]}>
                                {atBatStatus.balls >= 4 ? '保送' : atBatStatus.strikes >= 3 ? '三振' : '打擊結束'}
                            </Text>
                        )}
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
                            bottom: 3 + insets.bottom 
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
                        width: DRAWER_WIDTH, 
                        backgroundColor: theme.colors.surfaceVariant,
                        transform: [{ translateX: slideAnim }],
                        top: insets.top,
                        bottom: insets.bottom,
                        height: SCREEN_HEIGHT - insets.top - insets.bottom,
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
                    
                    <Text style={[styles.listTitle, { color: theme.colors.onSurface, paddingTop: 16 }]}>當前打席球數 ({atBatRecords.length} 球)</Text>
                    
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
    scoreBoard: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        zIndex: 15,
        gap: 10,
    },
    scoreText: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        minWidth: 70,
        textAlign: 'center',
    },
    finishedText: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: 'white',
        borderColor: '#E74C3C',
        borderWidth: 2,
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