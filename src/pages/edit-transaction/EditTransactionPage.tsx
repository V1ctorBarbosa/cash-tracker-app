import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { findUncategorizedTag, useTags } from '@/entities/tag';
import {
  getPaymentMethodLabel,
  PaymentMethod,
  TransactionType,
  useTransaction,
  useUpdateTransaction,
  type TransactionDto,
} from '@/entities/transaction';
import { Colors, FontFamily, LoaderSize } from '@/constants/theme';
import { formatDateBR, todayAsIsoDate } from '@/shared/lib/date';
import { takePendingPickedDate } from '@/shared/lib/date-picker-result';
import { formatAmount, maskCurrencyInput, parseAmountInput } from '@/shared/lib/format';
import { normalizeOptionalText } from '@/shared/lib/text';
import { Chip } from '@/shared/ui/Chip';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Loader } from '@/shared/ui/Loader';
import { PageLoader } from '@/shared/ui/PageLoader';
import { SegmentedToggle } from '@/shared/ui/SegmentedToggle';

const PaymentMethodOptions = Object.values(PaymentMethod);

const TypeToggleOptions = [
  { label: 'despesa', value: TransactionType.Expense },
  { label: 'receita', value: TransactionType.Income },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
      {children}
    </Text>
  );
}

function resolveInitialAmount(existing: TransactionDto | undefined): string {
  if (existing === undefined) {
    return '';
  }

  return formatAmount(existing.amount);
}

export function EditTransactionPage({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const transaction = useTransaction(transactionId);
  const tags = useTags();
  const updateTransaction = useUpdateTransaction();

  const existing = transaction.data;

  const [type, setType] = useState<TransactionType>(existing?.type ?? TransactionType.Expense);
  const [amount, setAmount] = useState(resolveInitialAmount(existing));
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tagId, setTagId] = useState<string | null>(existing?.tagId ?? null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(existing?.paymentMethod ?? PaymentMethod.Pix);
  const [dateIso, setDateIso] = useState(existing?.date ?? todayAsIsoDate());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const pickedDate = takePendingPickedDate();
      if (pickedDate !== null) {
        setDateIso(pickedDate);
      }
    }, []),
  );

  if (transaction.isPending || tags.isPending) {
    return <PageLoader />;
  }

  if (transaction.isError || tags.isError || existing === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-ct-paper px-6">
        <Pressable onPress={() => router.back()} hitSlop={12} className="items-end pt-[26px]">
          <Text className="text-[15px] text-ct-muted">✕</Text>
        </Pressable>
        <View className="flex-1 items-center justify-center">
          <ErrorMessage />
        </View>
      </SafeAreaView>
    );
  }

  const tagsForType = tags.data.filter((tag) => tag.kind === type);
  const uncategorizedTag = findUncategorizedTag(tags.data, type);
  const descriptionIsRequired = tagId === null || tagId === uncategorizedTag?.id;
  const isSaving = updateTransaction.isPending;

  let descriptionLabel: string;
  if (descriptionIsRequired) {
    descriptionLabel = 'descrição';
  } else {
    descriptionLabel = 'descrição (opcional)';
  }

  let saveButtonContent: ReactNode;
  if (isSaving) {
    saveButtonContent = <Loader size={LoaderSize.medium} color={Colors.light.card} />;
  } else {
    saveButtonContent = <Text className="text-[15px] font-semibold text-ct-card">salvar alterações</Text>;
  }

  function handleChangeType(nextType: TransactionType) {
    setType(nextType);
    setTagId(null);
  }

  function handlePressDateField() {
    router.push({ pathname: '/pick-date', params: { initial: dateIso } });
  }

  async function handlePressSave() {
    setErrorMessage(null);

    const parsedAmount = parseAmountInput(amount);

    if (parsedAmount === null) {
      setErrorMessage('Informe um valor válido.');
      return;
    }

    const resolvedTagId = tagId ?? uncategorizedTag?.id ?? null;
    if (resolvedTagId === null) {
      setErrorMessage('Não foi possível determinar a categoria. Tente novamente.');
      return;
    }

    const normalizedDescription = normalizeOptionalText(description);
    if (resolvedTagId === uncategorizedTag?.id && normalizedDescription === null) {
      setErrorMessage('Descreva do que se trata, já que não escolheu uma categoria.');
      return;
    }

    try {
      await updateTransaction.mutateAsync({
        transactionId,
        request: {
          type,
          amount: parsedAmount,
          date: dateIso,
          description: normalizedDescription,
          tagId: resolvedTagId,
          paymentMethod,
        },
      });
      router.back();
    } catch {
      setErrorMessage('Não foi possível salvar. Tente novamente.');
    }
  }

  function handlePressDelete() {
    router.push(`/transaction/${transactionId}/delete`);
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="gap-5 px-6 pt-[26px]">
          <View className="flex-row items-baseline justify-between">
            <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
              editar lançamento
            </Text>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text className="text-[15px] text-ct-muted">✕</Text>
            </Pressable>
          </View>

          <SegmentedToggle options={TypeToggleOptions} selectedValue={type} onSelect={handleChangeType} />
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
          <FieldLabel>{descriptionLabel}</FieldLabel>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Supermercado"
            placeholderTextColor={Colors.light.muted}
            className="border-b border-ct-divider pb-[10px] text-base text-ct-ink"
          />
        </View>

        <View className="gap-3 px-6 pt-6">
          <FieldLabel>categoria (opcional)</FieldLabel>
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

        <View className="gap-1 px-6 pt-6">
          <FieldLabel>data</FieldLabel>
          <Pressable onPress={handlePressDateField} className="self-start border-b border-ct-divider pb-[10px] pt-[6px]">
            <Text className="text-base text-ct-ink">{formatDateBR(dateIso)}</Text>
          </Pressable>
        </View>

        {errorMessage !== null && (
          <View className="px-6 pt-6">
            <ErrorMessage message={errorMessage} />
          </View>
        )}

        <View className="gap-3 px-6 pb-6 pt-7">
          <Pressable onPress={handlePressSave} disabled={isSaving} className="items-center bg-ct-accent py-[17px] disabled:opacity-60">
            {saveButtonContent}
          </Pressable>
          <Pressable onPress={handlePressDelete} className="items-center border border-ct-ink py-[15px]">
            <Text className="text-[15px] font-semibold text-ct-ink">excluir lançamento</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
