// tests/hooks/ui/usePitchInput.test.js
import { renderHook, act } from '@testing-library/react-native';
import { usePitchInput } from '../../../src/hooks/ui/usePitchInput';
import { useAlert } from '../../../src/context/AlertContext';
import { usePreferences } from '../../../src/context/PreferencesContext';
import { getFieldQueue, pushToFieldQueue } from '../../../src/hooks/ui/useCustomFieldQueue';
import { PITCH_RESULTS } from '../../../src/constants/GameConstants';

jest.mock('../../../src/context/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../../src/context/PreferencesContext', () => ({
    usePreferences: jest.fn(),
}));

jest.mock('../../../src/hooks/ui/useCustomFieldQueue', () => ({
    getFieldQueue: jest.fn(),
    pushToFieldQueue: jest.fn(),
}));

describe('usePitchInput 測試', () => {
    const mockShowWarning = jest.fn();
    const mockOnSave = jest.fn();

    const defaultPitchTypes = ['直球', '滑球', '曲球'];
    const mockCustomPitchFields = [
        { id: 'feeling', type: 'text' },
        { id: 'location', type: 'dropdown', options: ['內角', '外角'] }
    ];

    const cellInfo = { cellNumber: 5, gridX: 1, gridY: 1 };

    // Status
    const defaultStatus = { strikes: 0, balls: 0, isFinished: false };
    const twoStrikesStatus = { strikes: 2, balls: 0, isFinished: false };
    const threeStrikesStatus = { strikes: 3, balls: 0, isFinished: false };
    const threeBallsStatus = { strikes: 0, balls: 3, isFinished: false };
    const fourBallsStatus = { strikes: 0, balls: 4, isFinished: false };
    const finishedStatus = { strikes: 0, balls: 0, isFinished: true };

    beforeEach(() => {
        jest.clearAllMocks();

        useAlert.mockReturnValue({ showWarning: mockShowWarning });
        usePreferences.mockReturnValue({
            pitchTypes: defaultPitchTypes,
            customPitchFields: mockCustomPitchFields,
        });

        getFieldQueue.mockResolvedValue(['great', 'bad']);
    });

    describe('【初始化與資源載入 (useEffect)】', () => {
        it('當 isVisible 為 false 時，應重置所有表單狀態回預設值', () => {
            const { result, rerender } = renderHook(
                ({ isVisible }) => usePitchInput(isVisible, cellInfo, defaultStatus, mockOnSave),
                { initialProps: { isVisible: true } }
            );

            // 變更一些資料以測試重置
            act(() => {
                result.current.setPitchType('滑球');
                result.current.setResult('界外');
                result.current.setSpeed('140');
                result.current.setNote('too low');
                result.current.setCustomValue('feeling', 'bad');
            });

            rerender({ isVisible: false });

            expect(result.current.form).toEqual({
                pitchType: defaultPitchTypes[0],
                result: PITCH_RESULTS[0],
                speed: '',
                note: ''
            });
            expect(result.current.customValues).toEqual({});
        });

        it('當 isVisible 為 true 且存在 text 類型的 customPitchFields，應向 getFieldQueue 要求快選列表並存入 fieldQueues', async () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, defaultStatus, mockOnSave));

            // 因為 loadQueues 是 async，我們需要等待一下
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // 有兩個 field, 但只有 feeling 是 text
            expect(getFieldQueue).toHaveBeenCalledTimes(1);
            expect(getFieldQueue).toHaveBeenCalledWith('feeling');

            expect(result.current.fieldQueues).toEqual({
                feeling: ['great', 'bad']
            });
        });
    });

    describe('【表單輸入變更 (State 更新)】', () => {
        it('呼叫表單更新函式應能正確變更對應狀態', () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, defaultStatus, mockOnSave));

            act(() => {
                result.current.setPitchType('曲球');
                result.current.setResult('壞球');
                result.current.setSpeed('125');
                result.current.setNote('test');
            });

            expect(result.current.form).toEqual({
                pitchType: '曲球',
                result: '壞球',
                speed: '125',
                note: 'test'
            });
        });

        it('呼叫 setCustomValue 傳入 fieldId 與 value，應能正確更新 customValues 中的屬性', () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, defaultStatus, mockOnSave));

            act(() => {
                result.current.setCustomValue('feeling', 'normal');
                result.current.setCustomValue('location', '內角');
            });

            expect(result.current.customValues).toEqual({
                feeling: 'normal',
                location: '內角'
            });
        });
    });

    describe('【結果過濾邏輯 (getResultOptions)】', () => {
        it('當好球數為 0 且壞球數為 0 時，應回傳包含所有 PITCH_RESULTS 的選項', () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, defaultStatus, mockOnSave));
            const options = result.current.getResultOptions();
            expect(options).toEqual(PITCH_RESULTS);
        });

        it('當好球數為 3 時，回傳的選項中不應包含「好球」', () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, threeStrikesStatus, mockOnSave));
            const options = result.current.getResultOptions();

            expect(options).not.toContain('好球');
            expect(options.length).toBe(PITCH_RESULTS.length - 1);
        });

        it('當壞球數為 4 時，回傳的選項中不應包含「壞球」', () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, fourBallsStatus, mockOnSave));
            const options = result.current.getResultOptions();

            expect(options).not.toContain('壞球');
            expect(options.length).toBe(PITCH_RESULTS.length - 1);
        });

        it('當同時滿足滿球數限制(理論上不可能，但應同時過濾)', () => {
            const maxStatus = { strikes: 3, balls: 4, isFinished: false };
            const { result } = renderHook(() => usePitchInput(true, cellInfo, maxStatus, mockOnSave));
            const options = result.current.getResultOptions();

            expect(options).not.toContain('好球');
            expect(options).not.toContain('壞球');
        });
    });

    describe('【儲存邏輯與防呆 (handleSave)】', () => {
        it('若 atBatStatus.isFinished 為 true，呼叫 handleSave 應彈出警告並中止儲存', async () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, finishedStatus, mockOnSave));

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockShowWarning).toHaveBeenCalledWith('打席已結束', expect.any(String));
            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('若選擇「好球」且目前 strikes 已達 3，呼叫 handleSave 應彈出警告並中止儲存', async () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, threeStrikesStatus, mockOnSave));

            await act(async () => {
                result.current.setResult('好球');
            });

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockShowWarning).toHaveBeenCalledWith('無法儲存', '好球數已滿。');
            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('若選擇「壞球」且目前 balls 已達 4，呼叫 handleSave 應彈出警告並中止儲存', async () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, fourBallsStatus, mockOnSave));

            await act(async () => {
                result.current.setResult('壞球');
            });

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockShowWarning).toHaveBeenCalledWith('無法儲存', '壞球數已滿。');
            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('若驗證皆通過，對於 text 型態的自訂欄位，應呼叫 pushToFieldQueue 儲存值，並呼叫 onSave 傳遞正確 payload', async () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, twoStrikesStatus, mockOnSave));

            await act(async () => {
                result.current.setPitchType('滑球');
                result.current.setResult('揮空');
                result.current.setSpeed('  142  '); // test parsing
                result.current.setNote('strikeout');
                result.current.setCustomValue('feeling', 'awsome'); // type text
                result.current.setCustomValue('location', '外角');   // type dropdown
            });

            await act(async () => {
                await result.current.handleSave();
            });

            // feeling 是 text，應被推入 queue
            expect(pushToFieldQueue).toHaveBeenCalledTimes(1);
            expect(pushToFieldQueue).toHaveBeenCalledWith('feeling', 'awsome');

            expect(mockOnSave).toHaveBeenCalledWith({
                pitchType: '滑球',
                result: '揮空',
                speed: 142, // parsed to float
                cellNumber: 5,
                gridX: 1,
                gridY: 1,
                note: 'strikeout',
                customPitchValues: {
                    feeling: 'awsome',
                    location: '外角'
                }
            });
        });

        it('速球轉換若為空字串或無效字串，應為 0', async () => {
            const { result } = renderHook(() => usePitchInput(true, cellInfo, defaultStatus, mockOnSave));

            await act(async () => {
                result.current.setSpeed('abc');
            });

            await act(async () => {
                await result.current.handleSave();
            });

            expect(mockOnSave.mock.calls[0][0].speed).toBe(0);
        });
    });
});
