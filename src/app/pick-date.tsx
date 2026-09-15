import { useLocalSearchParams } from 'expo-router';

import { PickDatePage } from '@/pages/pick-date/PickDatePage';
import { todayAsIsoDate } from '@/shared/lib/date';

export default function PickDateRoute() {
  const params = useLocalSearchParams<{ initial?: string }>();

  let initialIso = todayAsIsoDate();
  if (params.initial !== undefined) {
    initialIso = params.initial;
  }

  return <PickDatePage initialIso={initialIso} />;
}
