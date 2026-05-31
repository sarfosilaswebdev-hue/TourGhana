import { StyleSheet, View } from 'react-native'
import React from 'react'
import { onboardingContent } from '@/contants/onboardingContent'
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'

interface PaginationProps {
  activeIndex: number
}

const DOT_SIZE = 8
const ACTIVE_WIDTH = 28

const Dot = ({ isActive }: { isActive: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? ACTIVE_WIDTH : DOT_SIZE, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    }),
    opacity: withTiming(isActive ? 1 : 0.3, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    }),
  }))

  return (
    <Animated.View
      style={[
        {
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: '#F2C94C',
          marginHorizontal: 3,
        },
        animatedStyle,
      ]}
    />
  )
}

const Pagination = ({ activeIndex }: PaginationProps) => {
  return (
    <View style={styles.container}>
      {onboardingContent.map((_, index) => (
        <Dot key={index} isActive={activeIndex === index} />
      ))}
    </View>
  )
}

export default Pagination

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
})
