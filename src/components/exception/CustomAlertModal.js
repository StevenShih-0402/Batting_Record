// src/components/exception/CustomAlertModal.js
// 自訂的警示訊息彈窗
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Card, Avatar } from 'react-native-paper';
import { useAlert } from '../../context/AlertContext';

const CustomAlertModal = () => {
    const theme = useTheme();
    const { alertState, hideAlert } = useAlert();

    const { visible, title, message, buttons, type } = alertState;

    if (!visible) return null;

    // 根據 type 決定顏色
    let alertColor = theme.colors.primary;
    let icon = 'information-outline';

    switch (type) {
        case 'success':
            alertColor = theme.colors.success; // Or green
            icon = 'check-circle-outline';
            break;
        case 'error':
            alertColor = theme.colors.error;
            icon = 'alert-circle-outline';
            break;
        case 'warning':
            alertColor = theme.colors.warning; // Or yellow/orange
            icon = 'alert-outline';
            break;
        case 'mail_send':
            alertColor = theme.colors.primary; // Or yellow/orange
            icon = 'email-fast-outline';
            break;
        default:
            alertColor = theme.colors.primary;
            icon = 'information-outline';
            break;
    }

    // 處理按鈕
    const handleButtonPress = (onPress) => {
        hideAlert();
        if (onPress) onPress();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={hideAlert} contentContainerStyle={styles.modalContent}>
                <Card style={[styles.card, { borderColor: alertColor, backgroundColor: theme.colors.background }]}>

                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                        <Avatar.Icon
                            size={80}
                            icon={alertState.icon || icon}
                            color={alertColor}
                            style={{ backgroundColor: 'transparent' }}
                        />
                        <Text variant="titleLarge" style={[styles.title, { color: alertColor }]}>
                            {title}
                        </Text>
                    </View>

                    <Card.Content>
                        <Text style={[styles.message, { color: theme.colors.onSurface }]}>{message}</Text>
                    </Card.Content>
                    <Card.Actions style={styles.actions}>
                        {buttons.map((btn, index) => (
                            <Button
                                key={index}
                                onPress={() => handleButtonPress(btn.onPress)}
                                style={styles.button}
                                mode={btn.style === 'cancel' ? 'outlined' : 'contained'} // Simple logic based on style
                                textColor={btn.style === 'cancel' ? theme.colors.primary : theme.colors.onPrimary}
                                buttonColor={btn.style === 'cancel' ? undefined : alertColor}
                            >
                                {btn.text}
                            </Button>
                        ))}
                    </Card.Actions>
                </Card>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'white', // Or dynamic based on theme
        borderWidth: 1,
        borderRadius: 12, // More rounded
        elevation: 5,
        padding: 15
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
        width: '100%',
    },
    message: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 10,
    },
    actions: {
        justifyContent: 'center', // Center buttons
        paddingBottom: 10,
        flexWrap: 'nowrap', // Allow wrapping if many buttons
    },
    button: {
        marginHorizontal: 5,
        minWidth: 80,
    }
});

export default CustomAlertModal;
