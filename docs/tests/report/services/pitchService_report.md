# 測試報告：pitchService_report.md

## 1. 測試目標與範圍
- **測試對象**：`src/services/pitchService.js`
- **覆蓋功能**：即時投球紀錄監聽、單球紀錄 CRUD、身分驗證分發。

## 2. 測試環境設定
- **Mock 策略**: 
  - Mock `firebase/firestore` 與 `firebase/auth` 函式。
  - Mock `firebaseService` 狀態。

## 3. 測試案例與結果
- **【即時監聽與排序】**
  - [x] 讀取紀錄並觸發 onSnapshot (驗證 Query 參數與 userId 條件)
- **【CRUD 操作】**
  - [x] 存儲新球紀錄
  - [x] 更新紀錄
  - [x] 刪除紀錄

## 4. 執行日誌快照
```text
PASS tests/services/pitchService.test.js
  pitchService 測試
    【即時監聽與排序】
      ✓ 讀取紀錄並觸發 onSnapshot (2 ms)
    【CRUD 操作】
      ✓ 存儲新球紀錄
      ✓ 更新紀錄
      ✓ 刪除紀錄
```

## 5. 結論與覆蓋率概述
`pitchService` 通過核心 CRUD 測試，確認在新增投球時能正確夾帶 `userId` 與 `serverTimestamp`。監聽邏輯則確保了在 StrikeZone 模式下能準確連動相應的資料集。
