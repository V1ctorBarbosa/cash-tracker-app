import { Alert } from 'react-native';

/** A destructive-action confirmation dialog with a Cancel button and a labeled confirm button. */
export function confirmDestructiveAction(title: string, message: string, confirmLabel: string, onConfirm: () => void): void {
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/** A plain informational dialog with a single acknowledgement button. */
export function showAlert(title: string, message: string): void {
  Alert.alert(title, message);
}
