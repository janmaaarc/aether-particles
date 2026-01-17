/**
 * UIController - Enhanced UI management with collapsible sections and advanced controls
 * Features: Presets, Onboarding, Toast notifications, Accessibility, Sound effects, Touch gestures
 */
export class UIController {
    constructor() {
        // Panel elements
        this.controlPanel = document.getElementById('control-panel');
        this.panelToggle = document.getElementById('panel-toggle');

        // Section headers for collapsible behavior
        this.sectionHeaders = document.querySelectorAll('.section-header');

        // Pattern elements
        this.patternButtons = document.querySelectorAll('.pattern-btn');

        // Color elements
        this.colorPicker = document.getElementById('color-picker');
        this.colorPreview = document.getElementById('color-preview');
        this.colorValue = document.getElementById('color-value');
        this.colorPresets = document.querySelectorAll('.color-preset');
        this.gradientPresets = document.querySelectorAll('.gradient-preset');

        // Particle sliders
        this.particleCountSlider = document.getElementById('particle-count');
        this.particleCountValue = document.getElementById('particle-count-value');
        this.particleSizeSlider = document.getElementById('particle-size');
        this.particleSizeValue = document.getElementById('particle-size-value');
        this.glowIntensitySlider = document.getElementById('glow-intensity');
        this.glowIntensityValue = document.getElementById('glow-intensity-value');

        // Animation sliders
        this.rotationSpeedSlider = document.getElementById('rotation-speed');
        this.rotationSpeedValue = document.getElementById('rotation-speed-value');
        this.morphSpeedSlider = document.getElementById('morph-speed');
        this.morphSpeedValue = document.getElementById('morph-speed-value');
        this.idleAmplitudeSlider = document.getElementById('idle-amplitude');
        this.idleAmplitudeValue = document.getElementById('idle-amplitude-value');

        // Settings toggles
        this.cameraToggle = document.getElementById('camera-toggle');
        this.autoRotateToggle = document.getElementById('auto-rotate-toggle');
        this.cameraContainer = document.getElementById('camera-container');

        // Action buttons
        this.resetBtn = document.getElementById('reset-btn');
        this.randomizeBtn = document.getElementById('randomize-btn');
        this.screenshotBtn = document.getElementById('screenshot-btn');

        // Effects toggles
        this.connectionsToggle = document.getElementById('connections-toggle');
        this.audioToggle = document.getElementById('audio-toggle');
        this.backgroundToggle = document.getElementById('background-toggle');
        this.mouseControlToggle = document.getElementById('mouse-control-toggle');

        // Post-processing elements
        this.bloomToggle = document.getElementById('bloom-toggle');
        this.bloomStrengthSlider = document.getElementById('bloom-strength');
        this.bloomStrengthValue = document.getElementById('bloom-strength-value');

        // Trails elements
        this.trailsToggle = document.getElementById('trails-toggle');
        this.trailsSettings = document.getElementById('trails-settings');
        this.trailLengthSlider = document.getElementById('trail-length');
        this.trailLengthValue = document.getElementById('trail-length-value');
        this.trailOpacitySlider = document.getElementById('trail-opacity');
        this.trailOpacityValue = document.getElementById('trail-opacity-value');

        // Fullscreen elements
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.fsExpand = document.getElementById('fs-expand');
        this.fsCompress = document.getElementById('fs-compress');

        // FPS counter
        this.fpsValue = document.getElementById('fps-value');

        // Tutorial and shortcuts
        this.tutorialOverlay = document.getElementById('tutorial-overlay');
        this.tutorialClose = document.getElementById('tutorial-close');
        this.shortcutsModal = document.getElementById('shortcuts-modal');
        this.shortcutsClose = document.getElementById('shortcuts-close');
        this.shortcutsHint = document.getElementById('shortcuts-hint');

        // Gesture indicator
        this.gestureText = document.getElementById('gesture-text');
        this.gestureFill = document.getElementById('gesture-fill');

        // Loading overlay
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingMessage = document.getElementById('loading-message');
        this.loadingProgressBar = document.getElementById('loading-progress-bar');

        // Preset elements
        this.presetButtons = document.querySelectorAll('#preset-gallery .preset-btn');
        this.customPresetsList = document.getElementById('custom-presets-list');
        this.savePresetBtn = document.getElementById('save-preset-btn');
        this.exportPresetBtn = document.getElementById('export-preset-btn');
        this.importPresetBtn = document.getElementById('import-preset-btn');
        this.importFileInput = document.getElementById('import-file-input');

        // Accessibility elements
        this.reducedMotionToggle = document.getElementById('reduced-motion-toggle');
        this.highContrastToggle = document.getElementById('high-contrast-toggle');
        this.soundEffectsToggle = document.getElementById('sound-effects-toggle');

        // Performance elements
        this.statParticles = document.getElementById('stat-particles');
        this.statLod = document.getElementById('stat-lod');
        this.statDrawcalls = document.getElementById('stat-drawcalls');
        this.statGpu = document.getElementById('stat-gpu');
        this.autoAdjustToggle = document.getElementById('auto-adjust-toggle');

        // Onboarding elements
        this.onboardingOverlay = document.getElementById('onboarding-overlay');
        this.onboardingSteps = document.querySelectorAll('.onboarding-step');
        this.onboardingDots = document.querySelectorAll('.onboarding-dots .dot');
        this.onboardingPrev = document.getElementById('onboarding-prev');
        this.onboardingNext = document.getElementById('onboarding-next');
        this.onboardingSkip = document.getElementById('onboarding-skip');

        // Toast container
        this.toastContainer = document.getElementById('toast-container');

        // Callbacks
        this.onPatternChange = null;
        this.onColorChange = null;
        this.onParticleCountChange = null;
        this.onParticleSizeChange = null;
        this.onGlowIntensityChange = null;
        this.onRotationSpeedChange = null;
        this.onMorphSpeedChange = null;
        this.onIdleAmplitudeChange = null;
        this.onCameraToggle = null;
        this.onAutoRotateToggle = null;
        this.onReset = null;
        this.onRandomize = null;
        this.onScreenshot = null;
        this.onConnectionsToggle = null;
        this.onAudioToggle = null;
        this.onBackgroundToggle = null;
        this.onMouseControlToggle = null;
        this.onBloomToggle = null;
        this.onBloomStrengthChange = null;
        this.onTrailsToggle = null;
        this.onTrailLengthChange = null;
        this.onTrailOpacityChange = null;
        this.onPresetLoad = null;
        this.onReducedMotionToggle = null;
        this.onAutoAdjustToggle = null;

        // State
        this.currentPattern = 'sphere';
        this.currentColor = '#00d4ff';
        this.isPanelCollapsed = false;
        this.isFullscreen = false;
        this.currentOnboardingStep = 1;
        this.soundEffectsEnabled = false;
        this.customPresets = [];

        // Audio context for sound effects
        this.audioCtx = null;

        // Touch gesture state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.initialPinchDistance = 0;

        // Default values for reset
        this.defaults = {
            pattern: 'sphere',
            color: '#00d4ff',
            particleCount: 15000,
            particleSize: 1,
            glowIntensity: 1,
            rotationSpeed: 1,
            morphSpeed: 1,
            idleAmplitude: 1,
            cameraPreview: true,
            autoRotate: true,
            connections: false,
            audio: false,
            background: true,
            mouseControl: true
        };

        // Built-in presets
        this.builtInPresets = {
            calm: {
                name: 'Calm',
                pattern: 'sphere',
                color: '#00d4ff',
                particleCount: 10000,
                particleSize: 0.8,
                glowIntensity: 0.6,
                rotationSpeed: 0.3,
                morphSpeed: 0.5,
                idleAmplitude: 0.5,
                connections: false
            },
            energetic: {
                name: 'Energetic',
                pattern: 'firework',
                color: '#ff006e',
                particleCount: 20000,
                particleSize: 1.5,
                glowIntensity: 2,
                rotationSpeed: 3,
                morphSpeed: 2,
                idleAmplitude: 2,
                connections: true
            },
            psychedelic: {
                name: 'Psychedelic',
                pattern: 'galaxy',
                color: '#8338ec',
                particleCount: 25000,
                particleSize: 1.2,
                glowIntensity: 2.5,
                rotationSpeed: 2,
                morphSpeed: 1.5,
                idleAmplitude: 1.5,
                connections: true
            },
            minimal: {
                name: 'Minimal',
                pattern: 'cube',
                color: '#ffffff',
                particleCount: 5000,
                particleSize: 0.6,
                glowIntensity: 0.3,
                rotationSpeed: 0.5,
                morphSpeed: 0.3,
                idleAmplitude: 0.3,
                connections: false
            },
            fire: {
                name: 'Fire',
                pattern: 'tornado',
                color: '#ff5400',
                particleCount: 18000,
                particleSize: 1.3,
                glowIntensity: 2,
                rotationSpeed: 2.5,
                morphSpeed: 1.8,
                idleAmplitude: 1.2,
                connections: false
            },
            ocean: {
                name: 'Ocean',
                pattern: 'wave',
                color: '#0077be',
                particleCount: 15000,
                particleSize: 1,
                glowIntensity: 1,
                rotationSpeed: 0.8,
                morphSpeed: 0.8,
                idleAmplitude: 1.5,
                connections: true
            }
        };

        this.init();
    }

