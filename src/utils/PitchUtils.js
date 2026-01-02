// src/utils/PitchUtils.js
import { GRID_CELL_SIZE } from '../constants/GameConstants'; // 假設這是 3

/**
 * 將螢幕座標轉換為九宮格資訊
 * @param {number} pageX - 觸摸點在螢幕上的 X
 * @param {number} pageY - 觸摸點在螢幕上的 Y
 * @param {object} gridLayout - 包含 x, y, width, height 的佈局資訊
 */
export const getCellNumber = (pageX, pageY, gridLayout) => {
    if (!gridLayout || gridLayout.width === 0 || gridLayout.height === 0) {
        return { cellNumber: 0, isInside: false, relX: 0, relY: 0 }; 
    }

    const { x, y, width, height } = gridLayout;

    // 1. 算出相對九宮格左上角的「像素位移」
    // 25 是常見的 Android StatusBar 高度，需額外扣除，否則球看起來會出現在點擊位置偏下方
    const relX_px = pageX - x;
    const relY_px = pageY - y - 25;

    // 2. 判定是否在九宮格範圍內 (使用像素判定最直覺)
    const isInside = (
        relX_px >= 0 && 
        relX_px <= width && 
        relY_px >= 0 && 
        relY_px <= height
    );

    let cellNumber = 0;
    
    if (isInside) {
        // 算出每一格的寬高像素
        const cellWidth = width / GRID_CELL_SIZE;
        const cellHeight = height / GRID_CELL_SIZE;

        // 算出點擊位置是在第幾欄、第幾列 (0, 1, 2)
        // 使用 clamp 確保數值不會因為浮點數誤差變成 3
        const col = Math.min(Math.floor(relX_px / cellWidth), GRID_CELL_SIZE - 1); 
        const row = Math.min(Math.floor(relY_px / cellHeight), GRID_CELL_SIZE - 1); 

        // 換算成 1~9 號位
        cellNumber = (row * GRID_CELL_SIZE) + col + 1;
    }
    
    // 3. 轉換成比例 (0.0 ~ 1.0) 回傳給 Hook 存入資料庫
    const relX_ratio = relX_px / width;
    const relY_ratio = relY_px / height;

    return { 
        cellNumber, 
        isInside,
        relX: relX_ratio, // 這裡是比例值
        relY: relY_ratio,
    };
};