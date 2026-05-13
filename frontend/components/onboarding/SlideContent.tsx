import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const width = Dimensions.get('window').width

interface SlideContentProps {
  title: string;
  description: string;
  image: any;
}


const SlideContent = ({ title, description, image }: SlideContentProps) => {
  return (
    <View className='w-full items-center' style={{ width }}>
      <View className='w-full items-center gap-5 px-4'>
        <Image source={image} className='w-[98%] h-[408]' resizeMode='cover'/>
        <Text className='text-3xl  text-center text-primary font-popBold'>{title}</Text>
        <Text className='text-base text-center text-dark font-regular'>{description}</Text>
      </View>
    </View>
  )
}

export default SlideContent

const styles = StyleSheet.create({})