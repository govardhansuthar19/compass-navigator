import { useState, useEffect, useCallback } from 'react';
import { Coordinates, NavigationData } from '../types';
import { LocationService } from '../services/LocationService';
import { SensorService } from '../services/SensorService';
import {
  calculateDistance,
  calculateBearing,
  angleDifference,
  normalizeAngle,
} from '../utils/geolocation';

// Digantara Industries coordinates
const TARGET_LOCATION: Coordinates = {
  latitude: 13.0453132,
  longitude: 77.5733936,
};

export function useNavigation() {
  const [navigationData, setNavigationData] = useState<NavigationData>({
    userLocation: null,
    targetLocation: TARGET_LOCATION,
    distance: null,
    bearing: null,
    deviceHeading: null,
    relativeAngle: null,
  });

  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [isSensorActive, setIsSensorActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize location tracking
  const initializeLocation = useCallback(async () => {
    try {
      const locationService = LocationService.getInstance();
      const hasPermission = await locationService.hasPermissions();

      if (!hasPermission) {
        const granted = await locationService.requestPermissions();
        setIsLocationPermissionGranted(granted);
        
        if (!granted) {
          setError('Location permission denied. Please enable location access in settings.');
          return;
        }
      } else {
        setIsLocationPermissionGranted(true);
      }

      // Get initial location
      const location = await locationService.getCurrentLocation();
      if (location) {
        updateLocation(location);
      }

      // Start watching location
      const started = await locationService.startWatching();
      if (!started) {
        setError('Failed to start location tracking');
        return;
      }

      // Add location listener
      const unsubscribe = locationService.addListener((location) => {
        updateLocation(location);
      });

      return unsubscribe;
    } catch (err) {
      setError('Error initializing location: ' + (err as Error).message);
      console.error('Location initialization error:', err);
    }
  }, []);

  // Initialize sensors
  const initializeSensors = useCallback(async () => {
    try {
      const sensorService = SensorService.getInstance();
      const availability = await sensorService.checkAvailability();

      if (!availability.deviceMotion && !availability.magnetometer) {
        setError('Device sensors not available');
        return;
      }

      const started = await sensorService.startSensors();
      if (!started) {
        setError('Failed to start sensors');
        return;
      }

      setIsSensorActive(true);

      // Add sensor listener
      const unsubscribe = sensorService.addListener((heading) => {
        updateDeviceHeading(heading);
      });

      return unsubscribe;
    } catch (err) {
      setError('Error initializing sensors: ' + (err as Error).message);
      console.error('Sensor initialization error:', err);
    }
  }, []);

  // Update location and recalculate navigation data
  const updateLocation = useCallback((location: Coordinates) => {
    setNavigationData((prev) => {
      const distance = calculateDistance(location, TARGET_LOCATION);
      const bearing = calculateBearing(location, TARGET_LOCATION);

      let relativeAngle = null;
      if (prev.deviceHeading !== null) {
        relativeAngle = angleDifference(prev.deviceHeading, bearing);
      }

      return {
        ...prev,
        userLocation: location,
        distance,
        bearing,
        relativeAngle,
      };
    });
  }, []);

  // Update device heading and recalculate relative angle
  const updateDeviceHeading = useCallback((heading: number) => {
    setNavigationData((prev) => {
      const normalizedHeading = normalizeAngle(heading);
      
      let relativeAngle = null;
      if (prev.bearing !== null) {
        relativeAngle = angleDifference(normalizedHeading, prev.bearing);
      }

      return {
        ...prev,
        deviceHeading: normalizedHeading,
        relativeAngle,
      };
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    let locationUnsubscribe: (() => void) | undefined;
    let sensorUnsubscribe: (() => void) | undefined;

    const initialize = async () => {
      locationUnsubscribe = await initializeLocation();
      sensorUnsubscribe = await initializeSensors();
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (locationUnsubscribe) locationUnsubscribe();
      if (sensorUnsubscribe) sensorUnsubscribe();

      LocationService.getInstance().cleanup();
      SensorService.getInstance().cleanup();
    };
  }, [initializeLocation, initializeSensors]);

  return {
    navigationData,
    isLocationPermissionGranted,
    isSensorActive,
    error,
  };
}
