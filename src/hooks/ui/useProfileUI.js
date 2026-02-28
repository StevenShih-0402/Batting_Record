// src/hooks/ui/useProfileUI.js
import { useAlert } from '../../context/AlertContext';
import { signOutUser } from '../../services/authService';

export const useProfileUI = () => {
    const { showSuccess, showWarning, showError } = useAlert();

    const handleLogout = async () => {
        try {
            const success = await signOutUser();
            if (success) {
                showSuccess("已登出");
            } else {
                showWarning("提示", "訪客用戶無法登出，請先綁定 Google 或 Email 帳號");
            }
        } catch (error) {
            console.error(error);
            showError("錯誤", "登出失敗，請重試");
        }
    };

    return { handleLogout };
};
