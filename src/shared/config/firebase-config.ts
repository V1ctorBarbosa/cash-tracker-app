/**
 * Firebase Web SDK config -- safe to ship in client code. These values identify the
 * project and are restricted server-side (Firestore rules, App Check, OAuth client
 * restrictions); they are not secrets, unlike the backend's service account key.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCq34UdPUD4uIWhaS7j2lfLx24pLPEPvxA',
  authDomain: 'cash-track-83c77.firebaseapp.com',
  projectId: 'cash-track-83c77',
  storageBucket: 'cash-track-83c77.firebasestorage.app',
  messagingSenderId: '1023825986111',
  appId: '1:1023825986111:web:21919f22bf58df8baaee8a',
} as const;

/**
 * The "Web client" OAuth client id Firebase Auth creates when Google sign-in is enabled.
 * @react-native-google-signin/google-signin needs this even on Android/iOS, because it is
 * what Firebase uses server-side to verify the Google ID token.
 */
export const googleWebClientId =
  '1023825986111-vibvmcc90g7c9fuqqgs0fmu69nek3ug7.apps.googleusercontent.com';
