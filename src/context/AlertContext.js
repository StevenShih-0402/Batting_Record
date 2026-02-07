// src/context/AlertContext.js
// 統一處理所有警告/錯誤訊息事件
import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: [],
        type: 'info', // info, success, warning, error
    });

    const hideAlert = useCallback(() => {
        setAlertState((prev) => ({ ...prev, visible: false }));
    }, []);

    const showAlert = useCallback((title, message, buttons = [], type = 'info') => {
        // 如果沒有提供按鈕，預設一個 "確定" 按鈕
        const finalButtons = buttons.length > 0 ? buttons : [
            { text: '確定', onPress: hideAlert }
        ];

        setAlertState({
            visible: true,
            title,
            message,
            buttons: finalButtons,
            type,
        });
    }, [hideAlert]);

    // 快捷方法
    const showSuccess = useCallback((title, message, buttons) => showAlert(title, message, buttons, 'success'), [showAlert]);
    const showError = useCallback((title, message, buttons) => showAlert(title, message, buttons, 'error'), [showAlert]);
    const showWarning = useCallback((title, message, buttons) => showAlert(title, message, buttons, 'warning'), [showAlert]);
    const showInfo = useCallback((title, message, buttons) => showAlert(title, message, buttons, 'info'), [showAlert]);
    const showMailSend = useCallback((title, message, buttons) => showAlert(title, message, buttons, 'mail_send'), [showAlert]);

    // 兼容原版 Alert.alert 的介面 (盡量模擬)
    const alert = useCallback((title, message, buttons, options) => {
        // 這裡可以根據 title 或 message 的內容來自動判斷 type，或是預設為 warning/info
        // 為了簡單起見，預設為 warning，因為 Alert.alert 通常用於警告或提示
        showAlert(title, message, buttons, 'warning');
    }, [showAlert]);

    return (
        <AlertContext.Provider value={{
            alertState,
            showAlert,
            hideAlert,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            showMailSend,
            alert // 為了方便遷移，提供一個名稱為 alert 的方法
        }}>
            {children}
        </AlertContext.Provider>
    );
};
