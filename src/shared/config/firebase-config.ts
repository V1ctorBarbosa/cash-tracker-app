/**
 * Firebase Web SDK config -- safe to ship in client code. These values identify the
 * project and are restricted server-side (Firestore rules, App Check, OAuth client
 * restrictions); they are not secrets, unlike the backend's service account key.
 *
 * REPLACE_ME: fill these in once the Firebase project is created (Firebase console ->
 * Project settings -> General -> Your apps -> Web app), same as food-track's
 * src/shared/config/firebase-config.ts.
 */
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.firebasestorage.app',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
} as const;

/**
 * The "Web client" OAuth client id Firebase Auth creates when Google sign-in is enabled.
 * @react-native-google-signin/google-signin needs this even on Android/iOS, because it is
 * what Firebase uses server-side to verify the Google ID token.
 */
export const googleWebClientId = 'REPLACE_ME.apps.googleusercontent.com';
