import { useLocalSearchParams } from 'expo-router';

import { TransactionDetailPage } from '@/pages/transaction-detail/TransactionDetailPage';

export default function TransactionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TransactionDetailPage transactionId={id} />;
}
