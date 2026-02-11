狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [x] 【UI Render】渲染基本資料表單
**範例輸入**：`initialForm = { displayName: 'John Doe', photoURL: null }`, `user = { email: 'test@example.com' }`
**期待輸出**：顯示標籤為「顯示名稱」的輸入框且值為 'John Doe'、顯示標籤為「電子郵件」的輸入框且值為 'test@example.com' 且為禁用狀態、顯示標籤為「基本資料」的 Section。

---

## [x] 【UI Render】渲染頭像區域
**範例輸入**：`photoURL = 'http://example.com/photo.jpg'`
**期待輸出**：顯示 Avatar.Image 並載入該 URL。

---

## [x] 【UI Render】安全性設定顯示邏輯 (Email 用戶)
**範例輸入**：`isGoogleUser = false`
**期待輸出**：顯示「安全性」Section 與「設定新密碼」輸入框。

---

## [x] 【UI Render】安全性設定顯示邏輯 (Google 用戶)
**範例輸入**：`isGoogleUser = true`
**期待輸出**：隱藏「安全性」Section 與「設定新密碼」輸入框。

---

## [x] 【Interaction】更新顯示名稱
**範例輸入**：在「顯示名稱」輸入框輸入 'New Name'
**期待輸出**：呼叫 `form.setDisplayName('New Name')`。

---

## [x] 【Interaction】更新密碼
**範例輸入**：在「設定新密碼」輸入框輸入 'newpassword123'
**期待輸出**：呼叫 `form.setPassword('newpassword123')`。

---

## [x] 【Interaction】點擊頭像觸發圖片選擇
**範例輸入**：點擊頭像區域
**期待輸出**：呼叫 `form.pickImage()`。

---

## [x] 【Interaction】點擊儲存按鈕
**範例輸入**：點擊「儲存變更」按鈕
**期待輸出**：呼叫 `actions.handleSave()`。

---

## [x] 【Interaction】點擊刪除帳號按鈕
**範例輸入**：點擊「刪除帳號」按鈕
**期待輸出**：呼叫 `actions.handleDeleteAccount()`。
