import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateTag, useDeleteTag, useTags, useUpdateTag, type TagDto } from '@/entities/tag';
import { TransactionType, useTransactions, useUpdateTransaction, type CreateTransactionRequest } from '@/entities/transaction';
import { Colors, FontFamily, TagColorSwatches } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { findReplacementCandidates } from './model/nova-tag-view';

// Wide enough to capture "all transactions ever", to know whether this tag is in use.
const AllTimeFrom = '2020-01-01';
const AllTimeTo = '2035-12-31';

export function NovaTagPage({ tagId }: { tagId?: string }) {
  const router = useRouter();
  const isEditing = tagId !== undefined;

  const tags = useTags();
  const transactions = useTransactions(AllTimeFrom, AllTimeTo);
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const updateTransaction = useUpdateTransaction();

  const existingTag = isEditing ? tags.data?.find((tag) => tag.id === tagId) : undefined;

  const [name, setName] = useState(existingTag?.name ?? '');
  const [kind, setKind] = useState<TransactionType>(existingTag?.kind ?? TransactionType.Expense);
  const [color, setColor] = useState<string>(existingTag?.color ?? TagColorSwatches[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replacementTagId, setReplacementTagId] = useState<string | null>(null);

  if (isEditing && (tags.isPending || transactions.isPending)) {
    return <SafeAreaView className="flex-1 bg-ct-paper" />;
  }

  if (tags.isError || transactions.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const usingTransactions = isEditing ? (transactions.data ?? []).filter((transaction) => transaction.tagId === tagId) : [];
  const replacementCandidates = isEditing ? findReplacementCandidates(tags.data ?? [], tagId, kind) : [];
  const isSaving = createTag.isPending || updateTag.isPending;
  const isDeleting = deleteTag.isPending || updateTransaction.isPending;

  async function handlePressSave() {
    setErrorMessage(null);

    if (name.trim().length === 0) {
      setErrorMessage('Informe um nome.');
      return;
    }

    try {
      if (isEditing) {
        await updateTag.mutateAsync({ tagId, request: { name, color, kind } });
      } else {
        await createTag.mutateAsync({ name, color, kind });
      }
      router.back();
    } catch {
      setErrorMessage('Não foi possível salvar. Tente novamente.');
    }
  }

  function handlePressDelete() {
    if (usingTransactions.length === 0) {
      Alert.alert('Apagar tag', `Apagar "${name}"? Essa ação não pode ser desfeita.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => void deleteWithoutReassignment() },
      ]);
      return;
    }

    if (replacementCandidates.length === 0) {
      Alert.alert('Apagar tag', 'Essa tag está em uso e não há outra tag do mesmo tipo para substituí-la. Crie uma nova tag antes de apagar esta.');
      return;
    }

    // Reveals the replacement picker below instead of a dialog -- there can be several
    // candidates, more than a native Alert's buttons comfortably fit.
    setReplacementTagId(replacementCandidates[0].id);
  }

  async function deleteWithoutReassignment() {
    if (tagId === undefined) {
      return;
    }

    try {
      await deleteTag.mutateAsync(tagId);
      router.back();
    } catch {
      setErrorMessage('Não foi possível apagar. Tente novamente.');
    }
  }

  async function handleConfirmDeleteWithReplacement() {
    if (tagId === undefined || replacementTagId === null) {
      return;
    }

    setErrorMessage(null);

    try {
      for (const transaction of usingTransactions) {
        const request: CreateTransactionRequest = {
          type: transaction.type,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
          tagId: replacementTagId,
          paymentMethod: transaction.paymentMethod,
        };
        await updateTransaction.mutateAsync({ transactionId: transaction.id, request });
      }

      await deleteTag.mutateAsync(tagId);
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
            {isEditing ? 'editar tag' : 'nova tag'}
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="text-[15px] text-ct-muted">✕</Text>
          </Pressable>
        </View>

        <View className="gap-[10px] px-6 pt-[30px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            nome
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Transporte"
            placeholderTextColor={Colors.light.divider}
            style={{ fontFamily: FontFamily.bodySemiBold }}
            className="border-b border-ct-ink pb-[10px] text-[30px] tracking-tight text-ct-ink"
          />
        </View>

        <View className="gap-3 px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            usada em
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setKind(TransactionType.Expense)}
              style={{ backgroundColor: kind === TransactionType.Expense ? Colors.light.ink : 'transparent' }}
              className="flex-1 items-center border border-ct-ink py-3">
              <Text
                style={{ color: kind === TransactionType.Expense ? Colors.light.card : Colors.light.ink }}
                className="text-[13.5px] font-medium">
                despesa
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setKind(TransactionType.Income)}
              style={{ backgroundColor: kind === TransactionType.Income ? Colors.light.ink : 'transparent' }}
              className="flex-1 items-center border border-ct-ink py-3">
              <Text
                style={{ color: kind === TransactionType.Income ? Colors.light.card : Colors.light.ink }}
                className="text-[13.5px] font-medium">
                receita
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-[14px] px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            cor nos gráficos
          </Text>
          <View className="flex-row flex-wrap gap-[10px]">
            {TagColorSwatches.map((swatch) => (
              <Pressable
                key={swatch}
                onPress={() => setColor(swatch)}
                style={{
                  backgroundColor: swatch,
                  borderWidth: swatch === color ? 2 : 1,
                  borderColor: swatch === color ? Colors.light.ink : Colors.light.divider,
                }}
                className="h-11 w-11"
              />
            ))}
          </View>
        </View>

        <View className="px-6 pt-[30px]">
          <View className="flex-row items-center gap-[14px] bg-ct-card p-4">
            <View className="h-[18px] w-[18px]" style={{ backgroundColor: color }} />
            <Text className="flex-1 text-sm text-ct-ink">{name.length > 0 ? name : 'Nome da tag'}</Text>
            <Text style={{ fontFamily: FontFamily.mono }} className="text-[11px] text-ct-muted">
              pré-visualização
            </Text>
          </View>
        </View>

        {isEditing && replacementTagId !== null && (
          <View className="gap-3 px-6 pt-[26px]">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4 }} className="text-[10px] uppercase text-ct-muted">
              {usingTransactions.length} lançamento(s) usam esta tag — escolha a substituta
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {replacementCandidates.map((candidate) => (
                <ReplacementChip
                  key={candidate.id}
                  candidate={candidate}
                  selected={replacementTagId === candidate.id}
                  onPress={() => setReplacementTagId(candidate.id)}
                />
              ))}
            </View>
            <Pressable
              onPress={() => void handleConfirmDeleteWithReplacement()}
              disabled={isDeleting}
              className="mt-2 items-center bg-ct-danger py-[14px] disabled:opacity-60">
              <Text className="text-sm font-semibold text-ct-card">confirmar exclusão</Text>
            </Pressable>
          </View>
        )}

        {errorMessage !== null && (
          <View className="px-6 pt-6">
            <ErrorMessage message={errorMessage} />
          </View>
        )}

        <View className="gap-3 px-6 pb-6 pt-7">
          <Pressable onPress={handlePressSave} disabled={isSaving} className="items-center bg-ct-accent py-[17px] disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-card">{isEditing ? 'salvar' : 'criar tag'}</Text>
          </Pressable>
          {isEditing && (
            <Pressable onPress={handlePressDelete} disabled={isDeleting} className="items-center border border-ct-ink py-[15px] disabled:opacity-60">
              <Text className="text-[15px] font-semibold text-ct-ink">apagar tag</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReplacementChip({ candidate, selected, onPress }: { candidate: TagDto; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: selected ? Colors.light.ink : 'transparent' }}
      className="border border-ct-ink px-[14px] py-[9px]">
      <Text style={{ color: selected ? Colors.light.card : Colors.light.ink }} className="text-[13px] font-medium">
        {candidate.name}
      </Text>
    </Pressable>
  );
}
