import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { Michroma_400Regular } from '@expo-google-fonts/michroma';
import {
  Saira_400Regular,
  Saira_500Medium,
  Saira_600SemiBold,
  Saira_700Bold,
  Saira_800ExtraBold,
} from '@expo-google-fonts/saira';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSession } from '@/entities/session';
import { authGateway } from '@/shared/api/auth-gateway';
import { clearQueryCacheOnSignOut, queryClient } from '@/shared/api/query-client';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const session = useSession();
  const [fontsLoaded] = useFonts({
    Saira_400Regular,
    Saira_500Medium,
    Saira_600SemiBold,
    Saira_700Bold,
    Saira_800ExtraBold,
    Michroma_400Regular,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  const isReady = fontsLoaded && session.status !== 'loading';

  useEffect(() => clearQueryCacheOnSignOut(authGateway, queryClient), []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {/* This design has no dark variant yet, so the app always renders with the light theme. */}
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Explicit override so Android also slides in from the right, matching iOS's native
                default and the design's "detail enters from the side" behavior -- native-stack
                transitions are OS-driven and only take preset names, not a custom timing curve. */}
            <Stack.Screen name="transaction/[id]" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
