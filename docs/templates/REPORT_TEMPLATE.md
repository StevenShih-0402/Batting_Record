# 測試報告：{{FILE_NAME}}

## 1. 測試目標
{{TEST_GOAL}}

## 2. 測試環境
- **Component**: `{{COMPONENT_NAME}}`
- **Path**: `{{FILE_PATH}}`
- **Tools**: Jest, React Native Testing Library
- **Mocks**: 
{{MOCK_LIST}}

## 3. 測試案例與結果 (Test Cases & Results)

### 3.1 前端元素 (UI Elements)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
{{UI_TEST_CASES}}

### 3.2 互動邏輯 (Interaction Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
{{INTERACTION_TEST_CASES}}

### 3.3 業務邏輯 (Business Logic)
| ID | 描述 | 預期結果 | 狀態 |
|---|---|---|---|
{{BUSINESS_TEST_CASES}}

## 4. 執行紀錄
- **執行時間**: {{EXECUTION_DATE}}
- **重試次數**: {{RETRY_COUNT}}
- **最終結果**: {{FINAL_STATUS}} (Success / Failed)
- **備註**: 
{{REMARKS}}