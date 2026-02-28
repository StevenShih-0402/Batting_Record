// tests/services/storageService.test.js
// Mock Firebase Storage early
jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('../../src/services/firebaseService', () => ({
    storage: { type: 'storage' },
}));

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
    })
);

import { uploadProfileImage } from '../../src/services/storageService';
import { uploadBytes, getDownloadURL } from 'firebase/storage';

describe('storageService 測試', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('【圖片上傳流程】', () => {
        it('成功上傳圖片並獲取 URL', async () => {
            uploadBytes.mockResolvedValue({});
            getDownloadURL.mockResolvedValue('https://fakeurl.com/avatar.jpg');

            const url = await uploadProfileImage('file://test.jpg', 'user123');

            expect(fetch).toHaveBeenCalledWith('file://test.jpg');
            expect(uploadBytes).toHaveBeenCalled();
            expect(getDownloadURL).toHaveBeenCalled();
            expect(url).toBe('https://fakeurl.com/avatar.jpg');
        });

        it('上傳失敗應拋出易讀錯誤', async () => {
            uploadBytes.mockRejectedValue(new Error('Storage Error'));

            await expect(uploadProfileImage('file://test.jpg', 'user123'))
                .rejects.toThrow('上傳頭像失敗，請稍後再試');
        });
    });
});
