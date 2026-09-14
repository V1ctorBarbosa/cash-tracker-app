import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithGoogle } from '@/features/auth';
import { Colors, brandStripeColors } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { GoogleIcon } from '@/shared/ui/icons/GoogleIcon';

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
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-center gap-8 px-7">
        <View className="h-32 flex-row overflow-hidden rounded-2xl">
          {brandStripeColors.map((color) => (
            <View key={color} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </View>

        <View className="gap-2">
          <Text className="text-6xl font-bold uppercase leading-[0.9] text-ct-savings">Cash{'\n'}Track</Text>
          <Text className="max-w-[270px] text-base leading-6 text-ct-muted">
            Registre suas receitas e despesas. Veja o saldo se mover.
          </Text>
        </View>
      </View>

      <View className="gap-3.5 px-7 pb-10">
        <Pressable
          onPress={handlePressSignIn}
          disabled={isSigningIn}
          className="h-[58px] flex-row items-center justify-center gap-3 rounded-2xl bg-[#F0F0F3] disabled:opacity-60 dark:bg-[#212225]">
          {isSigningIn ? (
            <ActivityIndicator color={Colors.light.savings} />
          ) : (
            <>
              <GoogleIcon />
              <Text className="text-base font-bold text-ct-savings">Continuar com o Google</Text>
            </>
          )}
        </Pressable>

        <Text className="text-center text-xs leading-5 text-ct-muted">
          Por enquanto, o Google é a única forma de entrar.
        </Text>

        {errorMessage !== null && <ErrorMessage message={errorMessage} />}
      </View>
    </SafeAreaView>
  );
}
