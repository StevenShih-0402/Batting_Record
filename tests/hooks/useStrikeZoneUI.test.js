// tests/hooks/useStrikeZoneUI.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useStrikeZoneUI } from '../../src/hooks/useStrikeZoneUI';
import { useAlert } from '../../src/context/AlertContext';
import { Layout } from '../../src/constants/Layout';
import { getCellNumber } from '../../src/utils/PitchUtils';
import { Animated, PanResponder } from 'react-native';

// Mock dependencies
jest.mock('../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../src/utils/PitchUtils', () => ({
    getCellNumber: jest.fn(),
}));

// Mock Layout
jest.mock('../../src/constants/Layout', () => ({
    Layout: {
        WINDOW: {
            WIDTH: 400,
            HEIGHT: 800,
        }
    }
}));

// Mock Animated.timing to execute immediately
jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: (callback) => callback && callback({ finished: true }),
}));

describe('useStrikeZoneUI 測試', () => {
    const mockShowWarning = jest.fn();
    const mockHandleSavePitch = jest.fn();
    const mockHandleUpdatePitch = jest.fn();
    const mockHandleDeletePitch = jest.fn();
    const mockNavigation = {
        navigate: jest.fn(),
    };

    const props = {
        atBatStatus: { strikes: 0, balls: 0, isFinished: false },
        handleSavePitch: mockHandleSavePitch,
        handleUpdatePitch: mockHandleUpdatePitch,
        handleDeletePitch: mockHandleDeletePitch,
        navigation: mockNavigation,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useAlert.mockReturnValue({ showWarning: mockShowWarning });
    });

    describe('【抽屜動畫邏輯 (Drawer Animation)】', () => {
        it('toggleDrawer 應正確切換 isDrawerOpen 狀態並觸發動畫', () => {
            const { result } = renderHook(() => useStrikeZoneUI(props));

            expect(result.current.drawer.isOpen).toBe(false);

            act(() => {
                result.current.drawer.toggle();
            });

            expect(Animated.timing).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
                toValue: 0,
            }));
            expect(result.current.drawer.isOpen).toBe(true);

            act(() => {
                result.current.drawer.toggle();
            });

            expect(Animated.timing).toHaveBeenLastCalledWith(expect.any(Object), expect.objectContaining({
                toValue: Layout.WINDOW.WIDTH,
            }));
            expect(result.current.drawer.isOpen).toBe(false);
        });
    });

    describe('【佈局運算 (Layout Handling)】', () => {
        it('handleGridLayout 應透過 gridRef 取得絕對座標並更新狀態', () => {
            const { result } = renderHook(() => useStrikeZoneUI(props));

            // Mock measureInWindow
            const mockMeasureInWindow = jest.fn((cb) => cb(10, 20, 100, 100));
            result.current.layout.gridRef.current = { measureInWindow: mockMeasureInWindow };

            const event = {
                nativeEvent: {
                    layout: { width: 100, height: 100 }
                }
            };

            act(() => {
                result.current.layout.handleGridLayout(event);
            });

            expect(mockMeasureInWindow).toHaveBeenCalled();
            expect(result.current.layout.gridLayout).toEqual({
                x: 10,
                y: 20,
                width: 100,
                height: 100
            });
        });
    });

    describe('【螢幕點擊與座標轉換 (Screen Press)】', () => {
        it('當 atBatStatus.isFinished 為 true 時，點擊螢幕應彈出警告', () => {
            const finishedProps = { ...props, atBatStatus: { isFinished: true } };
            const { result } = renderHook(() => useStrikeZoneUI(finishedProps));

            act(() => {
                result.current.handleScreenPress({ nativeEvent: {} });
            });

            expect(mockShowWarning).toHaveBeenCalledWith("打席已結束", expect.any(String));
            expect(mockNavigation.navigate).not.toHaveBeenCalled();
        });

        it('座標轉換成功後，應更新 selectedCellInfo 並導航至 PitchInput', async () => {
            getCellNumber.mockReturnValue({
                cellNumber: 3,
                isInside: true,
                relX: 0.5,
                relY: 0.5
            });

            const { result } = renderHook(() => useStrikeZoneUI(props));

            // Mock measureInWindow
            const mockMeasureInWindow = jest.fn((cb) => cb(10, 20, 100, 100));
            result.current.layout.gridRef.current = { measureInWindow: mockMeasureInWindow };

            // 設定佈局
            act(() => {
                result.current.layout.handleGridLayout({
                    nativeEvent: { layout: { width: 100, height: 100 } }
                });
            });

            // 確保 gridLayout 已更新
            expect(result.current.layout.gridLayout).not.toBeNull();

            act(() => {
                result.current.handleScreenPress({
                    nativeEvent: { pageX: 50, pageY: 50 }
                });
            });

            expect(getCellNumber).toHaveBeenCalledWith(50, 50, result.current.layout.gridLayout);
            expect(result.current.selectedCellInfo).toEqual({
                cellNumber: 3,
                isInside: true,
                gridX: 0.5,
                gridY: 0.5
            });
            expect(mockNavigation.navigate).toHaveBeenCalledWith('PitchInput', expect.objectContaining({
                cellInfo: expect.any(Object),
                atBatStatus: props.atBatStatus,
                onSave: expect.any(Function)
            }));
        });
    });

    describe('【球點操作 Action (Save/Update/Delete)】', () => {
        it('onSavePitchAction 應觸發 isSaving 狀態並呼叫 handleSavePitch', async () => {
            const { result } = renderHook(() => useStrikeZoneUI(props));
            const data = { speed: 100 };

            await act(async () => {
                await result.current.actions.onSavePitch(data);
            });

            expect(mockHandleSavePitch).toHaveBeenCalledWith(data);
            expect(result.current.isSaving).toBe(false);
        });

        it('onUpdatePitchAction 應在成功後清空 editingRecord', async () => {
            mockHandleUpdatePitch.mockResolvedValue(true);
            const { result } = renderHook(() => useStrikeZoneUI(props));

            act(() => {
                result.current.modals.edit.setRecord({ id: 'pitch1' });
            });

            await act(async () => {
                await result.current.actions.onUpdatePitch({ speed: 110 });
            });

            expect(mockHandleUpdatePitch).toHaveBeenCalledWith('pitch1', { speed: 110 });
            expect(result.current.modals.edit.record).toBeNull();
        });

        it('onDeletePitchAction 應呼叫 handleDeletePitch 並清空 editingRecord', async () => {
            const { result } = renderHook(() => useStrikeZoneUI(props));

            act(() => {
                result.current.modals.edit.setRecord({ id: 'pitch1' });
            });

            await act(async () => {
                await result.current.actions.onDeletePitch('pitch1');
            });

            expect(mockHandleDeletePitch).toHaveBeenCalledWith('pitch1');
            expect(result.current.modals.edit.record).toBeNull();
        });
    });

    describe('【編輯導向 (handleEditPress)】', () => {
        it('呼叫 handleEditPress 時，應設定編輯對象並導航至 PitchEdit', () => {
            const { result } = renderHook(() => useStrikeZoneUI(props));
            const record = { id: 'pitch1', speed: 95 };

            act(() => {
                result.current.actions.handleEditPress(record);
            });

            expect(result.current.modals.edit.record).toEqual(record);
            expect(mockNavigation.navigate).toHaveBeenCalledWith('PitchEdit', expect.objectContaining({
                record,
                onSave: expect.any(Function),
                onDelete: expect.any(Function)
            }));
        });
    });
});
