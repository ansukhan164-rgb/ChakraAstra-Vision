import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const isBrowser = typeof window !== "undefined";

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r, g, b };
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loading');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 1000);
    }, 1500);
});

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050101, 0.015);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 55;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.45, 0.85);
composer.addPass(bloomPass);

const COUNT = 25000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);
const targetPositions = new Float32Array(COUNT * 3);
const targetColors = new Float32Array(COUNT * 3);
const targetSizes = new Float32Array(COUNT);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

const descriptors = {
    neutral: "A peaceful rest state. Swirling red and black ash circles Itachi's stance quietly.",
    tiger: "Katon: Gōkākyū no Jutsu! A massive rotating stream of blazing fireballs surges outwards.",
    onehanded: "Tsukuyomi Illusion! Crimson geometric concentric rings project deep hypnotic space-time ripples.",
    genjutsu: "Genjutsu Awakened! Show five fingers to unleash a crimson illusion seal.",
    akatsuki: "Mangekyō Awakened! Show ten fingers to reveal the classic pinwheel eye.",
    techno: "Techno Hacker Pulse! Neon data streams cycle through every color like a futuristic cyber-core."
};

function getFireball(i) {
    const theta = Math.random() * Math.PI * 2;
    const progress = Math.random();
    const radius = (progress * 18.0) + (Math.random() - 0.5) * 4;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = (progress - 0.5) * 45 + (Math.random() - 0.5) * 4;
    return { x, y, z, r: 1.0, g: 0.15 + (Math.random() * 0.55 * (1.0 - progress)), b: 0.0, s: 1.8 * (1.2 - progress) };
}

function getTsukuyomi(i) {
    if (i < COUNT * 0.4) {
        const ringIndex = i % 4;
        const radius = 9 + ringIndex * 8;
        const theta = Math.random() * Math.PI * 2;
        const deviation = (Math.random() - 0.5) * 0.8;
        return { x: (radius + deviation) * Math.cos(theta), y: (radius + deviation) * Math.sin(theta), z: (Math.random() - 0.5) * 1.5, r: 0.95, g: 0.05, b: 0.08, s: 2.2 };
    }
    const r = 24 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi) * 0.2, r: 0.15, g: 0.02, b: 0.05, s: 0.8 };
}

function getGenjutsuSeal(i) {
    const R_star = 13.5;
    const V_star = [];
    for (let k = 0; k < 5; k++) {
        const angle = k * 2 * Math.PI / 5 - Math.PI / 2;
        V_star.push({ x: R_star * Math.cos(angle), y: R_star * Math.sin(angle) });
    }

    const kanjiSegments = [
        { x1: -3.5, y1: 4.5, x2: -1.2, y2: 2.2 },
        { x1: -2.2, y1: 2.2, x2: -2.2, y2: -5.0 },
        { x1: -2.2, y1: -5.0, x2: -0.8, y2: -4.2 },
        { x1: -0.8, y1: 3.0, x2: 2.5, y2: 3.0 },
        { x1: 2.5, y1: 3.0, x2: 2.5, y2: -1.2 },
        { x1: 2.5, y1: -1.2, x2: 0.0, y2: -1.2 },
        { x1: 0.8, y1: 4.0, x2: 3.5, y2: 1.8 },
        { x1: 3.5, y1: 1.8, x2: 3.5, y2: -5.0 },
        { x1: 3.5, y1: -5.0, x2: 5.0, y2: -3.8 }
    ];

    let x = 0, y = 0, z = 0, r = 1.0, g = 0.0, b = 0.0, s = 1.2;
    if (i < COUNT * 0.35) {
        const seg = kanjiSegments[i % kanjiSegments.length];
        const t = Math.random();
        x = seg.x1 + (seg.x2 - seg.x1) * t + (Math.random() - 0.5) * 0.5;
        y = seg.y1 + (seg.y2 - seg.y1) * t + (Math.random() - 0.5) * 0.5;
        z = (Math.random() - 0.5) * 0.5;
        r = 1.0; g = 0.0; b = 0.4 + Math.random() * 0.5; s = 2.0;
    } else if (i < COUNT * 0.65) {
        const starLine = i % 5;
        const t = Math.random();
        let p1, p2;
        if (starLine === 0) { p1 = V_star[0]; p2 = V_star[2]; }
        else if (starLine === 1) { p1 = V_star[2]; p2 = V_star[4]; }
        else if (starLine === 2) { p1 = V_star[4]; p2 = V_star[1]; }
        else if (starLine === 3) { p1 = V_star[1]; p2 = V_star[3]; }
        else { p1 = V_star[3]; p2 = V_star[0]; }
        x = p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * 0.4;
        y = p1.y + (p2.y - p1.y) * t + (Math.random() - 0.5) * 0.4;
        z = (Math.random() - 0.5) * 0.5;
        r = 1.0; g = 0.2 + Math.random() * 0.4; b = 0.0; s = 1.6;
    } else if (i < COUNT * 0.90) {
        const ringIndex = i % 2;
        const radius = ringIndex === 0 ? 17.5 : 22.0;
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.cos(theta) + (Math.random() - 0.5) * 0.3;
        y = radius * Math.sin(theta) + (Math.random() - 0.5) * 0.3;
        z = (Math.random() - 0.5) * 0.5;
        r = 0.4 + Math.random() * 0.3;
        g = 0.0;
        b = 1.0;
        s = 1.4;
    } else {
        const rayIndex = i % 8;
        const angle = rayIndex * Math.PI / 4;
        const distance = 5.0 + Math.random() * 23.0;
        x = distance * Math.cos(angle) + (Math.random() - 0.5) * 0.6;
        y = distance * Math.sin(angle) + (Math.random() - 0.5) * 0.6;
        z = (Math.random() - 0.5) * 1.5;
        r = 1.0; g = 0.7 + Math.random() * 0.3; b = 1.0; s = 1.8;
    }
    return { x, y, z, r, g, b, s };
}

