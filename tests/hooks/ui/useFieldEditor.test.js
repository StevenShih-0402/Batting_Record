// tests/hooks/ui/useFieldEditor.test.js
import { renderHook, act } from '@testing-library/react-native';
import { useFieldEditor } from '../../../src/hooks/ui/useFieldEditor';

describe('useFieldEditor 測試', () => {
    describe('【初始化與重置邏輯】', () => {
        it('初始化時，預設狀態應為空字串或預設值', () => {
            const { result } = renderHook(() => useFieldEditor());

            expect(result.current.label).toBe('');
            expect(result.current.type).toBe('text'); // default is text
            expect(result.current.newOption).toBe('');
            expect(result.current.options).toEqual([]);
        });

        it('呼叫 reset 時，應將所有狀態恢復為預設值', () => {
            const { result } = renderHook(() => useFieldEditor());

            act(() => {
                result.current.setLabel('測試欄位');
                result.current.setType('dropdown');
                result.current.setNewOption('選項 1');
            });
            act(() => {
                result.current.addOption(); // trigger to add Options
            });

            // 確定修改過
            expect(result.current.label).toBe('測試欄位');
            expect(result.current.type).toBe('dropdown');
            expect(result.current.options).toEqual(['選項 1']);

            act(() => {
                result.current.reset();
            });

            expect(result.current.label).toBe('');
            expect(result.current.type).toBe('text');
            expect(result.current.newOption).toBe('');
            expect(result.current.options).toEqual([]);
        });
    });

    describe('【下拉選項管理 (addOption/removeOption)】', () => {
        it('當 newOption 有效且不重複時，呼叫 addOption 應成功加入 options 陣列並清空 newOption', () => {
            const { result } = renderHook(() => useFieldEditor());

            act(() => {
                result.current.setNewOption('   藍色   '); // test trim
            });
            act(() => {
                result.current.addOption();
            });

            expect(result.current.options).toEqual(['藍色']);
            expect(result.current.newOption).toBe('');
        });

        it('當 newOption 為空字串或只有空白時，呼叫 addOption 不應修改 options 陣列', () => {
            const { result } = renderHook(() => useFieldEditor());

            act(() => {
                result.current.setNewOption('   '); // empty space
            });
            act(() => {
                result.current.addOption();
            });

            expect(result.current.options).toEqual([]);
            // 實際操作如果被 return 的話這時候 newOption 會維持原先輸入(不為 '')

            // 更為精準測試: hook不負責重置無效的 newOption
            // result.current.newOption 狀態依然是 '   '
        });

        it('當 newOption 的值已存在於 options 時，呼叫 addOption 不應修改 options 陣列 (避免重複)', () => {
            const { result } = renderHook(() => useFieldEditor());

            act(() => {
                result.current.setNewOption('紅色');
            });
            act(() => {
                result.current.addOption();
            });

            expect(result.current.options).toEqual(['紅色']);

            act(() => {
                result.current.setNewOption('  紅色  '); // trim 後一樣會重複
            });
            act(() => {
                result.current.addOption();
            });

            expect(result.current.options).toEqual(['紅色']);
        });

        it('呼叫 removeOption 傳入指定索引時，應將該索引的選項從 options 陣列中移除', () => {
            const { result } = renderHook(() => useFieldEditor());

            act(() => {
                result.current.setNewOption('1');
            });
            act(() => {
                result.current.addOption();
            });
            act(() => {
                result.current.setNewOption('2');
            });
            act(() => {
                result.current.addOption();
            });
            act(() => {
                result.current.setNewOption('3');
            });
            act(() => {
                result.current.addOption();
            });

            expect(result.current.options).toEqual(['1', '2', '3']);

            // 移除索引 1 (2)
            act(() => {
                result.current.removeOption(1);
            });

            expect(result.current.options).toEqual(['1', '3']);
        });
    });
});
