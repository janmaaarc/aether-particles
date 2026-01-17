/**
 * GestureDetector - Enhanced MediaPipe Hands wrapper with advanced gesture detection
 * Features: Finger curl detection, One Euro Filter, velocity tracking, pinch gesture, adaptive smoothing
 */

/**
 * One Euro Filter - Reduces noise while maintaining responsiveness
 * Based on: https://cristal.univ-lille.fr/~casiez/1euro/
 */
class OneEuroFilter {
    constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
        this.minCutoff = minCutoff;  // Minimum cutoff frequency
        this.beta = beta;             // Speed coefficient (higher = more responsive to quick movements)
        this.dCutoff = dCutoff;       // Derivative cutoff frequency
        this.xPrev = null;
        this.dxPrev = 0;
        this.tPrev = null;
    }

    alpha(cutoff, dt) {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / dt);
    }

    filter(x, timestamp = null) {
        const t = timestamp || performance.now() / 1000;

        if (this.xPrev === null) {
            this.xPrev = x;
            this.tPrev = t;
            return x;
        }

        const dt = t - this.tPrev;
        if (dt <= 0) return this.xPrev;

        // Estimate derivative
        const dx = (x - this.xPrev) / dt;
        const edx = this.alpha(this.dCutoff, dt) * dx + (1 - this.alpha(this.dCutoff, dt)) * this.dxPrev;

        // Adaptive cutoff based on speed
        const cutoff = this.minCutoff + this.beta * Math.abs(edx);

        // Filter the value
        const filtered = this.alpha(cutoff, dt) * x + (1 - this.alpha(cutoff, dt)) * this.xPrev;

        this.xPrev = filtered;
        this.dxPrev = edx;
        this.tPrev = t;

        return filtered;
    }

    reset() {
        this.xPrev = null;
        this.dxPrev = 0;
        this.tPrev = null;
    }
}

/**
 * Velocity Tracker - Tracks movement speed with smoothing
 */
class VelocityTracker {
    constructor(historyLength = 5) {
        this.positions = [];
        this.timestamps = [];
        this.historyLength = historyLength;
    }

    update(position, timestamp = null) {
        const t = timestamp || performance.now();

        this.positions.push({ ...position });
        this.timestamps.push(t);

        if (this.positions.length > this.historyLength) {
            this.positions.shift();
            this.timestamps.shift();
        }
    }

    getVelocity() {
        if (this.positions.length < 2) {
            return { x: 0, y: 0, z: 0, magnitude: 0 };
        }

        const newest = this.positions[this.positions.length - 1];
        const oldest = this.positions[0];
        const dt = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / 1000;

        if (dt <= 0) {
            return { x: 0, y: 0, z: 0, magnitude: 0 };
        }

        const vx = (newest.x - oldest.x) / dt;
        const vy = (newest.y - oldest.y) / dt;
        const vz = ((newest.z || 0) - (oldest.z || 0)) / dt;
        const magnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);

        return { x: vx, y: vy, z: vz, magnitude };
    }

    reset() {
        this.positions = [];
        this.timestamps = [];
    }
}

export class GestureDetector {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');

        // MediaPipe Hands instance
        this.hands = null;
        this.camera = null;

        // Gesture state
        this.gestureValue = 0.5;
        this.isHandDetected = false;
        this.landmarks = null;

        // One Euro Filters for smooth output
        this.opennessFilter = new OneEuroFilter(1.0, 0.007, 1.0);
        this.pinchFilter = new OneEuroFilter(1.0, 0.01, 1.0);

        // Velocity tracking
        this.palmVelocityTracker = new VelocityTracker(8);
        this.velocity = { x: 0, y: 0, z: 0, magnitude: 0 };

        // Finger curl states (0 = straight, 1 = fully curled)
        this.fingerCurls = {
            thumb: 0,
            index: 0,
            middle: 0,
            ring: 0,
            pinky: 0
        };

        // Pinch gesture
        this.pinchValue = 0;      // 0 = no pinch, 1 = full pinch
        this.isPinching = false;
        this.pinchThreshold = 0.7;

        // Hand rotation (roll angle in radians)
        this.handRotation = 0;

