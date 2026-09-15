import { useLocalSearchParams } from 'expo-router';

import { DeleteTagPage } from '@/pages/delete-tag/DeleteTagPage';

export default function DeleteTagRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <DeleteTagPage key={id} tagId={id} />;
}
