/**
 * PatternGenerator - Generates 3D particle positions for various shapes
 * Each pattern returns an array of {x, y, z} positions
 */

export class PatternGenerator {
    /**
     * Generate positions for a spherical distribution
     * @param {number} count - Number of particles
     * @param {number} radius - Sphere radius
     * @returns {Float32Array} - Position array [x1,y1,z1, x2,y2,z2, ...]
     */
    static sphere(count, radius = 50) {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Fibonacci sphere distribution for even spacing
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const r = radius * Math.cbrt(Math.random()); // Volume distribution
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a cubic distribution
     * @param {number} count - Number of particles
     * @param {number} size - Cube size
     * @returns {Float32Array} - Position array
     */
    static cube(count, size = 80) {
        const positions = new Float32Array(count * 3);
        const half = size / 2;

        for (let i = 0; i < count; i++) {
            // Random distribution within cube volume
            positions[i * 3] = (Math.random() - 0.5) * size;
            positions[i * 3 + 1] = (Math.random() - 0.5) * size;
            positions[i * 3 + 2] = (Math.random() - 0.5) * size;
        }

        return positions;
    }

    /**
     * Generate positions for a heart shape
     * @param {number} count - Number of particles
     * @param {number} scale - Heart scale
     * @returns {Float32Array} - Position array
     */
    static heart(count, scale = 3) {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Parametric heart surface equation
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;

            // Heart shape parametric equations
            const x = 16 * Math.pow(Math.sin(u), 3);
            const y = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);
            const z = (Math.random() - 0.5) * 15; // Add depth

            positions[i * 3] = x * scale;
            positions[i * 3 + 1] = y * scale;
            positions[i * 3 + 2] = z * scale;
        }

