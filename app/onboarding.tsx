import { router } from 'expo-router';

import { OnboardingScreen } from '../src/features/onboarding/OnboardingScreen';

export default function OnboardingRoute() {
  return <OnboardingScreen onFinish={() => router.dismissTo('/')} />;
}
