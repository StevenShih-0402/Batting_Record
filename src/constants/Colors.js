// src/constants/Colors.js

// 變動性低的顏色，才會放在 constant；只要這個顏色是為了傳達資訊（例如「這是 Strike」，「這是 Ball」），而不是為了美化介面，就應該放在這裡。
const COLOR_STRIKE = '#FFC300'; 
const COLOR_BALL = '#38A3A5';   
const COLOR_OTHER = '#3498DB';  
const COLOR_FOUL = '#A9A9A9';

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