// src/constants/GameConstants.js
const DOT_SIZE = 28
const GRID_CELL_SIZE = 3; 
const PITCH_TYPES_ZH = ['四縫線快速球', '變速球', '滑球', '橫掃球', '曲球', '伸卡球', '其他'];
const PITCH_RESULTS = ['好球', '壞球', '界外', '打擊出去']; 

const AT_BAT_END_OUTCOMES = [
    '三振', '保送', '一壘安打', '二壘安打', '三壘安打', '全壘打', 
    '犧牲觸擊', '犧牲飛球', '野手選擇', '失誤上壘', '觸身球', '界外球接殺出局',
    '一壘滾地球出局', '二壘滾地球出局', '三壘滾地球出局', '投手滾地球出局',
    '一壘平飛球出局', '二壘平飛球出局', '三壘平飛球出局', '投手平飛球出局',
    '一壘飛球出局', '二壘飛球出局', '三壘飛球出局', '外野飛球出局', 
];

export { 
    DOT_SIZE,
    GRID_CELL_SIZE, 
    PITCH_TYPES_ZH, 
    PITCH_RESULTS, 
    AT_BAT_END_OUTCOMES, 
};