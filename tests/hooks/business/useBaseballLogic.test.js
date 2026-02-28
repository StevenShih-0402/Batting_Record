// tests/hooks/business/useBaseballLogic.test.js
import { renderHook } from '@testing-library/react-native';
import { useBaseballLogic } from '../../../src/hooks/business/useBaseballLogic';

describe('useBaseballLogic 測試', () => {
    describe('【邊界與例外處理】', () => {
        it('當傳入的 rawRecords 為 null 或 undefined 時，應回傳初始空狀態，避免崩潰', () => {
            const { result: r1 } = renderHook(() => useBaseballLogic(null));
            expect(r1.current.atBatRecords).toEqual([]);
            expect(r1.current.atBatStatus).toEqual({ balls: 0, strikes: 0, isFinished: false, atBatRecordsCount: 0 });

            const { result: r2 } = renderHook(() => useBaseballLogic(undefined));
            expect(r2.current.atBatRecords).toEqual([]);
            expect(r2.current.atBatStatus).toEqual({ balls: 0, strikes: 0, isFinished: false, atBatRecordsCount: 0 });
        });

        it('當傳入空陣列時，應回傳空狀態且打席未結束', () => {
            const { result } = renderHook(() => useBaseballLogic([]));
            expect(result.current.atBatRecords).toEqual([]);
            expect(result.current.atBatStatus).toEqual({ balls: 0, strikes: 0, isFinished: false, lastResult: null, atBatRecordsCount: 0 });
        });
    });

    describe('【基礎球數計算與排序邏輯】', () => {
        it('傳入多筆紀錄時，應先依照 createdAt 升序處理，最後回傳的 records 應為降序 (最新在頂部)', () => {
            const rawRecords = [
                { id: '2', createdAt: new Date('2024-01-01T10:05:00'), result: '壞球' },
                { id: '1', createdAt: new Date('2024-01-01T10:00:00'), result: '好球' },
                { id: '3', createdAt: new Date('2024-01-01T10:10:00'), result: '界外' }
            ];

            const { result } = renderHook(() => useBaseballLogic(rawRecords));

            // 確保第一個是最新的一球 (id '3')，最後一個是最舊的 (id '1')
            expect(result.current.atBatRecords[0].id).toBe('3');
            expect(result.current.atBatRecords[1].id).toBe('2');
            expect(result.current.atBatRecords[2].id).toBe('1');
        });

        it('連續輸入兩顆好球與兩顆壞球，狀態應正確記錄 strikes: 2, balls: 2，打席尚未結束', () => {
            const rawRecords = [
                { id: '1', createdAt: new Date(1), result: '好球' },
                { id: '2', createdAt: new Date(2), result: '壞球' },
                { id: '3', createdAt: new Date(3), result: '好球' },
                { id: '4', createdAt: new Date(4), result: '壞球' }
            ];

            const { result } = renderHook(() => useBaseballLogic(rawRecords));
            expect(result.current.atBatStatus.strikes).toBe(2);
            expect(result.current.atBatStatus.balls).toBe(2);
            expect(result.current.atBatStatus.isFinished).toBe(false);
            expect(result.current.atBatStatus.atBatRecordsCount).toBe(4);
        });

        it('輸入界外球時，若好球數小於 2 則增加好球數，若已達兩好球則好球數不變 (維持 2)', () => {
            // 情境 1: 0 好球時打界外 (S=1)
            const rec1 = [{ id: '1', createdAt: new Date(1), result: '界外' }];
            const { result: r1 } = renderHook(() => useBaseballLogic(rec1));
            expect(r1.current.atBatStatus.strikes).toBe(1);

            // 情境 2: 2 好球時打界外 (S 維持 2)
            const rec2 = [
                { id: '1', createdAt: new Date(1), result: '好球' },
                { id: '2', createdAt: new Date(2), result: '好球' },
                { id: '3', createdAt: new Date(3), result: '界外' }
            ];
            const { result: r2 } = renderHook(() => useBaseballLogic(rec2));
            expect(r2.current.atBatStatus.strikes).toBe(2);
            expect(r2.current.atBatStatus.isFinished).toBe(false);
        });
    });

    describe('【打席結束判定 (出局或上壘)】', () => {
        it('累積三好球時，最後一球應被標記 atBatEndOutcome="三振" 且 isFinished=true', () => {
            const rawRecords = [
                { id: '1', createdAt: new Date(1), result: '好球' },
                { id: '2', createdAt: new Date(2), result: '界外' },
                { id: '3', createdAt: new Date(3), result: '好球' } // 第三顆好球
            ];

            const { result } = renderHook(() => useBaseballLogic(rawRecords));
            expect(result.current.atBatStatus.strikes).toBe(3);
            expect(result.current.atBatStatus.isFinished).toBe(true);

            // 確保是最新的那一筆資料加上了 atBatEndOutcome
            expect(result.current.atBatRecords[0].atBatEndOutcome).toBe('三振');
        });

        it('累積四壞球時，最後一球應被標記 atBatEndOutcome="保送" 且 isFinished=true', () => {
            const rawRecords = [
                { id: '1', createdAt: new Date(1), result: '壞球' },
                { id: '2', createdAt: new Date(2), result: '壞球' },
                { id: '3', createdAt: new Date(3), result: '好球' },
                { id: '4', createdAt: new Date(4), result: '壞球' },
                { id: '5', createdAt: new Date(5), result: '壞球' } // 第四顆壞球
            ];

            const { result } = renderHook(() => useBaseballLogic(rawRecords));
            expect(result.current.atBatStatus.balls).toBe(4);
            expect(result.current.atBatStatus.isFinished).toBe(true);

            expect(result.current.atBatRecords[0].atBatEndOutcome).toBe('保送');
        });

        it('當打擊結果為 "打擊出去" 時，該球應被標記為 atBatEndOutcome="打擊出去" 且 isFinished=true', () => {
            const rawRecords = [
                { id: '1', createdAt: new Date(1), result: '壞球' },
                { id: '2', createdAt: new Date(2), result: '打擊出去' },
            ];

            const { result } = renderHook(() => useBaseballLogic(rawRecords));
            expect(result.current.atBatStatus.isFinished).toBe(true);
            expect(result.current.atBatRecords[0].atBatEndOutcome).toBe('打擊出去');
        });
    });

    describe('【打席結束後的防呆】', () => {
        it('當打席已經結束 (例如已遭三振)，雖然傳入了多餘的後續球數，其 strikes 和 balls 都不應繼續累加，只會維持三振當下的球數', () => {
            const rawRecords = [
                { id: '1', createdAt: new Date(1), result: '好球' },
                { id: '2', createdAt: new Date(2), result: '好球' },
                { id: '3', createdAt: new Date(3), result: '好球' },   // 三振
                { id: '4', createdAt: new Date(4), result: '壞球' },   // 多餘的資料
                { id: '5', createdAt: new Date(5), result: '打擊出去' } // 多餘的資料
            ];

            const { result } = renderHook(() => useBaseballLogic(rawRecords));

            expect(result.current.atBatStatus.strikes).toBe(3);
            expect(result.current.atBatStatus.balls).toBe(0);
            expect(result.current.atBatStatus.isFinished).toBe(true);

            // 多餘資料的 runningStrikes/Balls 必須維持結束當下的值
            const extraBadBall = result.current.atBatRecords.find(r => r.id === '4');
            expect(extraBadBall.runningStrikes).toBe(3);
            expect(extraBadBall.runningBalls).toBe(0);
        });
    });
});
