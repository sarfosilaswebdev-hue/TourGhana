import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import Onboarding from '@/components/onboarding/Onboarding'
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';

const index = () => {
  const {isSignedIn} = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/Home");
    }
  }, [isSignedIn]);

  return (
   <View className="flex-1 bg-background items-center justify-center">
      <Onboarding />
    </View>
  )
}

export default index

const styles = StyleSheet.create({})