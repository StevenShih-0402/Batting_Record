// tests/hooks/ui/usePitchEdit.test.js
import { renderHook, act } from '@testing-library/react-native';
import { usePitchEdit } from '../../../src/hooks/ui/usePitchEdit';

describe('usePitchEdit 測試', () => {
    const mockOnSave = jest.fn();

    const fullRecord = {
        speed: 145,
        pitchType: 'fastball',
        note: 'good pitch',
        result: 'S',
        customPitchValues: { location: 'high' }
    };

    const emptyRecord = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【初始化與同步 (useEffect)】', () => {
        it('當 isVisible 為 false 時，即使有傳入 record，也不應修改表單狀態 (維持預設值)', () => {
            const { result } = renderHook(() => usePitchEdit(fullRecord, false, mockOnSave));

            expect(result.current.formState).toEqual({ speed: '', pitchType: '', note: '', result: '' });
            expect(result.current.customPitchValues).toEqual({});
        });

        it('當 isVisible 為 true 且傳入完整的 record 時，應將各欄位值正確載入 state (包含數值轉字串的 speed)', () => {
            const { result } = renderHook(() => usePitchEdit(fullRecord, true, mockOnSave));

            expect(result.current.formState).toEqual({
                speed: '145',
                pitchType: 'fastball',
                note: 'good pitch',
                result: 'S'
            });
            expect(result.current.customPitchValues).toEqual({ location: 'high' });
        });

        it('當傳入的 record 缺少部分屬性時，對應的 state 應退回預設空字串/空物件', () => {
            const { result } = renderHook(() => usePitchEdit(emptyRecord, true, mockOnSave));

            expect(result.current.formState).toEqual({ speed: '', pitchType: '', note: '', result: '' });
            expect(result.current.customPitchValues).toEqual({});
        });
    });

    describe('【表單輸入變更 (State 更新)】', () => {
        it('呼叫 setSpeed, setPitchType, setNote, setResult 等更新函式，應能獨立變更對應狀態', () => {
            const { result } = renderHook(() => usePitchEdit(emptyRecord, true, mockOnSave));

            act(() => {
                result.current.setSpeed('130');
                result.current.setPitchType('curveball');
                result.current.setNote('too low');
                result.current.setResult('B');
            });

            expect(result.current.formState).toEqual({
                speed: '130',
                pitchType: 'curveball',
                note: 'too low',
                result: 'B'
            });
        });

        it('呼叫 setCustomValue 傳入 fieldId 與 value，應能正確更新 customPitchValues 中的對應屬性', () => {
            const { result } = renderHook(() => usePitchEdit(emptyRecord, true, mockOnSave));

            act(() => {
                result.current.setCustomValue('feeling', 'bad');
                result.current.setCustomValue('location', 'low-away');
            });

            expect(result.current.customPitchValues).toEqual({
                feeling: 'bad',
                location: 'low-away'
            });
        });
    });

    describe('【儲存邏輯 (handleSave)】', () => {
        it('呼叫 handleSave 時，應將目前的表單狀態打包呼叫 onSave', () => {
            const { result } = renderHook(() => usePitchEdit(fullRecord, true, mockOnSave));

            act(() => {
                result.current.setPitchType('changeup'); // change one value
            });

            act(() => {
                result.current.handleSave();
            });

            expect(mockOnSave).toHaveBeenCalledWith({
                speed: 145, // is parsed to float
                pitchType: 'changeup',
                note: 'good pitch',
                result: 'S',
                customPitchValues: { location: 'high' }
            });
        });

        it('儲存時，若 speed 字串可被解析為數字，onSave payload 中的 speed 應為數值型態；若解析失敗或為空，應送出 0', () => {
            const { result } = renderHook(() => usePitchEdit(emptyRecord, true, mockOnSave));

            act(() => {
                result.current.setSpeed('abc'); // invalid
                result.current.handleSave();
            });

            expect(mockOnSave).toHaveBeenCalledWith({
                speed: 0,
                pitchType: '',
                note: '',
                result: '',
                customPitchValues: {}
            });

            act(() => {
                result.current.setSpeed(''); // empty
                result.current.handleSave();
            });

            // second call
            expect(mockOnSave.mock.calls[1][0].speed).toBe(0);
        });
    });
});
