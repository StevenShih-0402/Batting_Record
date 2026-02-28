# useHistoryFilter 測試規劃

**目標路徑:** `src/hooks/ui/useHistoryFilter.js`
**測試路徑:** `tests/hooks/ui/useHistoryFilter.test.js`

## 測試範圍 (Hooks)

`useHistoryFilter` 負責篩選 `HistoryScreen` 的打席紀錄列表。它接收原始的 `history` 陣列，並提供 `applyFilters` 與 `clearFilters` 方法來變更篩選條件 (`filters`)。
該 Hook 核心在於其 `useMemo` 內的 `filteredHistory` 計算邏輯，其中包含五種條件的交集比對：標題 (含 outcome)、日期、球數、備註與自訂欄位。

### Mocking 策略
- 無外部依賴。純粹測試陣列過濾與字串/數值比對邏輯。

### 單元測試項目 (Unit Tests)

1. **【初始化與基礎操作】**
    - `初始狀態下，filters 應為全空值，isFilterActive 應為 false，filteredHistory 應等於傳入的 history`
    - `呼叫 applyFilters 傳入新條件時，應更新 filters，並將 isFilterActive 設為 true`
    - `呼叫 clearFilters 時，應重置 filters 回預設全空狀態，並將 isFilterActive 設為 false`

2. **【過濾邏輯：標題與結果 (Title/Outcome)】**
    - `當搜尋文字匹配 atBatLabel (忽略大小寫) 時，應保留該筆紀錄`
    - `當搜尋文字匹配 finalOutcome 時，應保留該筆紀錄`
    - `當標題與結果皆不匹配時，應過濾掉該筆紀錄`

3. **【過濾邏輯：日期 (Date)】**
    - `設定 startDate 後，應過濾掉 date 早於 startDate 的紀錄`
    - `設定 endDate 後，應過濾掉 date 晚於 endDate 的紀錄`
    - `同時設定 start 與 end 時，應只保留在區間內的紀錄`

4. **【過濾邏輯：球數 (Pitches)】**
    - `設定 minPitches 後，應過濾掉 totalPitches 小於設定值的紀錄`
    - `設定 maxPitches 後，應過濾掉 totalPitches 大於設定值的紀錄`
    - `當輸入無效數字時，應不報錯並忽略球數條件 (回傳所有紀錄)`

5. **【過濾邏輯：備註與自訂欄位 (Note & CustomFields)】**
    - `設定 note 後，應只保留 summaryNote 包含該字串的紀錄 (忽略大小寫)`
    - `設定 customFields 條件後，應只保留 customSummaryValues 對應 key 之 value 包含搜尋字串的紀錄`

6. **【多條件複合過濾】**
    - `多個條件同時存在時 (e.g. title + maxPitches)，必須全部滿足 (AND 邏輯) 才可保留紀錄`
