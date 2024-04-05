import * as THREE from "https://esm.sh/three";
import * as NODE  from "https://esm.sh/three/nodes";
import {global}   from "https://esm.sh/three/nodes";
import * as PlanetTech from "https://esm.sh/@interstellar-js-core/planettech@0.0.8-alpha.0.1.7";
import { nodeFrame }   from "https://esm.sh/three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js";
import {OrbitControls} from "https://esm.sh/three/addons/controls/OrbitControls.js";

global.set('TSL', NODE);

let scene, camera, renderer,controls,
rightColorTexture,leftColorTexture,topColorTexture,
bottomColorTexture,frontColorTexture,backColorTexture,
rightDisplaceTexture,leftDisplaceTexture,topDisplaceTexture,
bottomDisplaceTexture,frontDisplaceTexture,backDisplaceTexture

let aspect = window.innerWidth / window.innerHeight;
let lightVector = new THREE.Vector3(0.0,0.0,1.0)
let camPos = new THREE.Vector3(0,0,110000*12)
let backGroundColor = 'white'
let fov    =  10
let near   = .01
let far    =  Number.MAX_SAFE_INTEGER
let ambientLightParams = {c:0x404040,i:5}
let directionalLightParams = {c:0xffffff,i:5.5}
let clock = new THREE.Clock();

function loadTextuers(){
    rightColorTexture  = new THREE.TextureLoader().load("./textuers/color/right_color_image.png")
    leftColorTexture   = new THREE.TextureLoader().load("./textuers/color/left_color_image.png")
    topColorTexture    = new THREE.TextureLoader().load("./textuers/color/top_color_image.png")
    bottomColorTexture = new THREE.TextureLoader().load("./textuers/color/bottom_color_image.png")
    frontColorTexture  = new THREE.TextureLoader().load("./textuers/color/front_color_image.png")
    backColorTexture   = new THREE.TextureLoader().load("./textuers/color/back_color_image.png")

    rightDisplaceTexture  = new THREE.TextureLoader().load("./textuers/displacement/right_displacement_image.png")
    leftDisplaceTexture   = new THREE.TextureLoader().load("./textuers/displacement/left_displacement_image.png")
    topDisplaceTexture    = new THREE.TextureLoader().load("./textuers/displacement/top_displacement_image.png")
    bottomDisplaceTexture = new THREE.TextureLoader().load("./textuers/displacement/bottom_displacement_image.png")
    frontDisplaceTexture  = new THREE.TextureLoader().load("./textuers/displacement/front_displacement_image.png")
    backDisplaceTexture   = new THREE.TextureLoader().load("./textuers/displacement/back_displacement_image.png")
}


function setUp(){
    renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        logarithmicDepthBuffer: true,
        antialias: true,
      });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(backGroundColor);
    document.body.appendChild( renderer.domElement );
    
     scene = new THREE.Scene();
     camera = new THREE.PerspectiveCamera( fov, aspect, near,  far );
     camera.position.copy(camPos);
     controls = new OrbitControls( camera, renderer.domElement );
    const light = new THREE.AmbientLight( ambientLightParams.c, ambientLightParams.i ); 
    const directionalLight = new THREE.DirectionalLight( directionalLightParams.c, directionalLightParams.i );
    directionalLight.position.copy(lightVector)
    scene.add(directionalLight)
    scene.add( light );    
}

function initPlanet(){
    const params = {
        width:            10000,
        height:           10000,
        widthSegment:      50,
        heightSegment:     50,
        quadTreeDimensions: 2,
        levels:             1,
        radius:          80000,
        displacmentScale:  165,
        lodDistanceOffset:  6,
        material: new NODE.MeshPhysicalNodeMaterial({}),
        //color: () => NODE.vec3(1,0,0),
      }
      
      let s = new PlanetTech.Sphere(
        params.width,
        params.height,
        params.widthSegment,
        params.heightSegment,
        params.quadTreeDimensions
      )
      
      s.build(
        params.levels,
        params.radius,
        params.displacmentScale,
        params.lodDistanceOffset,
        params.material,
        params.color,
      )

      s.right .addTexture([rightColorTexture,rightDisplaceTexture],params.displacmentScale,false)
      s.left  .addTexture([leftColorTexture,leftDisplaceTexture],params.displacmentScale,false)
      s.top   .addTexture([topColorTexture,topDisplaceTexture],params.displacmentScale,false)
      s.bottom.addTexture([bottomColorTexture,bottomDisplaceTexture],params.displacmentScale,false)
      s.front .addTexture([frontColorTexture,frontDisplaceTexture],params.displacmentScale,false)
      s.back  .addTexture([backColorTexture,backDisplaceTexture],params.displacmentScale,false)

    scene.add( s.sphere );      
}

function render() {
    requestAnimationFrame( render );
    controls.update(clock.getDelta())
    renderer.render( scene, camera );
    nodeFrame.update();
    };

setUp()
loadTextuers()
initPlanet()
render();
