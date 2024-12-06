import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("./particles/1.png");

/**
 * Test cube
 */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
//Particles
const particleGeometry = new THREE.BufferGeometry();
const count = 2000;
const positions = new Float32Array(count * 3);
const speeds = new Float32Array(count); // Store rotation speeds

// Initialize particles
for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 15;
  positions[i3 + 1] = (Math.random() - 0.5) * 15;
  positions[i3 + 2] = (Math.random() - 0.5) * 15;
  speeds[i] = Math.random() * 0.0002 + 0.0001; // Random speed for each particle
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
  alphaMap: particleTexture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  color: 0xffffff,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);
// scene.add(cube);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update particles
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const radius = Math.sqrt(
      positions[i3] * positions[i3] +
        positions[i3 + 1] * positions[i3 + 1] +
        positions[i3 + 2] * positions[i3 + 2]
    );

    const phi = Math.acos(positions[i3 + 1] / radius);
    const theta = Math.atan2(positions[i3 + 2], positions[i3]);

    // Rotate around center with individual speeds
    const angle = speeds[i];
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta + angle);
    positions[i3 + 1] = radius * Math.cos(phi);
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta + angle);
  }

  particleGeometry.attributes.position.needsUpdate = true;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Next frame
  window.requestAnimationFrame(tick);
};

tick();
