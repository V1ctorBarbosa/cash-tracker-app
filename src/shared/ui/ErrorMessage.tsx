import { Text, View } from 'react-native';

const DefaultErrorMessage = 'Não foi possível buscar os dados';

export function ErrorMessage({ message = DefaultErrorMessage }: { message?: string }) {
  return (
    <View className="items-center">
      <Text
        style={{ fontFamily: 'IBMPlexMono_500Medium' }}
        className="text-center text-xs uppercase tracking-widest text-ct-danger">
        {message}
      </Text>
    </View>
  );
}
