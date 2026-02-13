import { Magnetometer, Gyroscope, Accelerometer, DeviceMotion } from 'expo-sensors';
import { AngleFilter, LowPassFilter } from '../utils/filters';
import { normalizeAngle } from '../utils/geolocation';

export class SensorService {
  private static instance: SensorService;
  
  // Sensor subscriptions
  private magnetometerSubscription: { remove: () => void } | null = null;
  private gyroscopeSubscription: { remove: () => void } | null = null;
  private accelerometerSubscription: { remove: () => void } | null = null;
  private deviceMotionSubscription: { remove: () => void } | null = null;

  // Filters for smoothing
  private headingFilter = new AngleFilter(0.2);
  private pitchFilter = new LowPassFilter(0.3);
  private rollFilter = new LowPassFilter(0.3);

  // Current sensor values
  private currentHeading: number = 0;
  private currentPitch: number = 0;
  private currentRoll: number = 0;

  // Calibration
  private isCalibrated: boolean = false;
  private calibrationOffset: number = 0;

  // Listeners
  private listeners: Set<(heading: number, pitch: number, roll: number) => void> = new Set();

  private constructor() {}

  static getInstance(): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService();
    }
    return SensorService.instance;
  }

  /**
   * Check if sensors are available on the device
   */
  async checkAvailability(): Promise<{
    magnetometer: boolean;
    gyroscope: boolean;
    accelerometer: boolean;
    deviceMotion: boolean;
  }> {
    const [mag, gyro, accel, motion] = await Promise.all([
      Magnetometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync(),
      Accelerometer.isAvailableAsync(),
      DeviceMotion.isAvailableAsync(),
    ]);

    return {
      magnetometer: mag,
      gyroscope: gyro,
      accelerometer: accel,
      deviceMotion: motion,
    };
  }

  /**
   * Start listening to device sensors
   */
  async startSensors(): Promise<boolean> {
    try {
      const availability = await this.checkAvailability();

      // Set update intervals (in milliseconds)
      Magnetometer.setUpdateInterval(100); // 10 Hz
      DeviceMotion.setUpdateInterval(100);

      // Subscribe to DeviceMotion (preferred for orientation)
      if (availability.deviceMotion) {
        this.deviceMotionSubscription = DeviceMotion.addListener((data) => {
          this.processDeviceMotion(data);
        });
      }

      // Subscribe to Magnetometer as backup
      if (availability.magnetometer && !availability.deviceMotion) {
        this.magnetometerSubscription = Magnetometer.addListener((data) => {
          this.processMagnetometer(data);
        });
      }

      return true;
    } catch (error) {
      console.error('Error starting sensors:', error);
      return false;
    }
  }

  /**
   * Process DeviceMotion data (includes orientation)
   */
  private processDeviceMotion(data: any): void {
    // DeviceMotion provides rotation data
    if (data.rotation) {
      const { alpha, beta, gamma } = data.rotation;
      
      // Alpha represents the rotation around the Z axis (compass heading)
      // Convert from radians to degrees
      let heading = alpha * (180 / Math.PI);
      
      // Apply smoothing
      heading = this.headingFilter.update(normalizeAngle(heading));
      
      // Apply calibration offset
      heading = normalizeAngle(heading + this.calibrationOffset);

      this.currentHeading = heading;
      this.currentPitch = beta * (180 / Math.PI);
      this.currentRoll = gamma * (180 / Math.PI);

      // Notify listeners
      this.notifyListeners();
    }
  }

  /**
   * Process Magnetometer data (fallback method)
   */
  private processMagnetometer(data: { x: number; y: number; z: number }): void {
    // Calculate heading from magnetometer data
    // This is a simplified approach; more sophisticated methods exist
    let heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
    
    // Normalize to 0-360
    heading = normalizeAngle(heading);
    
    // Apply smoothing
    heading = this.headingFilter.update(heading);
    
    // Apply calibration offset
    heading = normalizeAngle(heading + this.calibrationOffset);

    this.currentHeading = heading;

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Notify all listeners of sensor updates
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentHeading, this.currentPitch, this.currentRoll);
    });
  }

  /**
   * Calibrate the compass
   * This should be called when the user is known to be facing a specific direction
   */
  calibrate(trueHeading: number): void {
    this.calibrationOffset = trueHeading - this.currentHeading;
    this.isCalibrated = true;
  }

  /**
   * Reset calibration
   */
  resetCalibration(): void {
    this.calibrationOffset = 0;
    this.isCalibrated = false;
  }

  /**
   * Get current heading
   */
  getCurrentHeading(): number {
    return this.currentHeading;
  }

  /**
   * Get current pitch and roll
   */
  getCurrentOrientation(): { heading: number; pitch: number; roll: number } {
    return {
      heading: this.currentHeading,
      pitch: this.currentPitch,
      roll: this.currentRoll,
    };
  }

  /**
   * Check if calibrated
   */
  isDeviceCalibrated(): boolean {
    return this.isCalibrated;
  }

  /**
   * Add a listener for sensor updates
   */
  addListener(
    listener: (heading: number, pitch: number, roll: number) => void
  ): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Stop all sensors
   */
  stopSensors(): void {
    if (this.magnetometerSubscription) {
      this.magnetometerSubscription.remove();
      this.magnetometerSubscription = null;
    }
    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
    if (this.deviceMotionSubscription) {
      this.deviceMotionSubscription.remove();
      this.deviceMotionSubscription = null;
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopSensors();
    this.listeners.clear();
    this.headingFilter.reset();
    this.pitchFilter.reset();
    this.rollFilter.reset();
  }
}
