import { useLocalSearchParams } from 'expo-router';

import { NovaTagPage } from '@/pages/nova-tag/NovaTagPage';

export default function EditarTagRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <NovaTagPage tagId={id} />;
}
