// src/constants/Colors.js
// 管理"變動性低，傳達資訊的顏色"。
const COLOR_STRIKE = '#FFD600';
const COLOR_BALL = '#00E676';
const COLOR_OTHER = '#3eb2ffff';
const COLOR_FOUL = '#d7d5d5ff';

// 預設提供的主題色選項
const THEME_COLORS = [
    '#E81416', // 紅色 (Red)
    '#EF2B7C', // 粉紅色 (Fuchsia)
    '#FEF250', // 黃色 (Lemon Yellow)
    '#339C5E', // 綠色 (Kelly Green)
    '#00E5FF', // 預設青色 (Cyan)
    '#B026FF', // 紫色 (Neon Purple)
    '#F2D3BC', // 膚色 (Skin)
    '#FFCED5', // 淺粉紅色 (Light Pink)
    '#F8F1AE', // 淺黃色 (Pastel Yellow)
    '#75D09A', // 淺綠色 (Mint Green)
    '#ADD8E6', // 淺藍色 (Light Blue)
    '#DCD0FF', // 淺紫色 (Lilac)
];

export {
    COLOR_STRIKE,
    COLOR_BALL,
    COLOR_OTHER,
    COLOR_FOUL,
    THEME_COLORS,
};

// 輔助函式也放在這裡，方便取用
export const getColorByResult = (result, atBatEndOutcome) => {
    if (atBatEndOutcome === '保送') return COLOR_BALL;
    if (atBatEndOutcome === '三振') return COLOR_STRIKE;
    if (result === '壞球') return COLOR_BALL;
    if (result === '好球') return COLOR_STRIKE;
    if (result === '界外') return COLOR_FOUL;
    return COLOR_OTHER;
};