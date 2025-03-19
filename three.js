
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";



//https://threejs.org/docs/index.html#manual/en/introduction/Installation
//terminal run
//npx vite


// Set up the scene, camera, and renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);


//camera controls
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set(10,0,0);

controls.enablePan = false;
controls.enableZoom = false;

controls.minDistance = 11;
controls.maxDistance = 14;

//controls.minAzimuthAngle = Math.PI*-1;
//controls.maxAzimuthAngle = Math.PI*1;

//controls.minPolarAngle = Math.PI*-0.01;
controls.maxPolarAngle = Math.PI*2;
controls.enableDamping;

controls.dampingFactor = 45;




//raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


function onPointerMove( event ) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


}


//COLOR VARIABLES -------------
const grey_1 = new THREE.Color( 0x16151E );
//const grey_2 = new THREE.Color( 0x686677 );
const grey_3 = new THREE.Color( 0x55545E );
const grey_4 = new THREE.Color( 0x7A7887 );
//const gray_5 = new THREE.Color( 0x595959 );

const orange_1 = new THREE.Color( 0xCC4400 );
const orange_2 = new THREE.Color( 0xDD8800 );

const fog = new THREE.Color( 0x262437 );



//MATERIAL -----BACKGROUND ----
scene.background = grey_1;
scene.fog = new THREE.Fog(fog, 3, 12);
//scene.fog = new THREE.FogExp2( fog, 0.12 );

const loader = new THREE.TextureLoader();
//MATERIALS ------  ORBIT GLOBE--------
    //const orbitGlobeMaterial = new THREE.MeshBasicMaterial({ color: orange_2, transparent: true, opacity: 0.4, side: THREE.DoubleSide  });
    const orbitGlobeMaterial = new THREE.MeshLambertMaterial({ color: orange_1, side: THREE.DoubleSide  });


//MATERIALS ------  Map glbe  --------
const mapLocationMaterial = new THREE.MeshLambertMaterial({ color: orange_1, side: THREE.DoubleSide  });

const mapLocationInteractionMaterial = new THREE.MeshStandardMaterial({ 
  emissive: orange_1, 
  emissiveIntensity: 8,
  color: orange_1, 
  transparent: true,  
  opacity:0.1,
side: THREE.DoubleSide  
});



//MATERIALS ------  CIRCLES--------
    const circleMaterial = new THREE.MeshLambertMaterial({ color: orange_2, transparent: true, opacity: 0.7, side: THREE.DoubleSide  });

    //const circleMaterial = new THREE.MeshBasicMaterial({ color: orange_2, transparent: true, opacity: 0.2, side: THREE.DoubleSide });

//MATERIALS ------ CIRCLES--------

/*
  // const globeMaterial = new THREE.MeshBasicMaterial({ 
  color: orange_2, 
  wireframe: true,
});
*/
  
  
    const globeMaterial = new THREE.MeshStandardMaterial({ 
      //map: loader.load("../assets/textures/earthmap1k.jpg"),
     bumpMap: loader.load("../assets/textures/earthbump1k.jpg"),
     bumpScale: 10,
     fog: true,
      //roughness: 0.8,
      // emissiveMap: loader.load("../assets/textures/earthspec1k.jpg"),
      //emissive:orange_2,
      alphaMap: loader.load("../assets/textures/earthalpha1k.jpg"),
      transparent: true,
    //opacity: 0.9,
    side:THREE.DoubleSide,
    color:  grey_3,

    });

    //this material is used to create a wireframe sphere
    const globeMaterial2 = new THREE.MeshStandardMaterial({ 
      //map: loader.load("../assets/textures/earthmap1k.jpg"),
    color:  grey_4,
    wireframe: true,
    wireframeLineWidth: 0.01,
    transparent: true,
    opacity: 0.4,
    side:THREE.DoubleSide,
    });

//----------------------   OBJECTS: LIGHTS  -------------------- 

//Lights
const pl = new THREE.PointLight(0xffffff, 900);
pl.position.set(15, 6, 0);
scene.add( pl );

//Lights
const pl1 = new THREE.PointLight(0xffffff, 200);
pl1.position.set(-15, 6, 0);
scene.add( pl1 );

//ambient lighting
const al1 = new THREE.AmbientLight(0xffffff, 2);
scene.add( al1 )


//----------------------   OBJECTS: MESHES  --------------------

// Create the earth spheres. One sphere is for wireframe, other is for earth maps
const globeRadius = 5;
const globeRadius2 = 5.1;

const globeGeometry = new THREE.SphereGeometry(globeRadius, 32, 32);
const globeGeometry2 = new THREE.SphereGeometry(globeRadius2, 24, 16);

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
const globe_2_wireframe = new THREE.Mesh(globeGeometry2, globeMaterial2);

scene.add(globe);
scene.add(globe_2_wireframe);



