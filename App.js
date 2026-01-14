// App.js
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { Provider as PaperProvider, Avatar } from 'react-native-paper'; 
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather as Icon } from '@expo/vector-icons';

import StrikeZoneScreen from './src/screens/StrikeZoneScreen';
import HistoryScreen from './src/screens/HistoryScreen'; 
import customTheme from './src/theme/PaperTheme'; 

import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { useAuth } from './src/hooks/auth/useAuth';

const Tab = createBottomTabNavigator();

// 讓 React Navigation 的底層顏色也遵循我們的深色主題
const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: customTheme.colors.background, // 確保底層是全黑
    card: customTheme.colors.surface,
  },
};

const MainTabs = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth(); // 確保這裡有取得 user 狀態

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
                    elevation: 8,       // 恢復一點陰影讓導覽列跟內容有區隔
                    height: 65 + insets.bottom, 
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            })}
        >
            <Tab.Screen 
                name="Record" 
                component={StrikeZoneScreen} 
                options={{ title: '數據輸入' }}
            />

            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    title: '個人中心',
                    tabBarIcon: ({ focused }) => {
                        // 如果有 Google 頭貼
                        if (user?.photoURL) {
                            return (
                                <Avatar.Image 
                                    size={28} 
                                    source={{ uri: user.photoURL }} 
                                    style={{ 
                                        backgroundColor: '#333',
                                    }}
                                />
                            );
                        }
                        // 預設 Icon
                        return (
                            <Avatar.Icon 
                                size={28} 
                                icon="account" 
                                style={{ 
                                    backgroundColor: focused ? customTheme.colors.primary : '#333',
                                }} 
                            />
                        );
                    },
                    // 移除自定義 tabBarButton，回歸原生配置以徹底解決「歪掉」的問題
                }}
            />

            <Tab.Screen 
                name="History" 
                component={HistoryScreen} 
                options={{ title: '紀錄查詢' }}
            />

            <Tab.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ 
                    tabBarButton: () => null, 
                    tabBarItemStyle: { display: 'none' } // 徹底隱藏佔位
                }} 
            />
        </Tab.Navigator>
    );
};

const App = () => {

    // 使用你原本寫好的 useAuth，這裡不用動，因為它監聽 onAuthStateChanged
    const { user, isReady } = useAuth(); 

    // 等待 Firebase 初始化時的畫面
    if (!isReady) {
        return null; // 或者回傳一個 Splash Screen
    }

    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>            
            <PaperProvider theme={customTheme}>
                {/* 【關鍵 2】將合併後的主題傳給 NavigationContainer */}
                <NavigationContainer theme={CombinedDarkTheme}>
                    {/* 邏輯判斷：
                        有 User -> 進入主程式 (MainTabs)
                        沒 User -> 進入登入頁 (LoginScreen)
                        
                        *注意：因為我們在 authService 做了綁定邏輯，
                        當使用者從 LoginScreen 登入後，user 狀態會變更，
                        React 會自動重新渲染這裡，跳轉到 MainTabs。
                    */}
                    {user ? <MainTabs /> : <LoginScreen />}
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

export default App;