import { Redirect } from 'expo-router';

// Superseded by the (tabs) group; kept as a redirect stub rather than a stale duplicate screen.
export default function HomeRoute() {
  return <Redirect href="/(tabs)" />;
}
