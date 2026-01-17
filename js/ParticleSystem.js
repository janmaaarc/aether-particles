import { PatternGenerator } from './PatternGenerator.js';

/**
 * ParticleSystem - Enhanced Three.js particle system with advanced effects
 * Features: Bloom, trails, connections, mouse control, audio reactive, LOD
 */
export class ParticleSystem {
    constructor(container, particleCount = 15000) {
        this.container = container;
        this.particleCount = particleCount;
        this.targetParticleCount = particleCount;

        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.geometry = null;
        this.material = null;

        // Post-processing
        this.composer = null;
        this.bloomPass = null;
        this.bloomEnabled = true;
        this.bloomStrength = 1.5;
        this.bloomRadius = 0.4;
        this.bloomThreshold = 0.2;

        // Particle connections
        this.connectionLines = null;
        this.connectionGeometry = null;
        this.connectionMaterial = null;
        this.connectionsEnabled = false;
        this.connectionDistance = 15;
        this.maxConnections = 500;

        // Background
        this.backgroundMesh = null;
        this.backgroundEnabled = true;

        // Position arrays
        this.targetPositions = null;
        this.basePositions = null;
        this.velocities = null;
        this.previousPositions = null; // For trails

        // Trails
        this.trailsEnabled = false;
        this.trailLength = 8;
        this.trailOpacity = 0.4;
        this.trailHistory = []; // Array of position snapshots
        this.trailMesh = null;
        this.trailGeometry = null;
        this.trailMaterial = null;
        this.trailSampleRate = 3; // Only trail every Nth particle for performance
        this.trailUpdateCounter = 0;

        // Animation state
        this.currentScale = 1;
        this.targetScale = 1;
        this.gestureValue = 0.5;
        this.time = 0;

        // Gesture states
        this.pinchValue = 0;
        this.targetPinchValue = 0;
        this.handVelocity = { x: 0, y: 0, z: 0, magnitude: 0 };
        this.handRotation = 0;
        this.targetRotation = 0;

        // Current pattern
        this.currentPattern = 'sphere';

        // Color
        this.particleColor = new THREE.Color(0x00d4ff);

        // Animation parameters
        this.baseRotationSpeed = 0.0003;
        this.rotationSpeed = this.baseRotationSpeed;
        this.rotationMultiplier = 1;
        this.baseMorphSpeed = 0.06;
        this.morphSpeed = this.baseMorphSpeed;
        this.morphMultiplier = 1;
        this.baseIdleAmplitude = 1.5;
        this.idleAmplitude = this.baseIdleAmplitude;
        this.idleMultiplier = 1;
        this.idleSpeed = 0.001;

        // UI-controlled parameters
        this.sizeMultiplier = 1;
        this.baseGlowIntensity = 1;
        this.autoRotate = true;

        // Velocity-based turbulence
        this.turbulence = 0;
        this.targetTurbulence = 0;

        // Explosion/implosion state
        this.explosionForce = 0;
        this.targetExplosionForce = 0;

        // Mouse/touch control
        this.mouseControlEnabled = true;
        this.mouse = { x: 0, y: 0 };
        this.mouseInfluence = 0;
        this.targetMouseInfluence = 0;

        // Audio reactive
        this.audioEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.audioData = null;
        this.audioInfluence = 0;

        // LOD (Level of Detail)
        this.lodEnabled = true;
        this.currentLOD = 1;
        this.targetFPS = 55;
        this.fpsHistory = [];
        this.lastFrameTime = performance.now();
        this.currentFPS = 60;

        // Depth of field
        this.dofEnabled = false;
        this.focalDistance = 150;

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        this.camera.position.z = 150;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true // For screenshots
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a0f, 1);
        this.container.appendChild(this.renderer.domElement);

        // Create particles
        this.createParticles();

        // Create background
        this.createBackground();

        // Setup post-processing
        this.setupPostProcessing();

