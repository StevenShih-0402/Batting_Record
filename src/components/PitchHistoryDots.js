// src/components/PitchHistoryDots.js
// 邏輯元件，渲染九宮格上的歷史球點
import React, { memo } from 'react';
import Dot from './common/Dot';
import { getColorByResult } from '../constants/Colors';

const PitchHistoryDots = ({ records, pitchZoneHeight, gridLayout }) => {
    if (!pitchZoneHeight || !gridLayout || !records || records.length === 0) return null;

    const gridW = gridLayout.width;
    const gridH = gridLayout.height;

    // --- 偵錯用：檢查畫布尺寸 ---
    console.log(`[Dots畫布] 寬: ${gridW.toFixed(1)}, 高: ${gridH.toFixed(1)}`);

    return (
        <>
            {records.map((record, index) => {
                if (typeof record.gridX !== 'number' || typeof record.gridY !== 'number') return null;

                // 偵錯：看看從資料庫拿回來的 record 到底長怎樣
                console.log(`球點檢查 [ID: ${record.id.slice(-4)}]:`, { 
                    rawX: record.gridX, 
                    rawY: record.gridY 
                });

                // 計算絕對座標 (相對於九宮格畫布左上角)
                const finalX = record.gridX * gridW;
                const finalY = record.gridY * gridH;
                
                const pitchNumber = records.length - index;

                // --- 偵錯用：檢查每一顆球的計算過程 ---
                // 如果 finalX 永遠是 0，代表 record.gridX 存入的是 0
                console.log(`第 ${pitchNumber} 球: 原始比例(${record.gridX.toFixed(2)}, ${record.gridY.toFixed(2)}) -> 畫布像素(${finalX.toFixed(1)}, ${finalY.toFixed(1)})`);

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

export default memo(PitchHistoryDots);