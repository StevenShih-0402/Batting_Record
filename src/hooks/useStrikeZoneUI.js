// src/hooks/useStrikeZoneUI.js
// screen 裡面與前端元件互動較密切的邏輯
import { useState, useRef, useCallback } from 'react';
import { Animated, PanResponder, Alert } from 'react-native';
import { Layout } from '../constants/Layout';
import { getCellNumber } from '../utils/PitchUtils'

export const useStrikeZoneUI = ({ atBatStatus, handleSavePitch, handleUpdatePitch, handleDeletePitch }) => {
    // --- Modal 狀態 ---
    const [isPitchModalVisible, setIsPitchModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isEndModalVisible, setIsEndModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedCellInfo, setSelectedCellInfo] = useState({ 
        cellNumber: 0, gridX: 0, gridY: 0, isInside: false 
    });
    const [isSaving, setIsSaving] = useState(false);

    // --- 佈局狀態 ---
    const [gridLayout, setGridLayout] = useState(null);
    const [pitchZoneHeight, setPitchZoneHeight] = useState(0);
    const gridRef = useRef(null);

    // --- 抽屜動畫邏輯 ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(Layout.WINDOW.WIDTH)).current;

    const toggleDrawer = useCallback(() => {
        const targetValue = isDrawerOpen ? Layout.WINDOW.WIDTH : 0;
        Animated.timing(slideAnim, {
            toValue: targetValue,
            duration: 350,
            useNativeDriver: true,
        }).start(() => setIsDrawerOpen(!isDrawerOpen));
    }, [isDrawerOpen, slideAnim]);

    // --- PanResponder --- 
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
                const swipeThreshold = 0.3 * Layout.WINDOW.WIDTH;
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

    // --- 九宮格座標運算 ---
    const handleGridLayout = useCallback((event) => {
        // 加上安全檢查，避免 event 為空時崩潰
        if (!event || !event.nativeEvent) return;

        const { width, height } = event.nativeEvent.layout;

        // 使用更穩定的 measureInWindow
        gridRef.current?.measureInWindow((x, y, w, h) => {
            console.log("✅ 佈局成功取得:", { x, y, width, height });
            
            setGridLayout({
                x: x,      // 絕對座標 X
                y: y,      // 絕對座標 Y
                width: width,
                height: height
            });
        });
    }, []);

    // --- 螢幕點擊事件 ---
    const handleScreenPress = useCallback((event) => {
        console.log("螢幕點擊觸發");

        if (atBatStatus.isFinished) {
            Alert.alert("打席已結束", "請先儲存或刪除紀錄。");
            return;
        }
        
        // 確保 gridLayout 存在且寬高不為 0，避免除以 0 的錯誤
        if (gridLayout && gridLayout.width > 0 && gridLayout.height > 0) {
            const { pageX, pageY } = event.nativeEvent;
            console.log("點擊位置:", pageX, pageY);
            console.log("目前 gridLayout:", gridLayout);
            
            // 1. 取得結果，裡面的 relX 已經是比例了
            const result = getCellNumber(pageX, pageY, gridLayout);
            console.log("計算結果:", result);

            setSelectedCellInfo({
                cellNumber: result.cellNumber,
                isInside: result.isInside,
                
                gridX: result.relX, // 直接存入，不要再除一次
                gridY: result.relY,
            });
            setIsPitchModalVisible(true);
            console.log("Modal 開啟。");
        }
        else {
            console.warn("gridLayout 尚未就緒");
        }
    }, [gridLayout, atBatStatus]);

    // 1. 整合後的「儲存並關閉」邏輯
    const onSavePitchAction = useCallback(async (data) => {
        setIsSaving(true);
        try {
            await handleSavePitch(data);
            setIsPitchModalVisible(false); // 自動關閉
        } finally {
            setIsSaving(false);
        }
    }, [handleSavePitch]);

    // 2. 整合後的「編輯並關閉」邏輯
    const onUpdatePitchAction = useCallback(async (updatedData) => {
        if (!editingRecord) return;
        setIsSaving(true);
        try {
            const success = await handleUpdatePitch(editingRecord.id, updatedData);
            if (success) {
                setIsEditModalVisible(false);
                setEditingRecord(null);
            }
        } finally {
            setIsSaving(false);
        }
    }, [editingRecord, handleUpdatePitch]);

    // 3. 整合後的「刪除並關閉」邏輯
    const onDeletePitchAction = useCallback(async (recordId) => {
        // 直接開始 Loading (拿掉 Alert)
        setIsSaving(true);
        try {
            // 執行刪除
            await handleDeletePitch(recordId);
            
            // 強制執行關閉 (不再判斷 success，只要沒噴 error 就執行)
            setIsEditModalVisible(false);
            setEditingRecord(null);
            
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsSaving(false);
        }
    }, [handleDeletePitch]);
    
    // 4. 處理點擊編輯
    const handleEditPress = useCallback((record) => {
        setEditingRecord(record);
        setIsEditModalVisible(true);
    }, []);

    return {
        panResponder: panResponder,
        // 狀態
        modals: {
            pitch: { visible: isPitchModalVisible, set: setIsPitchModalVisible },
            edit: { visible: isEditModalVisible, set: setIsEditModalVisible, record: editingRecord, setRecord: setEditingRecord },
            end: { visible: isEndModalVisible, set: setIsEndModalVisible }
        },
        drawer: { 
            isOpen: isDrawerOpen, 
            anim: slideAnim, 
            toggle: toggleDrawer 
        },
        layout: { 
            gridRef, 
            gridLayout, 
            pitchZoneHeight, 
            setPitchZoneHeight, 
            handleGridLayout 
        },
        selectedCellInfo,
        isSaving,
        actions: {
            onSavePitch: onSavePitchAction,
            onUpdatePitch: onUpdatePitchAction,
            onDeletePitch: onDeletePitchAction,
            handleEditPress,
            handlePitchModalClose: () => setIsPitchModalVisible(false),
        },
        // 函式
        handleScreenPress,
    };
};