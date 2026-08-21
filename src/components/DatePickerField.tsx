import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '@utils/colors';
import { parseDateAsLocal } from '@utils/formatting';

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedDate = value ? parseDateAsLocal(value) : new Date();

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setVisible(false);
    }

    if (date) {
      onChange(toDateKey(date));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === 'web' ? (
        React.createElement('input', {
          type: 'date',
          value: toDateKey(selectedDate),
          disabled,
          onChange: (event: any) => {
            if (event.target.value) {
              onChange(event.target.value);
            }
          },
          style: {
            ...webDateInputStyle,
            ...(disabled ? webDisabledStyle : {}),
          },
        })
      ) : (
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={disabled}
            onPress={() => setVisible(true)}
            style={[styles.field, disabled && styles.fieldDisabled]}
          >
            <Text style={styles.fieldText}>
              {selectedDate.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.fieldAction}>Cambiar</Text>
          </TouchableOpacity>

          {visible && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: colors.dark, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  field: {
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  fieldDisabled: {
    backgroundColor: colors.gray[100],
  },
  fieldText: {
    color: colors.dark,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  fieldAction: { color: colors.primary, fontSize: 12, fontWeight: '800', marginLeft: 10 },
});

const webDateInputStyle = {
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