        return positions;
    }

    /**
     * Generate positions for a spiral galaxy
     * @param {number} count - Number of particles
     * @param {number} radius - Galaxy radius
     * @returns {Float32Array} - Position array
     */
    static galaxy(count, radius = 60) {
        const positions = new Float32Array(count * 3);
        const arms = 3;
        const armSpread = 0.5;
        const armOffset = (2 * Math.PI) / arms;

        for (let i = 0; i < count; i++) {
            // Distance from center (more particles near center)
            const distance = Math.pow(Math.random(), 0.5) * radius;

            // Base angle for spiral
            const baseAngle = distance * 0.15 + (Math.floor(Math.random() * arms) * armOffset);

            // Add randomness for arm spread
            const spreadAngle = baseAngle + (Math.random() - 0.5) * armSpread * (1 - distance / radius);

            const x = Math.cos(spreadAngle) * distance;
            const z = Math.sin(spreadAngle) * distance;
            const y = (Math.random() - 0.5) * 5 * (1 - distance / radius); // Thin disk

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a DNA double helix
     * @param {number} count - Number of particles
     * @param {number} height - Helix height
     * @returns {Float32Array} - Position array
     */
    static dna(count, height = 100) {
        const positions = new Float32Array(count * 3);
        const radius = 15;
        const turns = 4;

        for (let i = 0; i < count; i++) {
            // Position along helix
            const t = (i / count) * turns * Math.PI * 2;
            const y = ((i / count) - 0.5) * height;

            // Two strands of the helix
            const strand = Math.random() > 0.5 ? 0 : Math.PI;
            const noise = (Math.random() - 0.5) * 3;

            const x = Math.cos(t + strand) * radius + noise;
            const z = Math.sin(t + strand) * radius + noise;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a torus (donut) shape
     * @param {number} count - Number of particles
     * @param {number} majorRadius - Distance from center to tube center
     * @param {number} minorRadius - Tube radius
     * @returns {Float32Array} - Position array
     */
    static torus(count, majorRadius = 35, minorRadius = 15) {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Parametric torus equations
            const u = Math.random() * Math.PI * 2; // Around the tube
            const v = Math.random() * Math.PI * 2; // Around the torus

            const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
            const y = minorRadius * Math.sin(v);
            const z = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a 3D star shape
     * @param {number} count - Number of particles
     * @param {number} outerRadius - Outer point radius
     * @param {number} innerRadius - Inner valley radius
     * @returns {Float32Array} - Position array
     */
    static star(count, outerRadius = 50, innerRadius = 20) {
        const positions = new Float32Array(count * 3);
        const points = 5;

        for (let i = 0; i < count; i++) {
            // Random spherical coordinates
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.acos(2 * Math.random() - 1);

            // Modulate radius based on angle to create star shape
            const angle = phi * points;
            const radiusMod = (Math.cos(angle) + 1) / 2; // 0 to 1
            const radius = innerRadius + (outerRadius - innerRadius) * radiusMod;

            // Add some randomness
            const r = radius * (0.8 + Math.random() * 0.4);

            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a wave pattern
     * @param {number} count - Number of particles
     * @param {number} width - Wave width
     * @param {number} depth - Wave depth
     * @returns {Float32Array} - Position array
     */
    static wave(count, width = 100, depth = 60) {
        const positions = new Float32Array(count * 3);
        const amplitude = 20;
        const frequency = 0.08;

        for (let i = 0; i < count; i++) {
            // Grid distribution with wave height
            const x = (Math.random() - 0.5) * width;
            const z = (Math.random() - 0.5) * depth;

            // Sinusoidal wave with multiple frequencies
            const wave1 = Math.sin(x * frequency) * Math.cos(z * frequency) * amplitude;
            const wave2 = Math.sin(x * frequency * 2 + z * frequency) * amplitude * 0.5;
            const y = wave1 + wave2;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a pyramid shape
     * @param {number} count - Number of particles
     * @param {number} size - Pyramid size
     * @returns {Float32Array} - Position array
     */
    static pyramid(count, size = 60) {
        const positions = new Float32Array(count * 3);
        const height = size * 1.2;

        for (let i = 0; i < count; i++) {
            // Random height along pyramid
            const t = Math.random();
            const y = (t - 0.5) * height;

            // Width decreases with height
            const widthAtHeight = size * (1 - t) * 0.8;

            // Square base
            const side = Math.floor(Math.random() * 4);
            let x, z;

            if (side === 0) {
                x = (Math.random() - 0.5) * widthAtHeight;
                z = widthAtHeight / 2;
            } else if (side === 1) {
                x = (Math.random() - 0.5) * widthAtHeight;
                z = -widthAtHeight / 2;
            } else if (side === 2) {
                x = widthAtHeight / 2;
                z = (Math.random() - 0.5) * widthAtHeight;
            } else {
                x = -widthAtHeight / 2;
                z = (Math.random() - 0.5) * widthAtHeight;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for an infinity symbol
     * @param {number} count - Number of particles
     * @param {number} size - Symbol size
     * @returns {Float32Array} - Position array
     */
    static infinity(count, size = 50) {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Lemniscate of Bernoulli (infinity symbol)
            const t = (i / count) * Math.PI * 2;
            const noise = (Math.random() - 0.5) * 8;

            const scale = size / (1 + Math.sin(t) * Math.sin(t));
            const x = scale * Math.cos(t) + noise;
            const y = (scale * Math.sin(t) * Math.cos(t)) + noise;
            const z = (Math.random() - 0.5) * 15 + noise * 0.5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a firework burst
     * @param {number} count - Number of particles
     * @param {number} radius - Burst radius
     * @returns {Float32Array} - Position array
     */
    static firework(count, radius = 55) {
        const positions = new Float32Array(count * 3);
        const trails = 12; // Number of trails

        for (let i = 0; i < count; i++) {
            const trail = i % trails;
            const trailProgress = Math.pow(Math.random(), 0.5);

            // Base angle for this trail
            const phi = (trail / trails) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const theta = Math.random() * Math.PI;

            const r = radius * trailProgress;
            const spread = (1 - trailProgress) * 0.2;

            const x = r * Math.sin(theta) * Math.cos(phi) + (Math.random() - 0.5) * spread * radius;
            const y = r * Math.cos(theta) + (Math.random() - 0.5) * spread * radius;
            const z = r * Math.sin(theta) * Math.sin(phi) + (Math.random() - 0.5) * spread * radius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Generate positions for a tornado/vortex
     * @param {number} count - Number of particles
     * @param {number} height - Tornado height
     * @returns {Float32Array} - Position array
     */
    static tornado(count, height = 100) {
        const positions = new Float32Array(count * 3);
        const baseRadius = 40;
        const topRadius = 10;
        const spirals = 6;

        for (let i = 0; i < count; i++) {
            // Position along height
            const t = Math.random();
            const y = (t - 0.5) * height;

            // Radius decreases towards top
            const radius = baseRadius * (1 - t * 0.7) + topRadius * t;

            // Spiral angle
            const angle = t * spirals * Math.PI * 2 + (Math.random() - 0.5) * 1.5;

            // Add some turbulence
            const turbulence = (1 - t) * 8;

            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * turbulence;
            const z = Math.sin(angle) * radius + (Math.random() - 0.5) * turbulence;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }

    /**
     * Get pattern generator function by name
     * @param {string} name - Pattern name
     * @returns {Function} - Generator function
     */
    static getPattern(name) {
        const patterns = {
            sphere: PatternGenerator.sphere,
            cube: PatternGenerator.cube,
            heart: PatternGenerator.heart,
            galaxy: PatternGenerator.galaxy,
            dna: PatternGenerator.dna,
            torus: PatternGenerator.torus,
            star: PatternGenerator.star,
            wave: PatternGenerator.wave,
            pyramid: PatternGenerator.pyramid,
            infinity: PatternGenerator.infinity,
            firework: PatternGenerator.firework,
            tornado: PatternGenerator.tornado
        };

        return patterns[name] || patterns.sphere;
    }

    /**
     * Get all available pattern names
     * @returns {string[]} - Array of pattern names
     */
    static getPatternNames() {
        return ['sphere', 'cube', 'heart', 'galaxy', 'dna', 'torus', 'star', 'wave', 'pyramid', 'infinity', 'firework', 'tornado'];
    }
}