//Create spheres for partner locations 
const locationGeo = new THREE.SphereGeometry(0.1, 8, 8);
const locationGeoInteraction = new THREE.SphereGeometry(0.3, 8, 8);


const partners = [];

const partnerLatLong = (partnerNum,lat,long) =>{
  // Position the smaller sphere on the surface of the main one
  const latRad = lat * (Math.PI / 180);
  const longRad = long * (Math.PI / 180);

  // Calculate position (spherical to cartesian coordinates)
  const x = globeRadius * Math.cos(latRad) * Math.cos(longRad);
  const y = globeRadius * Math.sin(latRad);
  const z = globeRadius * Math.cos(latRad) * Math.sin(longRad);

  partners[partnerNum].position.set(x,y,z);
}  


//create all the partners and add to an array
for(let i=0; i<=6; i++){
  const partnerLocation = new THREE.Mesh(locationGeo, mapLocationMaterial);
  const partnerLocationInteraction = new THREE.Mesh(locationGeoInteraction, mapLocationInteractionMaterial);

  scene.add(partnerLocation);
  scene.add(partnerLocationInteraction);
  
  var locationGroup = new THREE.Group();
  scene.add( locationGroup);
  locationGroup.add(partnerLocation);
  locationGroup.add(partnerLocationInteraction);


  //add partnerlocation to partners array
  partners.push(locationGroup);
}

//add a unique location for each partner
partnerLatLong(0,-41, 180);
partnerLatLong(1,-30,-150);
partnerLatLong(2,30,80);
partnerLatLong(3,45,-130);
partnerLatLong(4,52,5);
partnerLatLong(5,10,0);


//Create a group containing earth and partner locations so they can all rotate together
var globeWithLocations = new THREE.Group();
scene.add( globeWithLocations);

globeWithLocations.add(globe);
globeWithLocations.add(globe_2_wireframe);
partners.forEach((partner) =>  globeWithLocations.add(partner));




//ORBIT GLOBES ------Create the rotating objects around the earth
const globes = [];
for(let i=0; i<8; i++){
    
//create pivot point for circle and orbit globe to rotate together
      var pivot = new THREE.Group();
      scene.add( pivot );

 //Create the orbiting globes
  const orbitGlobeRadius = 0.1; // Radius of the smaller orbiting globes

    const orbitGlobeGeometry = new THREE.SphereGeometry(orbitGlobeRadius, 8, 8);
    const orbitGlobe1 = new THREE.Mesh(orbitGlobeGeometry, orbitGlobeMaterial);
    orbitGlobe1.position.set(0, 0, 0);
    scene.add(orbitGlobe1);

//base radius for orbiting
const baseOrbitRadius = 5+(i*0.35)   

// Create the circle
    
    const circleGeometry = new THREE.RingGeometry(baseOrbitRadius, baseOrbitRadius + 0.03, 64);
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);

    const randomRotate = Math.random (0.5,3);

    //2 rotates crazy, 1 rotates in line
    circle.rotation.x = Math.PI / randomRotate *1.25; // Rotate circle to lie flat in the XY plane
    scene.add(circle);


//Add mesh to pivot group and offset position
pivot.add( orbitGlobe1 );
orbitGlobe1.position.set( baseOrbitRadius,0, 0 ); 
//Add mesh to pivot group and offset position
pivot.add( circle );
circle.position.set(0,0, 0 ); 
//add orbitglobes to circles
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
    
  
//centralPivot.add(globe);
//centralPivot.add(globe_2_wireframe);
////centralPivot.add(partnerLocation);
centralPivot.add(globeWithLocations)

const sceneGlobe = scene.children[2].children[8];




// Post-processing setup
const composer = new EffectComposer(renderer);
// Reduce resolution to half
composer.setSize(window.innerWidth / 2, window.innerHeight / 2); 

composer.addPass(new RenderPass(scene, camera));

const bokehPass = new BokehPass(scene, camera, {
    focus: 6,  // Distance to the focused object
    aperture: 0.01, // Blur strength (smaller = stronger blur)
    maxblur: 0.005 // Maximum blur size
});
composer.addPass(bokehPass);



//----------------------   RENDER LOOP   -------------------- 


// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the 'earth' and locations
  const earthRotate = -0.007;
  globeWithLocations.rotation.y += earthRotate;
  

  
  const baseCircleSpeed = 0.00220;
  const baseOrbitSpeed = 0.02;

  //rotate all items
  centralPivot.rotation.y += 0.01;

  //globenum accesses an item in the list of globes

  const rotate = (globeNum, circRotateFactor, orbitRotateFactor) =>{
      globes[globeNum].pivot.rotation.z += baseCircleSpeed * circRotateFactor;
      globes[globeNum].pivot.children[0].rotation.z += baseOrbitSpeed * orbitRotateFactor;
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
  //intersects[ i ].object.material.color.set( 0xff0000 );
}

      


controls.update();

    // Render the scene
    renderer.render(scene, camera);
    //composer.render();

}

animate();



// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});