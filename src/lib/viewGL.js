import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import renderer       from './render';
import { Planet }     from './PlanetTech/celestialBodies/planet';
import { nodeFrame }  from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { FirstPersonControls }  from 'three/examples/jsm/controls/FirstPersonControls';
import { Space } from './WorldSpace/space';
import {SMAAEffect} from "postprocessing";
import Quad from './PlanetTech/engine/quad';
import { Moon } from './PlanetTech/celestialBodies/moon';
import { getRandomColor,hexToRgbA } from './PlanetTech/engine/utils'

import { tileMap,tileMapFront,tileTextuerTop, tileTextuerWorld,tileTextuerFront, tileMapCubeMapFront,tileTextuerLoad} from './examples/tileMap';
import {cubeMap, cubeMapTop,cubeMapFront } from './examples/cubeMap';
import { DynamicTextures, DynamicTileTextureManager} from './cubeMap/tileTextureManager';
import { tileTextureExample,fullTextureExample } from './examples/dynamicTileTextureManager';
import { addTextureTiles } from './examples/basic';
import { PromiseWorker } from './PlanetTech/engine/utils';
import Sphere from './PlanetTech/sphere/sphere';
console.log(NODE)







let frustumObj = new THREE.Frustum()


function ff(camera_,scene_){
  let frustum = frustumObj.setFromProjectionMatrix( new THREE.Matrix4().multiplyMatrices(  camera_.projectionMatrix,  camera_.matrixWorldInverse ) );
  scene_.traverse( node => {
      if(( node.isMesh)){
          if(node.geometry.type == "webWorkerGeometry"){
          if(( frustum.intersectsBox ( node.geometry.boundingBox ) )){
            //node.material.visible = true
          }else{
            //console.log(node.side,node.w,node.idx)
            // node.material.visible = false
          }
        }
      }
  })
}


class ViewGL {
  constructor() {
  }
  
  render(canvasViewPort) {
    this.rend = renderer;
    this.rend.WebGLRenderer(canvasViewPort);
    this.rend.antialias = false
    this.rend.stencil   = false
    this.rend.depth     = false
    this.rend.scene();
    this.rend.stats();
    this.rend.camera();
    this.rend.updateCamera(0,0,110000*8)
    this.rend.orbitControls()
    this.rend.renderer.setClearColor('white');
    //this.space = new Space()
  }
  
  initViewPort(canvasViewPort) {
  this.canvasViewPort = canvasViewPort;
  this.render(this.canvasViewPort);

  }

 
  initPlanet() {
    this.planet = new Planet({
      size:            10000,
      polyCount:          30,
      quadTreeDimensions:  1,
      levels:              5,
      radius:          80000,
      displacmentScale: 80.5,
      lodDistanceOffset: 12.4,
      material: new NODE.MeshPhysicalNodeMaterial(),
        },'Terranox')
    //this.planet.textuers(N,D)
    this.planet.light   (NODE.vec3(0.0,8.0,8.0))

    this.space.initComposer()
    this.space.addPlanets(this.planet,{
      PLANET_CENTER:      this.planet.metaData().cnt.clone(),
      PLANET_RADIUS:      this.planet.metaData().radius,
      ATMOSPHERE_RADIUS:  50000*2.0,
      lightDir:           new THREE.Vector3(0,0,1),
      ulight_intensity:   new THREE.Vector3(7.0,7.0,7.0),
      uray_light_color:   new THREE.Vector3(5,5,5),
      umie_light_color:   new THREE.Vector3(5,5,5),
      RAY_BETA:           new THREE.Vector3(5.5e-6, 13.0e-6, 22.4e-6),
      MIE_BETA:           new THREE.Vector3(21e-6, 21e-6, 21e-6),
      AMBIENT_BETA:       new THREE.Vector3(0.0),
      ABSORPTION_BETA:    new THREE.Vector3(2.04e-5, 4.97e-5, 1.95e-6),
      HEIGHT_RAY:        .5e3,
      HEIGHT_MIE:       .25e3,
      HEIGHT_ABSORPTION: 30e3,
      ABSORPTION_FALLOFF: 4e3,
      PRIMARY_STEPS:        8,
      LIGHT_STEPS:          4,
      G:                  0.7,
    })
    this.space.setAtmosphere()
    this.space.addEffects([new SMAAEffect()])

    const light = new THREE.AmbientLight( 0x404040,35 ); // soft white light
    this.rend.scene_.add( light );
    this.rend.scene_.add( this.planet.sphere );
  }
  

  initQuad(){
    const quad = new Quad(100,100,10,10,2)
    quad.createQuadTree(5)
    quad.createDimensions('front')
    let config = quad.quadTreeconfig.config
    console.log(config)
  }

