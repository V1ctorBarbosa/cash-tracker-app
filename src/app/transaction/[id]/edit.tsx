import { useLocalSearchParams } from 'expo-router';

import { EditTransactionPage } from '@/pages/edit-transaction/EditTransactionPage';

export default function EditTransactionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditTransactionPage key={id} transactionId={id} />;
}
