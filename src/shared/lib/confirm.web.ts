// react-native-web's Alert.alert is a documented no-op (github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/Alert/index.js),
// so on web these fall back to the browser's own confirm()/alert().

/** A destructive-action confirmation dialog with a Cancel button and a labeled confirm button. */
export function confirmDestructiveAction(title: string, message: string, confirmLabel: string, onConfirm: () => void): void {
  const confirmLine = `${confirmLabel}?`;
  const confirmed = window.confirm(`${title}\n\n${message}\n\n${confirmLine}`);
  if (confirmed) {
    onConfirm();
  }
}

/** A plain informational dialog with a single acknowledgement button. */
export function showAlert(title: string, message: string): void {
  window.alert(`${title}\n\n${message}`);
}
