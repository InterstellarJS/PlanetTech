import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import renderer       from './render';
import { Planet }     from './PlanetTech/celestialBodies/planet';
import { nodeFrame }  from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { FirstPersonControls }  from 'three/examples/jsm/controls/FirstPersonControls';
import { Space } from './WorldSpace/space';
import {SMAAEffect} from "postprocessing";
import Quad from './PlanetTech/engine/quad';
import { tileMap,tileMapFront,tileTextuerTop, tileTextuerWorld,tileTextuerFront, tileMapCubeMapFront,tileTextuerLoad} from './examples/tileMap';
import {cubeMap, cubeMapTop,cubeMapFront } from './examples/cubeMap';
import { Moon } from './PlanetTech/celestialBodies/moon';


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
    this.rend.updateCamera(0,0,110005)
    this.rend.orbitControls()
    this.rend.renderer.setClearColor('white');
    this.space = new Space()
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
    var boxGeometry        = new THREE.BoxGeometry( 0.01, 0.01, 0.01, 1 )
    var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
    this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
    this.player.position.z = 110000
    this.controls               = new FirstPersonControls( this.player, document.body );
    this.controls.movementSpeed = 500
    this.controls.lookSpeed     = 0
    this.clock = new THREE.Clock();
    this.rend.scene_.add(this.player)
  }
  
  async start() {
    this.render(this.canvasViewPort);


      /*let ND = await Promise.all([
        new THREE.TextureLoader().loadAsync('./planet/5000_displacement/right_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/5000_displacement/left_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/5000_displacement/top_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/5000_displacement/bottom_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/5000_displacement/front_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/5000_displacement/back_displacement_image.png'),
      ])


      */

      /*let NF = await Promise.all([
        new THREE.TextureLoader().loadAsync('./planet/4000_normal/right_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/4000_normal/left_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/4000_normal/top_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/4000_normal/bottom_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/4000_normal/front_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/4000_normal/back_normal_image.png'),
      ])*/


    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor('white')
    renderer.setSize( window.innerWidth, window.innerHeight );


    //let n = tileTextuerWorld(this.rend,NF,ND)
    //let n = tileTextuerLoad({renderer},NF)
    //let n = tileMap({renderer})


    //let n = await new THREE.TextureLoader().loadAsync('./planet/front_normal_image.png')
    //let d = await new THREE.TextureLoader().loadAsync('./planet/front_displacement_image.png')

  let ND = await Promise.all([
      new THREE.TextureLoader().loadAsync('./planet/displacement/right_displacement_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/displacement/left_displacement_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/displacement/top_displacement_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/displacement/bottom_displacement_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/displacement/front_displacement_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/displacement/back_displacement_image.png'),
    ])

  let NF = await Promise.all([
      new THREE.TextureLoader().loadAsync('./planet/normal/right_normal_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/normal/left_normal_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/normal/top_normal_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/normal/bottom_normal_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/normal/front_normal_image.png'),
      new THREE.TextureLoader().loadAsync('./planet/normal/back_normal_image.png'),
    ])


    let moon = new Moon({
      size:            10000,
      polyCount:          50,
      quadTreeDimensions:  4,
      levels:              4,
      radius:          80000,
      displacmentScale: 80.5,
      lodDistanceOffset: 7.4,
      material: new NODE.MeshBasicNodeMaterial(),
    })
    moon.textuers(NF,ND)
    moon.light(NODE.vec3(0.0,-6.5,6.5))

    this.rend.scene_.add( moon.sphere);
    this.celestialBodie = moon
    this.initPlayer()
    this.update();
  }
  

  onWindowResize(vpW, vpH) {
    this.rend.renderer.setSize(vpW, vpH);
  }

  update(t) {
    requestAnimationFrame(this.update.bind(this));
    if(this.celestialBodie){
      this.controls.update(this.clock.getDelta())
      this.celestialBodie.update(this.player)
    }
    nodeFrame.update();
    this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
  }

}
  
  
  var viewGL = new ViewGL();
  export default viewGL;