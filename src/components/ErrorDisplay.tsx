import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    maxWidth: 400,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