        // Setup mouse/touch controls
        this.setupMouseControl();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        // Start animation
        this.animate();
    }

    createParticles() {
        // Geometry
        this.geometry = new THREE.BufferGeometry();

        // Generate initial positions
        this.basePositions = PatternGenerator.sphere(this.particleCount);
        this.targetPositions = new Float32Array(this.basePositions);
        this.previousPositions = new Float32Array(this.basePositions);

        // Initialize velocities
        this.velocities = new Float32Array(this.particleCount * 3);

        // Set positions attribute
        this.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(this.basePositions), 3)
        );

        // Create sizes array
        const sizes = new Float32Array(this.particleCount);
        for (let i = 0; i < this.particleCount; i++) {
            sizes[i] = Math.random() * 2 + 1;
        }
        this.geometry.setAttribute(
            'size',
            new THREE.BufferAttribute(sizes, 1)
        );

        // Create alpha array for depth-based fading
        const alphas = new Float32Array(this.particleCount);
        for (let i = 0; i < this.particleCount; i++) {
            alphas[i] = 1.0;
        }
        this.geometry.setAttribute(
            'alpha',
            new THREE.BufferAttribute(alphas, 1)
        );

        // Enhanced shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: this.particleColor },
                pointSize: { value: 3.0 },
                opacity: { value: 0.85 },
                glowIntensity: { value: 1.0 },
                time: { value: 0 },
                audioLevel: { value: 0 },
                focalDistance: { value: this.focalDistance },
                dofEnabled: { value: false }
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                uniform float pointSize;
                uniform float glowIntensity;
                uniform float time;
                uniform float audioLevel;
                uniform float focalDistance;
                uniform bool dofEnabled;
                varying float vAlpha;
                varying float vGlow;
                varying float vDepth;

                void main() {
                    vAlpha = size / 3.0 * alpha;
                    vGlow = glowIntensity;

                    vec3 pos = position;

                    // Audio reactive pulsing
                    pos *= 1.0 + audioLevel * 0.3 * sin(time * 2.0 + length(position) * 0.1);

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    vDepth = -mvPosition.z;

                    // DOF blur effect (size increases with distance from focal plane)
                    float dofFactor = 1.0;
                    if (dofEnabled) {
                        float dist = abs(vDepth - focalDistance);
                        dofFactor = 1.0 + dist * 0.01;
                    }

                    gl_PointSize = size * pointSize * (150.0 / -mvPosition.z) * dofFactor;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                uniform float time;
                uniform float audioLevel;
                varying float vAlpha;
                varying float vGlow;
                varying float vDepth;

                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    alpha *= opacity * vAlpha;

                    if (alpha < 0.01) discard;

                    // Enhanced glow with audio reactive color shift
                    vec3 glow = color * (1.0 + vGlow * 0.5 * (1.0 - dist * 2.0));

                    // Subtle color shift based on audio
                    glow += vec3(audioLevel * 0.2, audioLevel * 0.1, -audioLevel * 0.1);

                    gl_FragColor = vec4(glow, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // Create Points
        this.particles = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particles);
    }

    createBackground() {
        // Animated gradient background
        const bgGeometry = new THREE.PlaneGeometry(2, 2);
        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x0a0a0f) },
                color2: { value: new THREE.Color(0x1a1a2f) },
                audioLevel: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float audioLevel;
                varying vec2 vUv;

                void main() {
                    // Animated gradient
                    float t = vUv.y * 0.5 + sin(vUv.x * 3.0 + time * 0.2) * 0.1;
                    t += sin(time * 0.1) * 0.05;

                    // Audio reactive color boost
                    vec3 c1 = color1 + vec3(audioLevel * 0.1);
                    vec3 c2 = color2 + vec3(audioLevel * 0.15, audioLevel * 0.1, audioLevel * 0.2);

                    vec3 color = mix(c1, c2, t);

                    // Add subtle stars
                    float stars = 0.0;
                    vec2 p = vUv * 100.0;
                    stars += smoothstep(0.98, 1.0, fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453)) * 0.3;

                    gl_FragColor = vec4(color + stars * 0.1, 1.0);
                }
            `,
            depthWrite: false,
            depthTest: false
        });

        this.backgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        this.backgroundMesh.renderOrder = -1;
        this.scene.add(this.backgroundMesh);
    }

    setupPostProcessing() {
        // Check if EffectComposer is available
        if (typeof THREE.EffectComposer === 'undefined') {
            // Load post-processing scripts dynamically
            this.loadPostProcessing();
            return;
        }
        this.initPostProcessing();
    }

    async loadPostProcessing() {
        // Post-processing will be loaded via CDN in index.html
        // For now, we'll use a simple bloom approximation in the shader
        this.bloomEnabled = false;
    }

    initPostProcessing() {
        if (typeof THREE.EffectComposer === 'undefined') return;

        this.composer = new THREE.EffectComposer(this.renderer);

        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.bloomStrength,
            this.bloomRadius,
            this.bloomThreshold
        );
        this.composer.addPass(this.bloomPass);
    }

    setupMouseControl() {
        const onMouseMove = (e) => {
            if (!this.mouseControlEnabled) return;

            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.targetMouseInfluence = 0.3;
        };

        const onMouseLeave = () => {
            this.targetMouseInfluence = 0;
        };

        const onTouchMove = (e) => {
            if (!this.mouseControlEnabled || e.touches.length === 0) return;

            const touch = e.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            this.targetMouseInfluence = 0.3;
        };

        const onTouchEnd = () => {
            this.targetMouseInfluence = 0;
        };

        this.renderer.domElement.addEventListener('mousemove', onMouseMove);
        this.renderer.domElement.addEventListener('mouseleave', onMouseLeave);
        this.renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
        this.renderer.domElement.addEventListener('touchend', onTouchEnd);
    }

    // Audio reactive setup
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            source.connect(this.analyser);
            this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
            this.audioEnabled = true;

            return true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            return false;
        }
    }

    stopAudio() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.audioEnabled = false;
        this.analyser = null;
        this.audioData = null;
    }

    updateAudio() {
        if (!this.audioEnabled || !this.analyser) return 0;

        this.analyser.getByteFrequencyData(this.audioData);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < this.audioData.length; i++) {
            sum += this.audioData[i];
        }
        const avg = sum / this.audioData.length / 255;

        this.audioInfluence = avg;
        return avg;
    }

    // Particle connections
    createConnections() {
        if (this.connectionLines) {
            this.scene.remove(this.connectionLines);
            this.connectionGeometry.dispose();
        }

        this.connectionGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxConnections * 6); // 2 points per line, 3 coords each
        this.connectionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.connectionMaterial = new THREE.LineBasicMaterial({
            color: this.particleColor,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });

        this.connectionLines = new THREE.LineSegments(this.connectionGeometry, this.connectionMaterial);
        this.scene.add(this.connectionLines);
    }

    updateConnections() {
        if (!this.connectionsEnabled || !this.connectionLines) return;

        const positions = this.geometry.attributes.position.array;
        const linePositions = this.connectionGeometry.attributes.position.array;
        let connectionCount = 0;

        // Sample particles for connections (checking all would be too slow)
        const sampleSize = Math.min(200, this.particleCount);
        const step = Math.floor(this.particleCount / sampleSize);

        for (let i = 0; i < sampleSize && connectionCount < this.maxConnections; i++) {
            const idx1 = i * step;
            const x1 = positions[idx1 * 3];
            const y1 = positions[idx1 * 3 + 1];
            const z1 = positions[idx1 * 3 + 2];

            for (let j = i + 1; j < sampleSize && connectionCount < this.maxConnections; j++) {
                const idx2 = j * step;
                const x2 = positions[idx2 * 3];
                const y2 = positions[idx2 * 3 + 1];
                const z2 = positions[idx2 * 3 + 2];

                const dist = Math.sqrt(
                    (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2
                );

                if (dist < this.connectionDistance) {
                    const baseIdx = connectionCount * 6;
                    linePositions[baseIdx] = x1;
                    linePositions[baseIdx + 1] = y1;
                    linePositions[baseIdx + 2] = z1;
                    linePositions[baseIdx + 3] = x2;
                    linePositions[baseIdx + 4] = y2;
                    linePositions[baseIdx + 5] = z2;
                    connectionCount++;
                }
            }
        }

        // Clear unused connections
        for (let i = connectionCount * 6; i < linePositions.length; i++) {
            linePositions[i] = 0;
        }

        this.connectionGeometry.attributes.position.needsUpdate = true;
        this.connectionGeometry.setDrawRange(0, connectionCount * 2);
    }

    // Particle Trails
    createTrails() {
        if (this.trailMesh) {
            this.scene.remove(this.trailMesh);
            this.trailGeometry.dispose();
            this.trailMaterial.dispose();
        }

        // Calculate sampled particle count for performance
        const sampledCount = Math.floor(this.particleCount / this.trailSampleRate);
        const segmentsPerTrail = this.trailLength - 1;
        const totalSegments = sampledCount * segmentsPerTrail;

        this.trailGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalSegments * 6); // 2 points per segment, 3 coords each
        const colors = new Float32Array(totalSegments * 6); // RGB for each point

        this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.trailMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: this.trailOpacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.trailMesh = new THREE.LineSegments(this.trailGeometry, this.trailMaterial);
        this.trailMesh.frustumCulled = false;
        this.scene.add(this.trailMesh);

        // Initialize trail history
        this.trailHistory = [];
    }

    updateTrails() {
        if (!this.trailsEnabled || !this.trailMesh) return;

        this.trailUpdateCounter++;

        // Only update trail history every 2 frames for smoother trails
        if (this.trailUpdateCounter % 2 === 0) {
            const positions = this.geometry.attributes.position.array;
            const sampledCount = Math.floor(this.particleCount / this.trailSampleRate);

            // Create snapshot of current positions (sampled)
            const snapshot = new Float32Array(sampledCount * 3);
            for (let i = 0; i < sampledCount; i++) {
                const srcIdx = i * this.trailSampleRate * 3;
                const dstIdx = i * 3;
                snapshot[dstIdx] = positions[srcIdx];
                snapshot[dstIdx + 1] = positions[srcIdx + 1];
                snapshot[dstIdx + 2] = positions[srcIdx + 2];
            }

            // Add to history
            this.trailHistory.unshift(snapshot);

            // Keep only trailLength snapshots
            while (this.trailHistory.length > this.trailLength) {
                this.trailHistory.pop();
            }
        }

        // Update trail geometry
        if (this.trailHistory.length < 2) return;

        const trailPositions = this.trailGeometry.attributes.position.array;
        const trailColors = this.trailGeometry.attributes.color.array;
        const sampledCount = Math.floor(this.particleCount / this.trailSampleRate);
        const color = this.particleColor;

        let idx = 0;
        for (let i = 0; i < sampledCount; i++) {
            const i3 = i * 3;

            // Draw line segments between consecutive history positions
            for (let h = 0; h < this.trailHistory.length - 1; h++) {
                const current = this.trailHistory[h];
                const previous = this.trailHistory[h + 1];

                if (!current || !previous) continue;

                // Position for start of segment
                trailPositions[idx] = current[i3];
                trailPositions[idx + 1] = current[i3 + 1];
                trailPositions[idx + 2] = current[i3 + 2];

                // Position for end of segment
                trailPositions[idx + 3] = previous[i3];
                trailPositions[idx + 4] = previous[i3 + 1];
                trailPositions[idx + 5] = previous[i3 + 2];

                // Color with fade based on trail position
                const fadeStart = 1.0 - (h / this.trailLength);
                const fadeEnd = 1.0 - ((h + 1) / this.trailLength);

                // Start point color
                trailColors[idx] = color.r * fadeStart;
                trailColors[idx + 1] = color.g * fadeStart;
                trailColors[idx + 2] = color.b * fadeStart;

                // End point color
                trailColors[idx + 3] = color.r * fadeEnd;
                trailColors[idx + 4] = color.g * fadeEnd;
                trailColors[idx + 5] = color.b * fadeEnd;

                idx += 6;
            }
        }

        // Clear remaining buffer
        for (let i = idx; i < trailPositions.length; i++) {
            trailPositions[i] = 0;
            trailColors[i] = 0;
        }

        this.trailGeometry.attributes.position.needsUpdate = true;
        this.trailGeometry.attributes.color.needsUpdate = true;
    }

    setTrailLength(length) {
        this.trailLength = Math.max(2, Math.min(20, length));
        if (this.trailsEnabled) {
            this.createTrails();
        }
    }

    setTrailOpacity(opacity) {
        this.trailOpacity = opacity;
        if (this.trailMaterial) {
            this.trailMaterial.opacity = opacity;
        }
    }

    // Screenshot
    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL('image/png');
    }

    // Settings setters
    setGestureData(gestureData) {
        this.gestureValue = gestureData.openness;
        this.targetScale = 0.3 + this.gestureValue * 1.4;
        this.targetPinchValue = gestureData.pinch;
        this.handVelocity = gestureData.velocity;
        this.targetTurbulence = Math.min(1, gestureData.velocity.magnitude * 3);
        this.targetRotation = gestureData.rotation;

        if (gestureData.isPinching) {
            this.targetExplosionForce = -0.3;
        } else {
            this.targetExplosionForce = 0;
        }
    }

    setGestureValue(value) {
        this.gestureValue = Math.max(0, Math.min(1, value));
        this.targetScale = 0.3 + this.gestureValue * 1.4;
    }

    setPinchValue(value) {
        this.targetPinchValue = Math.max(0, Math.min(1, value));
    }

    setPattern(patternName) {
        if (patternName === this.currentPattern) return;

        this.currentPattern = patternName;
        const generator = PatternGenerator.getPattern(patternName);
        this.basePositions = generator(this.particleCount);
        this.targetPositions = new Float32Array(this.basePositions);
        this.velocities.fill(0);
    }

    setColor(hexColor) {
        this.particleColor.set(hexColor);
        this.material.uniforms.color.value = this.particleColor;
        if (this.connectionMaterial) {
            this.connectionMaterial.color.set(hexColor);
        }
    }

    setParticleSize(multiplier) {
        this.sizeMultiplier = multiplier;
        this.material.uniforms.pointSize.value = 3.0 * multiplier;
    }

    setGlowIntensity(intensity) {
        this.baseGlowIntensity = intensity;
    }

    setRotationSpeed(multiplier) {
        this.rotationMultiplier = multiplier;
    }

    setMorphSpeed(multiplier) {
        this.morphMultiplier = multiplier;
        this.morphSpeed = this.baseMorphSpeed * multiplier;
    }

    setIdleAmplitude(multiplier) {
        this.idleMultiplier = multiplier;
        this.idleAmplitude = this.baseIdleAmplitude * multiplier;
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    setBloomEnabled(enabled) {
        this.bloomEnabled = enabled;
        if (this.bloomPass) {
            this.bloomPass.enabled = enabled;
        }
    }

    setBloomStrength(strength) {
        this.bloomStrength = strength;
        if (this.bloomPass) {
            this.bloomPass.strength = strength;
        }
    }

    setConnectionsEnabled(enabled) {
        this.connectionsEnabled = enabled;
        if (enabled && !this.connectionLines) {
            this.createConnections();
        }
        if (this.connectionLines) {
            this.connectionLines.visible = enabled;
        }
    }

    setTrailsEnabled(enabled) {
        this.trailsEnabled = enabled;
        if (enabled && !this.trailMesh) {
            this.createTrails();
        }
        if (this.trailMesh) {
            this.trailMesh.visible = enabled;
        }
        // Clear history when disabled
        if (!enabled) {
            this.trailHistory = [];
        }
    }

    setBackgroundEnabled(enabled) {
        this.backgroundEnabled = enabled;
        if (this.backgroundMesh) {
            this.backgroundMesh.visible = enabled;
        }
    }

    setMouseControlEnabled(enabled) {
        this.mouseControlEnabled = enabled;
        if (!enabled) {
            this.targetMouseInfluence = 0;
        }
    }

    setDOFEnabled(enabled) {
        this.dofEnabled = enabled;
        this.material.uniforms.dofEnabled.value = enabled;
    }

    setFocalDistance(distance) {
        this.focalDistance = distance;
        this.material.uniforms.focalDistance.value = distance;
    }

    setParticleCount(count) {
        if (count === this.particleCount) return;

        this.scene.remove(this.particles);
        this.geometry.dispose();

        this.particleCount = count;
        this.createParticles();

        const generator = PatternGenerator.getPattern(this.currentPattern);
        this.basePositions = generator(this.particleCount);
        this.targetPositions = new Float32Array(this.basePositions);
    }

    // LOD system
    updateLOD() {
        if (!this.lodEnabled) return;

        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        const fps = 1000 / delta;
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 30) {
            this.fpsHistory.shift();
        }

        this.currentFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

        // Adjust particle count based on FPS
        if (this.currentFPS < this.targetFPS - 5 && this.currentLOD > 0.5) {
            this.currentLOD = Math.max(0.5, this.currentLOD - 0.05);
        } else if (this.currentFPS > this.targetFPS + 5 && this.currentLOD < 1) {
            this.currentLOD = Math.min(1, this.currentLOD + 0.02);
        }
    }

    getFPS() {
        return Math.round(this.currentFPS);
    }

    getParticleCount() {
        return this.particleCount;
    }

    getLODLevel() {
        return this.currentLOD || 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = 0.016;
        this.time += deltaTime;

        // Update LOD
        this.updateLOD();

        // Update audio
        const audioLevel = this.updateAudio();
        this.material.uniforms.audioLevel.value = audioLevel;
        this.material.uniforms.time.value = this.time;

        if (this.backgroundMesh) {
            this.backgroundMesh.material.uniforms.time.value = this.time;
            this.backgroundMesh.material.uniforms.audioLevel.value = audioLevel;
        }

        // Smooth interpolation
        this.currentScale += (this.targetScale - this.currentScale) * 0.08;
        this.pinchValue += (this.targetPinchValue - this.pinchValue) * 0.1;
        this.turbulence += (this.targetTurbulence - this.turbulence) * 0.05;
        this.explosionForce += (this.targetExplosionForce - this.explosionForce) * 0.08;
        this.mouseInfluence += (this.targetMouseInfluence - this.mouseInfluence) * 0.1;

        // Update shader uniforms
        this.material.uniforms.glowIntensity.value = this.baseGlowIntensity + this.pinchValue * 1.5 + audioLevel * 0.5;
        this.material.uniforms.pointSize.value = 3.0 * this.sizeMultiplier + this.pinchValue * 2.0 + audioLevel * 1.5;

        // Update positions
        this.updatePositions(deltaTime);

        // Update connections
        if (this.connectionsEnabled) {
            this.updateConnections();
        }

        // Update trails
        if (this.trailsEnabled) {
            this.updateTrails();
            // Keep trail mesh rotation synced with particles
            if (this.trailMesh) {
                this.trailMesh.rotation.copy(this.particles.rotation);
            }
        }

        // Rotation
        if (this.autoRotate) {
            this.rotationSpeed = (this.baseRotationSpeed * this.rotationMultiplier) + this.turbulence * 0.003;
            this.particles.rotation.y += this.rotationSpeed;
        }

        // Mouse influence on rotation
        if (this.mouseInfluence > 0.01) {
            this.particles.rotation.x += this.mouse.y * this.mouseInfluence * 0.02;
            this.particles.rotation.y += this.mouse.x * this.mouseInfluence * 0.02;
        }

        // Tilt
        const targetTiltX = Math.sin(this.time * 0.5) * 0.1 + this.targetRotation * 0.3;
        this.particles.rotation.x += (targetTiltX - this.particles.rotation.x) * 0.05;

        // Render
        if (this.composer && this.bloomEnabled) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updatePositions(deltaTime) {
        const positions = this.geometry.attributes.position.array;
        const damping = 0.95;
        const morphForce = this.morphSpeed;

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            // Store previous position for trails
            if (this.trailsEnabled) {
                this.previousPositions[i3] = positions[i3];
                this.previousPositions[i3 + 1] = positions[i3 + 1];
                this.previousPositions[i3 + 2] = positions[i3 + 2];
            }

            // Get base target position
            const baseX = this.basePositions[i3];
            const baseY = this.basePositions[i3 + 1];
            const baseZ = this.basePositions[i3 + 2];

            // Apply scale
            const targetX = baseX * this.currentScale;
            const targetY = baseY * this.currentScale;
            const targetZ = baseZ * this.currentScale;

            // Current position
            const currentX = positions[i3];
            const currentY = positions[i3 + 1];
            const currentZ = positions[i3 + 2];

            // Direction from center
            const dist = Math.sqrt(currentX * currentX + currentY * currentY + currentZ * currentZ);
            const dirX = dist > 0 ? currentX / dist : 0;
            const dirY = dist > 0 ? currentY / dist : 0;
            const dirZ = dist > 0 ? currentZ / dist : 0;

            // Morphing force
            const morphX = (targetX - currentX) * morphForce;
            const morphY = (targetY - currentY) * morphForce;
            const morphZ = (targetZ - currentZ) * morphForce;

            // Explosion/implosion
            const explosionX = dirX * this.explosionForce * 5;
            const explosionY = dirY * this.explosionForce * 5;
            const explosionZ = dirZ * this.explosionForce * 5;

            // Turbulence
            const turbX = (Math.random() - 0.5) * this.turbulence * 2;
            const turbY = (Math.random() - 0.5) * this.turbulence * 2;
            const turbZ = (Math.random() - 0.5) * this.turbulence * 2;

            // Audio reactive movement
            const audioMoveX = this.audioInfluence * dirX * Math.sin(this.time * 5 + i * 0.1) * 2;
            const audioMoveY = this.audioInfluence * dirY * Math.sin(this.time * 5 + i * 0.1) * 2;
            const audioMoveZ = this.audioInfluence * dirZ * Math.sin(this.time * 5 + i * 0.1) * 2;

            // Update velocities
            this.velocities[i3] = (this.velocities[i3] + morphX + explosionX + turbX + audioMoveX) * damping;
            this.velocities[i3 + 1] = (this.velocities[i3 + 1] + morphY + explosionY + turbY + audioMoveY) * damping;
            this.velocities[i3 + 2] = (this.velocities[i3 + 2] + morphZ + explosionZ + turbZ + audioMoveZ) * damping;

            // Apply velocities
            positions[i3] += this.velocities[i3];
            positions[i3 + 1] += this.velocities[i3 + 1];
            positions[i3 + 2] += this.velocities[i3 + 2];

            // Idle floating
            const idleFactor = 1 - this.turbulence * 0.8;
            const idleOffset = Math.sin(this.time * this.idleSpeed * 1000 + i * 0.01) * this.idleAmplitude * idleFactor;
            positions[i3] += Math.sin(this.time + i * 0.1) * idleOffset * 0.05;
            positions[i3 + 1] += idleOffset * 0.5;
            positions[i3 + 2] += Math.cos(this.time + i * 0.1) * idleOffset * 0.05;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();

        if (this.connectionGeometry) {
            this.connectionGeometry.dispose();
        }
        if (this.connectionMaterial) {
            this.connectionMaterial.dispose();
        }
        if (this.backgroundMesh) {
            this.backgroundMesh.geometry.dispose();
            this.backgroundMesh.material.dispose();
        }
        if (this.trailGeometry) {
            this.trailGeometry.dispose();
        }
        if (this.trailMaterial) {
            this.trailMaterial.dispose();
        }

        this.stopAudio();
        this.container.removeChild(this.renderer.domElement);
    }
}
