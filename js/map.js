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
cube1.userData = {room: 210};
const cg1 = new THREE.Group();
cg1.add(cube1);
level2.add(cg1);

const cube2 = new THREE.Mesh(geometry, material2);
cube2.userData = {room: 211};
const cg2 = new THREE.Group();
cg2.add(cube2);
level2.add(cg2);

const cube3 = new THREE.Mesh(geometry, material3);
cube3.userData = {room: 212};
const cg3 = new THREE.Group();
cg3.add(cube3);
level2.add(cg3);

const cube4 = new THREE.Mesh(geometry, material4);
cube4.userData = {room: 213};
const cg4 = new THREE.Group();
cg4.add(cube4);
level2.add(cg4);

cube1.position.set(-1.8, 0, 0);
cube2.position.set(-0.6, 0, 0);
cube3.position.set(0.6, 0, 0);
cube4.position.set(1.8, 0, 0);

// Adding the text labels
const labels = [
    {
        position: new THREE.Vector3(-1.5, 2.1, 0),
        element: document.querySelector('.point-210'),
        room: 210
    },
    {
        position: new THREE.Vector3(-0.3, 2.1, 0),
        element: document.querySelector('.point-211'),
        room: 211
    },
    {
        position: new THREE.Vector3(0.9, 2.1, 0),
        element: document.querySelector('.point-212'),
        room: 212
    },
    {
        position: new THREE.Vector3(2.1, 2.1, 0),
        element: document.querySelector('.point-213'),
        room: 213
    }
]
const stalks = [
    {
        position: new THREE.Vector3(-1.6, 0, 0),
        element: document.querySelector('.bar-210'),
        room: 210
    },
    {
        position: new THREE.Vector3(-0.4, 0, 0),
        element: document.querySelector('.bar-211'),
        room: 211
    },
    {
        position: new THREE.Vector3(0.8, 0, 0),
        element: document.querySelector('.bar-212'),
        room: 212
    },
    {
        position: new THREE.Vector3(2.0, 0, 0),
        element: document.querySelector('.bar-213'),
        room: 213
    }
]

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

    // update position of labels
    for (const stalk of stalks) {
        const screenPosition = stalk.position.clone();
        screenPosition.project(camera);
        
        const translateX = screenPosition.x * window.innerWidth * 0.5;
        const translateY = - screenPosition.y * window.innerHeight * 0.5;
        const stalkHeight = parseInt(getComputedStyle(stalk.element).height)
        stalk.element.style.transform = `translateX(${translateX}px) translateY(${translateY - stalkHeight}px)`
        
        // set position of label
        const label = labels.find(d => d.room == stalk.room);
        if (label) {
            label.element.style.transform = `translateX(${translateX + 20}px) translateY(${translateY - stalkHeight}px)`
            // see if its tall enough to even draw
            if (stalkHeight > 200) {
                label.element.style.opacity = `${(stalkHeight - 200) / 100}`
            } else {
                label.element.style.opacity = "0"
            }
        }
    }

    // Check if hovering a cube and turn it red
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [cube1, cube2, cube3, cube4]
    const intersects = raycaster.intersectObjects(objectsToTest)
    // console.log(intersects);

    // if the raycast hits something
    if(intersects.length) {
        intersects[0].object.material.color.set('#ff0000');

        // make the cylinder tall
        const cubeStalk = stalks.find(d => d.room == intersects[0].object.userData.room);
        if (cubeStalk) {
            gsap.to(cubeStalk.element, {
                duration: 0.5,
                height: 300
            })
        }
    }
    // reset colors of objects
    for(const object of objectsToTest)
    {
        if (!intersects[0] || intersects[0].object !== object)
        {
            object.material.color.set('#ffffff')
            
            const cubeStalk = stalks.find(d => d.room == object.userData.room);
            if (cubeStalk) {
                gsap.to(cubeStalk.element, {
                    duration: 0.5,
                    height: 0
                })
            }
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