        // Special gesture detection
        this.currentGesture = 'none';  // 'none', 'thumbsUp', 'peace', 'fist', 'open', 'pinch'
        this.gestureConfidence = 0;

        // Adaptive smoothing
        this.adaptiveSmoothingEnabled = true;
        this.baseSmoothing = 0.15;
        this.velocitySmoothing = 0.4;

        // Two-hand tracking
        this.twoHandsDetected = false;
        this.handDistance = 0;          // Distance between two hands
        this.handSpread = 0;            // Spread gesture (both hands moving apart)
        this.twoHandRotation = 0;       // Rotation between two hands
        this.secondHandData = null;     // Data for second hand

        // Callbacks
        this.onGestureUpdate = null;
        this.onHandDetected = null;
        this.onHandLost = null;
        this.onPinchStart = null;
        this.onPinchEnd = null;
        this.onTwoHandsDetected = null;
        this.onTwoHandsLost = null;
        this.onSpecialGesture = null;  // Called when special gesture detected

        // Landmark indices
        this.LANDMARKS = {
            WRIST: 0,
            THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
            INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
            MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
            RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
            PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20
        };
    }

    async init() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,  // Enable two-hand tracking
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => this.onResults(results));

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({ image: this.video });
            },
            width: 640,
            height: 480
        });

        await this.camera.start();

        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;

        return true;
    }

    onResults(results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            this.landmarks = landmarks;

            // Draw first hand
            this.drawHand(landmarks, 0);

            // Calculate all gesture values for first hand
            this.calculateFingerCurls(landmarks);
            const rawOpenness = this.calculateHandOpenness(landmarks);
            const rawPinch = this.calculatePinchValue(landmarks);
            this.calculateHandRotation(landmarks);
            this.updateVelocity(landmarks);

            // Apply One Euro Filter
            this.gestureValue = this.opennessFilter.filter(rawOpenness);
            this.pinchValue = this.pinchFilter.filter(rawPinch);

            // Detect special gestures (thumbs up, peace, fist)
            this.detectSpecialGestures();

            // Detect pinch state changes
            const wasPinching = this.isPinching;
            this.isPinching = this.pinchValue > this.pinchThreshold;

            if (this.isPinching && !wasPinching && this.onPinchStart) {
                this.onPinchStart();
            } else if (!this.isPinching && wasPinching && this.onPinchEnd) {
                this.onPinchEnd();
            }

            // Notify hand detected
            if (!this.isHandDetected) {
                this.isHandDetected = true;
                if (this.onHandDetected) this.onHandDetected();
            }

            // Handle second hand if present
            if (results.multiHandLandmarks.length > 1) {
                const landmarks2 = results.multiHandLandmarks[1];
                this.drawHand(landmarks2, 1);

                // Calculate two-hand gestures
                this.calculateTwoHandGestures(landmarks, landmarks2);

                // Notify two hands detected
                if (!this.twoHandsDetected) {
                    this.twoHandsDetected = true;
                    if (this.onTwoHandsDetected) this.onTwoHandsDetected();
                }
            } else {
                // Lost second hand
                if (this.twoHandsDetected) {
                    this.twoHandsDetected = false;
                    this.handDistance = 0;
                    this.handSpread = 0;
                    if (this.onTwoHandsLost) this.onTwoHandsLost();
                }
            }

            // Trigger callback with all gesture data
            if (this.onGestureUpdate) {
                this.onGestureUpdate(this.getGestureData());
            }
        } else {
            // No hand detected
            if (this.isHandDetected) {
                this.isHandDetected = false;
                this.twoHandsDetected = false;
                this.resetFilters();
                if (this.onHandLost) this.onHandLost();
            }

            // Gradually return to neutral
            this.gestureValue = this.opennessFilter.filter(0.5);
            this.pinchValue = this.pinchFilter.filter(0);

            if (this.onGestureUpdate) {
                this.onGestureUpdate(this.getGestureData());
            }
        }
    }

    /**
     * Calculate gestures between two hands
     */
    calculateTwoHandGestures(landmarks1, landmarks2) {
        const L = this.LANDMARKS;

        // Get palm centers
        const palm1 = this.getPalmCenter(landmarks1);
        const palm2 = this.getPalmCenter(landmarks2);

        // Distance between hands (normalized 0-1)
        const dx = palm2.x - palm1.x;
        const dy = palm2.y - palm1.y;
        const dz = (palm2.z || 0) - (palm1.z || 0);
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Previous distance for spread detection
        const prevDistance = this.handDistance;
        this.handDistance = Math.min(1, distance * 2);

        // Spread gesture (hands moving apart = positive, together = negative)
        this.handSpread = (this.handDistance - prevDistance) * 10;

        // Rotation between hands
        this.twoHandRotation = Math.atan2(dy, dx);
    }

    /**
     * Get center of palm
     */
    getPalmCenter(landmarks) {
        const L = this.LANDMARKS;
        return {
            x: (landmarks[L.INDEX_MCP].x + landmarks[L.MIDDLE_MCP].x +
                landmarks[L.RING_MCP].x + landmarks[L.PINKY_MCP].x) / 4,
            y: (landmarks[L.INDEX_MCP].y + landmarks[L.MIDDLE_MCP].y +
                landmarks[L.RING_MCP].y + landmarks[L.PINKY_MCP].y) / 4,
            z: (landmarks[L.INDEX_MCP].z + landmarks[L.MIDDLE_MCP].z +
                landmarks[L.RING_MCP].z + landmarks[L.PINKY_MCP].z) / 4
        };
    }

    /**
     * Calculate finger curl for each finger using angle-based detection
     */
    calculateFingerCurls(landmarks) {
        const L = this.LANDMARKS;

        // Calculate curl for each finger (angle between joints)
        this.fingerCurls.thumb = this.calculateFingerCurl(
            landmarks[L.THUMB_CMC], landmarks[L.THUMB_MCP],
            landmarks[L.THUMB_IP], landmarks[L.THUMB_TIP]
        );

        this.fingerCurls.index = this.calculateFingerCurl(
            landmarks[L.INDEX_MCP], landmarks[L.INDEX_PIP],
            landmarks[L.INDEX_DIP], landmarks[L.INDEX_TIP]
        );

        this.fingerCurls.middle = this.calculateFingerCurl(
            landmarks[L.MIDDLE_MCP], landmarks[L.MIDDLE_PIP],
            landmarks[L.MIDDLE_DIP], landmarks[L.MIDDLE_TIP]
        );

        this.fingerCurls.ring = this.calculateFingerCurl(
            landmarks[L.RING_MCP], landmarks[L.RING_PIP],
            landmarks[L.RING_DIP], landmarks[L.RING_TIP]
        );

        this.fingerCurls.pinky = this.calculateFingerCurl(
            landmarks[L.PINKY_MCP], landmarks[L.PINKY_PIP],
            landmarks[L.PINKY_DIP], landmarks[L.PINKY_TIP]
        );
    }

    /**
     * Calculate single finger curl value (0 = straight, 1 = curled)
     */
    calculateFingerCurl(mcp, pip, dip, tip) {
        // Vector from MCP to PIP
        const v1 = { x: pip.x - mcp.x, y: pip.y - mcp.y, z: (pip.z || 0) - (mcp.z || 0) };
        // Vector from PIP to DIP
        const v2 = { x: dip.x - pip.x, y: dip.y - pip.y, z: (dip.z || 0) - (pip.z || 0) };
        // Vector from DIP to TIP
        const v3 = { x: tip.x - dip.x, y: tip.y - dip.y, z: (tip.z || 0) - (dip.z || 0) };

        // Calculate angles between vectors
        const angle1 = this.angleBetweenVectors(v1, v2);
        const angle2 = this.angleBetweenVectors(v2, v3);

        // Average angle normalized to 0-1 (180° = straight = 0, 0° = curled = 1)
        const avgAngle = (angle1 + angle2) / 2;
        const curl = 1 - (avgAngle / Math.PI);

        return Math.max(0, Math.min(1, curl));
    }

    /**
     * Calculate angle between two vectors in radians
     */
    angleBetweenVectors(v1, v2) {
        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        if (mag1 === 0 || mag2 === 0) return Math.PI;

        const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return Math.acos(cosAngle);
    }

    /**
     * Calculate hand openness using finger curls (more accurate than distance-based)
     */
    calculateHandOpenness(landmarks) {
        // Weight fingers differently (index and middle are most important for gestures)
        const weights = {
            index: 0.35,
            middle: 0.30,
            ring: 0.20,
            pinky: 0.15
        };

        // Calculate weighted average of finger extension (1 - curl)
        const openness =
            (1 - this.fingerCurls.index) * weights.index +
            (1 - this.fingerCurls.middle) * weights.middle +
            (1 - this.fingerCurls.ring) * weights.ring +
            (1 - this.fingerCurls.pinky) * weights.pinky;

        return Math.max(0, Math.min(1, openness));
    }

    /**
     * Calculate pinch value (thumb to index finger distance)
     */
    calculatePinchValue(landmarks) {
        const L = this.LANDMARKS;
        const thumbTip = landmarks[L.THUMB_TIP];
        const indexTip = landmarks[L.INDEX_TIP];

        // Distance between thumb and index tips
        const distance = this.distance3D(thumbTip, indexTip);

        // Reference distance (index MCP to wrist for normalization)
        const refDist = this.distance3D(landmarks[L.INDEX_MCP], landmarks[L.WRIST]);

        // Normalize
        const normalizedDist = distance / refDist;

        // Map to pinch value (closer = higher pinch value)
        // Typical range: 0.1 (touching) to 0.8 (far apart)
        const pinch = 1 - Math.max(0, Math.min(1, (normalizedDist - 0.1) / 0.7));

        return pinch;
    }

    /**
     * Calculate hand rotation (roll angle)
     */
    calculateHandRotation(landmarks) {
        const L = this.LANDMARKS;

        // Use index MCP to pinky MCP as reference line
        const indexMcp = landmarks[L.INDEX_MCP];
        const pinkyMcp = landmarks[L.PINKY_MCP];

        // Calculate angle from horizontal
        const dx = pinkyMcp.x - indexMcp.x;
        const dy = pinkyMcp.y - indexMcp.y;

        this.handRotation = Math.atan2(dy, dx);
    }

    /**
     * Update velocity tracking
     */
    updateVelocity(landmarks) {
        const L = this.LANDMARKS;

        // Track palm center velocity
        const palmCenter = {
            x: (landmarks[L.INDEX_MCP].x + landmarks[L.MIDDLE_MCP].x +
                landmarks[L.RING_MCP].x + landmarks[L.PINKY_MCP].x) / 4,
            y: (landmarks[L.INDEX_MCP].y + landmarks[L.MIDDLE_MCP].y +
                landmarks[L.RING_MCP].y + landmarks[L.PINKY_MCP].y) / 4,
            z: (landmarks[L.INDEX_MCP].z + landmarks[L.MIDDLE_MCP].z +
                landmarks[L.RING_MCP].z + landmarks[L.PINKY_MCP].z) / 4
        };

        this.palmVelocityTracker.update(palmCenter);
        this.velocity = this.palmVelocityTracker.getVelocity();
    }

    /**
     * Detect special gestures (thumbs up, peace sign, fist)
     */
    detectSpecialGestures() {
        const curls = this.fingerCurls;
        const prevGesture = this.currentGesture;

        // Thumbs up: thumb extended, all other fingers curled
        const isThumbsUp = curls.thumb < 0.4 &&
                           curls.index > 0.7 &&
                           curls.middle > 0.7 &&
                           curls.ring > 0.7 &&
                           curls.pinky > 0.7;

        // Peace sign: index and middle extended, others curled
        const isPeace = curls.thumb > 0.5 &&
                        curls.index < 0.3 &&
                        curls.middle < 0.3 &&
                        curls.ring > 0.6 &&
                        curls.pinky > 0.6;

        // Fist: all fingers curled
        const isFist = curls.thumb > 0.5 &&
                       curls.index > 0.7 &&
                       curls.middle > 0.7 &&
                       curls.ring > 0.7 &&
                       curls.pinky > 0.7;

        // Open hand: all fingers extended
        const isOpen = curls.index < 0.3 &&
                       curls.middle < 0.3 &&
                       curls.ring < 0.4 &&
                       curls.pinky < 0.4;

        // Determine current gesture with confidence
        if (this.isPinching) {
            this.currentGesture = 'pinch';
            this.gestureConfidence = this.pinchValue;
        } else if (isThumbsUp) {
            this.currentGesture = 'thumbsUp';
            this.gestureConfidence = 0.9;
        } else if (isPeace) {
            this.currentGesture = 'peace';
            this.gestureConfidence = 0.9;
        } else if (isFist) {
            this.currentGesture = 'fist';
            this.gestureConfidence = 0.9;
        } else if (isOpen) {
            this.currentGesture = 'open';
            this.gestureConfidence = 0.8;
        } else {
            this.currentGesture = 'none';
            this.gestureConfidence = 0;
        }

        // Trigger callback if gesture changed
        if (this.currentGesture !== prevGesture && this.currentGesture !== 'none') {
            if (this.onSpecialGesture) {
                this.onSpecialGesture(this.currentGesture, this.gestureConfidence);
            }
        }
    }

    /**
     * Get all gesture data as an object
     */
    getGestureData() {
        return {
            openness: this.gestureValue,
            pinch: this.pinchValue,
            isPinching: this.isPinching,
            fingerCurls: { ...this.fingerCurls },
            rotation: this.handRotation,
            velocity: { ...this.velocity },
            isHandDetected: this.isHandDetected,
            landmarks: this.landmarks,
            // Two-hand data
            twoHandsDetected: this.twoHandsDetected,
            handDistance: this.handDistance,
            handSpread: this.handSpread,
            twoHandRotation: this.twoHandRotation,
            // Special gesture data
            gesture: this.currentGesture,
            gestureConfidence: this.gestureConfidence
        };
    }

    /**
     * Calculate 3D distance between two points
     */
    distance3D(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Reset all filters (call when hand is lost)
     */
    resetFilters() {
        this.opennessFilter.reset();
        this.pinchFilter.reset();
        this.palmVelocityTracker.reset();
        this.velocity = { x: 0, y: 0, z: 0, magnitude: 0 };
    }

    /**
     * Draw hand landmarks with enhanced visualization
     * @param {Array} landmarks - Hand landmarks
     * @param {number} handIndex - 0 for first hand, 1 for second hand
     */
    drawHand(landmarks, handIndex = 0) {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        // Different colors for each hand
        const baseHue = handIndex === 0 ? 190 : 280; // Cyan for first, purple for second
        const hue = this.isPinching && handIndex === 0 ? 320 : baseHue; // Pink when pinching
        this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.7)`;
        this.ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x * this.canvas.width, p1.y * this.canvas.height);
            this.ctx.lineTo(p2.x * this.canvas.width, p2.y * this.canvas.height);
            this.ctx.stroke();
        });

        // Draw landmarks
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;

            const isTip = [4, 8, 12, 16, 20].includes(index);
            const radius = isTip ? 6 : 4;

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);

            // Color tips based on curl state
            if (isTip) {
                const fingerIndex = Math.floor((index - 4) / 4);
                const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
                const curl = this.fingerCurls[fingerNames[fingerIndex]] || 0;
                const brightness = 100 - curl * 50; // Darker when curled
                this.ctx.fillStyle = `hsl(${hue}, 100%, ${brightness}%)`;
            } else {
                this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            }

            this.ctx.fill();
        });

        // Draw pinch indicator line when pinching
        if (this.pinchValue > 0.3) {
            const thumbTip = landmarks[this.LANDMARKS.THUMB_TIP];
            const indexTip = landmarks[this.LANDMARKS.INDEX_TIP];

            this.ctx.beginPath();
            this.ctx.moveTo(thumbTip.x * this.canvas.width, thumbTip.y * this.canvas.height);
            this.ctx.lineTo(indexTip.x * this.canvas.width, indexTip.y * this.canvas.height);
            this.ctx.strokeStyle = `rgba(255, 0, 150, ${this.pinchValue})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    getGestureValue() {
        return this.gestureValue;
    }

    getPinchValue() {
        return this.pinchValue;
    }

    hasHand() {
        return this.isHandDetected;
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }
}
