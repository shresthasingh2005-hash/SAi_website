import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const DarkMidnightMeshBackground = () => {
  const gridSize = 28;
  const numVertical = Math.ceil(width / gridSize);
  const numHorizontal = Math.ceil(height / gridSize);

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={['#0B1B36', '#071326', '#040B16']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* 100% Native Crash-Proof Grid */}
      <View style={StyleSheet.absoluteFillObject}>
        {Array.from({ length: numVertical }).map((_, i) => (
          <View key={`v-${i}`} style={{ position: 'absolute', left: i * gridSize, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(100,180,255,0.15)' }} />
        ))}
        {Array.from({ length: numHorizontal }).map((_, i) => (
          <View key={`h-${i}`} style={{ position: 'absolute', top: i * gridSize, left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,180,255,0.15)' }} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0D10',
  }
});

export default DarkMidnightMeshBackground;
