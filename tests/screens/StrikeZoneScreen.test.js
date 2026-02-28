// tests/screens/StrikeZoneScreen.test.js
// Mock Firebase and services
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => [{}]),
    getApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        onAuthStateChanged: jest.fn(() => jest.fn())
    })),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInAnonymously: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
}));
jest.mock('../src/services/firebaseService', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {}
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StrikeZoneScreen from '../../src/screens/StrikeZoneScreen';
import useAtBatRecords from '../../src/hooks/useAtBatRecords';
import { useStrikeZoneUI } from '../../src/hooks/useStrikeZoneUI';

// Mock Hooks
jest.mock('../src/hooks/useAtBatRecords');
jest.mock('../src/hooks/useStrikeZoneUI');
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaView: ({ children }) => <View>{children}</View>,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
    };
});

jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return {
        useTheme: () => ({
            colors: {
                surface: 'white',
                primary: 'blue',
                background: 'white',
                onSurface: 'black',
                surfaceVariant: 'grey',
                onPrimary: 'white'
            }
        }),
        Text: ({ children, style }) => <Text style={style}>{children}</Text>,
        ActivityIndicator: (props) => {
            const { animating = true, ...rest } = props;
            return animating ? <View {...rest} testID="loading-indicator" /> : null;
        },
    };
});

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Feather: ({ name }) => <View testID={`icon-${name}`} />,
    };
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
    const React = require('react');
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ name }) => <View testID={`mci-icon-${name}`} />;
});

jest.mock('../src/components/common/PitchGrid', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.forwardRef((props, ref) => (
        <View testID="pitch-grid" onLayout={props.onLayout} ref={ref}>
            <Text>Mock PitchGrid</Text>
        </View>
    ));
});

jest.mock('../src/components/common/BallIndicator', () => {
    const React = require('react');
    const { View } = require('react-native');
    return ({ count, max }) => <View testID={`indicator-${count}/${max}`} />;
});

jest.mock('../src/components/PitchHistoryDots', () => {
    const React = require('react');
    const { View } = require('react-native');
    return () => <View testID="pitch-dots" />;
});


describe('StrikeZoneScreen 測試', () => {
    const mockNavigate = jest.fn();
    const mockNavigation = { navigate: mockNavigate };

    beforeEach(() => {
        jest.clearAllMocks();

        useStrikeZoneUI.mockReturnValue({
            layout: {
                gridRef: { current: null },
                handleGridLayout: jest.fn(),
                setPitchZoneHeight: jest.fn(),
                gridLayout: { width: 300, height: 300 },
                pitchZoneHeight: 500
            },
            handleScreenPress: jest.fn()
        });
    });

    describe('【前端元素】', () => {
        it('顯示載入狀態', () => {
            useAtBatRecords.mockReturnValue({
                loading: true,
                atBatRecords: [],
                atBatStatus: {},
            });

            const { getByText } = render(<StrikeZoneScreen navigation={mockNavigation} />);
            expect(getByText('資料庫連線中...')).toBeTruthy();
        });

        it('正確渲染好壞球與總球數燈號', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [{}, {}, {}, {}, {}], // 5 pitches
                atBatStatus: { strikes: 2, balls: 1 },
            });

            const { getByText, getByTestId } = render(<StrikeZoneScreen navigation={mockNavigation} />);
            expect(getByTestId('indicator-2/2')).toBeTruthy(); // 好球燈顯示2顆亮起 (S count, max 2)
            expect(getByTestId('indicator-1/3')).toBeTruthy(); // 壞球燈顯示1顆亮起 (B count, max 3)
            expect(getByText('5')).toBeTruthy(); // 總球數 P
        });

        it('最新紀錄文字顯示', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [{ result: '被保送' }], // At least 1 record to show text
                atBatStatus: { strikes: 2, balls: 4, isFinished: true }, // balls >= 4
            });

            const { getByText } = render(<StrikeZoneScreen navigation={mockNavigation} />);
            expect(getByText('保送')).toBeTruthy();
        });
    });

    describe('【使用者互動】', () => {
        it('點擊歷史列表按鈕導航', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [],
                atBatStatus: {},
            });

            const { getByTestId } = render(<StrikeZoneScreen navigation={mockNavigation} />);

            const listBtnIcon = getByTestId('mci-icon-clipboard-list');
            fireEvent.press(listBtnIcon.parent);

            expect(mockNavigate).toHaveBeenCalledWith('BattingList');
        });
    });
});
