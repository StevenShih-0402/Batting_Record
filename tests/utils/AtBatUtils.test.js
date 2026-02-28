// tests/utils/AtBatUtils.test.js
import { formatAtBatData } from '../../src/utils/AtBatUtils';

describe('AtBatUtils 測試', () => {

    describe('【基本功能】', () => {
        it('傳入完整資料應正確格式化', () => {
            const records = [
                { runningBalls: 0, runningStrikes: 2, result: 'S', pitchType: 'Fastball', speed: 90, createdAt: new Date('2024-01-01T10:00:01Z') },
                { runningBalls: 0, runningStrikes: 1, result: 'S', pitchType: 'Fastball', speed: 88, createdAt: new Date('2024-01-01T10:00:00Z') }
            ];
            const data = formatAtBatData('Test At-Bat', 'Nice game', records);

            expect(data.atBatLabel).toBe('Test At-Bat');
            expect(data.summaryNote).toBe('Nice game');
            expect(data.totalPitches).toBe(2);
            expect(data.finalOutcome).toBe('已彙整');
            expect(data.pitchRecords[0].speed).toBe(90);
        });

        it('未傳入標題應使用預設值', () => {
            const data = formatAtBatData('', '', []);
            expect(data.atBatLabel).toBe('未命名打席');
        });
    });

    describe('【邊界條件與極端值】', () => {
        it('空紀錄處理', () => {
            const data = formatAtBatData('Test', 'Note', []);
            expect(data.totalPitches).toBe(0);
            expect(data.finalBalls).toBe(0);
            expect(data.finalStrikes).toBe(0);
            expect(data.pitchRecords).toEqual([]);
        });

        it('無效紀錄對象處理', () => {
            const records = [null, undefined, {}];
            const data = formatAtBatData('Test', 'Note', records);
            expect(data.pitchRecords.length).toBe(3);
            expect(data.pitchRecords[0].speed).toBe(0);
            expect(data.pitchRecords[0].cellNumber).toBe(0);
        });
    });

    describe('【結果邏輯判斷】', () => {
        it('三振判斷', () => {
            const records = [{ runningBalls: 1, runningStrikes: 3 }];
            const data = formatAtBatData('Test', 'Note', records);
            expect(data.finalOutcome).toBe('三振');
        });

        it('保送判斷', () => {
            const records = [{ runningBalls: 4, runningStrikes: 2 }];
            const data = formatAtBatData('Test', 'Note', records);
            expect(data.finalOutcome).toBe('保送');
        });
    });

    describe('【時間處理】', () => {
        it('開始時間取自第一球', () => {
            const startTime = new Date('2024-01-01T08:00:00Z');
            const records = [
                { createdAt: new Date('2024-01-01T08:00:05Z') },
                { createdAt: startTime }
            ];
            const data = formatAtBatData('Test', 'Note', records);
            expect(data.startAt).toEqual(startTime);
        });
    });
});
