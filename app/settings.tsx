import { router } from 'expo-router';

import { SettingsScreen } from '../src/features/settings/SettingsScreen';

const ROUTES = {
  notifications: '/notifications',
  onboarding: '/onboarding',
  states: '/dev/states',
} as const;

export default function SettingsRoute() {
  return <SettingsScreen onOpen={(target) => router.push(ROUTES[target])} />;
}
