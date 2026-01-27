# LoginScreen 測試計畫

狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。

---

## [ ] 【Rendering】初始渲染正確性
**測試說明**：檢查畫面是否包含電子郵件、密碼輸入框以及登入按鈕。
**範例輸入**：Mount LoginScreen
**期待輸出**：
- 看到 "電子郵件" 輸入框
- 看到 "密碼" 輸入框
- 看到 "登入" 按鈕
- 預設標題為 "歡迎回來"

---

## [ ] 【Interaction】切換註冊/登入模式
**測試說明**：點擊切換文字，檢查按鈕與標題文字是否改變。
**範例輸入**：點擊 "還沒有帳號？點此註冊"
**期待輸出**：
- 標題變為 "建立新帳戶"
- 按鈕文字變為 "註冊"
- 切換文字變為 "已有帳號？點此登入"

---

## [ ] 【Validation】空值防呆測試
**測試說明**：未輸入帳號密碼時點擊按鈕，應跳出 Alert。
**範例輸入**：Email="", Password="", 點擊登入
**期待輸出**：
- 呼叫 Alert.alert
- 內容包含 "請輸入電子郵件和密碼"

---

## [ ] 【Logic】Email 登入呼叫
**測試說明**：輸入正確格式後點擊登入，應呼叫 `signInWithEmail`。
**範例輸入**：Email="test@example.com", Password="password123", Mode=Login
**期待輸出**：
- `authService.signInWithEmail` 被呼叫一次
- 參數為 ("test@example.com", "password123")

---

## [ ] 【Logic】Email 註冊呼叫
**測試說明**：切換至註冊模式，輸入資料後點擊註冊，應呼叫 `signUpWithEmail`。
**範例輸入**：Email="new@example.com", Password="password123", Mode=SignUp
**期待輸出**：
- `authService.signUpWithEmail` 被呼叫一次
- 參數為 ("new@example.com", "password123")

---

## [ ] 【Logic】Google 登入呼叫
**測試說明**：點擊 Google 圖示，應呼叫 `signInWithGoogle`。
**範例輸入**：點擊 Google SocialButton
**期待輸出**：
- `authService.signInWithGoogle` 被呼叫一次
