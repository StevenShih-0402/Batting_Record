// src/constants/GameConstants.js
// 管理"不會改變的固定數值"
const DOT_SIZE = 32
const GRID_CELL_SIZE = 3; 
const GRID_WIDTH_RATIO = 0.6;
const PITCH_TYPES_ZH = ['四縫線快速球', '變速球', '滑球', '橫掃球', '曲球', '伸卡球', '其他'];
const PITCH_RESULTS = ['好球', '壞球', '界外', '打擊出去']; 

// 迷你九宮格
const MINI_ZONE_WIDTH = 200;
const MINI_ZONE_HEIGHT = 250;
const MINI_BALL_SIZE = 24;

export { 
    DOT_SIZE,
    GRID_CELL_SIZE,
    GRID_WIDTH_RATIO, 
    PITCH_TYPES_ZH, 
    PITCH_RESULTS,
    MINI_ZONE_WIDTH,
    MINI_ZONE_HEIGHT,
    MINI_BALL_SIZE
};