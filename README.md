
## 🎯 Target Location

**Digantara Industries** - Bengaluru, India
- **Latitude:** `13.0453132`
- **Longitude:** `77.5733936`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Expo CLI**: `npm install -g @expo/cli`
- **Physical iOS or Android device** (emulators won't work - no real sensors)
- **Expo Go app** installed on your device

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd compass-navigator

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

### Running on Device

1. **Scan QR Code** displayed in terminal
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app

2. **Grant Permissions** when prompted
   - Location access (required)
   - Motion sensors (iOS only)

3. **Go Outside** for best GPS accuracy

4. **Start Moving** and watch the app track you!

---

## 🏗️ Architecture

### Project Structure

```
compass-navigator/
├── src/
│   ├── components/          # React components
│   │   ├── Arrow3D.tsx          → 3D arrow visualization
│   │   ├── NavigationInfo.tsx   → Information display
│   │   ├── ErrorDisplay.tsx     → Error handling UI
│   │   └── LoadingScreen.tsx    → Loading states
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useNavigation.ts     → Main navigation logic
│   │
│   ├── services/            # Hardware access services
│   │   ├── LocationService.ts   → GPS management
│   │   └── SensorService.ts     → Sensor management
│   │
│   ├── utils/               # Utility functions
│   │   ├── geolocation.ts       → Distance & bearing math
│   │   └── filters.ts           → Sensor smoothing algorithms
│   │
│   └── types/               # TypeScript definitions
│       └── index.ts             → All type definitions
│
├── App.tsx                  # Main entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── app.json                 # Expo configuration
```

### Architecture Layers

```
┌─────────────────────────────────────┐
│   Components (Presentation)         │  ← Arrow3D, NavigationInfo
├─────────────────────────────────────┤
│   Hooks (Business Logic)            │  ← useNavigation
├─────────────────────────────────────┤
│   Services (Hardware Access)        │  ← LocationService, SensorService
├─────────────────────────────────────┤
│   Utils (Pure Functions)            │  ← Geolocation, Filters
└─────────────────────────────────────┘
```

---

## 🧮 How It Works

### 1. Distance Calculation (Haversine Formula)

Calculates great-circle distance on Earth's surface:

```typescript
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c  // R = Earth's radius (6,371 km)
```

**Accuracy:** ±1m for distances < 1km, ±10m for < 100km

### 2. Bearing Calculation

Computes initial direction from user to target:

```typescript
y = sin(Δλ) × cos(φ2)
x = cos(φ1) × sin(φ2) - sin(φ1) × cos(φ2) × cos(Δλ)
θ = atan2(y, x)
bearing = (θ × 180/π + 360) % 360
```

**Output:** 0° = North, 90° = East, 180° = South, 270° = West

### 3. Relative Angle

Determines which way to turn:

```typescript
relativeAngle = targetBearing - deviceHeading
// Normalized to -180° to +180°

// Interpretation:
// Positive → Turn left (counterclockwise)
// Negative → Turn right (clockwise)
// |angle| < 10° → Aligned with target
```

### 4. Sensor Smoothing

Multiple filter algorithms reduce noise:

**AngleFilter** - Circular averaging for compass
```typescript
sinAvg = α × sin(angle) + (1-α) × sinAvg
cosAvg = α × cos(angle) + (1-α) × cosAvg
smoothed = atan2(sinAvg, cosAvg)
```

**LowPassFilter** - Exponential moving average
```typescript
value = α × newValue + (1-α) × oldValue
```

---


## 🎛️ Sensor Details

### Primary Sensor: DeviceMotion

- Provides fused orientation data
- Combines accelerometer, gyroscope, magnetometer
- Most accurate and stable option

### Fallback: Magnetometer

- Direct compass reading
- Used when DeviceMotion unavailable
- Requires additional smoothing

### Smoothing Parameters

```typescript
AngleFilter: alpha = 0.2   // 20% new, 80% old
LowPassFilter: alpha = 0.3  // 30% new, 70% old
```

---


### Poor GPS Accuracy?

**Symptoms:** Accuracy > 50m in console logs

**Solutions:**
1. **Move to open area** - Away from buildings
2. **Wait longer** - Accuracy improves over time
3. **Check device settings** - Ensure High Accuracy mode
4. **Restart app** - Sometimes fixes GPS issues

### App Crashes or Won't Start?

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo start --clear
```

---

## 📱 Permissions Required

### iOS (app.json)

```json
"NSLocationWhenInUseUsageDescription": "Calculate distance and direction to landmark"
"NSMotionUsageDescription": "Determine device orientation"
```

### Android (app.json)

```json
"ACCESS_FINE_LOCATION"
"ACCESS_COARSE_LOCATION"
"HIGH_SAMPLING_RATE_SENSORS"
```

---
