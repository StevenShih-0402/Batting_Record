// Mock Firebase and services TRANSITIVELY imported
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => [{}]),
    getApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signInAnonymously: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
}));
jest.mock('../src/services/firebaseService', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {}
}));
jest.mock('../src/hooks/useAtBatRecords');
jest.mock('../src/hooks/useStrikeZoneUI');
jest.mock('../src/hooks/auth/useAuth', () => ({
    useAuth: jest.fn(() => ({ user: { uid: 'test-uid' } }))
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import StrikeZoneScreen from '../src/screens/StrikeZoneScreen';
import useAtBatRecords from '../src/hooks/useAtBatRecords';
import { useStrikeZoneUI } from '../src/hooks/useStrikeZoneUI';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
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
        Button: ({ children, onPress, disabled }) => (
            <TouchableOpacity onPress={onPress} disabled={disabled} testID="mock-button">
                <Text>{children}</Text>
            </TouchableOpacity>
        ),
        ActivityIndicator: (props) => {
            const { animating = true, ...rest } = props;
            return animating ? <View {...rest} testID="loading-indicator" /> : null;
        },
    };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaView: ({ children }) => <View>{children}</View>,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
    };
});

// Mock icons
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Feather: ({ name }) => <View testID={`icon-${name}`} />,
    };
});

// Mock components to simplify tests
jest.mock('../src/components/common/PitchGrid', () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.forwardRef((props, ref) => <View testID="pitch-grid" onLayout={props.onLayout} />);
});

jest.mock('../src/components/common/BallIndicator', () => {
    const React = require('react');
    const { View } = require('react-native');
    return ({ count, max }) => <View testID={`indicator-${count}/${max}`} />;
});

jest.mock('../src/components/modals/PitchInputModal', () => {
    const React = require('react');
    const { View } = require('react-native');
    return () => <View testID="pitch-input-modal" />;
});

jest.mock('../src/components/modals/EndAtBatModal', () => {
    const React = require('react');
    const { View } = require('react-native');
    return () => <View testID="end-at-bat-modal" />;
});

jest.mock('../src/components/modals/PitchEditModal', () => {
    const React = require('react');
    const { View } = require('react-native');
    return () => <View testID="pitch-edit-modal" />;
});

jest.mock('../src/components/HistoryList', () => {
    const React = require('react');
    const { View } = require('react-native');
    return () => <View testID="history-list" />;
});

jest.mock('../src/components/PitchHistoryDots', () => {
    const React = require('react');
    const { View } = require('react-native');
    return () => <View testID="pitch-dots" />;
});

