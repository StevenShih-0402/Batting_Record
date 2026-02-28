# 測試報告：PitchUtils_report.md

## 1. 測試目標與範圍
- **測試對象**：`src/utils/PitchUtils.js`
- **覆蓋功能**：九宮格座標轉換、StatusBar 補償計算、範圍外判定、邊界條件處理。

## 2. 測試環境設定
- **測試框架**: Jest
- **執行環境**: Node.js / Jest-Expo

## 3. 測試案例與結果
- **【坐標轉換與九宮格判定】**
  - [x] 九宮格正中心點
  - [x] 左上角頂點 (Cell 1)
  - [x] 右下角頂點 (Cell 9)
- **【範圍外判定】**
  - [x] 點擊在九宮格左側
  - [x] 點擊在九宮格上方 (StatusBar 區域)
- **【邊界條件與錯誤處理】**
  - [x] 無效的 Layout 資訊
  - [x] 浮點數精確位移

## 4. 執行日誌快照
```text
PASS tests/utils/PitchUtils.test.js
  PitchUtils 測試
    【坐標轉換與九宮格判定】
      ✓ 九宮格正中心點 (2 ms)
      ✓ 左上角頂點 (Cell 1) (1 ms)
      ✓ 右下角頂點 (Cell 9)
    【範圍外判定】
      ✓ 點擊在九宮格左側 (1 ms)
      ✓ 點擊在九宮格上方 (StatusBar 區域)
    【邊界條件與錯誤處理】
      ✓ 無效的 Layout 資訊 (1 ms)
      ✓ 浮點數精確位移
```

## 5. 結論與覆蓋率概述
`PitchUtils` 通過所有坐標轉換測試。座標比例與 cellNumber 的計算與預期 100% 吻合，且能正確處理 -25px 的狀態列補償位移。此工具函數能穩定提供給 StrikeZone 繪圖使用。
