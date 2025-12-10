// src/components/common/SelectionDropdown.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme, Button, Modal, Portal } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';

const SelectionDropdown = ({ label, selectedValue, options, onSelect, disabled = false }) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const showModal = () => !disabled && setVisible(true);
    const hideModal = () => setVisible(false);

    const handleSelect = (value) => {
        onSelect(value);
        hideModal();
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <Button 
                mode="outlined" 
                onPress={showModal}
                disabled={disabled}
                style={[
                    styles.dropdownButton, 
                    {borderColor: selectedValue === '不選擇' ? theme.colors.outline : theme.colors.primary},
                    disabled && {opacity: 0.6}
                ]}
                contentStyle={styles.dropdownContent}
            >
                <View style={styles.customDropdownContentInner}>
                    <Text style={[styles.dropdownText, {
                        color: selectedValue === '不選擇' ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
                        opacity: disabled ? 0.8 : 1,
                    }]}>
                        {selectedValue}
                    </Text>
                    <Icon name="chevron-down" size={20} color={disabled ? theme.colors.onSurfaceVariant : theme.colors.onSurface} />
                </View>
            </Button>
            
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.dropdownModalInner}>
                    <ScrollView>
                        {options.map(value => (
                            <TouchableOpacity 
                                key={value} 
                                onPress={() => handleSelect(value)}
                                style={[styles.dropdownItem, { backgroundColor: selectedValue === value ? theme.colors.primaryContainer : 'white' }]}
                            >
                                <Text style={{ color: selectedValue === value ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>{value}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    dropdownButton: {
        justifyContent: 'space-between',
        height: 50,
        borderRadius: 8,
    },
    dropdownContent: {
        height: '100%', 
        width: '100%', 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    customDropdownContentInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%', 
        paddingHorizontal: 10, 
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownModalInner: {
        backgroundColor: 'white',
        padding: 10,
        margin: 40,
        borderRadius: 8,
        maxHeight: '60%',
        width: '80%',
        alignSelf: 'center',
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    }
});


export default SelectionDropdown;