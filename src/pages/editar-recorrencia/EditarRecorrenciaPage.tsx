import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDeleteRecurringTransaction, useRecurringTransactions, useUpdateRecurringTransaction } from '@/entities/recurring-transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { formatAmount, maskCurrencyInput, parseAmountInput } from '@/shared/lib/format';
import { normalizeOptionalText } from '@/shared/lib/text';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { buildDayPills, formatMonthYearInput, parseMonthYearInput } from './model/editar-recorrencia-view';

function ActiveToggle({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="h-7 w-[52px] justify-center border border-ct-ink p-[2px]">
      <View style={{ backgroundColor: Colors.light.ink, alignSelf: active ? 'flex-end' : 'flex-start' }} className="h-[22px] w-[22px]" />
    </Pressable>
  );
}

export function EditarRecorrenciaPage({ recurringTransactionId }: { recurringTransactionId: string }) {
  const router = useRouter();
  const recurringTransactions = useRecurringTransactions();
  const updateRecurringTransaction = useUpdateRecurringTransaction();
  const deleteRecurringTransaction = useDeleteRecurringTransaction();

  const existing = recurringTransactions.data?.find((recurring) => recurring.id === recurringTransactionId);

  const [amount, setAmount] = useState(existing !== undefined ? formatAmount(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedDay, setSelectedDay] = useState(existing?.dayOfMonth ?? 0);
  const [startInput, setStartInput] = useState(existing !== undefined ? formatMonthYearInput(existing.startDate) : '');
  const [endInput, setEndInput] = useState(existing?.endDate !== null && existing?.endDate !== undefined ? formatMonthYearInput(existing.endDate) : '');
  const [active, setActive] = useState(existing?.active ?? true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (recurringTransactions.isPending) {
    return <SafeAreaView className="flex-1 bg-ct-paper" />;
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
    const parsedEnd = endInput.trim().length === 0 ? null : parseMonthYearInput(endInput);

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

    Alert.alert('Apagar definição', `Apagar ${recurringLabel}? O histórico já gerado é mantido.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => void confirmDelete() },
    ]);
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
              <Pressable
                key={pill.day}
                onPress={() => setSelectedDay(pill.day)}
                style={{ backgroundColor: pill.isSelected ? Colors.light.ink : 'transparent' }}
                className="flex-1 items-center border border-ct-ink py-[11px]">
                <Text
                  style={{ fontFamily: FontFamily.mono, color: pill.isSelected ? Colors.light.card : Colors.light.ink }}
                  className="text-[13px]">
                  {pill.label}
                </Text>
              </Pressable>
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
