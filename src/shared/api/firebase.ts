import AsyncStorage from '@react-native-async-storage/async-storage';
// `firebase/auth`'s package.json exports map has no "react-native" condition, so it never
// resolves to the React Native build -- getReactNativePersistence only exists on the
// underlying @firebase/auth package, which does have that condition.
import { getReactNativePersistence } from '@firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { Platform } from 'react-native';

import { firebaseConfig } from '@/shared/config/firebase-config';

const firebaseApp = resolveFirebaseApp();

export const auth: Auth = resolveAuth(firebaseApp);

function resolveFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

function resolveAuth(firebaseApp: ReturnType<typeof resolveFirebaseApp>): Auth {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  return createNativeAuth(firebaseApp);
}

function createNativeAuth(firebaseApp: ReturnType<typeof resolveFirebaseApp>): Auth {
  try {
    return initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // initializeAuth throws if it already ran for this app (e.g. Fast Refresh re-executing
    // this module) -- fall back to the existing instance instead of crashing.
    return getAuth(firebaseApp);
  }
}
