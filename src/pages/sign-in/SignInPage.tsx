import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithGoogle } from '@/features/auth';
import { Colors, FontFamily } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

export function SignInPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePressSignIn() {
    setErrorMessage(null);
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-between gap-6 bg-ct-paper px-7 py-8">
      <View className="gap-[10px]">
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 2.2 }} className="text-[11px] uppercase text-ct-muted">
          controle financeiro pessoal
        </Text>
        <Text style={{ fontFamily: FontFamily.displayWordmark, lineHeight: 47 }} className="text-[40px] tracking-tight text-ct-ink">
          cash{'\n'}track
        </Text>
      </View>

      <View className="flex-row items-stretch gap-5">
        <View className="w-px bg-ct-ink" />
        <Text className="max-w-[250px] text-[15px] leading-[22px] text-ct-ink">
          Receitas, despesas, recorrências e metas por categoria. Um usuário, um lugar.
        </Text>
      </View>

      <View className="gap-[14px]">
        <Pressable onPress={handlePressSignIn} disabled={isSigningIn} className="items-center bg-ct-ink py-[17px] disabled:opacity-60">
          {isSigningIn ? (
            <ActivityIndicator color={Colors.light.card} />
          ) : (
            <Text className="text-[15px] font-semibold text-ct-card">Entrar com Google</Text>
          )}
        </Pressable>
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.8 }} className="text-center text-[10.5px] text-ct-muted">
          seus dados ficam na sua conta
        </Text>

        {errorMessage !== null && <ErrorMessage message={errorMessage} />}
      </View>
    </SafeAreaView>
  );
}