function getMangekyo(i) {
    const segment = i / COUNT;
    if (segment < 0.22) {
        const radius = Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        return { x: radius * Math.cos(theta), y: radius * Math.sin(theta), z: 0, r: 0.05, g: 0.0, b: 0.0, s: 1.6 };
    } else if (segment < 0.68) {
        const blade = i % 3;
        const baseAngle = blade * (Math.PI * 2 / 3);
        const t = Math.random();
        const theta = baseAngle + (t * 1.6);
        const radius = 3.5 + (t * 15.5);
        return { x: radius * Math.cos(theta), y: radius * Math.sin(theta), z: (Math.random() - 0.5) * 1.5, r: 0.9, g: 0.0, b: 0.08, s: 2.3 };
    }
    const theta = Math.random() * Math.PI * 2;
    const radius = 21 + (Math.random() - 0.5) * 1.2;
    return { x: radius * Math.cos(theta), y: radius * Math.sin(theta), z: 0, r: 0.85, g: 0.0, b: 0.0, s: 1.5 };
}

function getNeutral(i) {
    if (i < COUNT * 0.12) {
        const r = 12 + Math.random() * 18;
        const t = Math.random() * 6.28;
        const ph = Math.random() * 3.14;
        return { x: r * Math.sin(ph) * Math.cos(t), y: r * Math.sin(ph) * Math.sin(t), z: r * Math.cos(ph), r: 0.8, g: 0.08, b: 0.1, s: 1.2 };
    }
    const r = 25 + Math.random() * 20;
    const t = Math.random() * 6.28;
    return { x: r * Math.cos(t), y: (Math.random() - 0.5) * 15, z: r * Math.sin(t), r: 0.08, g: 0.02, b: 0.02, s: 0.6 };
}

function getTechno(i, elapsedTime = 0) {
    const ring = i % 3;
    const t = i / COUNT;
    const angle = t * Math.PI * 14 + elapsedTime * 0.7;
    const radius = 8 + ring * 6 + Math.sin(elapsedTime * 1.4 + t * 18) * 1.5;
    const x = radius * Math.cos(angle);
    const y = (t * 55 - 27.5) + Math.sin(elapsedTime * 1.5 + t * 22) * 2.2;
    const z = radius * Math.sin(angle);
    const hue = (elapsedTime * 0.10 + t * 1.8) % 1;
    const rgb = hslToRgb(hue, 1.0, 0.58);
    return { x, y, z, r: rgb.r, g: rgb.g, b: rgb.b, s: 1.4 + ring * 0.15 };
}

for (let i = 0; i < COUNT; i++) {
    const p = getNeutral(i);
    positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
    colors[i * 3] = p.r; colors[i * 3 + 1] = p.g; colors[i * 3 + 2] = p.b;
    sizes[i] = p.s;
    targetPositions[i * 3] = p.x; targetPositions[i * 3 + 1] = p.y; targetPositions[i * 3 + 2] = p.z;
    targetColors[i * 3] = p.r; targetColors[i * 3 + 1] = p.g; targetColors[i * 3 + 2] = p.b;
    targetSizes[i] = p.s;
}

