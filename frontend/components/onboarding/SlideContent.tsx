import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

// Constrained image area — no overflow
const IMAGE_HEIGHT = height * 0.52

interface SlideContentProps {
  title: string;
  description: string;
  image: any;
}

const SlideContent = ({ title, description, image }: SlideContentProps) => {
  return (
    <View style={{ width, height, backgroundColor: '#081C14' }}>
      {/* Bounded image section */}
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.image} resizeMode="cover" />
        {/* Top dark vignette — so the logo is legible */}
        <LinearGradient
          colors={['rgba(8,28,20,0.6)', 'transparent']}
          locations={[0, 0.3]}
          style={[StyleSheet.absoluteFillObject]}
          pointerEvents="none"
        />
        {/* Bottom fade into dark section */}
        <LinearGradient
          colors={['transparent', 'rgba(8,28,20,0.55)', 'rgba(8,28,20,1)']}
          locations={[0.5, 0.82, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      {/* Text section on dark background */}
      <View style={styles.textContainer}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBar} />
          <Text style={styles.eyebrow}>GHANA TOURISM</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  )
}

export default SlideContent

const styles = StyleSheet.create({
  imageWrapper: {
    width,
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 28,
    paddingTop: 22,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  eyebrowBar: {
    width: 22,
    height: 2,
    backgroundColor: '#F2C94C',
    borderRadius: 2,
  },
  eyebrow: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    letterSpacing: 3.5,
    color: '#F2C94C',
  },
  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 28,
    lineHeight: 36,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.62)',
  },
})
