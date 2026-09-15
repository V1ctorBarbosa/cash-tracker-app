import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBudgets } from '@/entities/budget';
import { useDeleteTag, useTags } from '@/entities/tag';
import { Colors, FontFamily, LoaderSize } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Loader } from '@/shared/ui/Loader';
import { PageLoader } from '@/shared/ui/PageLoader';

import { tagKindLabel } from './model/delete-tag-view';

const StackScreensToDismissOnDelete = 2;

function DeleteTagErrorScreen({ onPressClose }: { onPressClose: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-ct-paper px-6">
      <Pressable onPress={onPressClose} hitSlop={12} className="items-end pt-[26px]">
        <Text className="text-[15px] text-ct-muted">✕</Text>
      </Pressable>
      <View className="flex-1 items-center justify-center">
        <ErrorMessage />
      </View>
    </SafeAreaView>
  );
}

export function DeleteTagPage({ tagId }: { tagId: string }) {
  const router = useRouter();
  const tags = useTags();
  const budgets = useBudgets();
  const deleteTag = useDeleteTag();

  if (tags.isPending || budgets.isPending) {
    return <PageLoader />;
  }

  if (tags.isError || budgets.isError) {
    return <DeleteTagErrorScreen onPressClose={() => router.back()} />;
  }

  const tag = tags.data.find((candidate) => candidate.id === tagId);
  if (tag === undefined) {
    return <DeleteTagErrorScreen onPressClose={() => router.back()} />;
  }

  const hasBudget = budgets.data.some((budget) => budget.tagId === tagId);
  const isDeleting = deleteTag.isPending;

  let budgetWarning: string | null = null;
  if (hasBudget) {
    budgetWarning = 'Essa tag também tem um limite definido — ele será apagado junto.';
  }

  let deleteButtonContent: ReactNode;
  if (isDeleting) {
    deleteButtonContent = <Loader size={LoaderSize.medium} color={Colors.light.card} />;
  } else {
    deleteButtonContent = <Text className="text-[15px] font-semibold text-ct-card">excluir</Text>;
  }

  async function handlePressDelete() {
    await deleteTag.mutateAsync(tagId);
    router.dismiss(StackScreensToDismissOnDelete);
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="flex-row items-baseline justify-between px-6 pt-[26px]">
        <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
          excluir tag
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-[15px] text-ct-muted">✕</Text>
        </Pressable>
      </View>

      <View className="gap-[22px] px-6 pt-[34px]">
        <View className="flex-row items-center gap-[14px] bg-ct-card p-4">
          <View className="h-[22px] w-[22px]" style={{ backgroundColor: tag.color }} />
          <View className="min-w-0 flex-1">
            <Text className="text-[15.5px] font-medium text-ct-ink" numberOfLines={1}>
              {tag.name}
            </Text>
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] text-ct-muted">
              {tagKindLabel(tag.kind)}
            </Text>
          </View>
        </View>

        <View style={{ borderLeftWidth: 3, borderLeftColor: Colors.light.danger }} className="gap-[6px] bg-ct-card px-[18px] py-4">
          <Text className="text-base font-medium text-ct-ink">Essa ação não pode ser desfeita.</Text>
          {budgetWarning !== null && (
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10.5px] text-ct-muted">
              {budgetWarning}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-auto gap-3 px-6 pb-6 pt-7">
        <Pressable
          onPress={() => void handlePressDelete()}
          disabled={isDeleting}
          className="items-center bg-ct-danger py-[17px] disabled:opacity-60">
          {deleteButtonContent}
        </Pressable>
        <Pressable onPress={() => router.back()} disabled={isDeleting} className="items-center border border-ct-ink py-4 disabled:opacity-60">
          <Text className="text-[15px] font-semibold text-ct-ink">manter tag</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
