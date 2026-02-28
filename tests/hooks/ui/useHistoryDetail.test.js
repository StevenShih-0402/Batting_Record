// tests/hooks/ui/useHistoryDetail.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useHistoryDetail } from '../../../src/hooks/ui/useHistoryDetail';
import { useAlert } from '../../../src/context/AlertContext';
import { deleteAtBatSummary, updateAtBatSummaryPitches } from '../../../src/services/atBatSummaryService';

// Mock dependencies
jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/services/atBatSummaryService', () => ({
    deleteAtBatSummary: jest.fn(),
    updateAtBatSummaryPitches: jest.fn(),
}));

describe('useHistoryDetail 測試', () => {
    const mockShowWarning = jest.fn();
    const mockNavigation = {
        goBack: jest.fn(),
        navigate: jest.fn(),
    };

    const mockRecord = {
        id: 'record_123',
        pitchRecords: [
            { id: 'p1', result: 'S' },
            { id: 'p2', result: 'B' },
            { id: 'p3', result: 'H' },
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();

        useAlert.mockReturnValue({
            showWarning: mockShowWarning,
        });

        // 預設確認按鈕執行 (為了方便，部分測試需要自己複寫 mock 或擷取 param)
    });

    describe('【初始化與同步 (useEffect)】', () => {
        it('當傳入的 record 存在 pitchRecords 時，應正確同步至 localPitches 狀態', () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));
            expect(result.current.localPitches).toEqual(mockRecord.pitchRecords);
        });

        it('若傳入的 record 中未包含 pitchRecords，則應維持預設空陣列', () => {
            const { result } = renderHook(() => useHistoryDetail({ id: 'empty_record' }, mockNavigation));
            expect(result.current.localPitches).toEqual([]);

            const { result: r2 } = renderHook(() => useHistoryDetail(null, mockNavigation));
            expect(r2.current.localPitches).toEqual([]);
        });
    });

    describe('【九宮格佈局處理 (handleGridLayout)】', () => {
        it('呼叫 handleGridLayout 傳入 layout 事件後，應能正確設定 gridLayout { width, height }', () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleGridLayout({
                    nativeEvent: { layout: { width: 300, height: 400, x: 0, y: 0 } }
                });
            });

            expect(result.current.gridLayout).toEqual({ width: 300, height: 400 });
        });
    });

    describe('【單球刪除 (handleDeleteSinglePitch)】', () => {
        it('呼叫時應彈出 showWarning 確認視窗，若選擇取消則不改變狀態與儲存', () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleDeleteSinglePitch(1);
            });

            expect(mockShowWarning).toHaveBeenCalledWith(
                '刪除球點',
                '確定要刪除這顆球嗎？',
                expect.any(Array)
            );

            // 取得參數
            const buttons = mockShowWarning.mock.calls[0][2];
            expect(buttons[0].text).toBe('取消');
            expect(buttons[0].style).toBe('cancel');

            // 取消行為不需要驗證，因為預設沒有提供 onPress 就是純粹的 dismiss
            expect(updateAtBatSummaryPitches).not.toHaveBeenCalled();
            expect(result.current.localPitches.length).toBe(3);
        });

        it('若於確認視窗選擇「刪除」，應將指定索引的球點從 localPitches 中移除，並呼叫 updateAtBatSummaryPitches 儲存變更', async () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleDeleteSinglePitch(1); // 刪除 p2 (index 1)
            });

            const buttons = mockShowWarning.mock.calls[0][2];
            const deleteAction = buttons[1].onPress;

            await act(async () => {
                await deleteAction();
            });

            expect(updateAtBatSummaryPitches).toHaveBeenCalledWith('record_123', [
                { id: 'p1', result: 'S' },
                { id: 'p3', result: 'H' }
            ]);
            expect(result.current.localPitches).toEqual([
                { id: 'p1', result: 'S' },
                { id: 'p3', result: 'H' }
            ]);
        });
    });

    describe('【整筆紀錄刪除 (handleDeleteWholeRecord)】', () => {
        it('呼叫時應彈出 showWarning 確認視窗，若選擇取消不應調用 deleteAtBatSummary 或 goBack', () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleDeleteWholeRecord();
            });

            expect(mockShowWarning).toHaveBeenCalledWith(
                '刪除整筆紀錄',
                '確定要刪除這個打席的所有資料嗎？',
                expect.any(Array)
            );

            const buttons = mockShowWarning.mock.calls[0][2];
            expect(buttons[0].text).toBe('取消');

            expect(deleteAtBatSummary).not.toHaveBeenCalled();
            expect(mockNavigation.goBack).not.toHaveBeenCalled();
        });

        it('若選擇「確認刪除」，應呼叫 deleteAtBatSummary，並呼叫 navigation.goBack 回上一頁', async () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleDeleteWholeRecord();
            });

            const buttons = mockShowWarning.mock.calls[0][2];
            const confirmDeleteAction = buttons[1].onPress;

            await act(async () => {
                await confirmDeleteAction();
            });

            expect(deleteAtBatSummary).toHaveBeenCalledWith('record_123');
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    describe('【單球編輯與導航 (handleEditPitch)】', () => {
        it('呼叫 handleEditPitch 指定索引時，應呼叫 navigation.navigate 前往 PitchEdit，並帶入該球資料與回呼函式', () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleEditPitch(2); // 引數為 p3 (H)
            });

            expect(mockNavigation.navigate).toHaveBeenCalledWith('PitchEdit', {
                record: { id: 'p3', result: 'H' },
                onSave: expect.any(Function),
                onDelete: expect.any(Function),
            });
        });

        it('模擬在 PitchEdit 觸發 onSave 回呼時，應更新對應索引的球點，並呼叫 updateAtBatSummaryPitches', async () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleEditPitch(1); // origin: p2 'B'
            });

            const navigateArgs = mockNavigation.navigate.mock.calls[0][1];
            const onSaveCallback = navigateArgs.onSave;

            await act(async () => {
                await onSaveCallback({ result: 'FOUL', speed: '140' });
            });

            const expectedNewPitches = [
                { id: 'p1', result: 'S' },
                { id: 'p2', result: 'FOUL', speed: '140' },
                { id: 'p3', result: 'H' },
            ];

            expect(updateAtBatSummaryPitches).toHaveBeenCalledWith('record_123', expectedNewPitches);
            expect(result.current.localPitches).toEqual(expectedNewPitches);
        });

        it('模擬在 PitchEdit 觸發 onDelete 回呼時，應觸發 handleDeleteSinglePitch (彈出確認窗)', () => {
            const { result } = renderHook(() => useHistoryDetail(mockRecord, mockNavigation));

            act(() => {
                result.current.handleEditPitch(0);
            });

            const navigateArgs = mockNavigation.navigate.mock.calls[0][1];
            const onDeleteCallback = navigateArgs.onDelete;

            act(() => {
                onDeleteCallback();
            });

            // 此時會觸發 handleDeleteSinglePitch 的 showWarning
            expect(mockShowWarning).toHaveBeenCalledWith(
                '刪除球點',
                '確定要刪除這顆球嗎？',
                expect.any(Array)
            );
        });
    });
});
