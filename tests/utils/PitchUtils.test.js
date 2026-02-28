// tests/utils/PitchUtils.test.js
import { getCellNumber } from '../../src/utils/PitchUtils';

describe('PitchUtils 測試', () => {
    const gridLayout = { x: 100, y: 100, width: 300, height: 300 }; // Cell size = 100x100

    describe('【坐標轉換與九宮格判定】', () => {
        it('九宮格正中心點', () => {
            // 中心點: x=250, y=250. 
            // 補償: y - 25 = 225. 
            // relX = (250-100)/300 = 0.5
            // relY = (250-100-25)/300 = 125/300 = 0.4166...
            // row = floor(125/100) = 1, col = floor(150/100) = 1.
            // cell = (1*3)+1+1 = 5.
            const result = getCellNumber(250, 275, gridLayout); // pageY = 250 + 25 = 275 to keep legacy logic center
            expect(result.cellNumber).toBe(5);
            expect(result.isInside).toBe(true);
            expect(result.relX).toBeCloseTo(0.5);
            expect(result.relY).toBeCloseTo(0.5);
        });

        it('左上角頂點 (Cell 1)', () => {
            // pageX=100, pageY=125 (125-25=100=y)
            const result = getCellNumber(100, 125, gridLayout);
            expect(result.cellNumber).toBe(1);
            expect(result.isInside).toBe(true);
        });

        it('右下角頂點 (Cell 9)', () => {
            // pageX=400, pageY=425 (425-25=400=y+h)
            const result = getCellNumber(400, 425, gridLayout);
            expect(result.cellNumber).toBe(9);
            expect(result.isInside).toBe(true);
        });
    });

    describe('【範圍外判定】', () => {
        it('點擊在九宮格左側', () => {
            const result = getCellNumber(50, 150, gridLayout);
            expect(result.isInside).toBe(false);
            expect(result.cellNumber).toBe(0);
        });

        it('點擊在九宮格上方 (StatusBar 區域)', () => {
            const result = getCellNumber(150, 110, gridLayout); // 110-25 = 85 < 100
            expect(result.isInside).toBe(false);
        });
    });

    describe('【邊界條件與錯誤處理】', () => {
        it('無效的 Layout 資訊', () => {
            const result = getCellNumber(150, 150, null);
            expect(result).toEqual({ cellNumber: 0, isInside: false, relX: 0, relY: 0 });

            const result2 = getCellNumber(150, 150, { width: 0, height: 100 });
            expect(result2.isInside).toBe(false);
        });

        it('浮點數精確位移', () => {
            // relX_px = 100 (剛好到 cell 2)
            const result = getCellNumber(200, 150, gridLayout);
            expect(result.cellNumber).toBe(2);
        });
    });
});
