// App.js
import React from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'; 
import { Provider as PaperProvider } from 'react-native-paper'; 

// 導入拆分後的配置與畫面
import StrikeZoneScreen from './src/screens/StrikeZoneScreen';
import customTheme from './src/theme/PaperTheme'; 

// 這是主要的 App 根元件
const App = () => {
    return (
        // 1. SafeAreaProvider：處理系統 UI 遮擋
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>            
            {/* 2. PaperProvider：提供 Material Design 主題 */}
            <PaperProvider theme={customTheme}>
                <StrikeZoneScreen />
            </PaperProvider>
        </SafeAreaProvider>
    );
};

export default App;