# 測試報告：authService_report.md

## 1. 測試目標與範圍
- **測試對象**：`src/services/authService.js`
- **覆蓋功能**：Google 登入/帳號綁定、Email 註冊/登入（含驗證狀態檢查）、個人資料修改、匿名用戶登出限制。

## 2. 測試環境設定
- **Mock 策略**: 
  - Mock `@react-native-google-signin/google-signin`。
  - Mock `firebase/auth` 所有的認證方法。
  - 手動切換 `auth.currentUser` 狀態以測試不同場景。

## 3. 測試案例與結果
- **【Google 登入流程】**
  - [x] Google 登入並成功綁定匿名帳號
  - [x] Google 帳號既有資料時切換登入
- **【Email 登入與註冊】**
  - [x] Email 登入驗證檢查 - 未驗證應強制登出
  - [x] Email 註冊錯誤處理 (重複 Email)
- **【個人資料管理】**
  - [x] 更新顯示名稱
- **【登出邏輯】**
  - [x] 匿名用戶禁止登出 (回傳 false)

## 4. 執行日誌快照
```text
PASS tests/services/authService.test.js
  authService 測試
    【Google 登入流程】
      ✓ Google 登入並成功綁定匿名帳號 (16 ms)
      ✓ Google 帳號既有資料時切換登入 (1 ms)
    【Email 登入與註冊】
      ✓ Email 登入驗證檢查 - 未驗證應登出
      ✓ Email 註冊錯誤處理 (7 ms)
    【個人資料管理】
      ✓ 更新顯示名稱 (1 ms)
    【登出邏輯】
      ✓ 匿名用戶禁止登出 (2 ms)
```

## 5. 結論與覆蓋率概述
`authService` 的關鍵流程運作正常。特別驗證了安全性邏輯（如未驗證 Email 強制登出）與帳號升級邏輯（匿名轉 Google）。所有外部的原生套件與 Firebase 服務均已正確隔離。
