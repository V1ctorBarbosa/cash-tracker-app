import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
  type RecurringTransactionDto,
} from '@/entities/recurring-transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { confirmDestructiveAction } from '@/shared/lib/confirm';
import { formatAmount, maskCurrencyInput, parseAmountInput } from '@/shared/lib/format';
import { normalizeOptionalText } from '@/shared/lib/text';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { PageLoader } from '@/shared/ui/PageLoader';

import { buildDayPills, formatMonthYearInput, parseMonthYearInput } from './model/edit-recurring-view';

function ActiveToggle({ active, onPress }: { active: boolean; onPress: () => void }) {
  let alignSelf: 'flex-start' | 'flex-end';
  if (active) {
    alignSelf = 'flex-end';
  } else {
    alignSelf = 'flex-start';
  }

  return (
    <Pressable onPress={onPress} className="h-7 w-[52px] justify-center border border-ct-ink p-[2px]">
      <View style={{ backgroundColor: Colors.light.ink, alignSelf }} className="h-[22px] w-[22px]" />
    </Pressable>
  );
}

function DayPillButton({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  let backgroundColor: string;
  let textColor: string;
  if (isSelected) {
    backgroundColor = Colors.light.ink;
    textColor = Colors.light.card;
  } else {
    backgroundColor = 'transparent';
    textColor = Colors.light.ink;
  }

  return (
    <Pressable onPress={onPress} style={{ backgroundColor }} className="flex-1 items-center border border-ct-ink py-[11px]">
      <Text style={{ fontFamily: FontFamily.mono, color: textColor }} className="text-[13px]">
        {label}
      </Text>
    </Pressable>
  );
}

function resolveInitialAmount(existing: RecurringTransactionDto | undefined): string {
  if (existing === undefined) {
    return '';
  }

  return formatAmount(existing.amount);
}

function resolveInitialStartInput(existing: RecurringTransactionDto | undefined): string {
  if (existing === undefined) {
    return '';
  }

  return formatMonthYearInput(existing.startDate);
}

function resolveInitialEndInput(existing: RecurringTransactionDto | undefined): string {
  if (existing === undefined || existing.endDate === null) {
    return '';
  }

  return formatMonthYearInput(existing.endDate);
}

export function EditRecurringPage({ recurringTransactionId }: { recurringTransactionId: string }) {
  const router = useRouter();
  const recurringTransactions = useRecurringTransactions();
  const updateRecurringTransaction = useUpdateRecurringTransaction();
  const deleteRecurringTransaction = useDeleteRecurringTransaction();

  const existing = recurringTransactions.data?.find((recurring) => recurring.id === recurringTransactionId);

  const [amount, setAmount] = useState(resolveInitialAmount(existing));
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedDay, setSelectedDay] = useState(existing?.dayOfMonth ?? 0);
  const [startInput, setStartInput] = useState(resolveInitialStartInput(existing));
  const [endInput, setEndInput] = useState(resolveInitialEndInput(existing));
  const [active, setActive] = useState(existing?.active ?? true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (recurringTransactions.isPending) {
    return <PageLoader />;
  }

  if (recurringTransactions.isError || existing === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const isSaving = updateRecurringTransaction.isPending;
  const isDeleting = deleteRecurringTransaction.isPending;
  const dayPills = buildDayPills(selectedDay);

  async function handlePressSave() {
    if (existing === undefined) {
      return;
    }

    setErrorMessage(null);

    const parsedAmount = parseAmountInput(amount);
    const parsedStart = parseMonthYearInput(startInput);

    let parsedEnd: string | null;
    if (endInput.trim().length === 0) {
      parsedEnd = null;
    } else {
      parsedEnd = parseMonthYearInput(endInput);
    }

    if (parsedAmount === null) {
      setErrorMessage('Informe um valor válido.');
      return;
    }
    if (selectedDay === 0) {
      setErrorMessage('Escolha o dia do mês.');
      return;
    }
    if (parsedStart === null) {
      setErrorMessage('Informe um início válido (MM/AAAA).');
      return;
    }
    if (endInput.trim().length > 0 && parsedEnd === null) {
      setErrorMessage('Informe um fim válido (MM/AAAA).');
      return;
    }

    try {
      await updateRecurringTransaction.mutateAsync({
        recurringTransactionId,
        request: {
          type: existing.type,
          amount: parsedAmount,
          description: normalizeOptionalText(description),
          tagId: existing.tagId,
          paymentMethod: existing.paymentMethod,
          dayOfMonth: selectedDay,
          startDate: parsedStart,
          endDate: parsedEnd,
          active,
        },
      });
      router.back();
    } catch {
      setErrorMessage('Não foi possível salvar. Tente novamente.');
    }
  }

  function handlePressDelete() {
    if (existing === undefined) {
      return;
    }

    let recurringLabel: string;
    if (existing.description !== null) {
      recurringLabel = `a recorrência "${existing.description}"`;
    } else {
      recurringLabel = 'esta recorrência';
    }

    confirmDestructiveAction('Apagar definição', `Apagar ${recurringLabel}? O histórico já gerado é mantido.`, 'Apagar', () => void confirmDelete());
  }

  async function confirmDelete() {
    try {
      await deleteRecurringTransaction.mutateAsync(recurringTransactionId);
      router.back();
    } catch {
      setErrorMessage('Não foi possível apagar. Tente novamente.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-baseline justify-between px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
            editar recorrência
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="text-[15px] text-ct-muted">✕</Text>
          </Pressable>
        </View>

        <View className="gap-[10px] px-6 pt-7">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            valor mensal
          </Text>
          <View className="flex-row items-baseline gap-2 border-b border-ct-ink pb-[10px]">
            <Text className="text-xl text-ct-muted">R$</Text>
            <TextInput
              value={amount}
              onChangeText={(text) => setAmount(maskCurrencyInput(text))}
              placeholder="0,00"
              placeholderTextColor={Colors.light.divider}
              keyboardType="decimal-pad"
              style={{ fontFamily: FontFamily.bodyBold }}
              className="flex-1 text-[40px] tracking-tight text-ct-ink"
            />
          </View>
        </View>

        <View className="gap-[10px] px-6 pt-[22px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            descrição (opcional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Academia"
            placeholderTextColor={Colors.light.muted}
            className="border-b border-ct-divider pb-[10px] text-base text-ct-ink"
          />
        </View>

        <View className="gap-3 px-6 pt-[22px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            dia do mês
          </Text>
          <View className="flex-row gap-[7px]">
            {dayPills.map((pill) => (
              <DayPillButton key={pill.day} label={pill.label} isSelected={pill.isSelected} onPress={() => setSelectedDay(pill.day)} />
            ))}
          </View>
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] text-ct-muted">
            dia 29–31 cai no último dia de meses curtos
          </Text>
        </View>

        <View className="flex-row gap-[18px] px-6 pt-[22px]">
          <View className="flex-1 gap-1">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
              início
            </Text>
            <TextInput
              value={startInput}
              onChangeText={setStartInput}
              placeholder="MM/AAAA"
              placeholderTextColor={Colors.light.muted}
              keyboardType="numbers-and-punctuation"
              className="border-b border-ct-divider pb-[10px] pt-[6px] text-base text-ct-ink"
            />
          </View>
          <View className="flex-1 gap-1">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
              fim
            </Text>
            <TextInput
              value={endInput}
              onChangeText={setEndInput}
              placeholder="MM/AAAA"
              placeholderTextColor={Colors.light.muted}
              keyboardType="numbers-and-punctuation"
              className="border-b border-ct-divider pb-[10px] pt-[6px] text-base text-ct-ink"
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between px-6 pt-6">
          <Text className="text-[15px] font-medium text-ct-ink">Recorrência ativa</Text>
          <ActiveToggle active={active} onPress={() => setActive((current) => !current)} />
        </View>

        <View className="px-6 pt-[10px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] text-ct-muted">
            * gera lançamentos até 1 ano à frente
          </Text>
        </View>

        {errorMessage !== null && (
          <View className="px-6 pt-6">
            <ErrorMessage message={errorMessage} />
          </View>
        )}

        <View className="gap-3 px-6 pb-6 pt-7">
          <Pressable onPress={handlePressSave} disabled={isSaving} className="items-center bg-ct-accent py-[16px] disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-card">salvar</Text>
          </Pressable>
          <Pressable onPress={handlePressDelete} disabled={isDeleting} className="items-center border border-ct-ink py-[15px] disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-ink">apagar definição</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
