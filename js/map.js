import * as THREE from './three/build/three.module.js';
import {OrbitControls} from './three/examples/jsm/controls/OrbitControls.js';

// To keep ESLint happy
/* global THREE */

// Reference to container element that holds the entire scene
let container = document.querySelector('#scene-container');

let scene = new THREE.Scene();
// scene.background = new THREE.Color('skyblue');

// Create Camera
const fov = 35;
const aspectRatio = container.clientWidth / container.clientHeight;
const nearPlane = 0.1;
const farPlane = 10000;

let camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
camera.position.set(-1.5, 1.5, 3);

// Create Controls
// container param allows orbit only in the container, not the whole doc
let controls = new OrbitControls(camera, container);
controls.minDistance = 8;
controls.maxDistance = 50;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;

// TEST
const geometry = new THREE.BoxGeometry();
const material1 = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const material2 = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const material3 = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const material4 = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// Creating the initial test floor
const level2 = new THREE.Group();
level2.position.set(0.2, -0.5, 0);
// level2.rotateZ(-Math.PI/6);

const cube1 = new THREE.Mesh(geometry, material1);
const cg1 = new THREE.Group();
cg1.add(cube1);
level2.add(cg1);

const cube2 = new THREE.Mesh(geometry, material2);
const cg2 = new THREE.Group();
cg2.add(cube2);
level2.add(cg2);

const cube3 = new THREE.Mesh(geometry, material3);
const cg3 = new THREE.Group();
cg3.add(cube3);
level2.add(cg3);

const cube4 = new THREE.Mesh(geometry, material4);
const cg4 = new THREE.Group();
cg4.add(cube4);
level2.add(cg4);

cube1.position.set(-1.8, 0, 0);
cube2.position.set(-0.6, 0, 0);
cube3.position.set(0.6, 0, 0);
cube4.position.set(1.8, 0, 0);


// The line part of the labels

// line part again but as a cylinder
const stalkGeo = new THREE.CylinderGeometry(0.01, 0.01, 2, 3, 1); // top r, bot r, height, circle seg, height seg
const stalkMat = new THREE.MeshBasicMaterial( {color: 0xffffff} );
const stalk = new THREE.Mesh(stalkGeo, stalkMat)
stalk.position.set(-1.8, .5, 0)
cg1.add(stalk)

scene.add(level2);

// Adding lights
const alight = new THREE.AmbientLight( 0xffffff, .5); 
const dlight = new THREE.DirectionalLight(0xffffff, .5)
dlight.position.set(1, 0.25, 0)
scene.add( dlight )
scene.add( alight );

// raycaster
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// point test
/*
// particle cloud test
const pointcount = 100000;
let particles, pointCloud

let particlePositions = new Float32Array(3*pointcount)
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
*/

// Creating the renderer
let renderer = new THREE.WebGLRenderer({
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

function update() {
    controls.update();

    // Check if hovering a cube and turn it red
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [cube1, cube2, cube3, cube4]
    const intersects = raycaster.intersectObjects(objectsToTest)
    // console.log(intersects);

    // reset colors of objects
    for(const object of objectsToTest)
    {
        // if(!intersects.find(intersect => intersect.object === object))
        // {
            object.material.color.set('#ffffff')
            // if it has a stalk
            if(object.parent.children[1]) {
                object.parent.children[1].material.color.set('#ffffff')

                // scale to shrink and move it inside the cube
                gsap.to(object.parent.children[1].scale, {
                    duration: 0.5,
                    y: 0.01
                })
                gsap.to(object.parent.children[1].position, {
                    duration: 0.5,
                    y: 0.45
                })
            }
        // }
    }
    // if the raycast hits something
    if(intersects.length) {
        intersects[0].object.material.color.set('#ff0000');
    // for(const intersect of intersects)
    // {
    //     intersect.object.material.color.set('#ff0000')
    // }
        // make the cylinder tall
        console.log(intersects[0].object.parent.children[1])
        if(intersects[0].object.parent.children[1]) {
            intersects[0].object.parent.children[1].material.color.set('#ff0000')
            gsap.to(intersects[0].object.parent.children[1].scale, {
                duration: 0.5,
                y: 2
            })
            gsap.to(intersects[0].object.parent.children[1].position, {
                duration: 0.5,
                y: 1.75
            })
        }
    }
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

window.addEventListener('resize', onWindowResize);

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / window.innerWidth * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    // console.log(mouse)
})