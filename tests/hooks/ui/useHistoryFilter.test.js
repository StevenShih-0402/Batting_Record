// tests/hooks/ui/useHistoryFilter.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useHistoryFilter } from '../../../src/hooks/ui/useHistoryFilter';

describe('useHistoryFilter 測試', () => {
    const mockHistory = [
        {
            id: '1',
            atBatLabel: 'Game 1',
            finalOutcome: '三振',
            date: '2024-01-01',
            totalPitches: 3,
            summaryNote: 'Swing and miss',
            customSummaryValues: { weather: 'Sunny' }
        },
        {
            id: '2',
            atBatLabel: 'Game 2',
            finalOutcome: '一壘安打',
            date: '2024-01-05',
            totalPitches: 5,
            summaryNote: 'Solid hit',
            customSummaryValues: { weather: 'Rainy' }
        },
        {
            id: '3',
            atBatLabel: 'Practice',
            finalOutcome: '保送',
            date: '2024-01-10',
            totalPitches: 4,
            summaryNote: 'Good eye',
            customSummaryValues: { weather: 'Cloudy', opponent: 'Team B' }
        }
    ];

    describe('【初始化與基礎操作】', () => {
        it('初始狀態下，filters 應為全空值，isFilterActive 應為 false，filteredHistory 應等於傳入的 history', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            expect(result.current.isFilterActive).toBe(false);
            expect(result.current.filteredHistory).toEqual(mockHistory);
            expect(result.current.filters).toEqual({
                title: '',
                startDate: '',
                endDate: '',
                minPitches: '',
                maxPitches: '',
                note: '',
                customFields: {}
            });
        });

        it('呼叫 applyFilters 傳入新條件時，應更新 filters，並將 isFilterActive 設為 true', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ title: 'Game' });
            });

            expect(result.current.filters.title).toBe('Game');
            expect(result.current.isFilterActive).toBe(true);
        });

        it('呼叫 clearFilters 時，應重置 filters 回預設全空狀態，並將 isFilterActive 設為 false', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ title: 'Game' });
            });

            act(() => {
                result.current.clearFilters();
            });

            expect(result.current.isFilterActive).toBe(false);
            expect(result.current.filters.title).toBe('');
            expect(result.current.filteredHistory).toEqual(mockHistory);
        });
    });

    describe('【過濾邏輯：標題與結果 (Title/Outcome)】', () => {
        it('當搜尋文字匹配 atBatLabel (忽略大小寫) 時，應保留該筆紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ title: 'game' }); // 小寫測試
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(2);
            expect(filtered.map(f => f.id)).toEqual(['1', '2']);
        });

        it('當搜尋文字匹配 finalOutcome 時，應保留該筆紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ title: '一壘' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('2');
        });

        it('當標題與結果皆不匹配時，應過濾掉該筆紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ title: '全壘打' });
            });

            expect(result.current.filteredHistory.length).toBe(0);
        });
    });

    describe('【過濾邏輯：日期 (Date)】', () => {
        it('設定 startDate 後，應過濾掉 date 早於 startDate 的紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ startDate: '2024-01-05' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(2);
            expect(filtered.map(f => f.id)).toEqual(['2', '3']);
        });

        it('設定 endDate 後，應過濾掉 date 晚於 endDate 的紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ endDate: '2024-01-05' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(2);
            expect(filtered.map(f => f.id)).toEqual(['1', '2']);
        });

        it('同時設定 start 與 end 時，應只保留在區間內的紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ startDate: '2024-01-02', endDate: '2024-01-09' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('2');
        });
    });

    describe('【過濾邏輯：球數 (Pitches)】', () => {
        it('設定 minPitches 後，應過濾掉 totalPitches 小於設定值的紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ minPitches: '4' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(2);
            expect(filtered.map(f => f.id)).toEqual(['2', '3']);
        });

        it('設定 maxPitches 後，應過濾掉 totalPitches 大於設定值的紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ maxPitches: '3' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('1');
        });

        it('當輸入無效數字時，應不報錯並忽略球數條件 (回傳所有紀錄)', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ minPitches: 'abc' });
            });

            // isNaN(parseInt('abc')) 為 true，依據邏輯會被忽略
            expect(result.current.filteredHistory.length).toBe(3);
        });
    });

    describe('【過濾邏輯：備註與自訂欄位 (Note & CustomFields)】', () => {
        it('設定 note 後，應只保留 summaryNote 包含該字串的紀錄 (忽略大小寫)', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ note: 'hit' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('2');
        });

        it('設定 customFields 條件後，應只保留 customSummaryValues 對應 key 之 value 包含搜尋字串的紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                result.current.applyFilters({ customFields: { weather: 'sun' } });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('1');
        });
    });

    describe('【多條件複合過濾】', () => {
        it('多個條件同時存在時 (e.g. title + maxPitches)，必須全部滿足 (AND 邏輯) 才可保留紀錄', () => {
            const { result } = renderHook(() => useHistoryFilter(mockHistory));

            act(() => {
                // title match: "Game" -> Game 1, Game 2
                // maxPitches 3 -> Game 1, Practice
                // Intersection: Game 1
                result.current.applyFilters({ title: 'Game', maxPitches: '3' });
            });

            const filtered = result.current.filteredHistory;
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('1');
        });
    });
});
