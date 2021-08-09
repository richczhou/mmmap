import * as THREE from './three/build/three.module.js';
import {OrbitControls} from './three/examples/jsm/controls/OrbitControls.js';

// To keep ESLint happy
/* global THREE */

let container;
let camera;
let renderer;
let scene;
let controls;
const pointcount = 1000000;
let particles, pointCloud
let particlePositions = new Float32Array(3*pointcount)

function init() {
    // Reference to container element that holds the entire scene
    container = document.querySelector('#scene-container');

    scene = new THREE.Scene();
    // scene.background = new THREE.Color('skyblue');

    // Create Camera
    const fov = 35;
    const aspectRatio = container.clientWidth / container.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 10000;

    camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    camera.position.set(0, 0, 0);

    // Create Controls
    // container param allows orbit only in the container, not the whole doc
    controls = new OrbitControls(camera, container);
    controls.minDistance = 1000;
    controls.maxDistance = 5000;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    // TEST
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    // point test
    for(let i = 0; i < 3*pointcount; i++) {
        particlePositions[i] = Math.random() * 600.0 - 300
    }
    const pointMaterial = new THREE.PointsMaterial( {
        color: 0xFFFFFF,
        size: 4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    } );

    particles = new THREE.BufferGeometry()
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage))
    pointCloud = new THREE.Points(particles, pointMaterial)
    scene.add(pointCloud)

    // Creating the renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Applying gamma correction for colors
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Appending WebGLRenderer's canvas element to HTML
    container.appendChild(renderer.domElement);

    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}

function update() {
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    // Resizing camera to new window frame
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // Resizing renderer's canvas to fit
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Scene setup
init();

window.addEventListener('resize', onWindowResize);