import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTags } from '@/entities/tag';
import { useDeleteTransaction, useTransaction } from '@/entities/transaction';
import { Colors, FontFamily, LoaderSize } from '@/constants/theme';
import { formatCurrency } from '@/shared/lib/format';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Loader } from '@/shared/ui/Loader';

import { buildDeleteSummary } from './model/delete-transaction-view';

const GhostedContentOpacity = 0.28;

export function DeleteTransactionPage({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const transaction = useTransaction(transactionId);
  const tags = useTags();
  const deleteTransaction = useDeleteTransaction();

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

  const summary = buildDeleteSummary(transaction.data, tags.data);
  const isDeleting = deleteTransaction.isPending;

  async function handlePressDelete() {
    await deleteTransaction.mutateAsync(transactionId);
    router.dismissAll();
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-ink">
      <View style={{ opacity: GhostedContentOpacity }} className="flex-row items-baseline justify-between px-6 pt-[26px]">
        <Text className="text-[15px] text-[#a8a99f]">‹ voltar</Text>
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[11px] uppercase text-[#a8a99f]">
          {summary.typeLabel}
        </Text>
      </View>

      <View style={{ opacity: GhostedContentOpacity }} className="px-6 pb-[26px] pt-[34px]">
        <Text style={{ fontFamily: FontFamily.bodyExtraBold }} className="text-[54px] leading-[52px] tracking-tight text-ct-card">
          {formatCurrency(transaction.data.amount)}
        </Text>
        <Text className="mt-2 text-xl font-medium text-[#dcdad1]">{summary.headline}</Text>
      </View>

      <View className="mt-auto gap-[22px] border-t border-ct-card bg-ct-paper px-6 pb-6 pt-7">
        <View className="gap-[10px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            excluir lançamento
          </Text>
          <Text className="text-[26px] font-semibold leading-[31px] tracking-tight text-ct-ink">Essa ação não pode ser desfeita.</Text>
        </View>

        <View style={{ borderLeftWidth: 3, borderLeftColor: Colors.light.danger }} className="gap-[6px] bg-ct-card px-[18px] py-4">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text className="text-base font-medium text-ct-ink">{summary.headline}</Text>
            <Text className="text-base font-semibold text-ct-ink">{summary.signedAmount}</Text>
          </View>
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10.5px] text-ct-muted">
            {summary.metaLine}
          </Text>
        </View>

        <View className="gap-3">
          <Pressable onPress={() => void handlePressDelete()} disabled={isDeleting} className="items-center bg-ct-danger py-[17px] disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-card">excluir</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} disabled={isDeleting} className="items-center border border-ct-ink py-4 disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-ink">manter lançamento</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
