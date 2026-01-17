# AETHER

A real-time interactive 3D particle system built with Three.js that responds to hand gestures captured via webcam using MediaPipe Hands.

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Three.js](https://img.shields.io/badge/Three.js-r128-blue) ![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-orange)

## Features

### Core Features
- **15,000+ Particles** - Optimized for smooth 60fps performance on modern hardware
- **12 Unique Patterns** - Sphere, Cube, Heart, Galaxy, DNA, Torus, Star, Wave, Pyramid, Infinity, Firework, Tornado
- **Real-time Hand Tracking** - MediaPipe Hands with One Euro Filter for smooth, jitter-free detection
- **Two-Hand Support** - Use both hands for enhanced control

### Advanced Gesture Recognition
- Finger curl detection (angle-based)
- Pinch gesture detection
- Hand velocity tracking
- Hand rotation tracking
- Two-hand distance and spread gestures
- **Special Gestures**:
  - **Thumbs Up** - Cycle to next pattern
  - **Peace Sign** - Randomize colors
  - **Fist** - Toggle particle connections

### Visual Effects
- **Animated Background** - Dynamic gradient with subtle starfield
- **Particle Connections** - Constellation effect linking nearby particles
- **Particle Trails** - Motion blur effect with customizable length and opacity
- **Post-Processing Bloom** - Adjustable glow effect with strength control
- **Depth of Field** - Particles blur based on distance from focal plane
- **Audio Reactive Mode** - Particles respond to microphone input/music
- **Mouse/Touch Control** - Fallback controls when camera isn't available

### Preset System
- **6 Built-in Presets** - Calm, Energetic, Psychedelic, Minimal, Fire, Ocean
- **Custom Presets** - Save your own configurations
- **Export/Import** - Share presets as JSON files
- **LocalStorage Persistence** - Your presets are saved between sessions

### UI Features
- **Color Customization** - 8 preset colors + gradient presets + custom color picker
- **Collapsible Sections** - Organized control panel with expandable sections
- **Fullscreen Mode** - Immersive experience
- **Screenshot Export** - Save your creations as PNG images
- **FPS Counter** - Real-time performance monitoring
- **Keyboard Shortcuts** - Quick access to common actions
- **Tooltips** - Helpful descriptions for all controls
- **Toast Notifications** - Visual feedback for user actions
- **Interactive Onboarding** - 5-step guided tutorial for new users

### Accessibility
- **Reduced Motion** - Respects system preferences, can be toggled manually
- **High Contrast Mode** - Enhanced visibility option
- **Sound Effects** - Audio feedback for interactions (optional)
- **Keyboard Navigation** - Full keyboard support

### Performance
- **LOD System** - Automatic particle count adjustment based on framerate
- **Performance Monitor** - Real-time stats (particles, LOD level, draw calls, GPU memory)
- **Auto-Adjust** - Dynamically adjusts quality for consistent FPS
- **Optimized Rendering** - Efficient GPU-based particle storage

### Mobile Support
- **Touch Gestures** - Pinch to zoom (adjust particle count)
- **Swipe Navigation** - Swipe left/right to change patterns
- **Responsive UI** - Adapted for smaller screens

## Gesture Controls

### Single Hand
| Gesture | Effect |
|---------|--------|
| **Closed Fist** | Particles contract toward center |
| **Open Hand** | Particles expand outward |
| **Pinch** (thumb + index) | Particles implode with enhanced glow |
| **Fast Movement** | Turbulence effect - particles shake chaotically |
| **Hand Tilt** | Particle system tilts to match |
| **Thumbs Up** | Cycle to next pattern |
| **Peace Sign** | Randomize particle color |
| **Fist** (held) | Toggle particle connections |

### Two Hands
| Gesture | Effect |
|---------|--------|
| **Hands Apart** | Particles spread outward |
| **Hands Together** | Particles compress inward |
| **Rotate Hands** | Particle system rotates |

### Mouse/Touch (Fallback)
| Action | Effect |
|--------|--------|
| **Mouse Move** | Rotate particle system |
| **Touch Drag** | Rotate particle system |
| **Pinch (2 fingers)** | Adjust particle count |
| **Swipe Left/Right** | Change pattern |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9, 0` | Select pattern (1=Sphere, 2=Cube, etc.) |
| `Space` | Toggle auto-rotation |
| `C` | Toggle camera preview |
| `F` | Toggle fullscreen |
| `S` | Take screenshot |
| `A` | Toggle audio reactive mode |
| `R` | Randomize settings |
| `Escape` | Reset to defaults |
| `?` | Show keyboard shortcuts |

## Quick Start

### Prerequisites
- Modern browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Webcam access (optional - mouse/touch works as fallback)
- Microphone access (optional - for audio reactive mode)

### Running Locally

Since the project uses ES6 modules, you need a local server:

```bash
# Navigate to project directory
cd interactive-gesture

# Option 1: Using npx (Node.js)
npx serve .

# Option 2: Using Python
python3 -m http.server 8000

# Option 3: Using PHP
php -S localhost:8000
```

Then open `http://localhost:5000` (or `http://localhost:8000`) in your browser.

### First Run
1. Complete the interactive onboarding (or skip it)
2. Allow camera permissions when prompted
3. Position your hand in front of the webcam
4. Open/close your hand to control particles
5. Try pinching to see the implosion effect!
6. Give a thumbs up to change patterns!
7. Use two hands for spread/compress gestures!

## Project Structure

```
interactive-gesture/
├── index.html              # Main HTML entry point
├── README.md               # This file
├── css/
│   └── styles.css          # Dark theme with glassmorphism
└── js/
    ├── main.js             # Application initialization
    ├── ParticleSystem.js   # Three.js particle rendering + effects
    ├── GestureDetector.js  # MediaPipe hand tracking (1-2 hands)
    ├── PatternGenerator.js # 12 3D shape generators
    └── UIController.js     # UI panel controls + presets
```

## Technical Details

### Gesture Detection
- **One Euro Filter**: Adaptive noise filtering for smooth tracking
- **Finger Curl Detection**: Angle-based joint analysis for accurate finger state
- **Velocity Tracking**: Palm movement tracking with history averaging
- **Two-Hand Tracking**: Distance, spread, and rotation between hands
- **Special Gesture Detection**: Thumbs up, peace sign, fist recognition

### Particle System
- **Buffer Geometry**: Efficient GPU-based particle storage
- **Custom Shaders**: Additive blending with glow, depth, and audio effects
- **Physics Simulation**: Per-particle velocities for natural movement
- **Connection Lines**: Dynamic lines between nearby particles
- **Particle Trails**: History-based motion blur with fading opacity

### Visual Effects
- **Animated Background**: Shader-based gradient with procedural stars
- **Post-Processing**: UnrealBloomPass for glow effects
- **Audio Reactive**: FFT analysis for music visualization
- **Depth of Field**: Size-based blur simulation
- **Mouse Parallax**: Subtle rotation based on cursor position

### Performance
- Optimized for M2 Macs (15,000+ particles at 60fps)
- Adjustable particle count (5,000 - 30,000)
- Pixel ratio capped at 2x for high-DPI displays
- Automatic LOD adjustment based on framerate
- Trail sampling for efficient motion blur

## Control Panel Sections

| Section | Controls |
|---------|----------|
| **Patterns** | 12 pattern buttons with visual previews |
| **Colors** | Color picker, 8 presets, 4 gradient presets |
| **Particles** | Count, size, glow intensity sliders |
| **Animation** | Rotation speed, morph speed, idle float |
| **Effects** | Connections, audio reactive, background, mouse control, trails, bloom |
| **Presets** | Built-in presets, custom presets, save/export/import |
| **Settings** | Camera preview, auto-rotate, reset, randomize, screenshot |
| **Accessibility** | Reduced motion, high contrast, sound effects |
| **Performance** | Stats display, auto-adjust toggle |

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Full |
| Firefox | Full |
| Safari | Full |
| Edge | Full |

## Dependencies

All loaded via CDN (no npm install required):
- [Three.js r128](https://threejs.org/) - 3D rendering and shaders
- [Three.js Post-processing](https://threejs.org/docs/#examples/en/postprocessing/EffectComposer) - Bloom effects
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) - Hand tracking
- [MediaPipe Camera Utils](https://google.github.io/mediapipe/solutions/hands.html) - Webcam handling

## Author

**Jan Marc Coloma** - [Portfolio](https://automatebyja.vercel.app) | [GitHub](https://github.com/janmaaarc)

## License

MIT License - Feel free to use and modify for your projects.

## Acknowledgments

- [Three.js](https://threejs.org/) for 3D rendering
- [MediaPipe](https://mediapipe.dev/) for hand tracking
- [One Euro Filter](https://cristal.univ-lille.fr/~casiez/1euro/) for signal smoothing
# aether-particles
