import { useLocalSearchParams } from 'expo-router';

import { EditarRecorrenciaPage } from '@/pages/editar-recorrencia/EditarRecorrenciaPage';

export default function EditRecurringRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditarRecorrenciaPage key={id} recurringTransactionId={id} />;
}
