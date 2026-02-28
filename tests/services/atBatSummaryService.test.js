// Mock Firebase Firestore early to prevent ESM issues
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    writeBatch: jest.fn(),
    doc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    serverTimestamp: jest.fn(),
}));

jest.mock('../../src/services/firebaseService', () => ({
    db: {},
    firebaseStatus: {
        isReady: true,
        BATTING_RECORDS_PATH: 'records',
        AT_BAT_SUMMARY_PATH: 'summaries'
    }
}));

import { saveAtBatSummaryAndClearRecords, getAtBatHistory, deleteAtBatSummary, updateAtBatSummaryPitches } from '../../src/services/atBatSummaryService';
import { db, firebaseStatus } from '../../src/services/firebaseService';
import { collection, addDoc, updateDoc, deleteDoc, writeBatch, doc, onSnapshot, query, where } from 'firebase/firestore';

describe('atBatSummaryService 測試', () => {
    const mockUser = { uid: 'user_123' };
    const mockSummaryData = { atBatLabel: 'Test' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【彙整與清除】', () => {
        it('成功彙整並清空紀錄', async () => {
            const mockBatch = {
                delete: jest.fn(),
                commit: jest.fn().mockResolvedValue()
            };
            writeBatch.mockReturnValue(mockBatch);

            await saveAtBatSummaryAndClearRecords(mockSummaryData, mockUser, ['r1', 'r2']);

            expect(addDoc).toHaveBeenCalled();
            expect(mockBatch.delete).toHaveBeenCalledTimes(2);
            expect(mockBatch.commit).toHaveBeenCalled();
        });

        it('無紀錄時僅寫入摘要', async () => {
            const mockBatch = { delete: jest.fn(), commit: jest.fn() };
            writeBatch.mockReturnValue(mockBatch);
            await saveAtBatSummaryAndClearRecords(mockSummaryData, mockUser, []);
            expect(addDoc).toHaveBeenCalled();
            expect(mockBatch.delete).not.toHaveBeenCalled();
        });
    });

    describe('【讀取歷史摘要】', () => {
        it('根據 userId 監聽歷史紀錄', () => {
            const setRecords = jest.fn();
            const setLoading = jest.fn();

            getAtBatHistory('user_123', setRecords, setLoading);

            expect(where).toHaveBeenCalledWith('userId', '==', 'user_123');
            expect(onSnapshot).toHaveBeenCalled();
        });
    });

    describe('【修改與刪除】', () => {
        it('刪除打席摘要', async () => {
            await deleteAtBatSummary('doc_123');
            expect(deleteDoc).toHaveBeenCalled();
        });

        it('更新打席中的球種紀錄', async () => {
            const newRecords = [{ type: 'Fastball' }];
            await updateAtBatSummaryPitches('doc_123', newRecords);

            expect(updateDoc).toHaveBeenCalled();
        });
    });
});
