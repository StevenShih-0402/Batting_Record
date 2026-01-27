// App.js
import React from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import customTheme from './src/theme/PaperTheme';

import LoginScreen from './src/screens/LoginScreen';
import { useAuth } from './src/hooks/auth/useAuth';

import EditProfileScreen from './src/screens/EditProfileScreen';

import MainTabs from './src/components/MainTabs';

const Stack = createNativeStackNavigator(); // 2. 建立 Stack 實例

// 讓 React Navigation 的底層顏色也遵循我們的深色主題
const CombinedDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: customTheme.colors.background, // 確保底層是全黑
        card: customTheme.colors.surface,
    },
};


const App = () => {
    const { user, isReady } = useAuth();

    if (!isReady) return null;

    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <PaperProvider theme={customTheme}>
                <NavigationContainer theme={CombinedDarkTheme}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {user ? (
                            // --- 已登入或訪客狀態 ---
                            <>
                                <Stack.Screen name="MainTabs">
                                    {(props) => <MainTabs {...props} user={user} />}
                                </Stack.Screen>

                                {/* 如果是訪客，我們把 Login 加入路由表，讓 Profile 可以 navigate 到它 */}
                                {user.isAnonymous && (
                                    <Stack.Screen
                                        name="Login"
                                        component={LoginScreen}
                                        options={{
                                            presentation: 'modal', // 下方滑入效果
                                            headerShown: true,
                                            title: '帳號綁定',
                                            headerStyle: { backgroundColor: customTheme.colors.surface },
                                            headerTintColor: customTheme.colors.onSurface,
                                        }}
                                    />
                                )}

                                {/* 只有登入用戶(非訪客)才能進入編輯頁面，雖然 ProfileScreen 會擋，但這裡也加上判斷較保險 */}
                                {!user.isAnonymous && (
                                    <Stack.Screen
                                        name="EditProfile"
                                        component={EditProfileScreen}
                                        options={{ title: '編輯個人資料' }}
                                    />
                                )}
                            </>
                        ) : (
                            // --- 完全未登入狀態 ---
                            <Stack.Screen name="Login" component={LoginScreen} />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

export default App;