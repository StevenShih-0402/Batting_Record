// src/components/common/SelectionDropdown.js
// 彈窗裡面的下拉選單
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, useTheme } from 'react-native-paper';

/*
input:
label: 下拉選單的標題。
selectedValue: 下拉選單選擇/預設的選項。
options: 列出的所有選項。
onSelect: 更新父元件狀態的函式。
disable: 打席是否已經結束。
*/


const SelectionDropdown = ({ 
    label, 
    selectedValue, 
    options, 
    onSelect, 
    icon = "baseball", 
    disabled = false 
}) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={[
            styles.selectBox, 
            expanded && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}>
            <List.Accordion
                title={selectedValue || `請選擇${label}`}
                titleStyle={{ 
                    fontSize: 16,
                    color: selectedValue ? theme.colors.onSurface : theme.colors.onSurfaceVariant 
                }}
                left={props => <List.Icon {...props} icon={icon} color={expanded ? theme.colors.primary : props.color} />}
                expanded={expanded}
                onPress={() => !disabled && setExpanded(!expanded)}
                style={[styles.accordion, disabled && { opacity: 0.5 }]}
            >
                {options.map((option) => (
                    <List.Item
                        key={option}
                        title={option}
                        onPress={() => {
                            onSelect(option);
                            setExpanded(false);
                        }}
                        style={styles.pitchItem}
                        right={props => selectedValue === option && (
                            <List.Icon {...props} icon="check" color={theme.colors.primary} />
                        )}
                    />
                ))}
            </List.Accordion>
        </View>
    );
};

const styles = StyleSheet.create({
    selectBox: {
        borderWidth: 1,
        borderColor: '#79747E',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    accordion: {
        backgroundColor: 'transparent',
        height: 56,
        justifyContent: 'center',
    },
    pitchItem: {
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(0,0,0,0.02)',
    }
});

export default SelectionDropdown;