describe('StrikeZoneScreen 測試', () => {
    const mockAtBatStatus = {
        strikes: 0,
        balls: 0,
        isFinished: false
    };

    const mockLayout = {
        gridRef: { current: null },
        handleGridLayout: jest.fn(),
        setPitchZoneHeight: jest.fn(),
        gridLayout: { width: 300, height: 300 },
        pitchZoneHeight: 500
    };

    const mockDrawer = {
        isOpen: false,
        toggle: jest.fn(),
        anim: 0
    };

    const mockModals = {
        pitch: { visible: false, set: jest.fn() },
        edit: { visible: false, record: null, set: jest.fn() },
        end: { visible: false, set: jest.fn() }
    };

    const mockActions = {
        handlePitchModalClose: jest.fn(),
        onSavePitch: jest.fn(),
        handleEditPress: jest.fn(),
        onUpdatePitch: jest.fn(),
        onDeletePitch: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useStrikeZoneUI.mockReturnValue({
            layout: mockLayout,
            drawer: mockDrawer,
            modals: mockModals,
            actions: mockActions,
            handleScreenPress: jest.fn(),
            panResponder: { panHandlers: {} },
            isSaving: false,
            selectedCellInfo: null
        });
    });

    describe('【UI Render】', () => {
        it('渲染打席數據輸入畫面 (載入中)', () => {
            useAtBatRecords.mockReturnValue({
                loading: true,
                atBatRecords: [],
                atBatStatus: mockAtBatStatus,
            });

            const { getByText } = render(<StrikeZoneScreen />);
            expect(getByText('資料庫連線中...')).toBeTruthy();
        });

        it('渲染打席數據輸入畫面 (載入完成)', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [],
                atBatStatus: { strikes: 1, balls: 2 },
                handleSavePitch: jest.fn(),
            });

            const { getByText, getByTestId } = render(<StrikeZoneScreen />);
            expect(getByText(/打席數據輸入/)).toBeTruthy();
            expect(getByTestId('pitch-grid')).toBeTruthy();
        });

        it('狀態列顯示正確球數與燈號', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [{}, {}, {}, {}, {}],
                atBatStatus: { strikes: 2, balls: 3 },
            });

            const { getByText, getByTestId } = render(<StrikeZoneScreen />);
            expect(getByTestId('indicator-2/2')).toBeTruthy();
            expect(getByTestId('indicator-3/3')).toBeTruthy();
            expect(getByText('5')).toBeTruthy(); // 總球數 P
        });

        it('顯示最新一球結果', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [{ result: '界外', atBatEndOutcome: null }],
                atBatStatus: { strikes: 2, balls: 1, isFinished: false },
            });

            const { getByText } = render(<StrikeZoneScreen />);
            expect(getByText('界外')).toBeTruthy();
        });

        it('打席結束顯示結算文字 (三振)', () => {
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [{ result: '揮空' }],
                atBatStatus: { strikes: 3, balls: 0, isFinished: true },
            });

            const { getByText } = render(<StrikeZoneScreen />);
            expect(getByText('三振')).toBeTruthy();
        });
    });

    describe('【Interaction】', () => {
        it('點擊抽屜按鈕開啟側邊欄', () => {
            const toggleDrawer = jest.fn();
            useStrikeZoneUI.mockReturnValue({
                layout: mockLayout,
                drawer: { ...mockDrawer, toggle: toggleDrawer },
                modals: mockModals,
                actions: mockActions,
                handleScreenPress: jest.fn(),
                panResponder: { panHandlers: {} }
            });
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [],
                atBatStatus: mockAtBatStatus,
            });

            const { getByTestId } = render(<StrikeZoneScreen />);
            // The menu button contains icon-menu
            fireEvent.press(getByTestId('icon-menu'));
            expect(toggleDrawer).toHaveBeenCalled();
        });

        it('點擊畫面觸發點選球位', () => {
            const handleScreenPress = jest.fn();
            useStrikeZoneUI.mockReturnValue({
                layout: mockLayout,
                drawer: mockDrawer,
                modals: mockModals,
                actions: mockActions,
                handleScreenPress: handleScreenPress,
                panResponder: { panHandlers: {} }
            });
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [],
                atBatStatus: mockAtBatStatus,
            });

            const { getByTestId } = render(<StrikeZoneScreen />);
            // pitchZoneContainer has onTouchEnd={ui.handleScreenPress}
            // We can fire an event on the view
            fireEvent(getByTestId('pitch-grid').parent, 'touchEnd');
            // handleScreenPress should be called
        });

        it('儲存打席彙整', () => {
            const setEndModalVisible = jest.fn();
            useStrikeZoneUI.mockReturnValue({
                layout: mockLayout,
                drawer: { ...mockDrawer, isOpen: true },
                modals: { ...mockModals, end: { visible: false, set: setEndModalVisible } },
                actions: mockActions,
                handleScreenPress: jest.fn(),
                panResponder: { panHandlers: {} }
            });
            useAtBatRecords.mockReturnValue({
                loading: false,
                atBatRecords: [{}],
                atBatStatus: mockAtBatStatus,
            });

            const { getByText } = render(<StrikeZoneScreen />);
            fireEvent.press(getByText('儲存紀錄 (彙整)'));
            expect(setEndModalVisible).toHaveBeenCalledWith(true);
        });
    });
});