let currentTech = 'neutral';
let shakeIntensity = 0;
let transitionSpeed = 0.1;
const videoElement = document.querySelector('.input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
let glowColor = '#ff2222';
let lastInteractionSource = 'camera';

function setButtonActive(tech) {
    document.querySelectorAll('.gesture-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${tech}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function updateState(tech) {
    if (currentTech === tech) return;
    currentTech = tech;

    const overlay = document.getElementById('eye-overlay');
    overlay.classList.remove('laser-flash');
    void overlay.offsetWidth;
    overlay.classList.add('laser-flash');

    const nameEl = document.getElementById('technique-name');
    const descEl = document.getElementById('jutsu-desc');

    shakeIntensity = tech !== 'neutral' ? 0.3 : 0;
    descEl.innerText = descriptors[tech] || "";
    setButtonActive(tech);

    nameEl.classList.remove('techno-ui');

    if (tech === 'tiger') {
        glowColor = '#ff5500';
        nameEl.innerText = "Fire Style: Fire Ball Jutsu";
        nameEl.style.color = '#ff6600';
        bloomPass.strength = 3.0;
        transitionSpeed = 0.08;
    } else if (tech === 'onehanded') {
        glowColor = '#ff0033';
        nameEl.innerText = "Kekkei Genkai: Tsukuyomi";
        nameEl.style.color = '#ff0055';
        bloomPass.strength = 2.4;
        transitionSpeed = 0.12;
    } else if (tech === 'genjutsu') {
        glowColor = '#ff00aa';
        nameEl.innerText = "Illusion: Genjutsu Seal";
        nameEl.style.color = '#ff00aa';
        bloomPass.strength = 3.2;
        transitionSpeed = 0.09;
    } else if (tech === 'akatsuki') {
        glowColor = '#ff0000';
        nameEl.innerText = "Mangekyō Sharingan Activated";
        nameEl.style.color = '#ff1111';
        bloomPass.strength = 3.5;
        transitionSpeed = 0.06;
    } else if (tech === 'techno') {
        glowColor = '#00ffcc';
        nameEl.innerText = "Cyber Nexus: Techno Hacker Pulse";
        nameEl.style.color = '#00ffd5';
        nameEl.classList.add('techno-ui');
        bloomPass.strength = 4.2;
        transitionSpeed = 0.11;
    } else {
        glowColor = '#ff2222';
        nameEl.innerText = "Chakra Neutral State";
        nameEl.style.color = '#ff2222';
        bloomPass.strength = 1.2;
        transitionSpeed = 0.1;
    }

    for (let i = 0; i < COUNT; i++) {
        let p;
        if (tech === 'neutral') p = getNeutral(i);
        else if (tech === 'tiger') p = getFireball(i);
        else if (tech === 'onehanded') p = getTsukuyomi(i);
        else if (tech === 'genjutsu') p = getGenjutsuSeal(i);
        else if (tech === 'akatsuki') p = getMangekyo(i);
        else if (tech === 'techno') p = getTechno(i, 0);
        targetPositions[i * 3] = p.x; targetPositions[i * 3 + 1] = p.y; targetPositions[i * 3 + 2] = p.z;
        targetColors[i * 3] = p.r; targetColors[i * 3 + 1] = p.g; targetColors[i * 3 + 2] = p.b;
        targetSizes[i] = p.s;
    }
}

window.triggerManualState = function(state) {
    lastInteractionSource = 'manual';
    updateState(state);
};

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.72
});

hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    let detected = 'neutral';

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const numHands = results.multiHandLandmarks.length;
        const hand1 = results.multiHandLandmarks[0];
        const isUp = (lm, tip, pip) => lm[tip].y < lm[pip].y;

        const indexUp = isUp(hand1, 8, 6);
        const middleUp = isUp(hand1, 12, 10);
        const ringUp = isUp(hand1, 16, 14);
        const pinkyUp = isUp(hand1, 20, 18);
        const thumbUp = hand1[4].x < hand1[3].x ? hand1[4].x < hand1[2].x : hand1[4].x > hand1[2].x;
        const allFiveUp = indexUp && middleUp && ringUp && pinkyUp && thumbUp;
        const pinchDist = Math.hypot(hand1[8].x - hand1[4].x, hand1[8].y - hand1[4].y);

        if (numHands === 2) {
            const hand2 = results.multiHandLandmarks[1];
            const centerDist = Math.hypot(hand1[9].x - hand2[9].x, hand1[9].y - hand2[9].y);
            const hand2IndexUp = isUp(hand2, 8, 6);
            const hand2MiddleUp = isUp(hand2, 12, 10);
            const hand2RingUp = isUp(hand2, 16, 14);
            const hand2PinkyUp = isUp(hand2, 20, 18);
            const hand2ThumbUp = hand2[4].x < hand2[3].x ? hand2[4].x < hand2[2].x : hand2[4].x > hand2[2].x;
            const hand2AllFiveUp = hand2IndexUp && hand2MiddleUp && hand2RingUp && hand2PinkyUp && hand2ThumbUp;

            if (hand1.length && hand2.length && allFiveUp && hand2AllFiveUp) {
                detected = 'akatsuki';
            } else if (centerDist < 0.45 && isUp(hand1, 8, 5) && isUp(hand2, 8, 5)) {
                detected = 'tiger';
            }
        }

        if (detected === 'neutral' && numHands === 1) {
            if (allFiveUp) {
                detected = 'genjutsu';
            } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
                detected = 'onehanded';
            } else if (pinchDist < 0.042) {
                detected = 'akatsuki';
            }
        }

        results.multiHandLandmarks.forEach((lm) => {
            drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, { color: glowColor, lineWidth: 4 });
            drawLandmarks(canvasCtx, lm, { color: '#ffffff', lineWidth: 1.5, radius: 2.5 });
        });

        lastInteractionSource = 'camera';
        updateState(detected);
    } else {
        if (lastInteractionSource === 'camera') updateState('neutral');
    }
});

