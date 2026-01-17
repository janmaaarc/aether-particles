/**
 * Main Application Entry Point
 * Integrates ParticleSystem, GestureDetector (enhanced), and UIController
 */

import { ParticleSystem } from './ParticleSystem.js';
import { GestureDetector } from './GestureDetector.js';
import { UIController } from './UIController.js';

class App {
    constructor() {
        this.particleSystem = null;
        this.gestureDetector = null;
        this.uiController = null;
        this.isInitialized = false;
    }

    async init() {
        console.log('Initializing AETHER...');

        // Initialize UI Controller first
        this.uiController = new UIController();
        this.uiController.showLoading();
        this.uiController.setLoadingMessage('Initializing...');
        this.uiController.setLoadingProgress(0);
        this.uiController.setLoadingStep('step-init');

        try {
            // Initialize Particle System
            this.uiController.setLoadingMessage('Creating particle system...');
            this.uiController.setLoadingProgress(25);
            this.uiController.setLoadingStep('step-particles');

            const container = document.getElementById('canvas-container');
            const particleCount = this.uiController.getParticleCount();
            this.particleSystem = new ParticleSystem(container, particleCount);

            // Set initial values from UI
            this.particleSystem.setColor(this.uiController.getCurrentColor());
            this.particleSystem.setParticleSize(this.uiController.getParticleSize());
            this.particleSystem.setGlowIntensity(this.uiController.getGlowIntensity());
            this.particleSystem.setRotationSpeed(this.uiController.getRotationSpeed());
            this.particleSystem.setMorphSpeed(this.uiController.getMorphSpeed());
            this.particleSystem.setIdleAmplitude(this.uiController.getIdleAmplitude());

            // Initialize MediaPipe
            this.uiController.setLoadingMessage('Loading MediaPipe...');
            this.uiController.setLoadingProgress(50);
            this.uiController.setLoadingStep('step-mediapipe');

            // Initialize Gesture Detector
            this.uiController.setLoadingMessage('Starting camera...');
            this.uiController.setLoadingProgress(75);
            this.uiController.setLoadingStep('step-camera');

            const videoElement = document.getElementById('camera-feed');
            const canvasElement = document.getElementById('camera-overlay');
            this.gestureDetector = new GestureDetector(videoElement, canvasElement);

            // Setup gesture callbacks
            this.gestureDetector.onGestureUpdate = (gestureData) => {
                this.onGestureUpdate(gestureData);
            };

            this.gestureDetector.onHandDetected = () => {
                console.log('Hand detected');
                this.uiController.showToast('Hand detected!', 'success');
            };

            this.gestureDetector.onHandLost = () => {
                console.log('Hand lost');
            };

            this.gestureDetector.onPinchStart = () => {
                console.log('Pinch started');
                this.uiController.playSound('pinch');
            };

            this.gestureDetector.onPinchEnd = () => {
                console.log('Pinch ended');
            };

            // Special gesture detection
            this.gestureDetector.onSpecialGesture = (gesture, confidence) => {
                console.log(`Special gesture: ${gesture} (${(confidence * 100).toFixed(0)}%)`);
                this.handleSpecialGesture(gesture);
            };

            // Initialize gesture detector
            await this.gestureDetector.init();

            // Setup UI callbacks
            this.setupUICallbacks();

            // Complete loading
            this.uiController.setLoadingProgress(100);
            this.uiController.setLoadingMessage('Ready!');

            // Hide loading overlay
            setTimeout(() => {
                this.uiController.hideLoading();
            }, 500);

            this.isInitialized = true;
            console.log('Initialization complete!');

        } catch (error) {
            console.error('Initialization error:', error);
            this.handleInitError(error);
        }
    }

