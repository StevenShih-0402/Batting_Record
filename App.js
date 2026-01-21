// App.js
import React from 'react';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { Provider as PaperProvider, Avatar } from 'react-native-paper'; 
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // 1. 匯入 Stack
import { Feather as Icon } from '@expo/vector-icons';

import StrikeZoneScreen from './src/screens/StrikeZoneScreen';
import HistoryScreen from './src/screens/HistoryScreen'; 
import customTheme from './src/theme/PaperTheme'; 

import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { useAuth } from './src/hooks/auth/useAuth';

import EditProfileScreen from './src/screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
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

// MainTabs 現在接收 user 作為 props，由 App.js 傳入
const MainTabs = ({ user }) => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = route.name === 'Record' ? 'edit-3' : 'list';
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: customTheme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                sceneContainerStyle: { backgroundColor: customTheme.colors.background },
                tabBarStyle: {
                    backgroundColor: customTheme.colors.surface,
                    borderTopWidth: 0,
                    elevation: 8,
                    height: 65 + insets.bottom, 
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                },
            })}
        >
            <Tab.Screen name="Record" component={StrikeZoneScreen} options={{ title: '數據輸入' }} />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    title: '個人中心',
                    tabBarIcon: ({ focused }) => {
                        if (user?.photoURL) {
                            return <Avatar.Image size={28} source={{ uri: user.photoURL }} />;
                        }
                        return (
                            <Avatar.Icon 
                                size={28} 
                                icon="account" 
                                style={{ backgroundColor: focused ? customTheme.colors.primary : '#333' }} 
                            />
                        );
                    },
                }}
            />
            <Tab.Screen name="History" component={HistoryScreen} options={{ title: '紀錄查詢' }} />
        </Tab.Navigator>
    );
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