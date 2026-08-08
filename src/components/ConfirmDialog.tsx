import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@utils/colors';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  cancelLabel = 'Cancelar',
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <Text style={[styles.title, destructive && styles.titleDestructive]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={[styles.confirmButton, destructive && styles.confirmButtonDestructive]}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(29, 27, 56, 0.48)', padding: 24 },
  dialog: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 24, padding: 22, elevation: 12, shadowColor: colors.dark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  title: { color: colors.dark, fontSize: 20, fontWeight: '800' },
  titleDestructive: { color: colors.danger },
  message: { color: colors.gray[600], fontSize: 14, lineHeight: 21, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelButton: { alignItems: 'center', backgroundColor: colors.gray[100], borderRadius: 14, flex: 1, paddingVertical: 13 },
  cancelText: { color: colors.gray[700], fontSize: 14, fontWeight: '700' },
  confirmButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, flex: 1, paddingVertical: 13 },
  confirmButtonDestructive: { backgroundColor: colors.danger },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