    handleInitError(error) {
        const errorMessage = error.message || 'Unknown error';

        // Determine specific error type
        if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
            this.uiController.setLoadingMessage('Camera access denied');
            this.uiController.showToast('Camera access denied. Using mouse control instead.', 'warning');
        } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
            this.uiController.setLoadingMessage('No camera found');
            this.uiController.showToast('No camera found. Using mouse control instead.', 'warning');
        } else {
            this.uiController.setLoadingMessage('Error initializing camera');
            this.uiController.showToast('Could not start camera. Using mouse control instead.', 'warning');
        }

        // Enable mouse control as fallback
        if (this.particleSystem) {
            this.particleSystem.setMouseControlEnabled(true);
        }

        // Still allow app to work without camera
        setTimeout(() => {
            this.uiController.hideLoading();
            this.setupUICallbacks();
            this.isInitialized = true;
        }, 2000);
    }

    setupUICallbacks() {
        // Pattern change
        this.uiController.onPatternChange = (pattern) => {
            this.particleSystem.setPattern(pattern);
        };

        // Color change
        this.uiController.onColorChange = (color) => {
            this.particleSystem.setColor(color);
        };

        // Particle count change (debounced)
        let countTimeout = null;
        this.uiController.onParticleCountChange = (count) => {
            clearTimeout(countTimeout);
            countTimeout = setTimeout(() => {
                this.particleSystem.setParticleCount(count);
                this.particleSystem.setPattern(this.uiController.getCurrentPattern());
            }, 300);
        };

        // Particle size change
        this.uiController.onParticleSizeChange = (size) => {
            this.particleSystem.setParticleSize(size);
        };

        // Glow intensity change
        this.uiController.onGlowIntensityChange = (intensity) => {
            this.particleSystem.setGlowIntensity(intensity);
        };

        // Rotation speed change
        this.uiController.onRotationSpeedChange = (speed) => {
            this.particleSystem.setRotationSpeed(speed);
        };

        // Morph speed change
        this.uiController.onMorphSpeedChange = (speed) => {
            this.particleSystem.setMorphSpeed(speed);
        };

        // Idle amplitude change
        this.uiController.onIdleAmplitudeChange = (amplitude) => {
            this.particleSystem.setIdleAmplitude(amplitude);
        };

        // Camera toggle (visibility handled by UIController)
        this.uiController.onCameraToggle = () => {};

        // Auto-rotate toggle
        this.uiController.onAutoRotateToggle = (enabled) => {
            this.particleSystem.setAutoRotate(enabled);
        };

        // Reset callback
        this.uiController.onReset = (defaults) => {
            this.particleSystem.setParticleCount(defaults.particleCount);
            this.particleSystem.setPattern(defaults.pattern);
            this.particleSystem.setColor(defaults.color);
            this.particleSystem.setParticleSize(defaults.particleSize);
            this.particleSystem.setGlowIntensity(defaults.glowIntensity);
            this.particleSystem.setRotationSpeed(defaults.rotationSpeed);
            this.particleSystem.setMorphSpeed(defaults.morphSpeed);
            this.particleSystem.setIdleAmplitude(defaults.idleAmplitude);
            this.particleSystem.setAutoRotate(defaults.autoRotate);
        };

        // Randomize callback
        this.uiController.onRandomize = () => {
            console.log('Randomized settings');
        };

        // Screenshot callback
        this.uiController.onScreenshot = () => {
            this.takeScreenshot();
        };

        // Effects callbacks
        this.uiController.onConnectionsToggle = (enabled) => {
            this.particleSystem.setConnectionsEnabled(enabled);
        };

        this.uiController.onAudioToggle = async (enabled) => {
            if (enabled) {
                const success = await this.particleSystem.initAudio();
                if (!success) {
                    console.warn('Could not enable audio reactive mode');
                }
            } else {
                this.particleSystem.stopAudio();
            }
        };

        this.uiController.onBackgroundToggle = (enabled) => {
            this.particleSystem.setBackgroundEnabled(enabled);
        };

        this.uiController.onMouseControlToggle = (enabled) => {
            this.particleSystem.setMouseControlEnabled(enabled);
        };

        // Post-processing callbacks
        this.uiController.onBloomToggle = (enabled) => {
            this.particleSystem.setBloomEnabled(enabled);
        };

        this.uiController.onBloomStrengthChange = (strength) => {
            this.particleSystem.setBloomStrength(strength);
        };

        // Trails callbacks
        this.uiController.onTrailsToggle = (enabled) => {
            this.particleSystem.setTrailsEnabled(enabled);
        };

        this.uiController.onTrailLengthChange = (length) => {
            this.particleSystem.setTrailLength(length);
        };

        this.uiController.onTrailOpacityChange = (opacity) => {
            this.particleSystem.setTrailOpacity(opacity);
        };

        // Start FPS update loop
        this.startFPSUpdater();
    }

    takeScreenshot() {
        const dataUrl = this.particleSystem.takeScreenshot();
        const link = document.createElement('a');
        link.download = `aether-screenshot-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        console.log('Screenshot saved');
    }

    startFPSUpdater() {
        setInterval(() => {
            const fps = this.particleSystem.getFPS();
            this.uiController.updateFPS(fps);

            // Update performance stats
            const particleCount = this.particleSystem.getParticleCount();
            const lodLevel = this.particleSystem.getLODLevel();

            this.uiController.updatePerformanceStats({
                particles: particleCount,
                lod: lodLevel,
                drawCalls: 2,
                gpuMemory: `~${Math.round(particleCount * 28 / 1024 / 1024)}MB`
            });
        }, 500);
    }

    onGestureUpdate(gestureData) {
        this.particleSystem.setGestureData(gestureData);
        this.uiController.updateGestureIndicator(
            gestureData.openness,
            gestureData.isHandDetected,
            gestureData.isPinching,
            gestureData.velocity.magnitude
        );
    }

    handleSpecialGesture(gesture) {
        switch (gesture) {
            case 'thumbsUp':
                // Thumbs up: Cycle to next pattern
                const patterns = ['sphere', 'cube', 'heart', 'galaxy', 'dna', 'torus', 'star', 'wave', 'pyramid', 'infinity', 'firework', 'tornado'];
                const currentIndex = patterns.indexOf(this.uiController.currentPattern);
                const nextIndex = (currentIndex + 1) % patterns.length;
                this.uiController.selectPattern(patterns[nextIndex]);
                this.uiController.showToast(`Pattern: ${patterns[nextIndex]}`, 'info');
                this.uiController.playSound('success');
                break;

            case 'peace':
                // Peace sign: Randomize colors
                const colors = ['#00d4ff', '#ff006e', '#ffbe0b', '#06ffa5', '#8338ec', '#ff5400', '#ffffff', '#0077be'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                this.uiController.setColor(randomColor);
                this.uiController.showToast('Color randomized!', 'info');
                this.uiController.playSound('click');
                break;

            case 'fist':
                // Fist: Toggle connections
                if (this.uiController.connectionsToggle) {
                    this.uiController.connectionsToggle.checked = !this.uiController.connectionsToggle.checked;
                    this.particleSystem.setConnectionsEnabled(this.uiController.connectionsToggle.checked);
                    this.uiController.showToast(
                        this.uiController.connectionsToggle.checked ? 'Connections enabled' : 'Connections disabled',
                        'info'
                    );
                    this.uiController.playSound('click');
                }
                break;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.app = app;
});
