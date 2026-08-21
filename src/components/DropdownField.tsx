import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '@utils/colors';

export interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

interface DropdownFieldProps<T extends string> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function DropdownField<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: DropdownFieldProps<T>) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        {React.createElement(
          'select',
          {
            value,
            disabled,
            onChange: (event: any) => onChange(event.target.value as T),
            style: {
              ...webSelectStyle,
              ...(disabled ? webDisabledStyle : {}),
            },
          },
          options.map((option) =>
            React.createElement(
              'option',
              { key: option.value, value: option.value },
              option.label
            )
          )
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          enabled={!disabled}
          selectedValue={value}
          onValueChange={(selectedValue) => onChange(selectedValue as T)}
          mode="dropdown"
          style={styles.picker}
          dropdownIconColor={colors.primary}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: colors.dark, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  pickerContainer: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 48,
    overflow: 'hidden',
  },
  picker: {
    color: colors.dark,
    height: 48,
  },
});

const webSelectStyle = {
  appearance: 'auto',
  WebkitAppearance: 'menulist',
  backgroundColor: colors.gray[50],
  border: `1.5px solid ${colors.gray[200]}`,
  borderRadius: 14,
  boxSizing: 'border-box',
  color: colors.dark,
  fontFamily: 'inherit',
  fontSize: 15,
  fontWeight: 700,
  height: 48,
  outline: 'none',
  padding: '0 14px',
  width: '100%',
};

const webDisabledStyle = {
  backgroundColor: colors.gray[100],
  color: colors.gray[500],
};
