import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, LoaderSize } from '@/constants/theme';

import { Loader } from './Loader';

/** The full-page loading state shown while a screen's first query is still in flight. */
export function PageLoader() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper">
      <Loader size={LoaderSize.large} color={Colors.light.ink} />
    </SafeAreaView>
  );
}
