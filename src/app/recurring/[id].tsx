import { useLocalSearchParams } from 'expo-router';

import { EditRecurringPage } from '@/pages/edit-recurring/EditRecurringPage';

export default function EditRecurringRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditRecurringPage key={id} recurringTransactionId={id} />;
}
