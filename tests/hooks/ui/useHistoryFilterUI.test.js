// tests/hooks/ui/useHistoryFilterUI.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useHistoryFilterUI } from '../../../src/hooks/ui/useHistoryFilterUI';

describe('useHistoryFilterUI 測試', () => {
    const mockOnApply = jest.fn();
    const mockOnClear = jest.fn();
    const mockNavigation = {
        goBack: jest.fn(),
    };

    const emptyInitialFilters = {
        title: '', startDate: '', endDate: '',
        minPitches: '', maxPitches: '', note: '', customFields: {}
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【初始化與屬性同步 (useEffect)】', () => {
        it('當傳入 initialFilters 時，應正確初始化 localFilters 狀態', () => {
            const initialProps = {
                ...emptyInitialFilters,
                title: 'Test',
            };
            const { result } = renderHook(() => useHistoryFilterUI(initialProps, mockOnApply, mockOnClear, mockNavigation));

            expect(result.current.localFilters.title).toBe('Test');
        });

        it('若未傳入 initialFilters，應使用預設的空字串/空物件結構作為初始狀態', () => {
            const { result } = renderHook(() => useHistoryFilterUI(undefined, mockOnApply, mockOnClear, mockNavigation));

            expect(result.current.localFilters).toEqual(emptyInitialFilters);
        });

        it('當 initialFilters 發生變化時，localFilters 應同步更新', () => {
            const { result, rerender } = renderHook(
                ({ filters }) => useHistoryFilterUI(filters, mockOnApply, mockOnClear, mockNavigation),
                { initialProps: { filters: { ...emptyInitialFilters, title: 'Old' } } }
            );

            expect(result.current.localFilters.title).toBe('Old');

            rerender({ filters: { ...emptyInitialFilters, title: 'New' } });

            expect(result.current.localFilters.title).toBe('New');
        });
    });

    describe('【自訂欄位變更 (handleCustomFieldChange)】', () => {
        it('呼叫 handleCustomFieldChange 傳入 fieldId 和 value 時，應能正確更新 localFilters.customFields 中的對應數值', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => {
                result.current.handleCustomFieldChange('weather', 'Sunny');
            });

            expect(result.current.localFilters.customFields).toEqual({ weather: 'Sunny' });
        });

        it('若多次變更不同 fieldId，customFields 內的其他屬性應被保留 (淺層複製正確)', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => {
                result.current.handleCustomFieldChange('f1', 'v1');
            });
            act(() => {
                result.current.handleCustomFieldChange('f2', 'v2');
            });

            expect(result.current.localFilters.customFields).toEqual({ f1: 'v1', f2: 'v2' });
        });
    });

    describe('【套用過濾條件 (handleApply)】', () => {
        it('呼叫 handleApply 時，若有提供 onApply，應將當前的 localFilters 作為參數傳遞給 onApply', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => {
                result.current.handleCustomFieldChange('testKey', 'testVal');
            });
            act(() => {
                result.current.handleApply();
            });

            expect(mockOnApply).toHaveBeenCalledWith({
                ...emptyInitialFilters,
                customFields: { testKey: 'testVal' }
            });
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });

        it('呼叫 handleApply 後，即使沒有 onApply，皆應呼叫 navigation.goBack()', () => {
            // undefined callbacks
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, undefined, undefined, mockNavigation));

            act(() => {
                result.current.handleApply();
            });

            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    describe('【清除過濾條件 (handleClear)】', () => {
        it('呼叫 handleClear 時，若有提供 onClear，應呼叫 onClear (無參數)', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => {
                result.current.handleClear();
            });

            expect(mockOnClear).toHaveBeenCalledWith(); // no params
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });

        it('呼叫 handleClear 後，即使沒有 onClear，皆應呼叫 navigation.goBack()', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, undefined, undefined, mockNavigation));

            act(() => {
                result.current.handleClear();
            });

            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    describe('【日期選擇器 (DatePicker)】', () => {
        it('openDatePicker 應正確設定預設日期與顯示狀態', () => {
            const testFilters = { ...emptyInitialFilters, startDate: '2026-05-15' };
            const { result } = renderHook(() => useHistoryFilterUI(
                testFilters,
                mockOnApply, mockOnClear, mockNavigation
            ));

            act(() => {
                result.current.openDatePicker('start');
            });

            expect(result.current.datePickerConfig.show).toBe(true);
            expect(result.current.datePickerConfig.mode).toBe('start');
            expect(result.current.datePickerConfig.date.getFullYear()).toBe(2026);
            expect(result.current.datePickerConfig.date.getMonth()).toBe(4); // 5月
            expect(result.current.datePickerConfig.date.getDate()).toBe(15);
        });

        it('onDateChange (dismissed) 應關閉選擇器', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => { result.current.openDatePicker('start'); });

            act(() => {
                result.current.onDateChange({ type: 'dismissed' });
            });

            expect(result.current.datePickerConfig.show).toBe(false);
        });

        it('onDateChange 應更新 localFilters 的日期', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => { result.current.openDatePicker('end'); });

            act(() => {
                const selectedDate = new Date(2026, 11, 25); // 2026-12-25
                result.current.onDateChange({ type: 'set' }, selectedDate);
            });

            expect(result.current.localFilters.endDate).toBe('2026-12-25');
        });

        it('confirmIOSDate 應關閉選擇器', () => {
            const { result } = renderHook(() => useHistoryFilterUI(emptyInitialFilters, mockOnApply, mockOnClear, mockNavigation));

            act(() => { result.current.openDatePicker('start'); });

            act(() => {
                result.current.confirmIOSDate();
            });

            expect(result.current.datePickerConfig.show).toBe(false);
        });
    });
});
