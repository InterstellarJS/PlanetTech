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
    this.rend.updateCamera(0,0,110155-300)
    this.rend.orbitControls()
    this.rend.renderer.setClearColor('black');
    //this.space = new Space()
  }
  
  initViewPort(canvasViewPort) {
  this.canvasViewPort = canvasViewPort;
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
    var boxGeometry        = new THREE.BoxGeometry( 10.01, 10.01, 10.01, 1 )
    var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
    this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
    this.player.position.z = 110000-300
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
    directionalLight.position.set(-.0,.05,.05)
    this.rend.scene_.add(directionalLight)

    const light = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
    this.rend.scene_.add( light );

  }
  
  async start() {
    this.render(this.canvasViewPort);

    //this.celestialBodie = await tileTextureExample(this.rend.renderer)


    this.celestialBodie = await fullTextureExample(this.rend.renderer)

    this.space.initComposer()
    this.space.addPlanets(this.celestialBodie,{
      PLANET_CENTER:      this.celestialBodie.metaData().cnt.clone(),
      PLANET_RADIUS:      this.celestialBodie.metaData().radius,
      ATMOSPHERE_RADIUS:  81000,
      lightDir:           new THREE.Vector3(0,0,1),
      ulight_intensity:   new THREE.Vector3(8.0,8.0,8.0),
      uray_light_color:   new THREE.Vector3(2.0,2.0,2.0),
      umie_light_color:   new THREE.Vector3(5.0,5.0,5.0),
      RAY_BETA:           new THREE.Vector3(5.5e-6, 13.0e-6, 22.4e-6).multiplyScalar(34.5),
      MIE_BETA:           new THREE.Vector3(21e-6, 21e-6, 21e-6).multiplyScalar(34.5),
      AMBIENT_BETA:       new THREE.Vector3(0.0),
      ABSORPTION_BETA:    new THREE.Vector3(2.04e-5, 4.97e-5, 1.95e-6).multiplyScalar(79.5),
      HEIGHT_RAY:         8e3/81.5,
      HEIGHT_MIE:       1.2e3/81.5,
      HEIGHT_ABSORPTION: 30e3/79.5,
      ABSORPTION_FALLOFF: 4e3/79.5,
      PRIMARY_STEPS:            12,
      LIGHT_STEPS:               4,
      G:                 0.0000007,
      textureIntensity:         3.5,
      AmbientLightIntensity:  .007,
    })
    this.space.setAtmosphere()
    this.space.addEffects([new SMAAEffect()])

 

 this.rend.scene_.add( this.celestialBodie.sphere );
  }
  

  

  onWindowResize(vpW, vpH) {
    //this.rend.renderer.setSize(vpW, vpH);
  }






  async  webWorker(){
    this.render(this.canvasViewPort);
    this.celestialBodie = await fullTextureExample(this.rend.renderer)


      let gemo = this.celestialBodie.metaData().arrybuffers['1250'] 

      const buffMemLength = new window.SharedArrayBuffer(gemo.attributes.position.array.byteLength); //byte length   
      let typedArr1 = new Float32Array(buffMemLength);
   
      const buffMemLength2 = new window.SharedArrayBuffer(gemo.attributes.position.array.byteLength); //byte length   
      let typedArr2 = new Float32Array(buffMemLength2);
     

      const buffMemLength3 = new window.SharedArrayBuffer(gemo.attributes.position.array.byteLength); //byte length   
      let typedArr3 = new Float32Array(buffMemLength3);
      

      const buffMemLength4 = new window.SharedArrayBuffer(gemo.attributes.position.array.byteLength); //byte length   
      let typedArr4 = new Float32Array(buffMemLength4);

      let stra = gemo.attributes.position.array.toString()

      let w =  new PromiseWorker("threejsWork.js",typedArr1);
      let w1 = new PromiseWorker("threejsWork.js",typedArr2);
      let w2 = new PromiseWorker("threejsWork.js",typedArr3);
      let w3 = new PromiseWorker("threejsWork.js",typedArr4)

      let pw1 = w.oche({buffMemLength:buffMemLength,stra}); 
      let pw2 = w1.oche({buffMemLength:buffMemLength2,stra}); 
      let pw3 = w2.oche({buffMemLength:buffMemLength3,stra}); 
      let pw4 = w3.oche({buffMemLength:buffMemLength4,stra}); 


      let geometry = this.celestialBodie.metaData().arrybuffers['1250']
      let idx = Array.from(geometry.index.array)
      let that = this
      let pz = 300
      console.log('d')
      function f(typedArr1){
        let geoCore = new THREE.BufferGeometry()
        geoCore.setIndex( idx  );
        geoCore.setAttribute( 'position', new THREE.Float32BufferAttribute( typedArr1, 3 ) );
      // geoCore.setAttribute( 'normal', new THREE.Float32BufferAttribute(  geometry.attributes.normal.array, 3 ) );
      // geoCore.setAttribute( 'uv', new THREE.Float32BufferAttribute(  geometry.attributes.uv.array, 2 ) );
        const color = THREE.MathUtils.randInt(0, 0xffffff)
        console.log(color)
        const material = new THREE.MeshBasicMaterial( {wireframe:false,color: color} );
        const plane = new THREE.Mesh( geoCore, material );
        that.rend.scene_.add( plane );
        plane.position.x -= pz
        pz -= 600
        const box = new THREE.BoxHelper( plane, 0xffff00 );
        that.rend.scene_.add( box );
      }


     pw1 .then(
        (res) => {
          f(res)
          //console.log(res)
        }
      ).catch(
        (err) => console.log('Got error: ' + err)
      )
      pw2 .then(
        (res) => {
          f(res)
         // console.log(res)
        }
      ).catch(
        (err) => console.log('Got error: ' + err)
      )
      pw3 .then(
        (res) => {
          f(res)
        //  console.log(res)
        }
      ).catch(
        (err) => console.log('Got error: ' + err)
      )

      pw4 .then(
        (res) => {
          f(res)
        //  console.log(res)
        }
      ).catch(
        (err) => console.log('Got error: ' + err)
      )


  }

  update(t) {
    requestAnimationFrame(this.update.bind(this));
    this.rend.stats_.begin();
    this.controls.update(this.clock.getDelta())
    //if(this.celestialBodie){
      //this.celestialBodie.update(this.player)
      //this.space.update(this.player)
    //}
    this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
    this.rend.stats_.end();
    nodeFrame.update();
  }

}
  
  
  var viewGL = new ViewGL();
  export default viewGL;