// tests/services/pitchService.test.js
// Mock Firebase modules early
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    doc: jest.fn(),
    serverTimestamp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    signInAnonymously: jest.fn(),
    signInWithCustomToken: jest.fn(),
}));

jest.mock('../../src/services/firebaseService', () => ({
    db: {},
    auth: { currentUser: { uid: 'u1' } },
    firebaseStatus: {
        isReady: true,
        BATTING_RECORDS_PATH: 'records',
    }
}));

import { initAuthAndGetRecords, savePitchRecord, updatePitchRecord, deletePitchRecord } from '../../src/services/pitchService';
import { addDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

describe('pitchService 測試', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【即時監聽與排序】', () => {
        it('讀取紀錄並觸發 onSnapshot', () => {
            const setRecords = jest.fn();
            const setLoading = jest.fn();
            const mockUser = { uid: 'u1' };

            initAuthAndGetRecords(setRecords, setLoading, mockUser);

            expect(where).toHaveBeenCalledWith('userId', '==', 'u1');
            expect(onSnapshot).toHaveBeenCalled();
        });
    });

    describe('【CRUD 操作】', () => {
        it('存儲新球紀錄', async () => {
            const data = { pitchType: 'Fastball' };
            const mockUser = { uid: 'u1' };
            await savePitchRecord(data, mockUser);
            expect(addDoc).toHaveBeenCalled();
        });

        it('更新紀錄', async () => {
            await updatePitchRecord('id1', { speed: 95 });
            expect(updateDoc).toHaveBeenCalled();
        });

        it('刪除紀錄', async () => {
            await deletePitchRecord('id1');
            expect(deleteDoc).toHaveBeenCalled();
        });
    });
});
