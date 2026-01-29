// src/components/MainTabs.js
// APP 底下的導航列
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather as Icon } from '@expo/vector-icons';
import { Avatar, useTheme } from 'react-native-paper';

import StrikeZoneScreen from '../screens/StrikeZoneScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const MainTabs = ({ user }) => {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = route.name === 'Record' ? 'edit-3' : 'list';
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                sceneContainerStyle: { backgroundColor: theme.colors.background },
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
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
                                style={{ backgroundColor: focused ? theme.colors.primary : '#333' }}
                            />
                        );
                    },
                }}
            />
            <Tab.Screen name="History" component={HistoryScreen} options={{ title: '紀錄查詢' }} />
        </Tab.Navigator>
    );
};

export default MainTabs;
