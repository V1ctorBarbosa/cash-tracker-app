import { useLocalSearchParams } from 'expo-router';

import { EditarRecorrenciaPage } from '@/pages/editar-recorrencia/EditarRecorrenciaPage';

export default function EditarRecorrenciaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditarRecorrenciaPage recurringTransactionId={id} />;
}
