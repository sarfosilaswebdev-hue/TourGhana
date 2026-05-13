import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import HomeHeader from '@/components/Headers/HomeHeader'
import { useUser } from '@/hooks/user.hook'

const _layout = () => {
  const {data:user}= useUser();
  return (
  <Stack>
    <Stack.Screen name="index" options={{ header:()=><HomeHeader user={user}/>,

     }} />
  </Stack>
  )
}

export default _layout