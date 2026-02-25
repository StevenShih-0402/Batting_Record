// src/context/PreferencesContext.js
// 管理使用者偏好設定 (球種、自訂欄位、主題色)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { db } from '../services/firebaseService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PITCH_TYPES_ZH } from '../constants/GameConstants';
import customTheme from '../theme/PaperTheme';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
    const { user } = useAuth();

    // 預設值
    const [pitchTypes, setPitchTypes] = useState(PITCH_TYPES_ZH);
    const [primaryColor, setPrimaryColor] = useState(customTheme.colors.primary);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * 自訂打席備註欄位 (顯示在 PitchInputModal，儲存於每顆球的紀錄)
     * schema: { id: string, label: string, type: 'text'|'dropdown', options: string[] }
     */
    const [customPitchFields, setCustomPitchFields] = useState([]);

    /**
     * 自訂打席彙整欄位 (顯示在 EndAtBatModal，儲存於打席彙整)
     * schema: { id: string, label: string, type: 'text'|'dropdown', options: string[] }
     */
    const [customSummaryFields, setCustomSummaryFields] = useState([]);

    // 載入使用者偏好
    useEffect(() => {
        const loadPreferences = async () => {
            if (user && !user.isAnonymous) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const prefs = data.preferences || {};

                        if (prefs.pitchTypes) setPitchTypes(prefs.pitchTypes);
                        if (prefs.primaryColor) setPrimaryColor(prefs.primaryColor);
                        if (prefs.customPitchFields) setCustomPitchFields(prefs.customPitchFields);
                        if (prefs.customSummaryFields) setCustomSummaryFields(prefs.customSummaryFields);
                    }
                } catch (error) {
                    console.error('無法載入使用者偏好設定:', error);
                }
            } else {
                // 訪客或未登入使用預設值
                setPitchTypes(PITCH_TYPES_ZH);
                setPrimaryColor(customTheme.colors.primary);
                setCustomPitchFields([]);
                setCustomSummaryFields([]);
            }
            setIsLoading(false);
        };

        loadPreferences();
    }, [user]);

    /**
     * 儲存偏好設定到 Firestore。
     * pitchResults 已移除，改使用固定常數 PITCH_RESULTS。
     */
    const savePreferences = async (
        newPitchTypes,
        newPrimaryColor,
        newCustomPitchFields,
        newCustomSummaryFields
    ) => {
        setPitchTypes(newPitchTypes);
        setPrimaryColor(newPrimaryColor);
        setCustomPitchFields(newCustomPitchFields);
        setCustomSummaryFields(newCustomSummaryFields);

        if (user && !user.isAnonymous) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(
                    userRef,
                    {
                        preferences: {
                            pitchTypes: newPitchTypes,
                            primaryColor: newPrimaryColor,
                            customPitchFields: newCustomPitchFields,
                            customSummaryFields: newCustomSummaryFields,
                        },
                    },
                    { merge: true }
                );
                return true;
            } catch (error) {
                console.error('無法儲存使用者偏好設定:', error);
                return false;
            }
        }
        return true; // 訪客只更新本地狀態
    };

    return (
        <PreferencesContext.Provider
            value={{
                pitchTypes,
                primaryColor,
                customPitchFields,
                customSummaryFields,
                savePreferences,
                isLoading,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