let cameraUtils;
try {
    cameraUtils = new Camera(videoElement, {
        onFrame: async () => {
            canvasElement.width = videoElement.videoWidth || 640;
            canvasElement.height = videoElement.videoHeight || 480;
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    cameraUtils.start();
} catch (err) {
    console.log("Webcam unavailable, manual interface remains active.", err);
    document.getElementById('video-container').style.borderColor = 'rgba(255,255,255,0.05)';
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (shakeIntensity > 0) {
        const rx = (Math.random() - 0.5) * shakeIntensity * 12;
        const ry = (Math.random() - 0.5) * shakeIntensity * 12;
        renderer.domElement.style.transform = `translate(${rx}px, ${ry}px)`;
    } else {
        renderer.domElement.style.transform = 'translate(0px, 0px)';
    }

    const pos = particles.geometry.attributes.position.array;
    const col = particles.geometry.attributes.color.array;
    const siz = particles.geometry.attributes.size.array;

    for (let i = 0; i < COUNT * 3; i++) {
        pos[i] += (targetPositions[i] - pos[i]) * transitionSpeed;
        col[i] += (targetColors[i] - col[i]) * transitionSpeed;
    }
    for (let i = 0; i < COUNT; i++) {
        siz[i] += (targetSizes[i] - siz[i]) * transitionSpeed;
    }

    if (currentTech === 'genjutsu') {
        const vib = 0.95;
        for (let i = 0; i < COUNT; i++) {
            pos[i * 3] += (Math.random() - 0.5) * vib;
            pos[i * 3 + 1] += (Math.random() - 0.5) * vib;
            pos[i * 3 + 2] += (Math.random() - 0.5) * vib * 0.5;
        }
    }

    if (currentTech === 'techno') {
        for (let i = 0; i < COUNT; i++) {
            const hue = (elapsedTime * 0.15 + i / COUNT) % 1;
            const rgb = hslToRgb(hue, 1.0, 0.58);
            col[i * 3] += (rgb.r - col[i * 3]) * 0.3;
            col[i * 3 + 1] += (rgb.g - col[i * 3 + 1]) * 0.3;
            col[i * 3 + 2] += (rgb.b - col[i * 3 + 2]) * 0.3;
        }
        particles.rotation.y += 0.02;
        particles.rotation.z = Math.sin(elapsedTime * 1.2) * 0.08;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;

    if (currentTech === 'tiger') {
        particles.rotation.y += 0.08;
        particles.rotation.z += 0.01;
    } else if (currentTech === 'onehanded') {
        particles.rotation.z -= 0.03;
        particles.rotation.y = Math.sin(elapsedTime * 0.5) * 0.15;
    } else if (currentTech === 'genjutsu') {
        particles.rotation.set(0, 0, 0);
        particles.rotation.z = elapsedTime * 0.8;
    } else if (currentTech === 'akatsuki') {
        particles.rotation.set(0, 0, 0);
        particles.rotation.z = -elapsedTime * 1.5;
    } else if (currentTech === 'techno') {
        // already animated above
    } else {
        particles.rotation.y += 0.003;
        particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.05;
    }

    composer.render();
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === '1') triggerManualState('tiger');
    if (key === '2') triggerManualState('onehanded');
    if (key === '3') triggerManualState('genjutsu');
    if (key === '4') triggerManualState('akatsuki');
    if (key === '5') triggerManualState('techno');
    if (key === '0') triggerManualState('neutral');
});
