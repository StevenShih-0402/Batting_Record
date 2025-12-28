// src/components/PitchHistoryDots.js
// 邏輯組件，負責計算現有的 records 該如何配合目前的 gridLayout 縮放比例，算出每一顆球的絕對位移後再進行渲染。
import React, { memo } from 'react';
import Dot from './common/Dot';
import { Layout } from '../constants/Layout';
import { getColorByResult } from '../constants/Colors';

const PitchHistoryDots = ({ records, pitchZoneHeight, gridLayout }) => {
    // 1. 安全檢查：如果還沒拿到佈局資訊，先不畫
    if (!pitchZoneHeight || !gridLayout || !records || records.length === 0) return null;

    // 2. 座標轉換常數 (與 PitchGrid 保持一致)
    const gridW = Layout.WINDOW.WIDTH * 0.7;
    const gridH = gridW * (4/3);
    const offsetX = (Layout.WINDOW.WIDTH - gridW) / 2;
    const offsetY = (pitchZoneHeight - gridH) / 2;

    // 3. 渲染球點清單
    return (
        // 隱形容器 (React Fragment)
        // 
        <>
            {records.map((record, index) => {
                // 檢查必要座標是否存在
                if (typeof record.gridX !== 'number' || typeof record.gridY !== 'number') return null;

                // 計算絕對座標
                const finalX = offsetX + record.gridX * gridW;
                const finalY = offsetY + record.gridY * gridH;
                
                // 計算這是第幾球 (從 1 開始)
                const pitchNumber = records.length - index;

                return (
                    <Dot
                        key={record.id}
                        x={finalX}
                        y={finalY}
                        color={getColorByResult(record.result, record.atBatEndOutcome)}
                        pitchIndex={pitchNumber}
                    />
                );
            })}
        </>
    );
};

// 使用 memo 避免不必要的重繪
// 除非「球數增加」或「螢幕旋轉（Layout 改變）」，否則這一整群球點都不會重新渲染，這對 React Native 的動畫順暢度非常有幫助。
export default memo(PitchHistoryDots);