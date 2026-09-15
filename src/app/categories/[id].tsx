import { useLocalSearchParams } from 'expo-router';

import { NewTagPage } from '@/pages/new-tag/NewTagPage';

export default function EditTagRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <NewTagPage key={id} tagId={id} />;
}
