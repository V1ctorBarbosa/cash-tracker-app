import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTags } from '@/entities/tag';
import { useTransaction } from '@/entities/transaction';
import { Colors, FontFamily, LoaderSize } from '@/constants/theme';
import { formatCurrency } from '@/shared/lib/format';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Loader } from '@/shared/ui/Loader';

import { buildDetailRows, buildHeadline, typeLabel } from './model/transaction-detail-view';

export function TransactionDetailPage({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const transaction = useTransaction(transactionId);
  const tags = useTags();

  function handlePressEdit() {
    router.push(`/transaction/${transactionId}/edit`);
  }

  function handlePressDelete() {
    router.push(`/transaction/${transactionId}/delete`);
  }

  if (transaction.isPending || tags.isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-ink">
        <Loader size={LoaderSize.large} color={Colors.light.card} />
      </SafeAreaView>
    );
  }

  if (transaction.isError || tags.isError) {
    return (
      <SafeAreaView className="flex-1 bg-ct-ink px-6">
        <Pressable onPress={() => router.back()} hitSlop={12} className="pt-[26px]">
          <Text className="text-[15px] text-[#a8a99f]">‹ voltar</Text>
        </Pressable>
        <View className="flex-1 items-center justify-center">
          <ErrorMessage message="Não foi possível carregar esse lançamento" />
        </View>
      </SafeAreaView>
    );
  }

  const detailRows = buildDetailRows(transaction.data, tags.data);
  const headline = buildHeadline(transaction.data, tags.data);

  return (
    <SafeAreaView className="flex-1 bg-ct-ink">
      <View className="flex-row items-baseline justify-between px-6 pt-[26px]">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-[15px] text-[#a8a99f]">‹ voltar</Text>
        </Pressable>
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[11px] uppercase text-[#a8a99f]">
          {typeLabel(transaction.data.type)}
        </Text>
      </View>

      <View className="border-b border-[#3a3c36] px-6 pb-[26px] pt-[34px]">
        <Text style={{ fontFamily: FontFamily.bodyExtraBold }} className="text-[54px] leading-[52px] tracking-tight text-ct-card">
          {formatCurrency(transaction.data.amount)}
        </Text>
        <Text className="mt-2 text-xl font-medium text-[#dcdad1]">{headline}</Text>
      </View>

      <View className="flex-row gap-5 px-6 pt-[26px]">
        <View className="w-px bg-[#3a3c36]" />
        <View className="flex-1 gap-5">
          {detailRows.map((row) => (
            <View key={row.label} className="gap-[3px]">
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-[#8d8f85]">
                {row.label}
              </Text>
              <Text className="text-base font-medium text-ct-card">{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-auto gap-3 px-6 pb-6 pt-7">
        <Pressable onPress={handlePressEdit} className="items-center bg-ct-card py-4">
          <Text className="text-[15px] font-semibold text-ct-ink">editar</Text>
        </Pressable>
        <Pressable onPress={handlePressDelete} className="items-center border border-[#6b6d64] py-[15px]">
          <Text className="text-[15px] font-semibold text-[#dcdad1]">excluir</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
