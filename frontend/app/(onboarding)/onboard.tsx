import { View } from 'react-native'
import React, { useEffect } from 'react'
import Onboarding from '@/components/onboarding/Onboarding'
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';

const OnboardScreen = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/Home");
    }
  }, [isSignedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: '#081C14' }}>
      <Onboarding />
    </View>
  )
}

export default OnboardScreen