import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRecurringTransactions } from '@/entities/recurring-transaction';
import { useSession } from '@/entities/session';
import { useTags } from '@/entities/tag';
import { useTransactions } from '@/entities/transaction';
import { signOutOfSession } from '@/features/auth';
import { FontFamily } from '@/constants/theme';
import { formatMonthShort } from '@/shared/lib/date';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { computeTransactionStats, initialOf } from './model/perfil-view';

// Wide enough to capture "all transactions ever" for a personal-scale account without a
// dedicated backend count endpoint -- the API has no unbounded "no date filter" affordance
// on the frontend today, so this stands in for one.
const AllTimeFrom = '2020-01-01';
const AllTimeTo = '2035-12-31';

function ProfileRow({ label, meta, onPress }: { label: string; meta: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      className="flex-row items-center justify-between border-b border-ct-divider px-6 py-[19px]">
      <Text className="text-base font-medium text-ct-ink">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text style={{ fontFamily: FontFamily.mono }} className="text-[11.5px] text-ct-muted">
          {meta}
        </Text>
        {onPress !== undefined && <Text className="text-[15px] text-ct-muted">›</Text>}
      </View>
    </Pressable>
  );
}

export function PerfilPage() {
  const router = useRouter();
  const session = useSession();
  const tags = useTags();
  const recurringTransactions = useRecurringTransactions();
  const transactions = useTransactions(AllTimeFrom, AllTimeTo);

  const displayName = session.status === 'signed-in' ? (session.user.displayName ?? 'Você') : 'Você';
  const email = session.status === 'signed-in' ? (session.user.email ?? '') : '';

  if (transactions.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const stats = computeTransactionStats(transactions.data ?? []);
  const activeRecurringCount = recurringTransactions.data?.filter((recurring) => recurring.active).length;
  const today = new Date();
  const currentMonthLabel = formatMonthShort(today.getFullYear(), today.getMonth() + 1);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="gap-5 border-b border-ct-ink px-6 pb-[22px] pt-[26px]">
        <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
          perfil
        </Text>
        <View className="flex-row items-center gap-4">
          <View className="h-[62px] w-[62px] items-center justify-center bg-ct-accent">
            <Text className="text-2xl font-extrabold text-ct-card">{initialOf(displayName)}</Text>
          </View>
          <View>
            <Text className="text-xl font-semibold tracking-tight text-ct-ink">{displayName}</Text>
            <Text style={{ fontFamily: FontFamily.mono }} className="text-[11.5px] text-ct-muted">
              {email}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row border-b border-ct-divider">
        <View className="flex-1 border-r border-ct-divider px-6 py-[18px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            lançamentos
          </Text>
          <Text className="mt-1 text-[22px] font-semibold text-ct-ink">{stats.count}</Text>
        </View>
        <View className="flex-1 px-6 py-[18px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            desde
          </Text>
          <Text className="mt-1 text-[22px] font-semibold text-ct-ink">{stats.sinceLabel}</Text>
        </View>
      </View>

      <View>
        {/* Recorrentes/Exportar dados have no destination screen yet -- shown, but inert until one is designed. */}
        <ProfileRow
          label="Categorias"
          meta={tags.data !== undefined ? `${tags.data.length} tags` : '···'}
          onPress={() => router.push('/categorias/index')}
        />
        <ProfileRow label="Recorrentes" meta={activeRecurringCount !== undefined ? `${activeRecurringCount} ativas` : '···'} />
        <ProfileRow label="Orçamentos" meta={currentMonthLabel} />
        <ProfileRow label="Moeda" meta="BRL" />
        <ProfileRow label="Exportar dados" meta="csv" />
      </View>

      <View className="mt-auto px-6 pb-6 pt-7">
        <Pressable onPress={() => signOutOfSession()} className="items-center border border-ct-ink py-[15px]">
          <Text className="text-[15px] font-semibold text-ct-ink">sair da conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
