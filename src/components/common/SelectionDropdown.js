// src/components/common/SelectionDropdown.js
// 彈窗裡面的下拉選單
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme, Button, Modal, Portal } from 'react-native-paper';
import { Feather as Icon } from '@expo/vector-icons';

/*
input:
label: 下拉選單的標題。
selectedValue: 下拉選單選擇/預設的選項。
options: 列出的所有選項。
onSelect: 更新父元件狀態的函式。
disable: 打席是否已經結束。
*/

const SelectionDropdown = ({ label, selectedValue, options, onSelect, disabled = false }) => {
    const theme = useTheme();

    // 管理狀態
    const [visible, setVisible] = useState(false);          // 顯示狀態，預設為 False 不顯示
    const showModal = () => !disabled && setVisible(true);  // 如果元件沒有被禁用 (disabled 為 false，即打席還沒結束)，則執行 setVisible(true)，將顯示狀態設為 True (顯示)。
    const hideModal = () => setVisible(false);              // 將顯示狀態設為 False (不顯示)。

    // 點擊事件觸發的函式
    const handleSelect = (value) => {
        onSelect(value);                // onSelect() 將選取結果回傳給父元件，負責更新父元件的狀態（即更新 selectedValue）
        hideModal();
    };

    // 在元件內部定義動態樣式
    const modalContentStyle = [
        styles.dropdownModalInner, 
        { 
            backgroundColor: theme.colors.surface,    // 確保 Modal 內容容器有背景色 
        }
    ];

    return (
        // 下拉選單的主體
        <View style={styles.inputGroup}>
            {/* 標題 */}
            <Text style={styles.inputLabel}>{label}</Text>
            
            {/* 可點選的按鈕區塊 */}
            <Button 
                mode="outlined" 
                onPress={showModal}
                disabled={disabled}
                style={[
                    styles.dropdownButton, 
                    {borderColor: theme.colors.primary},
                ]}
                contentStyle={styles.dropdownContent}
            >
                {/* 使用者已選擇的內容區塊 */}
                <View style={[styles.customDropdownContentInner, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.dropdownText, {
                        color: theme.colors.onSurface,
                    }]}>
                        {selectedValue}
                    </Text>
                    <Icon name="chevron-down" size={20} color={theme.colors.onSurface} />
                </View>
            </Button>
            
            {/* Portal 允許你將子元件渲染到父元件的視覺階層之外，通常是直接渲染到應用程式的根視圖上。*/}
            {/* 這邊用來確保下拉清單選項永遠位於最上層。 */}
            <Portal>
                
                {/* 下拉清單選項的額外區塊 (Modal 可以把它想像成人造島嶼) */}
                <Modal 
                    visible={visible} 
                    onDismiss={hideModal} 
                    contentContainerStyle={modalContentStyle}
                >
                    
                    {/* 讓下拉清單選項太多時可以滾動  */}
                    <ScrollView keyboardShouldPersistTaps="always">
                        {options.map(value => (
                            
                            // 讓每個選項被點擊時降低透明度的元件
                            <TouchableOpacity 
                                key={value} 
                                onPress={() => handleSelect(value)}
                                style={[
                                    styles.dropdownItem, 
                                    { backgroundColor: selectedValue === value ? theme.colors.primary : theme.colors.surface },
                                    { borderBottomColor: theme.colors.onSurface}
                                ]}
                            >
                                <Text style={{ color: selectedValue === value ? theme.colors.onPrimary : theme.colors.onSurface }}>{value}</Text>
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
    },
    dropdownText: {
        fontSize: 16,
        marginTop: -4,
    },
    dropdownModalInner: {
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
    }
});


export default SelectionDropdown;