    init() {
        // Panel toggle
        this.panelToggle.addEventListener('click', () => this.togglePanel());

        // Collapsible sections
        this.sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.control-section');
                section.classList.toggle('collapsed');
            });
        });

        // Pattern buttons
        this.patternButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const pattern = btn.dataset.pattern;
                this.selectPattern(pattern);
                this.playSound('click');
            });
        });

        // Color picker
        this.colorPreview.addEventListener('click', () => this.colorPicker.click());
        this.colorPicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });

        // Color presets
        this.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.setColor(color);
                this.playSound('click');
            });
        });

        // Gradient presets
        this.gradientPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const startColor = preset.dataset.start;
                this.setColor(startColor);
                preset.classList.add('active');
                setTimeout(() => preset.classList.remove('active'), 300);
            });
        });

        // Particle sliders
        this.particleCountSlider.addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            this.particleCountValue.textContent = count.toLocaleString();
            if (this.onParticleCountChange) this.onParticleCountChange(count);
        });

        this.particleSizeSlider.addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            this.particleSizeValue.textContent = `${size.toFixed(1)}x`;
            if (this.onParticleSizeChange) this.onParticleSizeChange(size);
        });

        this.glowIntensitySlider.addEventListener('input', (e) => {
            const intensity = parseFloat(e.target.value);
            this.glowIntensityValue.textContent = intensity.toFixed(1);
            if (this.onGlowIntensityChange) this.onGlowIntensityChange(intensity);
        });

        // Animation sliders
        this.rotationSpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.rotationSpeedValue.textContent = `${speed.toFixed(1)}x`;
            if (this.onRotationSpeedChange) this.onRotationSpeedChange(speed);
        });

        this.morphSpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.morphSpeedValue.textContent = `${speed.toFixed(1)}x`;
            if (this.onMorphSpeedChange) this.onMorphSpeedChange(speed);
        });

        this.idleAmplitudeSlider.addEventListener('input', (e) => {
            const amplitude = parseFloat(e.target.value);
            this.idleAmplitudeValue.textContent = `${amplitude.toFixed(1)}x`;
            if (this.onIdleAmplitudeChange) this.onIdleAmplitudeChange(amplitude);
        });

        // Settings toggles
        this.cameraToggle.addEventListener('change', (e) => {
            this.toggleCamera(e.target.checked);
        });

        this.autoRotateToggle.addEventListener('change', (e) => {
            if (this.onAutoRotateToggle) this.onAutoRotateToggle(e.target.checked);
        });

        // Action buttons
        this.resetBtn.addEventListener('click', () => this.resetAll());
        this.randomizeBtn.addEventListener('click', () => this.randomize());

        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Listen for fullscreen change
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());

        // Screenshot button
        if (this.screenshotBtn) {
            this.screenshotBtn.addEventListener('click', () => {
                if (this.onScreenshot) this.onScreenshot();
                this.showToast('Screenshot saved!', 'success');
                this.playSound('success');
            });
        }

        // Effects toggles
        if (this.connectionsToggle) {
            this.connectionsToggle.addEventListener('change', (e) => {
                if (this.onConnectionsToggle) this.onConnectionsToggle(e.target.checked);
            });
        }

        if (this.audioToggle) {
            this.audioToggle.addEventListener('change', (e) => {
                if (this.onAudioToggle) this.onAudioToggle(e.target.checked);
            });
        }

        if (this.backgroundToggle) {
            this.backgroundToggle.addEventListener('change', (e) => {
                if (this.onBackgroundToggle) this.onBackgroundToggle(e.target.checked);
            });
        }

        if (this.mouseControlToggle) {
            this.mouseControlToggle.addEventListener('change', (e) => {
                if (this.onMouseControlToggle) this.onMouseControlToggle(e.target.checked);
            });
        }

        // Post-processing controls
        if (this.bloomToggle) {
            this.bloomToggle.addEventListener('change', (e) => {
                if (this.onBloomToggle) this.onBloomToggle(e.target.checked);
            });
        }

        if (this.bloomStrengthSlider) {
            this.bloomStrengthSlider.addEventListener('input', (e) => {
                const strength = parseFloat(e.target.value);
                if (this.bloomStrengthValue) {
                    this.bloomStrengthValue.textContent = strength.toFixed(1);
                }
                if (this.onBloomStrengthChange) this.onBloomStrengthChange(strength);
            });
        }

        // Trails controls
        if (this.trailsToggle) {
            this.trailsToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                if (this.trailsSettings) {
                    this.trailsSettings.style.display = enabled ? 'block' : 'none';
                }
                if (this.onTrailsToggle) this.onTrailsToggle(enabled);
            });
        }

        if (this.trailLengthSlider) {
            this.trailLengthSlider.addEventListener('input', (e) => {
                const length = parseInt(e.target.value);
                if (this.trailLengthValue) {
                    this.trailLengthValue.textContent = length;
                }
                if (this.onTrailLengthChange) this.onTrailLengthChange(length);
            });
        }

        if (this.trailOpacitySlider) {
            this.trailOpacitySlider.addEventListener('input', (e) => {
                const opacity = parseFloat(e.target.value);
                if (this.trailOpacityValue) {
                    this.trailOpacityValue.textContent = opacity.toFixed(2);
                }
                if (this.onTrailOpacityChange) this.onTrailOpacityChange(opacity);
            });
        }

        // Tutorial close
        if (this.tutorialClose) {
            this.tutorialClose.addEventListener('click', () => this.hideTutorial());
        }

        // Shortcuts modal
        if (this.shortcutsClose) {
            this.shortcutsClose.addEventListener('click', () => this.hideShortcuts());
        }

        if (this.shortcutsHint) {
            this.shortcutsHint.addEventListener('click', () => this.showShortcuts());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Initialize preset functionality
        this.initPresets();

        // Initialize accessibility settings
        this.initAccessibility();

        // Initialize onboarding
        this.initOnboarding();

        // Initialize touch gestures
        this.initTouchGestures();

        // Load custom presets from localStorage
        this.loadCustomPresets();

        // Show onboarding on first visit (instead of tutorial)
        if (!localStorage.getItem('onboardingSeen') && !localStorage.getItem('tutorialSeen')) {
            this.showOnboarding();
        } else if (!localStorage.getItem('tutorialSeen')) {
            this.showTutorial();
        }
    }

    // ============================================
    // Preset Management
    // ============================================
    initPresets() {
        // Built-in preset buttons
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetName = btn.dataset.preset;
                if (this.builtInPresets[presetName]) {
                    this.loadPreset(this.builtInPresets[presetName]);
                    this.showToast(`Loaded "${this.builtInPresets[presetName].name}" preset`, 'success');
                    this.playSound('success');
                }
            });
        });

        // Save preset button
        if (this.savePresetBtn) {
            this.savePresetBtn.addEventListener('click', () => this.saveCustomPreset());
        }

        // Export preset button
        if (this.exportPresetBtn) {
            this.exportPresetBtn.addEventListener('click', () => this.exportPresets());
        }

        // Import preset button
        if (this.importPresetBtn) {
            this.importPresetBtn.addEventListener('click', () => {
                this.importFileInput.click();
            });
        }

        // Import file input
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this.importPresets(e));
        }
    }

    getCurrentSettings() {
        return {
            pattern: this.currentPattern,
            color: this.currentColor,
            particleCount: parseInt(this.particleCountSlider.value),
            particleSize: parseFloat(this.particleSizeSlider.value),
            glowIntensity: parseFloat(this.glowIntensitySlider.value),
            rotationSpeed: parseFloat(this.rotationSpeedSlider.value),
            morphSpeed: parseFloat(this.morphSpeedSlider.value),
            idleAmplitude: parseFloat(this.idleAmplitudeSlider.value),
            connections: this.connectionsToggle?.checked || false,
            autoRotate: this.autoRotateToggle?.checked || true
        };
    }

    loadPreset(preset) {
        // Update UI
        if (preset.pattern) this.selectPattern(preset.pattern);
        if (preset.color) this.setColor(preset.color);

        if (preset.particleCount !== undefined) {
            this.particleCountSlider.value = preset.particleCount;
            this.particleCountValue.textContent = preset.particleCount.toLocaleString();
            if (this.onParticleCountChange) this.onParticleCountChange(preset.particleCount);
        }

        if (preset.particleSize !== undefined) {
            this.particleSizeSlider.value = preset.particleSize;
            this.particleSizeValue.textContent = `${preset.particleSize.toFixed(1)}x`;
            if (this.onParticleSizeChange) this.onParticleSizeChange(preset.particleSize);
        }

        if (preset.glowIntensity !== undefined) {
            this.glowIntensitySlider.value = preset.glowIntensity;
            this.glowIntensityValue.textContent = preset.glowIntensity.toFixed(1);
            if (this.onGlowIntensityChange) this.onGlowIntensityChange(preset.glowIntensity);
        }

        if (preset.rotationSpeed !== undefined) {
            this.rotationSpeedSlider.value = preset.rotationSpeed;
            this.rotationSpeedValue.textContent = `${preset.rotationSpeed.toFixed(1)}x`;
            if (this.onRotationSpeedChange) this.onRotationSpeedChange(preset.rotationSpeed);
        }

        if (preset.morphSpeed !== undefined) {
            this.morphSpeedSlider.value = preset.morphSpeed;
            this.morphSpeedValue.textContent = `${preset.morphSpeed.toFixed(1)}x`;
            if (this.onMorphSpeedChange) this.onMorphSpeedChange(preset.morphSpeed);
        }

        if (preset.idleAmplitude !== undefined) {
            this.idleAmplitudeSlider.value = preset.idleAmplitude;
            this.idleAmplitudeValue.textContent = `${preset.idleAmplitude.toFixed(1)}x`;
            if (this.onIdleAmplitudeChange) this.onIdleAmplitudeChange(preset.idleAmplitude);
        }

        if (preset.connections !== undefined && this.connectionsToggle) {
            this.connectionsToggle.checked = preset.connections;
            if (this.onConnectionsToggle) this.onConnectionsToggle(preset.connections);
        }

        if (this.onPresetLoad) this.onPresetLoad(preset);
    }

    saveCustomPreset() {
        const name = prompt('Enter preset name:');
        if (!name) return;

        const preset = {
            name,
            ...this.getCurrentSettings(),
            timestamp: Date.now()
        };

        this.customPresets.push(preset);
        this.saveCustomPresetsToStorage();
        this.renderCustomPresets();
        this.showToast(`Saved "${name}" preset`, 'success');
        this.playSound('success');
    }

    deleteCustomPreset(index) {
        const preset = this.customPresets[index];
        if (confirm(`Delete "${preset.name}"?`)) {
            this.customPresets.splice(index, 1);
            this.saveCustomPresetsToStorage();
            this.renderCustomPresets();
            this.showToast(`Deleted "${preset.name}"`, 'info');
        }
    }

    saveCustomPresetsToStorage() {
        localStorage.setItem('customPresets', JSON.stringify(this.customPresets));
    }

    loadCustomPresets() {
        try {
            const stored = localStorage.getItem('customPresets');
            if (stored) {
                this.customPresets = JSON.parse(stored);
                this.renderCustomPresets();
            }
        } catch (e) {
            console.warn('Could not load custom presets:', e);
        }
    }

    renderCustomPresets() {
        if (!this.customPresetsList) return;

        this.customPresetsList.innerHTML = '';

        if (this.customPresets.length === 0) {
            this.customPresetsList.innerHTML = '<p style="font-size: 10px; color: var(--text-muted); text-align: center; padding: 10px;">No custom presets yet</p>';
            return;
        }

        this.customPresets.forEach((preset, index) => {
            const item = document.createElement('div');
            item.className = 'custom-preset-item';
            item.innerHTML = `
                <span>${preset.name}</span>
                <button class="delete-preset" title="Delete">×</button>
            `;

            item.querySelector('span').addEventListener('click', () => {
                this.loadPreset(preset);
                this.showToast(`Loaded "${preset.name}"`, 'success');
                this.playSound('success');
            });

            item.querySelector('.delete-preset').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCustomPreset(index);
            });

            this.customPresetsList.appendChild(item);
        });
    }

    exportPresets() {
        const data = {
            version: '1.0',
            presets: this.customPresets,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aether-presets-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Presets exported!', 'success');
        this.playSound('success');
    }

    importPresets(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.presets && Array.isArray(data.presets)) {
                    const count = data.presets.length;
                    this.customPresets = [...this.customPresets, ...data.presets];
                    this.saveCustomPresetsToStorage();
                    this.renderCustomPresets();
                    this.showToast(`Imported ${count} preset(s)!`, 'success');
                    this.playSound('success');
                } else {
                    throw new Error('Invalid preset file format');
                }
            } catch (err) {
                this.showToast('Failed to import presets', 'error');
                this.playSound('error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // ============================================
    // Toast Notifications
    // ============================================
    showToast(message, type = 'info', duration = 3000) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        const icons = {
            success: '<svg class="toast-icon success" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            error: '<svg class="toast-icon error" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
            info: '<svg class="toast-icon info" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
            warning: '<svg class="toast-icon warning" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span class="toast-message">${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('exiting');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ============================================
    // Sound Effects
    // ============================================
    playSound(type) {
        if (!this.soundEffectsEnabled) return;

        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            const sounds = {
                click: { freq: 800, duration: 0.05, type: 'sine' },
                success: { freq: 600, duration: 0.1, type: 'sine' },
                error: { freq: 200, duration: 0.2, type: 'square' },
                pinch: { freq: 400, duration: 0.15, type: 'triangle' }
            };

            const sound = sounds[type] || sounds.click;
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.freq, this.audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + sound.duration);

            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + sound.duration);
        } catch (e) {
            // Audio not supported
        }
    }

    // ============================================
    // Accessibility
    // ============================================
    initAccessibility() {
        // Reduced motion toggle
        if (this.reducedMotionToggle) {
            // Check system preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) {
                this.reducedMotionToggle.checked = true;
                document.body.classList.add('reduced-motion');
            }

            this.reducedMotionToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('reduced-motion', e.target.checked);
                if (this.onReducedMotionToggle) this.onReducedMotionToggle(e.target.checked);
                this.showToast(e.target.checked ? 'Reduced motion enabled' : 'Reduced motion disabled', 'info');
            });
        }

        // High contrast toggle
        if (this.highContrastToggle) {
            this.highContrastToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('high-contrast', e.target.checked);
                this.showToast(e.target.checked ? 'High contrast enabled' : 'High contrast disabled', 'info');
            });
        }

        // Sound effects toggle
        if (this.soundEffectsToggle) {
            this.soundEffectsToggle.addEventListener('change', (e) => {
                this.soundEffectsEnabled = e.target.checked;
                if (e.target.checked) {
                    this.playSound('success');
                }
            });
        }

        // Auto-adjust toggle
        if (this.autoAdjustToggle) {
            this.autoAdjustToggle.addEventListener('change', (e) => {
                if (this.onAutoAdjustToggle) this.onAutoAdjustToggle(e.target.checked);
            });
        }
    }

    // ============================================
    // Onboarding Flow
    // ============================================
    initOnboarding() {
        if (this.onboardingPrev) {
            this.onboardingPrev.addEventListener('click', () => this.prevOnboardingStep());
        }

        if (this.onboardingNext) {
            this.onboardingNext.addEventListener('click', () => this.nextOnboardingStep());
        }

        if (this.onboardingSkip) {
            this.onboardingSkip.addEventListener('click', () => this.hideOnboarding());
        }

        // Dot navigation
        this.onboardingDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const step = parseInt(dot.dataset.step);
                this.goToOnboardingStep(step);
            });
        });
    }

    showOnboarding() {
        if (this.onboardingOverlay) {
            this.onboardingOverlay.classList.remove('hidden');
            this.currentOnboardingStep = 1;
            this.updateOnboardingUI();
        }
    }

    hideOnboarding() {
        if (this.onboardingOverlay) {
            this.onboardingOverlay.classList.add('hidden');
            localStorage.setItem('onboardingSeen', 'true');
            localStorage.setItem('tutorialSeen', 'true');
        }
    }

    nextOnboardingStep() {
        if (this.currentOnboardingStep < 5) {
            this.currentOnboardingStep++;
            this.updateOnboardingUI();
        } else {
            this.hideOnboarding();
        }
    }

    prevOnboardingStep() {
        if (this.currentOnboardingStep > 1) {
            this.currentOnboardingStep--;
            this.updateOnboardingUI();
        }
    }

    goToOnboardingStep(step) {
        this.currentOnboardingStep = step;
        this.updateOnboardingUI();
    }

    updateOnboardingUI() {
        // Update steps
        this.onboardingSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === this.currentOnboardingStep);
        });

        // Update dots
        this.onboardingDots.forEach(dot => {
            const stepNum = parseInt(dot.dataset.step);
            dot.classList.toggle('active', stepNum === this.currentOnboardingStep);
        });

        // Update buttons
        if (this.onboardingPrev) {
            this.onboardingPrev.disabled = this.currentOnboardingStep === 1;
        }

        if (this.onboardingNext) {
            this.onboardingNext.textContent = this.currentOnboardingStep === 5 ? 'Get Started' : 'Next';
        }
    }

    // ============================================
    // Touch Gestures
    // ============================================
    initTouchGestures() {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }

    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            this.initialPinchDistance = this.getPinchDistance(e.touches);
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = this.getPinchDistance(e.touches);
            const scale = currentDistance / this.initialPinchDistance;

            // Pinch to zoom (adjust particle count)
            if (Math.abs(scale - 1) > 0.1) {
                const currentCount = parseInt(this.particleCountSlider.value);
                const newCount = Math.round(currentCount * (scale > 1 ? 1.02 : 0.98));
                const clampedCount = Math.max(5000, Math.min(30000, newCount));

                this.particleCountSlider.value = clampedCount;
                this.particleCountValue.textContent = clampedCount.toLocaleString();
                if (this.onParticleCountChange) this.onParticleCountChange(clampedCount);

                this.initialPinchDistance = currentDistance;
            }
        }
    }

    handleTouchEnd(e) {
        if (e.changedTouches.length === 1 && this.touchStartX !== 0) {
            const deltaX = e.changedTouches[0].clientX - this.touchStartX;
            const deltaY = e.changedTouches[0].clientY - this.touchStartY;

            // Swipe to change pattern
            if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
                const patterns = ['sphere', 'cube', 'heart', 'galaxy', 'dna', 'torus', 'star', 'wave', 'pyramid', 'infinity', 'firework', 'tornado'];
                const currentIndex = patterns.indexOf(this.currentPattern);

                if (deltaX > 0) {
                    // Swipe right - previous pattern
                    const newIndex = (currentIndex - 1 + patterns.length) % patterns.length;
                    this.selectPattern(patterns[newIndex]);
                } else {
                    // Swipe left - next pattern
                    const newIndex = (currentIndex + 1) % patterns.length;
                    this.selectPattern(patterns[newIndex]);
                }
            }

            this.touchStartX = 0;
            this.touchStartY = 0;
        }
    }

    getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // ============================================
    // Loading Progress
    // ============================================
    setLoadingProgress(percent) {
        if (this.loadingProgressBar) {
            this.loadingProgressBar.style.width = `${percent}%`;
        }
    }

    setLoadingStep(step) {
        const steps = ['step-init', 'step-mediapipe', 'step-camera', 'step-particles'];
        steps.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) {
                if (id === step) {
                    el.classList.add('active');
                    el.classList.remove('completed');
                } else if (steps.indexOf(step) > index) {
                    el.classList.remove('active');
                    el.classList.add('completed');
                } else {
                    el.classList.remove('active', 'completed');
                }
            }
        });
    }

    // ============================================
    // Performance Stats
    // ============================================
    updatePerformanceStats(stats) {
        if (this.statParticles && stats.particles !== undefined) {
            this.statParticles.textContent = stats.particles.toLocaleString();
        }
        if (this.statLod && stats.lod !== undefined) {
            this.statLod.textContent = `${Math.round(stats.lod * 100)}%`;
        }
        if (this.statDrawcalls && stats.drawCalls !== undefined) {
            this.statDrawcalls.textContent = stats.drawCalls;
        }
        if (this.statGpu && stats.gpuMemory !== undefined) {
            this.statGpu.textContent = stats.gpuMemory;
        }
    }

    handleKeyboard(e) {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT') return;

        const patterns = ['sphere', 'cube', 'heart', 'galaxy', 'dna', 'torus', 'star', 'wave', 'pyramid', 'infinity', 'firework', 'tornado'];

        switch (e.key) {
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                const idx = parseInt(e.key) - 1;
                if (patterns[idx]) this.selectPattern(patterns[idx]);
                break;
            case '0':
                if (patterns[9]) this.selectPattern(patterns[9]);
                break;
            case ' ':
                e.preventDefault();
                this.autoRotateToggle.checked = !this.autoRotateToggle.checked;
                if (this.onAutoRotateToggle) this.onAutoRotateToggle(this.autoRotateToggle.checked);
                break;
            case 'c':
            case 'C':
                this.cameraToggle.checked = !this.cameraToggle.checked;
                this.toggleCamera(this.cameraToggle.checked);
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 's':
            case 'S':
                if (this.onScreenshot) this.onScreenshot();
                break;
            case 'a':
            case 'A':
                if (this.audioToggle) {
                    this.audioToggle.checked = !this.audioToggle.checked;
                    if (this.onAudioToggle) this.onAudioToggle(this.audioToggle.checked);
                }
                break;
            case 'r':
            case 'R':
                this.randomize();
                break;
            case 'Escape':
                if (!this.shortcutsModal.classList.contains('hidden')) {
                    this.hideShortcuts();
                } else {
                    this.resetAll();
                }
                break;
            case '?':
                this.toggleShortcuts();
                break;
        }
    }

    showTutorial() {
        if (this.tutorialOverlay) {
            this.tutorialOverlay.classList.remove('hidden');
        }
    }

    hideTutorial() {
        if (this.tutorialOverlay) {
            this.tutorialOverlay.classList.add('hidden');
            localStorage.setItem('tutorialSeen', 'true');
        }
    }

    showShortcuts() {
        if (this.shortcutsModal) {
            this.shortcutsModal.classList.remove('hidden');
        }
    }

    hideShortcuts() {
        if (this.shortcutsModal) {
            this.shortcutsModal.classList.add('hidden');
        }
    }

    toggleShortcuts() {
        if (this.shortcutsModal) {
            this.shortcutsModal.classList.toggle('hidden');
        }
    }

    updateFPS(fps) {
        if (this.fpsValue) {
            this.fpsValue.textContent = fps;
        }
    }

    togglePanel() {
        this.isPanelCollapsed = !this.isPanelCollapsed;
        this.controlPanel.classList.toggle('collapsed', this.isPanelCollapsed);
    }

    selectPattern(pattern) {
        if (pattern === this.currentPattern) return;

        this.currentPattern = pattern;

        this.patternButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pattern === pattern);
        });

        if (this.onPatternChange) this.onPatternChange(pattern);
    }

    setColor(color) {
        this.currentColor = color;
        this.colorPicker.value = color;
        this.colorPreview.style.background = color;
        this.colorValue.textContent = color.toUpperCase();

        // Update preset active state
        this.colorPresets.forEach(preset => {
            const isActive = preset.dataset.color.toLowerCase() === color.toLowerCase();
            preset.classList.toggle('active', isActive);
        });

        if (this.onColorChange) this.onColorChange(color);
    }

    toggleCamera(show) {
        this.cameraContainer.classList.toggle('hidden', !show);
        if (this.onCameraToggle) this.onCameraToggle(show);
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    onFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        this.fsExpand.style.display = this.isFullscreen ? 'none' : 'block';
        this.fsCompress.style.display = this.isFullscreen ? 'block' : 'none';
    }

    resetAll() {
        // Reset all sliders and values to defaults
        this.particleCountSlider.value = this.defaults.particleCount;
        this.particleCountValue.textContent = this.defaults.particleCount.toLocaleString();

        this.particleSizeSlider.value = this.defaults.particleSize;
        this.particleSizeValue.textContent = `${this.defaults.particleSize.toFixed(1)}x`;

        this.glowIntensitySlider.value = this.defaults.glowIntensity;
        this.glowIntensityValue.textContent = this.defaults.glowIntensity.toFixed(1);

        this.rotationSpeedSlider.value = this.defaults.rotationSpeed;
        this.rotationSpeedValue.textContent = `${this.defaults.rotationSpeed.toFixed(1)}x`;

        this.morphSpeedSlider.value = this.defaults.morphSpeed;
        this.morphSpeedValue.textContent = `${this.defaults.morphSpeed.toFixed(1)}x`;

        this.idleAmplitudeSlider.value = this.defaults.idleAmplitude;
        this.idleAmplitudeValue.textContent = `${this.defaults.idleAmplitude.toFixed(1)}x`;

        // Reset toggles
        this.cameraToggle.checked = this.defaults.cameraPreview;
        this.autoRotateToggle.checked = this.defaults.autoRotate;
        this.toggleCamera(this.defaults.cameraPreview);

        // Reset pattern and color
        this.selectPattern(this.defaults.pattern);
        this.setColor(this.defaults.color);

        // Trigger callback
        if (this.onReset) this.onReset(this.defaults);
    }

    randomize() {
        const patterns = ['sphere', 'cube', 'heart', 'galaxy', 'dna', 'torus', 'star', 'wave'];
        const colors = ['#00d4ff', '#ff006e', '#8338ec', '#ffbe0b', '#06ffa5', '#ff5400', '#ffffff', '#ff0000'];

        // Random pattern
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        this.selectPattern(randomPattern);

        // Random color
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.setColor(randomColor);

        // Random particle size
        const randomSize = 0.5 + Math.random() * 2.5;
        this.particleSizeSlider.value = randomSize;
        this.particleSizeValue.textContent = `${randomSize.toFixed(1)}x`;
        if (this.onParticleSizeChange) this.onParticleSizeChange(randomSize);

        // Random glow
        const randomGlow = Math.random() * 3;
        this.glowIntensitySlider.value = randomGlow;
        this.glowIntensityValue.textContent = randomGlow.toFixed(1);
        if (this.onGlowIntensityChange) this.onGlowIntensityChange(randomGlow);

        // Random rotation speed
        const randomRotation = Math.random() * 5;
        this.rotationSpeedSlider.value = randomRotation;
        this.rotationSpeedValue.textContent = `${randomRotation.toFixed(1)}x`;
        if (this.onRotationSpeedChange) this.onRotationSpeedChange(randomRotation);

        if (this.onRandomize) this.onRandomize();
    }

    updateGestureIndicator(value, isHandDetected, isPinching = false, velocity = 0) {
        this.gestureFill.style.width = `${value * 100}%`;

        // Change bar color based on state
        if (isPinching) {
            this.gestureFill.style.background = 'linear-gradient(90deg, #ff006e, #ff5500)';
        } else if (velocity > 0.3) {
            this.gestureFill.style.background = 'linear-gradient(90deg, #ffbe0b, #ff5400)';
        } else {
            this.gestureFill.style.background = 'linear-gradient(90deg, #00d4ff, #06ffa5)';
        }

        if (isHandDetected) {
            if (isPinching) {
                this.gestureText.textContent = 'Pinching - Particles imploding';
            } else if (velocity > 0.5) {
                this.gestureText.textContent = 'Fast movement - Turbulence';
            } else if (value < 0.3) {
                this.gestureText.textContent = 'Fist closed - Contracting';
            } else if (value > 0.7) {
                this.gestureText.textContent = 'Hand open - Expanding';
            } else {
                this.gestureText.textContent = 'Hand detected';
            }
        } else {
            this.gestureText.textContent = 'No hand detected';
        }
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    setLoadingMessage(message) {
        const p = this.loadingOverlay.querySelector('p');
        if (p) p.textContent = message;
    }

    getCurrentPattern() {
        return this.currentPattern;
    }

    getCurrentColor() {
        return this.currentColor;
    }

    getParticleCount() {
        return parseInt(this.particleCountSlider.value);
    }

    getParticleSize() {
        return parseFloat(this.particleSizeSlider.value);
    }

    getGlowIntensity() {
        return parseFloat(this.glowIntensitySlider.value);
    }

    getRotationSpeed() {
        return parseFloat(this.rotationSpeedSlider.value);
    }

    getMorphSpeed() {
        return parseFloat(this.morphSpeedSlider.value);
    }

    getIdleAmplitude() {
        return parseFloat(this.idleAmplitudeSlider.value);
    }
}
