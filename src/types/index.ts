export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DeviceOrientation {
  alpha: number; // rotation around z-axis (0-360)
  beta: number;  // rotation around x-axis (-180 to 180)
  gamma: number; // rotation around y-axis (-90 to 90)
}

export interface NavigationData {
  userLocation: Coordinates | null;
  targetLocation: Coordinates;
  distance: number | null;
  bearing: number | null;
  deviceHeading: number | null;
  relativeAngle: number | null;
}

export interface SensorState {
  magnetometer: { x: number; y: number; z: number } | null;
  gyroscope: { x: number; y: number; z: number } | null;
  accelerometer: { x: number; y: number; z: number } | null;
  deviceMotion: DeviceOrientation | null;
}

export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PENDING = 'pending',
  UNDETERMINED = 'undetermined'
}

export interface AppPermissions {
  location: PermissionStatus;
  sensors: PermissionStatus;
}
