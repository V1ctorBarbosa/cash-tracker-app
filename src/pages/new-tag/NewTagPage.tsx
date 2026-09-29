import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateTag, useDeleteTag, useTags, useUpdateTag, type TagDto } from '@/entities/tag';
import {
  TransactionType,
  useTransactions,
  useUpdateTransaction,
  type CreateTransactionRequest,
  type TransactionDto,
} from '@/entities/transaction';
import { Colors, FontFamily, TagColorGroups } from '@/constants/theme';
import { showAlert } from '@/shared/lib/confirm';
import { Chip } from '@/shared/ui/Chip';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { PageLoader } from '@/shared/ui/PageLoader';

import { findReplacementCandidates } from './model/new-tag-view';

const TotalTagColorCount = TagColorGroups.reduce((sum, group) => sum + group.colors.length, 0);
const DefaultTagColor = TagColorGroups[0].colors[1];

function KindOption({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
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
    <Pressable onPress={onPress} style={{ backgroundColor }} className="flex-1 items-center border border-ct-ink py-3">
      <Text style={{ color: textColor }} className="text-[13.5px] font-medium">
        {label}
      </Text>
    </Pressable>
  );
}

function ColorSwatch({ color, isSelected, onPress }: { color: string; isSelected: boolean; onPress: () => void }) {
  let borderWidth: number;
  let borderColor: string;
  if (isSelected) {
    borderWidth = 2;
    borderColor = Colors.light.ink;
  } else {
    borderWidth = 1;
    borderColor = Colors.light.divider;
  }

  return <Pressable onPress={onPress} style={{ backgroundColor: color, borderWidth, borderColor }} className="aspect-square flex-1" />;
}

function SaveAndDeleteActions({
  isEditing,
  isSaving,
  isDeleting,
  onPressSave,
  onPressDelete,
}: {
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onPressSave: () => void;
  onPressDelete: () => void;
}) {
  let saveLabel: string;
  if (isEditing) {
    saveLabel = 'salvar';
  } else {
    saveLabel = 'criar tag';
  }

  let deleteButton: ReactNode = null;
  if (isEditing) {
    deleteButton = (
      <Pressable onPress={onPressDelete} disabled={isDeleting} className="items-center border border-ct-ink py-[15px] disabled:opacity-60">
        <Text className="text-[15px] font-semibold text-ct-ink">apagar tag</Text>
      </Pressable>
    );
  }

  return (
    <View className="gap-3 px-6 pb-6 pt-7">
      <Pressable onPress={onPressSave} disabled={isSaving} className="items-center bg-ct-accent py-[17px] disabled:opacity-60">
        <Text className="text-[15px] font-semibold text-ct-card">{saveLabel}</Text>
      </Pressable>
      {deleteButton}
    </View>
  );
}

export function NewTagPage({ tagId }: { tagId?: string }) {
  const router = useRouter();
  const isEditing = tagId !== undefined;

  const tags = useTags();
  const transactions = useTransactions({ tagId }, { enabled: isEditing });
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const updateTransaction = useUpdateTransaction();

  let existingTag: TagDto | undefined;
  if (isEditing) {
    existingTag = tags.data?.find((tag) => tag.id === tagId);
  }

  const isLocked = existingTag?.isSystemDefined === true;

  const [name, setName] = useState(existingTag?.name ?? '');
  const [kind, setKind] = useState<TransactionType>(existingTag?.kind ?? TransactionType.Expense);
  const [color, setColor] = useState<string>(existingTag?.color ?? DefaultTagColor);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replacementTagId, setReplacementTagId] = useState<string | null>(null);

  if (isEditing && (tags.isPending || transactions.isPending)) {
    return <PageLoader />;
  }

  if (tags.isError || transactions.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  let usingTransactions: TransactionDto[] = [];
  let replacementCandidates: ReturnType<typeof findReplacementCandidates> = [];
  if (isEditing) {
    usingTransactions = transactions.data ?? [];
    replacementCandidates = findReplacementCandidates(tags.data ?? [], tagId, kind);
  }

  const isSaving = createTag.isPending || updateTag.isPending;
  const isDeleting = deleteTag.isPending || updateTransaction.isPending;

  let title: string;
  if (isEditing) {
    title = 'editar tag';
  } else {
    title = 'nova tag';
  }

  let previewName: string;
  if (name.length > 0) {
    previewName = name;
  } else {
    previewName = 'Nome da tag';
  }

  function handleSelectKind(nextKind: TransactionType) {
    if (isLocked) {
      return;
    }

    setKind(nextKind);
  }

  function handleSelectColor(nextColor: string) {
    if (isLocked) {
      return;
    }

    setColor(nextColor);
  }

  async function handlePressSave() {
    if (isLocked) {
      return;
    }

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
    if (tagId === undefined) {
      return;
    }

    if (usingTransactions.length === 0) {
      router.push(`/categories/${tagId}/delete`);
      return;
    }

    if (replacementCandidates.length === 0) {
      showAlert('Apagar tag', 'Essa tag está em uso e não há outra tag do mesmo tipo para substituí-la. Crie uma nova tag antes de apagar esta.');
      return;
    }

    // Reveals the replacement picker below instead of a dialog -- there can be several
    // candidates, more than a native Alert's buttons comfortably fit.
    setReplacementTagId(replacementCandidates[0].id);
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
            {title}
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
            editable={!isLocked}
            placeholder="Transporte"
            placeholderTextColor={Colors.light.divider}
            style={{ fontFamily: FontFamily.bodySemiBold }}
            className="border-b border-ct-ink pb-[10px] text-[30px] tracking-tight text-ct-ink"
          />
        </View>

        {isLocked && (
          <View className="px-6 pt-[14px]">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10.5px] text-ct-muted">
              tag automática, usada quando nenhuma categoria é escolhida — não pode ser editada nem apagada
            </Text>
          </View>
        )}

        <View className="gap-3 px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            usada em
          </Text>
          <View className="flex-row gap-2">
            <KindOption label="despesa" isSelected={kind === TransactionType.Expense} onPress={() => handleSelectKind(TransactionType.Expense)} />
            <KindOption label="receita" isSelected={kind === TransactionType.Income} onPress={() => handleSelectKind(TransactionType.Income)} />
          </View>
        </View>

        <View className="gap-3 px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            cor nos gráficos · {TotalTagColorCount} opções
          </Text>
          <View className="gap-[10px]">
            {TagColorGroups.map((group) => (
              <View key={group.label} className="gap-[6px]">
                <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.2 }} className="text-[9.5px] uppercase text-ct-muted">
                  {group.label}
                </Text>
                <View className="flex-row gap-[6px]">
                  {group.colors.map((swatch) => (
                    <ColorSwatch key={swatch} color={swatch} isSelected={swatch === color} onPress={() => handleSelectColor(swatch)} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="px-6 pt-[30px]">
          <View className="flex-row items-center gap-[14px] bg-ct-card p-4">
            <View className="h-[18px] w-[18px]" style={{ backgroundColor: color }} />
            <Text className="flex-1 text-sm text-ct-ink">{previewName}</Text>
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
                <Chip
                  key={candidate.id}
                  label={candidate.name}
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

        {!isLocked && (
          <SaveAndDeleteActions
            isEditing={isEditing}
            isSaving={isSaving}
            isDeleting={isDeleting}
            onPressSave={() => void handlePressSave()}
            onPressDelete={handlePressDelete}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
