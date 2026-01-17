/**
 * PatternGenerator - Generates 3D particle positions for various shapes
 * Uses structured UV surface distribution for flowing wireframe aesthetics
 */

export class PatternGenerator {
    /**
     * Generate positions for a spherical surface distribution
     * Creates flowing latitude/longitude pattern
     */
    static sphere(count, radius = 50) {
        const positions = new Float32Array(count * 3);

        // Calculate grid dimensions for UV distribution
        const aspectRatio = 2; // longitude wraps twice as much as latitude
        const gridV = Math.ceil(Math.sqrt(count / aspectRatio));
        const gridU = Math.ceil(count / gridV);

        let idx = 0;
        for (let i = 0; i < gridV && idx < count; i++) {
            for (let j = 0; j < gridU && idx < count; j++) {
                // UV coordinates with slight noise for organic feel
                const u = (j / gridU) * Math.PI * 2;
                const v = (i / (gridV - 1)) * Math.PI;

                // Small perturbation for natural look
                const noiseU = (Math.random() - 0.5) * 0.05;
                const noiseV = (Math.random() - 0.5) * 0.05;

                const phi = u + noiseU;
                const theta = v + noiseV;

                // Spherical to Cartesian
                const x = radius * Math.sin(theta) * Math.cos(phi);
                const y = radius * Math.cos(theta);
                const z = radius * Math.sin(theta) * Math.sin(phi);

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Generate positions for a torus surface
     * Creates flowing ring pattern
     */
    static torus(count, majorRadius = 35, minorRadius = 15) {
        const positions = new Float32Array(count * 3);

        // Grid dimensions
        const gridU = Math.ceil(Math.sqrt(count * 1.5));
        const gridV = Math.ceil(count / gridU);

        let idx = 0;
        for (let i = 0; i < gridU && idx < count; i++) {
            for (let j = 0; j < gridV && idx < count; j++) {
                const u = (i / gridU) * Math.PI * 2;
                const v = (j / gridV) * Math.PI * 2;

                // Small noise
                const noiseU = (Math.random() - 0.5) * 0.03;
                const noiseV = (Math.random() - 0.5) * 0.03;

                const uN = u + noiseU;
                const vN = v + noiseV;

                const x = (majorRadius + minorRadius * Math.cos(vN)) * Math.cos(uN);
                const y = minorRadius * Math.sin(vN);
                const z = (majorRadius + minorRadius * Math.cos(vN)) * Math.sin(uN);

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Saturn - Sphere with rings
     */
    static saturn(count, radius = 40) {
        const positions = new Float32Array(count * 3);

        // 70% sphere, 30% ring
        const sphereCount = Math.floor(count * 0.7);
        const ringCount = count - sphereCount;

        // Sphere portion
        const gridV = Math.ceil(Math.sqrt(sphereCount / 2));
        const gridU = Math.ceil(sphereCount / gridV);

        let idx = 0;
        for (let i = 0; i < gridV && idx < sphereCount; i++) {
            for (let j = 0; j < gridU && idx < sphereCount; j++) {
                const u = (j / gridU) * Math.PI * 2;
                const v = (i / (gridV - 1)) * Math.PI;

                const noise = (Math.random() - 0.5) * 0.03;
                const phi = u + noise;
                const theta = v + noise;

                const x = radius * Math.sin(theta) * Math.cos(phi);
                const y = radius * Math.cos(theta);
                const z = radius * Math.sin(theta) * Math.sin(phi);

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        // Ring portion
        const ringInner = radius * 1.4;
        const ringOuter = radius * 2.2;
        const ringGridU = Math.ceil(Math.sqrt(ringCount * 3));
        const ringGridV = Math.ceil(ringCount / ringGridU);

        for (let i = 0; i < ringGridV && idx < count; i++) {
            for (let j = 0; j < ringGridU && idx < count; j++) {
                const angle = (j / ringGridU) * Math.PI * 2;
                const r = ringInner + (i / ringGridV) * (ringOuter - ringInner);

                const noise = (Math.random() - 0.5) * 0.02;

                const x = Math.cos(angle + noise) * r;
                const y = (Math.random() - 0.5) * 2; // Very thin
                const z = Math.sin(angle + noise) * r;

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Helix / DNA double helix
     */
    static helix(count, height = 100) {
        const positions = new Float32Array(count * 3);
        const radius = 20;
        const turns = 4;

        // Two strands
        const perStrand = Math.floor(count / 2);

        let idx = 0;
        for (let strand = 0; strand < 2; strand++) {
            const offset = strand * Math.PI;

            for (let i = 0; i < perStrand && idx < count; i++) {
                const t = i / perStrand;
                const angle = t * turns * Math.PI * 2 + offset;
                const y = (t - 0.5) * height;

                const noise = (Math.random() - 0.5) * 0.02;

                const x = Math.cos(angle + noise) * radius;
                const z = Math.sin(angle + noise) * radius;

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Galaxy spiral
     */
    static galaxy(count, radius = 60) {
        const positions = new Float32Array(count * 3);
        const arms = 3;
        const armOffset = (2 * Math.PI) / arms;

        // Distribute along spiral arms
        const perArm = Math.floor(count / arms);

        let idx = 0;
        for (let arm = 0; arm < arms; arm++) {
            for (let i = 0; i < perArm && idx < count; i++) {
                const t = i / perArm;
                const distance = t * radius;

                // Spiral angle increases with distance
                const spiralAngle = t * Math.PI * 2 + arm * armOffset;

                // Add slight spread
                const spread = (Math.random() - 0.5) * 0.3 * (1 - t * 0.5);
                const angle = spiralAngle + spread;

                const x = Math.cos(angle) * distance;
                const z = Math.sin(angle) * distance;
                const y = (Math.random() - 0.5) * 3 * (1 - t * 0.7); // Thinner at edges

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        // Fill remaining with center bulge
        while (idx < count) {
            const r = Math.random() * radius * 0.2;
            const angle = Math.random() * Math.PI * 2;

            positions[idx * 3] = Math.cos(angle) * r;
            positions[idx * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[idx * 3 + 2] = Math.sin(angle) * r;
            idx++;
        }

        return positions;
    }

    /**
     * Cube - wireframe style surface
     */
    static cube(count, size = 70) {
        const positions = new Float32Array(count * 3);
        const half = size / 2;

        // Distribute across 6 faces
        const perFace = Math.floor(count / 6);
        const gridSize = Math.ceil(Math.sqrt(perFace));

        const faces = [
            { axis: 'x', sign: 1 },
            { axis: 'x', sign: -1 },
            { axis: 'y', sign: 1 },
            { axis: 'y', sign: -1 },
            { axis: 'z', sign: 1 },
            { axis: 'z', sign: -1 }
        ];

        let idx = 0;
        for (const face of faces) {
            for (let i = 0; i < gridSize && idx < count; i++) {
                for (let j = 0; j < gridSize && idx < count; j++) {
                    const u = (i / (gridSize - 1)) * 2 - 1;
                    const v = (j / (gridSize - 1)) * 2 - 1;

                    const noise = (Math.random() - 0.5) * 0.02;

                    let x, y, z;
                    if (face.axis === 'x') {
                        x = face.sign * half;
                        y = (u + noise) * half;
                        z = (v + noise) * half;
                    } else if (face.axis === 'y') {
                        x = (u + noise) * half;
                        y = face.sign * half;
                        z = (v + noise) * half;
                    } else {
                        x = (u + noise) * half;
                        y = (v + noise) * half;
                        z = face.sign * half;
                    }

                    positions[idx * 3] = x;
                    positions[idx * 3 + 1] = y;
                    positions[idx * 3 + 2] = z;
                    idx++;
                }
            }
        }

        return positions;
    }

    /**
     * Pyramid - surface distribution
     */
    static pyramid(count, size = 60) {
        const positions = new Float32Array(count * 3);
        const height = size * 1.2;
        const half = size / 2;

        // 4 triangular faces + 1 square base
        const perFace = Math.floor(count / 5);

        let idx = 0;

        // Base (square grid)
        const baseGrid = Math.ceil(Math.sqrt(perFace));
        for (let i = 0; i < baseGrid && idx < perFace; i++) {
            for (let j = 0; j < baseGrid && idx < perFace; j++) {
                const x = ((i / (baseGrid - 1)) - 0.5) * size;
                const z = ((j / (baseGrid - 1)) - 0.5) * size;
                const noise = (Math.random() - 0.5) * 0.02 * size;

                positions[idx * 3] = x + noise;
                positions[idx * 3 + 1] = -height / 2;
                positions[idx * 3 + 2] = z + noise;
                idx++;
            }
        }

        // 4 triangular faces
        const trianglePoints = [
            { x1: -half, z1: -half, x2: half, z2: -half }, // front
            { x1: half, z1: -half, x2: half, z2: half },   // right
            { x1: half, z1: half, x2: -half, z2: half },   // back
            { x1: -half, z1: half, x2: -half, z2: -half }  // left
        ];

        const faceGrid = Math.ceil(Math.sqrt(perFace));
        for (const tri of trianglePoints) {
            for (let i = 0; i < faceGrid && idx < count; i++) {
                for (let j = 0; j <= i && idx < count; j++) {
                    const t = i / (faceGrid - 1); // 0 at base, 1 at apex
                    const s = i > 0 ? j / i : 0.5;

                    const baseX = tri.x1 + (tri.x2 - tri.x1) * s;
                    const baseZ = tri.z1 + (tri.z2 - tri.z1) * s;

                    const x = baseX * (1 - t);
                    const z = baseZ * (1 - t);
                    const y = -height / 2 + t * height;

                    const noise = (Math.random() - 0.5) * 0.02;

                    positions[idx * 3] = x + noise * size;
                    positions[idx * 3 + 1] = y;
                    positions[idx * 3 + 2] = z + noise * size;
                    idx++;
                }
            }
        }

        return positions;
    }

    /**
     * Heart shape - surface distribution
     */
    static heart(count, scale = 3) {
        const positions = new Float32Array(count * 3);

        const gridU = Math.ceil(Math.sqrt(count * 2));
        const gridV = Math.ceil(count / gridU);

        let idx = 0;
        for (let i = 0; i < gridU && idx < count; i++) {
            for (let j = 0; j < gridV && idx < count; j++) {
                const u = (i / gridU) * Math.PI * 2;
                const v = (j / gridV) * Math.PI - Math.PI / 2;

                const noise = (Math.random() - 0.5) * 0.03;

                // Heart parametric equations
                const x = 16 * Math.pow(Math.sin(u + noise), 3);
                const y = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);
                const z = Math.sin(v + noise) * 8;

                positions[idx * 3] = x * scale;
                positions[idx * 3 + 1] = y * scale;
                positions[idx * 3 + 2] = z * scale;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Star shape
     */
    static star(count, outerRadius = 50, innerRadius = 25) {
        const positions = new Float32Array(count * 3);
        const points = 5;

        const gridU = Math.ceil(Math.sqrt(count));
        const gridV = Math.ceil(count / gridU);

        let idx = 0;
        for (let i = 0; i < gridU && idx < count; i++) {
            for (let j = 0; j < gridV && idx < count; j++) {
                const u = (i / gridU) * Math.PI * 2;
                const v = (j / (gridV - 1)) * Math.PI;

                // Star modulation
                const starAngle = u * points;
                const radiusMod = (Math.cos(starAngle) + 1) / 2;
                const radius = innerRadius + (outerRadius - innerRadius) * radiusMod;

                const noise = (Math.random() - 0.5) * 0.03;

                const x = radius * Math.sin(v) * Math.cos(u + noise);
                const y = radius * Math.cos(v);
                const z = radius * Math.sin(v) * Math.sin(u + noise);

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Wave surface
     */
    static wave(count, width = 100, depth = 80) {
        const positions = new Float32Array(count * 3);
        const amplitude = 15;

        const gridX = Math.ceil(Math.sqrt(count * width / depth));
        const gridZ = Math.ceil(count / gridX);

        let idx = 0;
        for (let i = 0; i < gridX && idx < count; i++) {
            for (let j = 0; j < gridZ && idx < count; j++) {
                const x = ((i / (gridX - 1)) - 0.5) * width;
                const z = ((j / (gridZ - 1)) - 0.5) * depth;

                // Multiple wave frequencies for organic look
                const wave1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * amplitude;
                const wave2 = Math.sin(x * 0.15 + z * 0.1) * amplitude * 0.4;
                const y = wave1 + wave2;

                const noise = (Math.random() - 0.5) * 0.5;

                positions[idx * 3] = x + noise;
                positions[idx * 3 + 1] = y + noise;
                positions[idx * 3 + 2] = z + noise;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Infinity symbol
     */
    static infinity(count, size = 50) {
        const positions = new Float32Array(count * 3);

        const gridU = Math.ceil(Math.sqrt(count * 2));
        const gridV = Math.ceil(count / gridU);

        let idx = 0;
        for (let i = 0; i < gridU && idx < count; i++) {
            for (let j = 0; j < gridV && idx < count; j++) {
                const t = (i / gridU) * Math.PI * 2;
                const thickness = (j / gridV) * 8 - 4;

                const noise = (Math.random() - 0.5) * 0.02;

                // Lemniscate
                const scale = size / (1 + Math.sin(t) * Math.sin(t));
                const x = scale * Math.cos(t + noise);
                const y = scale * Math.sin(t) * Math.cos(t);
                const z = thickness + noise * 5;

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Firework burst
     */
    static firework(count, radius = 55) {
        const positions = new Float32Array(count * 3);
        const trails = 16;
        const particlesPerTrail = Math.ceil(count / trails);

        let idx = 0;
        for (let trail = 0; trail < trails && idx < count; trail++) {
            // Trail direction
            const phi = (trail / trails) * Math.PI * 2;
            const theta = Math.PI / 4 + Math.random() * Math.PI / 2;

            for (let i = 0; i < particlesPerTrail && idx < count; i++) {
                const t = i / particlesPerTrail;
                const r = t * radius;

                const noise = (Math.random() - 0.5) * 0.05 * (1 - t);

                const x = r * Math.sin(theta + noise) * Math.cos(phi + noise);
                const y = r * Math.cos(theta + noise);
                const z = r * Math.sin(theta + noise) * Math.sin(phi + noise);

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * Tornado vortex
     */
    static tornado(count, height = 100) {
        const positions = new Float32Array(count * 3);
        const baseRadius = 35;
        const topRadius = 8;
        const spirals = 5;

        const gridU = Math.ceil(Math.sqrt(count * 2));
        const gridV = Math.ceil(count / gridU);

        let idx = 0;
        for (let i = 0; i < gridV && idx < count; i++) {
            for (let j = 0; j < gridU && idx < count; j++) {
                const t = i / (gridV - 1); // Height parameter
                const angle = (j / gridU) * Math.PI * 2 + t * spirals * Math.PI * 2;

                const radius = baseRadius * (1 - t) + topRadius * t;
                const y = (t - 0.5) * height;

                const noise = (Math.random() - 0.5) * 0.03;

                const x = Math.cos(angle + noise) * radius;
                const z = Math.sin(angle + noise) * radius;

                positions[idx * 3] = x;
                positions[idx * 3 + 1] = y;
                positions[idx * 3 + 2] = z;
                idx++;
            }
        }

        return positions;
    }

    /**
     * DNA double helix (alias for helix)
     */
    static dna(count, height = 100) {
        return PatternGenerator.helix(count, height);
    }

    /**
     * Get pattern generator function by name
     */
    static getPattern(name) {
        const patterns = {
            sphere: PatternGenerator.sphere,
            cube: PatternGenerator.cube,
            heart: PatternGenerator.heart,
            galaxy: PatternGenerator.galaxy,
            dna: PatternGenerator.dna,
            helix: PatternGenerator.helix,
            torus: PatternGenerator.torus,
            saturn: PatternGenerator.saturn,
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
     */
    static getPatternNames() {
        return ['sphere', 'cube', 'heart', 'galaxy', 'dna', 'helix', 'torus', 'saturn', 'star', 'wave', 'pyramid', 'infinity', 'firework', 'tornado'];
    }
}
