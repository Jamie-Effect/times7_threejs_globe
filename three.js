
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';



//https://threejs.org/docs/index.html#manual/en/introduction/Installation
//terminal run
//npx vite


// Set up the scene, camera, and renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);


//camera controls
const controls = new OrbitControls( camera, renderer.domElement );



camera.position.set(0,15,0);

controls.enablePan = false;
controls.minDistance = 12;
controls.maxDistance = 18;

controls.minAzimuthAngle = Math.PI*-0.75;
controls.maxAzimuthAngle = Math.PI*0.75;

controls.minPolarAngle = Math.PI*0.4;
controls.maxPolarAngle = Math.PI*0.6;

controls.dampingFactor = 1;
controls.enableDamping;

controls.update();


//raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

const loader = new THREE.TextureLoader();
//MATERIALS ------  ORBIT GLOBE--------
    const orbitGlobeRadius = 0.2; // Radius of the smaller orbiting globes
    //const orbitGlobeMaterial = new THREE.MeshBasicMaterial({ color: 0xdd8800, transparent: true, opacity: 0.4, side: THREE.DoubleSide  });
    const orbitGlobeMaterial = new THREE.MeshLambertMaterial({ color: 0xcc4400, side: THREE.DoubleSide  });


//MATERIALS ------  Map glbe  --------
const mapLocationMaterial = new THREE.MeshLambertMaterial({ color: 0x000ff, side: THREE.DoubleSide  });




//MATERIALS ------  CIRCLES--------
    const circleMaterial = new THREE.MeshLambertMaterial({ color: 0xdd8800, transparent: true, opacity: 0.7, side: THREE.DoubleSide  });

    //const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xdd8800, transparent: true, opacity: 0.2, side: THREE.DoubleSide });

//MATERIALS ------ CIRCLES--------

/*
  // const globeMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xdd8800, 
  wireframe: true,
});
*/
  
  
    const globeMaterial = new THREE.MeshStandardMaterial({ 
    map: loader.load("../assets/textures/earthmap1k.jpg"),
   // bumpMap: loader.load("../assets/textures/earthbump1k.jpg"),
   // bumpScale: 4,
   // fog: true,
    //roughness: 0.8,
    // emissiveMap: loader.load("../assets/textures/earthspec1k.jpg"),
    //emissive:0xdd8800,
    alphaMap: loader.load("../assets/textures/earthspec1k.jpg"),
   //wireframe: true,
   //wireframeLineWidth: 1,
    });


//----------------------   OBJECTS   -------------------- 

//Lights
const pl = new THREE.PointLight(0xffffff, 3000);
pl.position.set(15, 15, 0);
scene.add( pl );

//Lights
//const pl1 = new THREE.PointLight(0xffffff, 1100);
//pl1.position.set(0, 0, -10);
//scene.add( pl1 );

//ambient lighting
const al1 = new THREE.AmbientLight(0xffffff, 0.3);

scene.add( al1 )


// Create the earth sphere
const globeRadius = 5;
const globeGeometry = new THREE.SphereGeometry(globeRadius, 32, 32);
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);


//Points on sphere

const locationGeo = new THREE.SphereGeometry(1, 8, 8);
const mapLocation = new THREE.Mesh(locationGeo, mapLocationMaterial);
scene.add(mapLocation);


//Create group with globe and sphere
var globeWithLocations = new THREE.Group();
scene.add( globeWithLocations );
globeWithLocations.add(globe);
globeWithLocations.add(mapLocation);


const globeUV = globeGeometry.attributes.uv;
console.log(globeUV);

/*
let globeLat = globeUV.v
let globeY = 

mapLocation.position = 
*/

//Rotating objects

const globes = [];
for(let i=0; i<8; i++){
    
//create pivot point
      var pivot = new THREE.Group();
      scene.add( pivot );

 // Create the orbiting globe
    const orbitGlobeGeometry = new THREE.SphereGeometry(orbitGlobeRadius, 16, 16);
    const orbitGlobe1 = new THREE.Mesh(orbitGlobeGeometry, orbitGlobeMaterial);
    orbitGlobe1.position.set(0, 0, 0);
    scene.add(orbitGlobe1);


// Create the circle
    const circleRadius = 7+(i*0.5);
    const circleGeometry = new THREE.RingGeometry(circleRadius, circleRadius + 0.03, 64);
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);

    const randomRotate = Math.random (0.3,1);

    //2 rotates crazy 1 rotates in line
    circle.rotation.x = Math.PI / 1*randomRotate; // Rotate circle to lie flat in the XY plane
    scene.add(circle);


//Add mesh to pivot group and offset position
pivot.add( orbitGlobe1 );
orbitGlobe1.position.set( 7+i,0, 0 ); 

//Add mesh to pivot group and offset position
pivot.add( circle );
circle.position.set(0,0, 0 ); 

circle.attach(orbitGlobe1);

pivot.position.set(0,0,0);


   globes.push({
        pivot: pivot,
      
    });

}

//create a central group and all items so they spin togetrher
var centralPivot = new THREE.Group();
scene.add( centralPivot );

globes.forEach((item) => {
        centralPivot.add(item.pivot)
}
)
    
   
centralPivot.add(globe);



const sceneGlobe = scene.children[2].children[8];




//----------------------   RENDER LOOP   -------------------- 


// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the 'earth'
  globe.rotation.y += -0.004

  const baseSpeed = 0.003;
  const orbitSpeed = 0.02;

  //rrotate all
  centralPivot.rotation.y += 0.003;

  
  const rotate = (globeNum, circRotate, orbitRotate) =>{
      globes[globeNum].pivot.rotation.z += baseSpeed * circRotate;
      globes[globeNum].pivot.children[0].rotation.z += orbitSpeed * orbitRotate;
    }

    //indvidual rotation speeds for each element in the arrary of globes
  rotate(0,2,2);
  rotate(1,2,2);
  rotate(2,1,4);
  rotate(3,0.8,2);
  rotate(4,3,2);
  rotate(5,0.4,2);
  rotate(6,1.1,3);
  rotate(7,1.5,3);

          
       
/*
        globes[0].pivot.rotation.z += baseSpeed * 2;
        globes[0].pivot.children[0].rotation.z += baseSpeed * 2;

*/




//------------RAYCASTER--------
// update the picking ray with the camera and pointer position
raycaster.setFromCamera( pointer, camera );


// calculate objects intersecting the picking ray

const intersects = raycaster.intersectObjects( scene.children );


for ( let i = 0; i < intersects.length; i ++ ) {


  intersects[ i ].object.material.color.set( 0xff0000 );

}

        
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}



animate();



// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});