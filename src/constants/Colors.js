// src/constants/Colors.js
// 管理"變動性低，傳達資訊的顏色"。
const COLOR_STRIKE = '#FFD600'; 
const COLOR_BALL = '#00E676';   
const COLOR_OTHER = '#3eb2ffff';  
const COLOR_FOUL = '#d7d5d5ff';

export {
    COLOR_STRIKE,
    COLOR_BALL,
    COLOR_OTHER,
    COLOR_FOUL,
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