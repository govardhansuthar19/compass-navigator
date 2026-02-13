import * as Location from 'expo-location';
import { Coordinates } from '../types';

export class LocationService {
  private static instance: LocationService;
  private currentLocation: Coordinates | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private listeners: Set<(location: Coordinates) => void> = new Set();

  private constructor() { }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 1000, // Don't use cached location older than 1 second
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // console.log('📍 Initial Location:', {
      //   lat: this.currentLocation.latitude.toFixed(6),
      //   lng: this.currentLocation.longitude.toFixed(6),
      //   accuracy: location.coords.accuracy?.toFixed(1),
      // });

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start watching location changes
   */
  async startWatching(): Promise<boolean> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return false;
      }

      // Stop any existing subscription
      this.stopWatching();

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation, // Changed from High
          distanceInterval: 1, // Changed from 5 - update every 1 meter
          timeInterval: 500, // Changed from 1000 - update every 0.5 seconds
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Log location updates for debugging
          // console.log('📍 Location Updated:', {
          //   lat: newLocation.latitude.toFixed(6),
          //   lng: newLocation.longitude.toFixed(6),
          //   accuracy: location.coords.accuracy?.toFixed(1),
          //   speed: location.coords.speed?.toFixed(1),
          // });

          this.currentLocation = newLocation;

          // Notify all listeners
          this.listeners.forEach((listener) => {
            listener(this.currentLocation!);
          });
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  stopWatching(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  /**
   * Add a listener for location updates
   */
  addListener(listener: (location: Coordinates) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get the last known location
   */
  getLastKnownLocation(): Coordinates | null {
    return this.currentLocation;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopWatching();
    this.listeners.clear();
    this.currentLocation = null;
  }
}
