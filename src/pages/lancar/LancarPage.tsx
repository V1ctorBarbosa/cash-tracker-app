import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateRecurringTransaction } from '@/entities/recurring-transaction';
import { useTags } from '@/entities/tag';
import { getPaymentMethodLabel, PaymentMethod, TransactionType, useCreateTransaction } from '@/entities/transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { maskCurrencyInput, parseAmountInput } from '@/shared/lib/format';
import { Chip } from '@/shared/ui/Chip';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { parseDateInput, todayAsBRDate } from './model/lancar-view';

const PaymentMethodOptions = Object.values(PaymentMethod);

function FieldLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
      {children}
    </Text>
  );
}

export function LancarPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; recurring?: string }>();
  const initialType = params.type === TransactionType.Income ? TransactionType.Income : TransactionType.Expense;

  const tags = useTags();
  const createTransaction = useCreateTransaction();
  const createRecurringTransaction = useCreateRecurringTransaction();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [tagId, setTagId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Pix);
  const [dateInput, setDateInput] = useState(todayAsBRDate());
  const [isRecurring, setIsRecurring] = useState(params.recurring === 'true');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tagsForType = tags.data?.filter((tag) => tag.kind === type) ?? [];

  const isSaving = createTransaction.isPending || createRecurringTransaction.isPending;

  function handleChangeType(nextType: TransactionType) {
    setType(nextType);
    setTagId(null);
  }

  async function handlePressSave() {
    setErrorMessage(null);

    const parsedAmount = parseAmountInput(amount);
    const parsedDate = parseDateInput(dateInput);

    if (parsedAmount === null) {
      setErrorMessage('Informe um valor válido.');
      return;
    }
    if (description.trim().length === 0) {
      setErrorMessage('Informe uma descrição.');
      return;
    }
    if (tagId === null) {
      setErrorMessage('Escolha uma categoria.');
      return;
    }
    if (parsedDate === null) {
      setErrorMessage('Informe uma data válida (DD/MM/AAAA).');
      return;
    }

    try {
      if (isRecurring) {
        const dayOfMonth = Number(parsedDate.split('-')[2]);
        await createRecurringTransaction.mutateAsync({
          type,
          amount: parsedAmount,
          description,
          tagId,
          paymentMethod,
          dayOfMonth,
          startDate: parsedDate,
          endDate: null,
        });
      } else {
        await createTransaction.mutateAsync({ type, amount: parsedAmount, date: parsedDate, description, tagId, paymentMethod });
      }

      router.back();
    } catch {
      setErrorMessage('Não foi possível salvar. Tente novamente.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="gap-5 px-6 pt-[26px]">
          <View className="flex-row items-baseline justify-between">
            <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
              novo lançamento
            </Text>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text className="text-[15px] text-ct-muted">✕</Text>
            </Pressable>
          </View>

          <View className="flex-row border border-ct-ink">
            <Pressable
              onPress={() => handleChangeType(TransactionType.Expense)}
              style={{ backgroundColor: type === TransactionType.Expense ? Colors.light.ink : 'transparent' }}
              className="flex-1 items-center py-[13px]">
              <Text style={{ color: type === TransactionType.Expense ? Colors.light.card : Colors.light.ink }} className="text-sm font-semibold">
                despesa
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleChangeType(TransactionType.Income)}
              style={{ backgroundColor: type === TransactionType.Income ? Colors.light.ink : 'transparent' }}
              className="flex-1 items-center py-[13px]">
              <Text style={{ color: type === TransactionType.Income ? Colors.light.card : Colors.light.ink }} className="text-sm font-semibold">
                receita
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-1 px-6 pt-[26px]">
          <FieldLabel>valor</FieldLabel>
          <View className="flex-row items-baseline gap-2 border-b border-ct-ink pb-3 pt-[6px]">
            <Text className="text-xl text-ct-muted">R$</Text>
            <TextInput
              value={amount}
              onChangeText={(text) => setAmount(maskCurrencyInput(text))}
              placeholder="0,00"
              placeholderTextColor={Colors.light.divider}
              keyboardType="decimal-pad"
              style={{ fontFamily: FontFamily.bodyExtraBold }}
              className="flex-1 text-[44px] tracking-tight text-ct-ink"
            />
          </View>
        </View>

        <View className="gap-[10px] px-6 pt-6">
          <FieldLabel>descrição</FieldLabel>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Supermercado"
            placeholderTextColor={Colors.light.muted}
            className="border-b border-ct-divider pb-[10px] text-base text-ct-ink"
          />
        </View>

        <View className="gap-3 px-6 pt-6">
          <FieldLabel>categoria</FieldLabel>
          {tagsForType.length === 0 && <Text className="text-xs text-ct-muted">Nenhuma categoria ainda.</Text>}
          <View className="flex-row flex-wrap gap-2">
            {tagsForType.map((tag) => (
              <Chip key={tag.id} label={tag.name} selected={tagId === tag.id} onPress={() => setTagId(tag.id)} />
            ))}
          </View>
        </View>

        <View className="gap-3 px-6 pt-6">
          <FieldLabel>forma de pagamento</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            {PaymentMethodOptions.map((option) => (
              <Chip
                key={option}
                label={getPaymentMethodLabel(option)}
                selected={paymentMethod === option}
                onPress={() => setPaymentMethod(option)}
              />
            ))}
          </View>
        </View>

        <View className="flex-row gap-[18px] px-6 pt-6">
          <View className="flex-1 gap-1">
            <FieldLabel>data</FieldLabel>
            <TextInput
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.light.muted}
              keyboardType="numbers-and-punctuation"
              className="border-b border-ct-divider pb-[10px] pt-[6px] text-base text-ct-ink"
            />
          </View>
          <View className="flex-1 gap-1">
            <FieldLabel>repetir todo mês</FieldLabel>
            <Pressable onPress={() => setIsRecurring((current) => !current)} className="border-b border-ct-divider pb-[10px] pt-[6px]">
              <Text className="text-base text-ct-ink">{isRecurring ? 'sim' : 'não'}</Text>
            </Pressable>
          </View>
        </View>

        {errorMessage !== null && (
          <View className="px-6 pt-6">
            <ErrorMessage message={errorMessage} />
          </View>
        )}

        <View className="px-6 pb-6 pt-7">
          <Pressable onPress={handlePressSave} disabled={isSaving} className="items-center bg-ct-accent py-[17px] disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-card">salvar lançamento</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
