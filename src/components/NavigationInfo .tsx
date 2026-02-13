import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationData } from '../types';
import { formatDistance } from '../utils/geolocation';

interface NavigationInfoProps {
  navigationData: NavigationData;
}

export function NavigationInfo({ navigationData }: NavigationInfoProps) {
  const { distance, bearing, deviceHeading, relativeAngle } = navigationData;

  // Debug: Log values to console
  // React.useEffect(() => {
  //   console.log('Navigation Update:', {
  //     distance: distance ? Math.round(distance) : null,
  //     bearing: bearing ? Math.round(bearing) : null,
  //     deviceHeading: deviceHeading ? Math.round(deviceHeading) : null,
  //     relativeAngle: relativeAngle ? Math.round(relativeAngle) : null,
  //   });
  // }, [distance, bearing, deviceHeading, relativeAngle]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Digantara Industries</Text>
        <Text style={styles.subtitle}>Bengaluru, India</Text>
      </View>

      {distance !== null && (
        <View style={styles.card}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{formatDistance(distance)}</Text>
          <Text style={styles.subValue}>({Math.round(distance)} meters)</Text>
        </View>
      )}

      {bearing !== null && (
        <View style={styles.card}>
          <Text style={styles.label}>Bearing to Target</Text>
          <Text style={styles.value}>{Math.round(bearing)}°</Text>
        </View>
      )}

      {deviceHeading !== null && (
        <View style={styles.card}>
          <Text style={styles.label}>Device Heading</Text>
          <Text style={styles.value}>{Math.round(deviceHeading)}°</Text>
        </View>
      )}

      {relativeAngle !== null && (
        <View style={styles.card}>
          <Text style={styles.label}>Relative Angle</Text>
          <Text style={[
            styles.value,
            Math.abs(relativeAngle) < 10 && styles.valueSuccess
          ]}>
            {Math.round(relativeAngle)}°
          </Text>
          {Math.abs(relativeAngle) < 10 && (
            <Text style={styles.successText}>You're pointing at the target!</Text>
          )}
        </View>
      )}

      <View style={styles.directionHint}>
        {relativeAngle !== null && (
          <Text style={styles.hintText}>
            {Math.abs(relativeAngle) < 10
              ? '✓ Aligned with target'
              : relativeAngle > 0
                ? '← Turn left'
                : '→ Turn right'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  gpsHint: {
    fontSize: 11,
    color: 'rgba(0, 212, 255, 0.8)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  valueSuccess: {
    color: '#00ff88',
  },
  successText: {
    marginTop: 4,
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '600',
  },
  directionHint: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.4)',
  },
  hintText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00d4ff',
  },
});
