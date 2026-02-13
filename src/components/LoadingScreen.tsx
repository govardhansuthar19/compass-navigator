import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Initializing...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00d4ff" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
