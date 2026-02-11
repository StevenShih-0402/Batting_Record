// src/context/PreferencesContext.js
// 管理使用者偏好設定 (球種、結果、主題色)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { db } from '../services/firebaseService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { PITCH_TYPES_ZH, PITCH_RESULTS } from '../constants/GameConstants';
import customTheme from '../theme/PaperTheme';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
    const { user } = useAuth();

    // 預設值
    const [pitchTypes, setPitchTypes] = useState(PITCH_TYPES_ZH);
    const [pitchResults, setPitchResults] = useState(PITCH_RESULTS);
    const [primaryColor, setPrimaryColor] = useState(customTheme.colors.primary);
    const [isLoading, setIsLoading] = useState(true);

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
                        if (prefs.pitchResults) setPitchResults(prefs.pitchResults);
                        if (prefs.primaryColor) setPrimaryColor(prefs.primaryColor);
                    }
                } catch (error) {
                    console.error("無法載入使用者偏好設定:", error);
                }
            } else {
                // 訪客或未登入使用預設值
                setPitchTypes(PITCH_TYPES_ZH);
                setPitchResults(PITCH_RESULTS);
                setPrimaryColor(customTheme.colors.primary);
            }
            setIsLoading(false);
        };

        loadPreferences();
    }, [user]);

    // 儲存偏好設定
    const savePreferences = async (newPitchTypes, newPitchResults, newPrimaryColor) => {
        setPitchTypes(newPitchTypes);
        setPitchResults(newPitchResults);
        setPrimaryColor(newPrimaryColor);

        if (user && !user.isAnonymous) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    preferences: {
                        pitchTypes: newPitchTypes,
                        pitchResults: newPitchResults,
                        primaryColor: newPrimaryColor
                    }
                }, { merge: true });
                return true;
            } catch (error) {
                console.error("無法儲存使用者偏好設定:", error);
                return false;
            }
        }
        return true; // 訪客只更新本地狀態
    };

    return (
        <PreferencesContext.Provider value={{
            pitchTypes,
            pitchResults,
            primaryColor,
            savePreferences,
            isLoading
        }}>
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
