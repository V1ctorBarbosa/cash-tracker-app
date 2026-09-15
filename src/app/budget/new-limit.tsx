import { useLocalSearchParams } from 'expo-router';

import { NewLimitPage } from '@/pages/new-limit/NewLimitPage';

export default function NewLimitRoute() {
  const today = new Date();
  const params = useLocalSearchParams<{ year?: string; month?: string }>();

  let initialYear = today.getFullYear();
  if (params.year !== undefined) {
    initialYear = Number(params.year);
  }

  let initialMonth = today.getMonth() + 1;
  if (params.month !== undefined) {
    initialMonth = Number(params.month);
  }

  return <NewLimitPage initialYear={initialYear} initialMonth={initialMonth} />;
}
