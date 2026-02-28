// tests/hooks/useAtBatRecords.test.js
import { renderHook, act } from '@testing-library/react-native';
import useAtBatRecords from '../../src/hooks/useAtBatRecords';

// Mock dependencies
import { useAuth } from '../../src/hooks/auth/useAuth';
import { usePitchData } from '../../src/hooks/api/usePitchData';
import { useBaseballLogic } from '../../src/hooks/business/useBaseballLogic';
import { formatAtBatData } from '../../src/utils/AtBatUtils';

jest.mock('../../src/hooks/auth/useAuth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../src/hooks/api/usePitchData', () => ({
    usePitchData: jest.fn(),
}));

jest.mock('../../src/hooks/business/useBaseballLogic', () => ({
    useBaseballLogic: jest.fn(),
}));

jest.mock('../../src/utils/AtBatUtils', () => ({
    formatAtBatData: jest.fn(),
}));

describe('useAtBatRecords 測試', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【整合狀態邏輯】', () => {
        it('組件初始化時，應正確回傳 authReady、loading、運算後的 records 以及 status', () => {
            useAuth.mockReturnValue({ user: { uid: 'user123' }, isReady: true });
            usePitchData.mockReturnValue({
                rawRecords: [],
                loading: false,
                handleSavePitch: jest.fn(),
                handleDeletePitch: jest.fn(),
                handleUpdatePitch: jest.fn(),
                handleSaveSummary: jest.fn(),
            });
            useBaseballLogic.mockReturnValue({
                atBatRecords: [{ id: 'record1' }],
                atBatStatus: { strikes: 0, balls: 0, outs: 0 },
            });

            const { result } = renderHook(() => useAtBatRecords());

            expect(result.current.userReady).toBe(true);
            expect(result.current.loading).toBe(false);
            expect(result.current.atBatRecords).toEqual([{ id: 'record1' }]);
            expect(result.current.atBatStatus).toEqual({ strikes: 0, balls: 0, outs: 0 });
        });

        it('應將 usePitchData 提供的操作方法 (保存、刪除、更新球數) 正確對外暴露', () => {
            const mockSavePitch = jest.fn();
            const mockDeletePitch = jest.fn();
            const mockUpdatePitch = jest.fn();

            useAuth.mockReturnValue({ user: null, isReady: false });
            usePitchData.mockReturnValue({
                rawRecords: [],
                loading: true,
                handleSavePitch: mockSavePitch,
                handleDeletePitch: mockDeletePitch,
                handleUpdatePitch: mockUpdatePitch,
                handleSaveSummary: jest.fn(),
            });
            useBaseballLogic.mockReturnValue({ atBatRecords: [], atBatStatus: {} });

            const { result } = renderHook(() => useAtBatRecords());

            expect(result.current.handleSavePitch).toBe(mockSavePitch);
            expect(result.current.handleDeletePitch).toBe(mockDeletePitch);
            expect(result.current.handleUpdatePitch).toBe(mockUpdatePitch);
        });
    });

    describe('【資料轉換與提交流程 (handleSaveSummaryAction)】', () => {
        it('呼叫 handleSaveSummary 時，應透過 formatAtBatData 正確組裝 Payload 並傳遞給 baseSaveSummary', async () => {
            const mockBaseSaveSummary = jest.fn().mockResolvedValue(true);

            useAuth.mockReturnValue({ user: { uid: 'u1' }, isReady: true });
            usePitchData.mockReturnValue({
                rawRecords: [],
                loading: false,
                handleSaveSummary: mockBaseSaveSummary,
            });

            const mockAtBatRecords = [{ id: 'p1' }];
            useBaseballLogic.mockReturnValue({ atBatRecords: mockAtBatRecords, atBatStatus: {} });

            const formattedPayload = { title: 'Test', note: 'Note' };
            formatAtBatData.mockReturnValue(formattedPayload);

            const { result } = renderHook(() => useAtBatRecords());

            const uiData = {
                atBatTitle: 'Test Title',
                summaryNote: 'Test Note',
                customSummaryValues: { field1: 'val1' },
            };

            let saveResult;
            await act(async () => {
                saveResult = await result.current.handleSaveSummary(uiData);
            });

            // 驗證 formatAtBatData 有被正確呼叫
            expect(formatAtBatData).toHaveBeenCalledWith(
                'Test Title',
                'Test Note',
                mockAtBatRecords,
                { field1: 'val1' }
            );

            // 驗證 baseSaveSummary 被呼叫並傳入加工後的 payload
            expect(mockBaseSaveSummary).toHaveBeenCalledWith(formattedPayload);

            // 驗證回傳值
            expect(saveResult).toBe(true);
        });

        it('當 baseSaveSummary 成功時，應回報正確的結果', async () => {
            const mockBaseSaveSummary = jest.fn().mockResolvedValue(false);

            useAuth.mockReturnValue({ user: { uid: 'u1' }, isReady: true });
            usePitchData.mockReturnValue({
                rawRecords: [],
                loading: false,
                handleSaveSummary: mockBaseSaveSummary,
            });
            useBaseballLogic.mockReturnValue({ atBatRecords: [], atBatStatus: {} });
            formatAtBatData.mockReturnValue({});

            const { result } = renderHook(() => useAtBatRecords());

            let saveResult;
            await act(async () => {
                saveResult = await result.current.handleSaveSummary({});
            });

            expect(saveResult).toBe(false);
        });
    });
});
