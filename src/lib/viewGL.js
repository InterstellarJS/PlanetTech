import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import renderer       from './render';
import Sphere         from './PlanetTech/sphere/sphere'
import { Planet }     from './PlanetTech/celestialBodies/planet';
import { nodeFrame }  from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { Atmosphere } from './WorldSpace/Shaders/atmosphereScattering';
import { FirstPersonControls }      from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './PlanetTech/engine/utils'
import { CubeMap } from './cubeMap/cubeMap';
import { Space } from './WorldSpace/space';
import {SMAAEffect} from "postprocessing";
import * as Shaders  from  './PlanetTech/shaders/index.js'


 console.log(NODE)

let N = [
  new THREE.TextureLoader().load('./planet/nr_image.png'),
  new THREE.TextureLoader().load('./planet/nl_image.png'),
  new THREE.TextureLoader().load('./planet/nt_image.png'),
  new THREE.TextureLoader().load('./planet/nbo_image.png'),
  new THREE.TextureLoader().load('./planet/1nf_image.png'),
  new THREE.TextureLoader().load('./planet/nb_image.png'),
  ]
let D = [
  new THREE.TextureLoader().load('./planet/r_image.png'),
  new THREE.TextureLoader().load('./planet/l_image.png'),
  new THREE.TextureLoader().load('./planet/t_image.png'),
  new THREE.TextureLoader().load('./planet/bo_image.png'),
  new THREE.TextureLoader().load('./planet/1f_image.png'),
  new THREE.TextureLoader().load('./planet/b_image.png'),
]

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
    this.rend.updateCamera(0,0,80000*4)
    this.rend.orbitControls()
    this.rend.renderer.setClearColor('white');
    this.space = new Space()
  }
  
  initViewPort(canvasViewPort) {
  this.canvasViewPort = canvasViewPort;
  }

  async initCubeMapPlanet() {
    const displacmentMaps = new CubeMap(2000,2,true)
    const download = false
    displacmentMaps.build(1512,this.rend.renderer)
    displacmentMaps.simplexNoiseFbm({
      inScale:            0.008,
      scale:              0.05,
      radius:             400,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .08,
      redistribution:      2.,
      persistance:        .35,
      lacunarity:          2.,
      iteration:           10,
      terbulance:       false,
      ridge:            true,
    })
    
    displacmentMaps.fallOffNoise(0,{
      uvScale:            1.,
      fallOfRadius:        .4,
      inScale:            1.01,
      scale:              0.01,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .5,
      redistribution:      3.,
      persistance:        .25,
      lacunarity:          2.,
      iteration:           5,
      terbulance:       false,
      ridge:            false,
    })

    displacmentMaps.fallOffNoise(3,{
      uvScale:            1.,
      fallOfRadius:        .4,
      inScale:            3.5,
      scale:              0.01,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .5,
      redistribution:      3.,
      persistance:        .35,
      lacunarity:          3.,
      iteration:           10,
      terbulance:       false,
      ridge:            false,
    })



    displacmentMaps.fallOffNoise(4,{
      uvScale:            1.,
      fallOfRadius:        .4,
      inScale:            .01,
      scale:              0.1,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .5,
      redistribution:      2.,
      persistance:        .35,
      lacunarity:          3.,
      iteration:           10,
      terbulance:       false,
      ridge:            false,
    })

    displacmentMaps.fallOffNoise(4,{
      uvScale:            1.,
      fallOfRadius:        .4,
      inScale:            .001,
      scale:              0.01,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .05,
      redistribution:      1.,
      persistance:        .25,
      lacunarity:          3.,
      iteration:           10,
      terbulance:       false,
      ridge:            false,
    })



    displacmentMaps.fallOffNoise(5,{
      uvScale:            1.,
      fallOfRadius:        .4,
      inScale:            3.1,
      scale:              0.01,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .05,
      redistribution:      1.,
      persistance:        .25,
      lacunarity:          3.,
      iteration:           10,
      terbulance:       false,
      ridge:            false,
    })

    let loader3 = new THREE.TextureLoader()
    let text3 =  await loader3.loadAsync('./planet/nf_image.png')
    displacmentMaps.addTexture(0,text3)



    displacmentMaps.fallOffNoise(0,{
      uvScale:            1.,
      fallOfRadius:        .4,
      inScale:            1.01,
      scale:              0.01,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .08,
      redistribution:      3.,
      persistance:        .35,
      lacunarity:          3.,
      iteration:           10,
      terbulance:       false,
      ridge:            false,
    })


    displacmentMaps.snapShot(download)
    let N = displacmentMaps.textuerArray
    
    this.planet = new Planet({
      size:            10000,
      polyCount:          30,
      quadTreeDimensions:  1,
      levels:              1,
      radius:          80000,
      displacmentScale: 0.5,
      lodDistanceOffset: 12.4,
      material: new NODE.MeshBasicNodeMaterial(),
    })

    this.planet.textuers(N,N)
    this.planet.light(NODE.vec3(0.0,8.5,8.5))
    this.quads = this.planet.getAllInstance()
    this.rend.scene_.add( this.planet.sphere);
    const light = new THREE.AmbientLight( 0x404040,35 ); // soft white light
    this.rend.scene_.add( light );

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
    this.planet.textuers(N,D)
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
  
  initPlayer(){
    var boxGeometry        = new THREE.BoxGeometry( 10.1, 10.1, 10.1, 1 )
    var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
    this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
    this.player.position.z = 110000
    this.controls               = new FirstPersonControls( this.player, document.body );
    this.controls.movementSpeed = 500
    this.controls.lookSpeed     = 0
    this.clock = new THREE.Clock();
    this.rend.scene_.add(this.player)
  }
  
  start() {
    this.render(this.canvasViewPort);
    this.initCubeMapPlanet()
    this.initPlayer()
    this.update();
  }
  

  onWindowResize(vpW, vpH) {
    this.rend.renderer.setSize(vpW, vpH);
  }

  update(t) {
    requestAnimationFrame(this.update.bind(this));
    if(this.planet){
      this.controls.update(this.clock.getDelta())
      //this.planet.update(this.player)
    }
    nodeFrame.update();
    this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
  }

}
  
  
  var viewGL = new ViewGL();
  export default viewGL;