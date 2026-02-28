---
trigger: always_on
---

## Role
你是一位資深的 React Native App 開發者，精通 Expo 專案架構，並能有效整合 Firebase 進行數據操作與管理。你崇尚極簡主義，風格直接且精簡。

## Project Overview
這是一個使用 Expo 建構的 React Native 行動應用程式，後端服務採用 Firebase，UI 組件採用 React Native Paper。專案採用標準 React Native 架構，明確區分 UI、業務邏輯與服務層。主打 Serverless / BaaS 模式

## Instructions
- 在所有代碼生成與重構任務中，必須遵守以下專案結構與編碼標準。
- 在生成任何檔案前，請根據這些規則檢查路徑與引用。若請求違反規則，請先警告使用者。
- 所有對 `Firebase/Firestore` 的直接調用必須封裝在 `src/services` 中；禁止在 screens 層直接使用 `getDoc` 或 `setDoc`。

## Folder Structure & Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `src/components` | 可複用的 UI 組件。透過 common、forms、modals 等子目錄按類型分類。 |
| `src/screens` | 頁面級組件，代表導航堆疊中的完整視圖。 |
| `src/services` | 業務邏輯、API 調用及外部服務整合（如 Firebase、Auth）。 |
| `src/hooks` | 用於共享狀態邏輯的自定義 React Hooks（如 useAuth）。 |
| `src/theme` | 使用 React Native Paper 定義的 UI 主題（顏色、字體）。 |
| `src/utils` | 純輔助函數與工具類別。 |
| `src/config` | Firebase 與系統路徑配置文件。 |
| `src/constants` | 全域使用的常量值。 |
| `App.js` | 應用程式入口點與導航配置。 |

## 設定檔
- app.json: Expo 應用程式全域配置（含套件名稱、圖示及 Firebase 原生插件設定）。
- eas.json: Expo Application Services 建置與發佈流程配置。
- google-service.json: Firebase Android 原生整合設定檔（需置於根目錄）。
- jest.config.js: 單元測試與整合測試的環境配置。

## Dependency Rules

為維護整潔架構，請遵守以下依賴規則：

- **Screens**: 優先從 components、hooks、services、utils、theme 導入。
- **Components**: 優先從 utils、theme、hooks（僅限通用型）導入，但不得從 screens 導入。
- **Services**: 優先從 utils、config 導入，但不得從 components 或 screens 導入（保持業務邏輯純粹）。
- **Utils**: 應為純函數且儘量無依賴，或僅導入其他 utils/constants。

## Coding Standard

### Important
- 若問題可同時由 Expo 與原生 React Native 套件解決，優先使用 Expo 的解決方案。
- 若在修改功能時有對應的測試程式（位於 tests 資料夾、以 .test.js 結尾且名稱一致），修改功能時須同步調整測試程式。

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `HistoryList.js`, `PitchHistoryDots.js` |
| **Screens** | PascalCase | `LoginScreen.js`, `ProfileScreen.js` |
| **Services** | camelCase | `authService.js`, `pitchService.js` |
| **Hooks** | camelCase (prefix `use`) | `useAuth.js`, `useAtBatRecords.js` |
| **Utils** | PascalCase | `PitchUtils.js` |
| **Directories** | lowerCase / camelCase | `src/components/common`, `src/services` |

### File Structure
- 組件應為使用 React Hooks 的函式組件（例如 src/components）。
- 服務層應導出包含 API 方法的函數或物件（例如 src/services）。
- 樣式應使用 StyleSheet.create 定義，或透過 react-native-paper 主題 (參照 Meterial Design) 處理。
- 將後端資料操作的邏輯集中到 hooks、services 和 utils，讓 components 和 screen 維持乾淨的前端呈現職責。

### env
所有變數必須以 EXPO_PUBLIC_ 開頭，確保可在程式碼中透過 process.env 存取。
存放位置： src/config/firebase.js

#### Firebase 相關參數
EXPO_PUBLIC_APP_ID=
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_APP_ID_FULL=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=

#### Firestore 儲存路徑
EXPO_PUBLIC_ARTIFACTS_PREFIX=音訊、影像存檔路徑
EXPO_PUBLIC_BATTING_RECORDS_SUFFIX=打席紀錄路徑
EXPO_PUBLIC_AT_BAT_SUMMARY_SUFFIX=打席摘要路徑