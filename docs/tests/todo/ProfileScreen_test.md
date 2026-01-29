狀態：初始為 [ ]、完成為 [x]
注意：狀態只能在測試通過後由流程更新。
測試類型：前端元素、function 邏輯、Mock API、驗證權限...等

---

## [x] 【UI Render】訪客用戶顯示正確資訊
**範例輸入**：`user = { isAnonymous: true, uid: '123' }`
**期待輸出**：畫面顯示「訪客用戶」、顯示「登入 / 註冊帳戶」選項、不顯示「登出」與「編輯個人資料」。

---

## [x] 【UI Render】已登入用戶顯示正確資訊 (有頭貼)
**範例輸入**：`user = { isAnonymous: false, displayName: 'TestUser', photoURL: 'http://test.com/img.jpg', uid: '456' }`
**期待輸出**：畫面顯示「TestUser」、顯示 Avatar 圖片、顯示「編輯個人資料」、顯示「登出」。

---

## [x] 【UI Render】已登入用戶顯示正確資訊 (無頭貼)
**範例輸入**：`user = { isAnonymous: false, displayName: null, photoURL: null, uid: '789' }`
**期待輸出**：畫面顯示「未命名用戶」、顯示 Avatar Icon、顯示「編輯個人資料」。

---

## [x] 【UI Render】Email 未驗證顯示警告
**範例輸入**：`user = { isAnonymous: false, emailVerified: false }`
**期待輸出**：顯示「驗證電子郵件」選項。

---

## [x] 【Interaction】點擊登入導向 Login 頁面
**範例輸入**：訪客用戶點擊「登入 / 註冊帳戶」
**期待輸出**：呼叫 `navigation.navigate('Login')`。

---

## [x] 【Interaction】點擊編輯導向 EditProfile 頁面
**範例輸入**：已登入用戶點擊「編輯個人資料」
**期待輸出**：呼叫 `navigation.navigate('EditProfile')`。

---

## [x] 【Interaction】點擊登出執行 SignOut
**範例輸入**：已登入用戶點擊「登出」
**期待輸出**：呼叫 `signOut(auth)`，並顯示 Alert "已登出"。
