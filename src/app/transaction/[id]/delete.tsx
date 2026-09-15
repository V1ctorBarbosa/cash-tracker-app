import { useLocalSearchParams } from 'expo-router';

import { DeleteTransactionPage } from '@/pages/delete-transaction/DeleteTransactionPage';

export default function DeleteTransactionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <DeleteTransactionPage key={id} transactionId={id} />;
}
