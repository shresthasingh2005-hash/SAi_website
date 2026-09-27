import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const DarkEmberBackground = () => {
  const dotSpacing = 24;
  const numCols = Math.ceil(width / dotSpacing);
  const numRows = Math.ceil(height / dotSpacing);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#100C0A' }]} />
      <LinearGradient
        colors={['#100C0A', '#1A1210', '#080605']}
        style={StyleSheet.absoluteFillObject}
      />
      {/* 100% Native Crash-Proof Dot Grid */}
      <View style={StyleSheet.absoluteFillObject}>
        {Array.from({ length: numRows }).map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={{ flexDirection: 'row', width: '100%', height: dotSpacing }}>
            {Array.from({ length: numCols }).map((_, colIndex) => (
              <View key={`dot-${rowIndex}-${colIndex}`} style={{ width: dotSpacing, height: dotSpacing, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' }} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#100C0A',
  }
});

export default DarkEmberBackground;
