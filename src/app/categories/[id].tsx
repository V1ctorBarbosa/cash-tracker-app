import { useLocalSearchParams } from 'expo-router';

import { NovaTagPage } from '@/pages/nova-tag/NovaTagPage';

export default function EditTagRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <NovaTagPage key={id} tagId={id} />;
}
