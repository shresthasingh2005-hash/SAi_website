import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const STAR_AREA_HEIGHT = 2000;

const createStars = (count) => {
  return [...Array(count)].map((_, i) => ({
    key: String(i),
    left: Math.random() * width,
    top: Math.random() * STAR_AREA_HEIGHT
  }));
};

const StarLayer = ({ size, count, duration }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const stars = useMemo(() => createStars(count), [count]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(translateY, {
        toValue: -STAR_AREA_HEIGHT,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    anim.start();
    return () => anim.stop();
  }, [translateY, duration]);

  const renderStars = () => (
    <View style={[StyleSheet.absoluteFillObject, { height: STAR_AREA_HEIGHT }]}>
      {stars.map(s => (
        <View key={s.key} style={[styles.star, { width: size, height: size, left: s.left, top: s.top }]} />
      ))}
    </View>
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { height: STAR_AREA_HEIGHT, transform: [{ translateY }] }]}>
        {renderStars()}
      </Animated.View>
      {/* Seamless looping layer directly below the first one */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { height: STAR_AREA_HEIGHT, transform: [{ translateY: Animated.add(translateY, STAR_AREA_HEIGHT) }] }]}>
        {renderStars()}
      </Animated.View>
    </View>
  );
};

export default function StarsBackground() {
  return (
    <View style={styles.container}>
      <StarLayer size={1} count={150} duration={500} />
      <StarLayer size={2} count={80} duration={800} />
      <StarLayer size={3} count={30} duration={1200} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: 'transparent'
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 99,
  }
});
