// src/utils/PitchUtils.js
// 工具函式庫
import { GRID_CELL_SIZE } from '../constants/GameConstants';

/**
 * 輔助函數: 將螢幕座標轉換為 1-9 號位
 */
export const getCellNumber = (absoluteX, absoluteY, gridLayout) => {
    if (!gridLayout || gridLayout.width === 0) {
        return { cellNumber: 0, isInside: false, relX: 0, relY: 0 }; 
    }

    // 當使用者點擊畫面時，獲得的是螢幕絕對座標 (absoluteX, absoluteY)。
    // 必須使用 gridLayout (九宮格位置資訊) 中的 x 和 y (九宮格的起點) 進行減法運算：
    const relX = absoluteX - gridLayout.x;
    const relY = absoluteY - gridLayout.y;
    
    const isInside = (relX >= 0 && relX < gridLayout.width && relY >= 0 && relY < gridLayout.height);

    let cellNumber = 0;
    
    if (isInside) {
        const cellWidth = gridLayout.width / GRID_CELL_SIZE;
        const cellHeight = gridLayout.height / GRID_CELL_SIZE;

        const col = Math.floor(relX / cellWidth); 
        const row = Math.floor(relY / cellHeight); 

        cellNumber = (row * GRID_CELL_SIZE) + col + 1;
    }
    
    return { 
        cellNumber, 
        isInside,
        relX: relX / gridLayout.width, 
        relY: relY / gridLayout.height
    };
};

// export { SCREEN_WIDTH, SCREEN_HEIGHT };