import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from './src/hooks/useNavigation';
import { Arrow3D } from './src/components/Arrow3D';
import { NavigationInfo } from './src/components/NavigationInfo ';
import { ErrorDisplay } from './src/components/ErrorDisplay';
import { LoadingScreen } from './src/components/LoadingScreen';

export default function App() {
  const { navigationData, isLocationPermissionGranted, isSensorActive, error } =
    useNavigation();

  // Show loading screen while initializing
  if (!isLocationPermissionGranted || !isSensorActive) {
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    return <LoadingScreen message="Initializing sensors and location..." />;
  }

  // Show error if something went wrong
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Show loading if we don't have location yet
  if (!navigationData.userLocation) {
    return <LoadingScreen message="Acquiring location..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* 3D Arrow Visualization */}
        <View style={styles.arrowContainer}>
          <Arrow3D
            relativeAngle={navigationData.relativeAngle}
            distance={navigationData.distance}
          />
        </View>

        {/* Navigation Information */}
        <ScrollView style={styles.infoContainer}>
          <NavigationInfo navigationData={navigationData} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
  },
  arrowContainer: {
    height: '50%',
    backgroundColor: '#1a1a2e',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#16213e',
  },
});
