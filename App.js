// App.js
import 'react-native-get-random-values'; // uuid polyfill — must be first
import React, { useMemo } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import customTheme from './src/theme/PaperTheme';

import LoginScreen from './src/screens/LoginScreen';
import { useAuth } from './src/hooks/auth/useAuth';

import EditProfileScreen from './src/screens/EditProfileScreen';
import BattingListScreen from './src/screens/BattingListScreen';
import HistoryDetailScreen from './src/screens/HistoryDetailScreen';
import PreferenceScreen from './src/screens/PreferenceScreen'; // Import PreferenceScreen

import MainTabs from './src/components/MainTabs';
import { AlertProvider } from './src/context/AlertContext';
import CustomAlertModal from './src/components/exception/CustomAlertModal';
import { PreferencesProvider, usePreferences } from './src/context/PreferencesContext'; // Import Preferences Context

const Stack = createNativeStackNavigator();

// Inner component to consume usePreferences
const MainContent = () => {
    const { user, isReady } = useAuth();
    const { primaryColor } = usePreferences();

    // Create dynamic theme
    const dynamicTheme = useMemo(() => ({
        ...customTheme,
        colors: {
            ...customTheme.colors,
            primary: primaryColor,
        }
    }), [primaryColor]);

    // Create dynamic navigation theme
    const dynamicNavigationTheme = useMemo(() => ({
        ...NavigationDarkTheme,
        colors: {
            ...NavigationDarkTheme.colors,
            background: dynamicTheme.colors.background,
            card: dynamicTheme.colors.surface,
            primary: primaryColor, // Update navigation primary color too
        },
    }), [dynamicTheme, primaryColor]);


    if (!isReady) return null;

    return (
        <PaperProvider theme={dynamicTheme}>
            <AlertProvider>
                <NavigationContainer theme={dynamicNavigationTheme}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {user ? (
                            <>
                                <Stack.Screen name="MainTabs">
                                    {(props) => <MainTabs {...props} user={user} />}
                                </Stack.Screen>

                                <Stack.Screen
                                    name="Login"
                                    component={LoginScreen}
                                    options={{
                                        presentation: 'modal',
                                        headerShown: true,
                                        title: '帳號綁定',
                                        headerStyle: { backgroundColor: dynamicTheme.colors.surface },
                                        headerTintColor: dynamicTheme.colors.onSurface,
                                    }}
                                />

                                <Stack.Screen
                                    name="EditProfile"
                                    component={EditProfileScreen}
                                    options={{ title: '編輯個人資料' }}
                                />

                                <Stack.Screen
                                    name="Preference"
                                    component={PreferenceScreen}
                                    options={{
                                        title: '偏好設定',
                                        headerShown: true,
                                        headerStyle: { backgroundColor: dynamicTheme.colors.surface },
                                        headerTintColor: dynamicTheme.colors.onSurface,
                                    }}
                                />

                                <Stack.Screen
                                    name="BattingList"
                                    component={BattingListScreen}
                                    options={{
                                        headerShown: true,
                                        title: '打席紀錄',
                                        headerStyle: { backgroundColor: dynamicTheme.colors.surface },
                                        headerTintColor: dynamicTheme.colors.onSurface,
                                    }}
                                />

                                <Stack.Screen
                                    name="HistoryDetail"
                                    component={HistoryDetailScreen}
                                    options={{
                                        headerShown: true,
                                        title: '打席詳情',
                                        headerStyle: { backgroundColor: dynamicTheme.colors.surface },
                                        headerTintColor: dynamicTheme.colors.onSurface,
                                    }}
                                />
                            </>
                        ) : (
                            <Stack.Screen name="Login" component={LoginScreen} />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
                <CustomAlertModal />
            </AlertProvider>
        </PaperProvider>
    );
};

const App = () => {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <PreferencesProvider>
                <MainContent />
            </PreferencesProvider>
        </SafeAreaProvider>
    );
};

export default App;