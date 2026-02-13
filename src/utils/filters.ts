/**
 * Low-pass filter for smoothing noisy sensor data
 * This helps reduce jitter while maintaining responsiveness
 */
export class LowPassFilter {
  private value: number | null = null;
  private readonly alpha: number;

  /**
   * @param alpha Smoothing factor (0-1). Lower = smoother but slower response
   */
  constructor(alpha: number = 0.2) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  update(newValue: number): number {
    if (this.value === null) {
      this.value = newValue;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  reset(): void {
    this.value = null;
  }

  getValue(): number | null {
    return this.value;
  }
}

/**
 * Exponential moving average for angle smoothing
 * Handles the circular nature of angles (0° = 360°)
 */
export class AngleFilter {
  private sinAvg: number = 0;
  private cosAvg: number = 0;
  private readonly alpha: number;

  constructor(alpha: number = 0.15) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  update(angleDegrees: number): number {
    const angleRad = (angleDegrees * Math.PI) / 180;
    
    this.sinAvg = this.alpha * Math.sin(angleRad) + (1 - this.alpha) * this.sinAvg;
    this.cosAvg = this.alpha * Math.cos(angleRad) + (1 - this.alpha) * this.cosAvg;

    const smoothedRad = Math.atan2(this.sinAvg, this.cosAvg);
    const smoothedDeg = (smoothedRad * 180) / Math.PI;

    return (smoothedDeg + 360) % 360;
  }

  reset(): void {
    this.sinAvg = 0;
    this.cosAvg = 0;
  }
}

/**
 * Kalman-like filter for more sophisticated smoothing
 * Good for reducing noise while maintaining quick response to real changes
 */
export class KalmanFilter {
  private estimate: number | null = null;
  private errorEstimate: number = 1;
  private readonly processNoise: number;
  private readonly measurementNoise: number;

  constructor(processNoise: number = 0.01, measurementNoise: number = 0.1) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
  }

  update(measurement: number): number {
    if (this.estimate === null) {
      this.estimate = measurement;
      return measurement;
    }

    // Prediction
    const predictedEstimate = this.estimate;
    const predictedError = this.errorEstimate + this.processNoise;

    // Update
    const kalmanGain = predictedError / (predictedError + this.measurementNoise);
    this.estimate = predictedEstimate + kalmanGain * (measurement - predictedEstimate);
    this.errorEstimate = (1 - kalmanGain) * predictedError;

    return this.estimate;
  }

  reset(): void {
    this.estimate = null;
    this.errorEstimate = 1;
  }
}

/**
 * Complementary filter for fusing accelerometer and magnetometer data
 * Commonly used for orientation estimation
 */
export class ComplementaryFilter {
  private value: number = 0;
  private readonly alpha: number;

  constructor(alpha: number = 0.98) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  update(gyroValue: number, accelMagValue: number, dt: number): number {
    // Integrate gyroscope (high-pass)
    const gyroContribution = this.value + gyroValue * dt;
    
    // Trust accelerometer/magnetometer for long-term stability (low-pass)
    this.value = this.alpha * gyroContribution + (1 - this.alpha) * accelMagValue;
    
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

/**
 * Moving average filter for simple smoothing
 */
export class MovingAverageFilter {
  private buffer: number[] = [];
  private readonly windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = Math.max(1, windowSize);
  }

  update(value: number): number {
    this.buffer.push(value);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    const sum = this.buffer.reduce((acc, val) => acc + val, 0);
    return sum / this.buffer.length;
  }

  reset(): void {
    this.buffer = [];
  }
}
