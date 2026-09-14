import { useLocalSearchParams } from 'expo-router';

import { NovoLimitePage } from '@/pages/novo-limite/NovoLimitePage';

export default function NewLimitRoute() {
  const today = new Date();
  const params = useLocalSearchParams<{ year?: string; month?: string }>();
  const initialYear = params.year !== undefined ? Number(params.year) : today.getFullYear();
  const initialMonth = params.month !== undefined ? Number(params.month) : today.getMonth() + 1;

  return <NovoLimitePage initialYear={initialYear} initialMonth={initialMonth} />;
}
