import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTags } from '@/entities/tag';
import { useTransactions } from '@/entities/transaction';
import { FontFamily } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { buildTagRows } from './model/categories-view';

// Wide enough to capture "all transactions ever" so usage counts are accurate.
const AllTimeFrom = '2020-01-01';
const AllTimeTo = '2035-12-31';

export function CategoriesPage() {
  const router = useRouter();
  const tags = useTags();
  const transactions = useTransactions(AllTimeFrom, AllTimeTo);

  if (tags.isPending || transactions.isPending) {
    return <SafeAreaView className="flex-1 bg-ct-paper" />;
  }

  if (tags.isError || transactions.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const tagRows = buildTagRows(tags.data, transactions.data);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="gap-3 border-b border-ct-ink px-6 pb-4 pt-[26px]">
        <Pressable onPress={() => router.back()} hitSlop={12} className="self-start">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4 }} className="text-[11px] uppercase text-ct-muted">
            ‹ voltar
          </Text>
        </Pressable>
        <View className="flex-row items-baseline justify-between">
          <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
            categorias
          </Text>
          <Pressable onPress={() => router.push('/categories/new')}>
            <Text className="text-[15px] font-semibold text-ct-ink">+ nova</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10.5px] text-ct-muted">
          a cor da tag vale para todos os gráficos
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tagRows.length === 0 && <Text className="px-6 py-8 text-center text-sm text-ct-muted">Nenhuma categoria ainda.</Text>}
        {tagRows.map((tag) => (
          <Pressable
            key={tag.id}
            onPress={() => router.push({ pathname: '/categories/[id]', params: { id: tag.id } })}
            className="flex-row items-center gap-[14px] border-b border-ct-row-divider px-6 py-[15px]">
            <View className="h-[22px] w-[22px]" style={{ backgroundColor: tag.color }} />
            <View className="min-w-0 flex-1">
              <Text className="text-[15.5px] font-medium text-ct-ink" numberOfLines={1}>
                {tag.name}
              </Text>
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] text-ct-muted">
                {tag.kindLabel} · {tag.usesLabel}
              </Text>
            </View>
            <Text className="text-[15px] text-ct-muted">›</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="px-6 pb-6 pt-[22px]">
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4 }} className="text-[10px] uppercase text-ct-muted">
          apagar uma tag em uso pede uma substituta
        </Text>
      </View>
    </SafeAreaView>
  );
}