  initPlayer(){
    //75020.19999997318
    var boxGeometry        = new THREE.BoxGeometry( 100.01, 100.01, 100.01, 1 )
    var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
    this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
    this.player.position.z = 110000

    this.controls               = new FirstPersonControls( this.player, document.body );
    this.controls.movementSpeed = 500
    this.controls.lookSpeed     = 0
    this.clock = new THREE.Clock();
    this.rend.scene_.add(this.player)

    var boxGeometry1        = new THREE.BoxGeometry( .025, .025, .1, 1 )
    var boxMaterial1        = new THREE.MeshStandardMaterial({color:'green'});
    let p            = new THREE.Mesh( boxGeometry1, boxMaterial1 );
    p.position.z = 75010.62 

    this.rend.scene_.add(p)


    var boxGeometry1        = new THREE.BoxGeometry( .03, .03, 1.0, 1 )
    var boxMaterial1        = new THREE.MeshStandardMaterial({color:'blue'});
    let pp            = new THREE.Mesh( boxGeometry1, boxMaterial1 );
    pp.position.z = 75011. 
    pp.position.x = .25
    this.rend.scene_.add(pp)


    const directionalLight = new THREE.DirectionalLight( 0xffffff, 5.5 );
    directionalLight.position.set(0.0,0.0,1.0)
    this.rend.scene_.add(directionalLight)

    const light = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
    this.rend.scene_.add( light );

  }
  
  async start() {


  }
  

  

  onWindowResize(vpW, vpH) {
    //this.rend.renderer.setSize(vpW, vpH);
  }


    webWorker(){
    const params = {
      width:            10000,
      height:           10000,
      widthSegment:      25,
      heightSegment:     25,
      quadTreeDimensions: 2,
      levels:             5,
      radius:          80000,
      displacmentScale:  165.,
      lodDistanceOffset:   6,
      material: new NODE.MeshPhysicalNodeMaterial({}),
     // color: () => NODE.vec3(...hexToRgbA(getRandomColor())),
    }
    
    let s = new Sphere(
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

    this.s = s


    let r = new THREE.TextureLoader().load('./planet/color/c/right_color_image.png')
    let l = new THREE.TextureLoader().load('./planet/color/c/left_color_image.png')
    let t = new THREE.TextureLoader().load('./planet/color/c/top_color_image.png')
    let b = new THREE.TextureLoader().load('./planet/color/c/bottom_color_image.png')
    let f = new THREE.TextureLoader().load('./planet/color/c/front_color_image.png')
    let ba = new THREE.TextureLoader().load('./planet/color/c/back_color_image.png')
    
    let rd = new THREE.TextureLoader().load('./planet/color/d/right_displacement_image.png')
    let ld = new THREE.TextureLoader().load('./planet/color/d/left_displacement_image.png')
    let td = new THREE.TextureLoader().load('./planet/color/d/top_displacement_image.png')
    let bd = new THREE.TextureLoader().load('./planet/color/d/bottom_displacement_image.png')
    let fd = new THREE.TextureLoader().load('./planet/color/d/front_displacement_image.png')
    let bad = new THREE.TextureLoader().load('./planet/color/d/back_displacement_image.png')
    
    this.s.right.addTexture([r,rd],params.displacmentScale,false)
    this.s.left.addTexture([l,ld],params.displacmentScale,false)
    this.s.top.addTexture([t,td],params.displacmentScale,false)
    this.s.bottom.addTexture([b,bd],params.displacmentScale,false)
    this.s.front.addTexture([f,fd],params.displacmentScale,false)
    this.s.back.addTexture([ba,bad],params.displacmentScale,false)

    console.log(this.s.metaData())

this.rend.scene_.add(this.s.sphere)






/*
setTimeout(()=>{
  console.log('rrrrrrrr')
  this.s.right.addTexture([r,r],params.displacmentScale,false)
  this.s.left.addTexture([l,l],params.displacmentScale,false)
  this.s.top.addTexture([t,t],params.displacmentScale,false)
  this.s.bottom.addTexture([b,b],params.displacmentScale,false)
  this.s.front.addTexture([f,f],params.displacmentScale,false)
  this.s.back.addTexture([ba,ba],params.displacmentScale,false)
}, 20000)*/

  }

  update(t) {
    requestAnimationFrame(this.update.bind(this));
    this.rend.stats_.begin();
    this.controls.update(this.clock.getDelta())

   for (var i = 0; i < this.s.sphereInstance.length; i++) {
     this.s.sphereInstance[i].update(this.player)
    } 
    ff(this.rend.camera_,this.rend.scene_)
    this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
    this.rend.stats_.end();
    nodeFrame.update();
  }

}
  
  
  var viewGL = new ViewGL();
  export default viewGL;