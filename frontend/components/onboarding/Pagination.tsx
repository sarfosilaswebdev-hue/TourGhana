import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { onboardingContent } from '@/contants/onboardingContent'

interface PaginationProps {
    activeIndex: number
}

const Pagination = ({ activeIndex }: PaginationProps) => {
  return (
    <View className='flex-row'>
     {
        onboardingContent.map((_,index) => (
            <View key={index} className={`w-6 h-1 rounded-full ${ activeIndex == index ? 'bg-primary' : 'bg-primary-200'}  mx-1`} />
        ))
     }
    </View>
  )
}

export default Pagination

const styles = StyleSheet.create({})