import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import renderer       from './render';
import Sphere         from './PlanetTech/sphere/sphere'
import { Planet }     from './PlanetTech/celestialBodies/planet';
import { nodeFrame }  from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { Atmosphere } from './PlanetTech/shaders/vfx/atmosphereScattering';
import { FirstPersonControls }      from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './PlanetTech/engine/utils'
import { CubeMap } from './cubeMap/cubeMap';
import { Space } from './Space/space';


let N = [
  new THREE.TextureLoader().load('./planet/nf_image.png'),
  new THREE.TextureLoader().load('./planet/nb_image.png'),
  new THREE.TextureLoader().load('./planet/nr_image.png'),
  new THREE.TextureLoader().load('./planet/nl_image.png'),
  new THREE.TextureLoader().load('./planet/nt_image.png'),
  new THREE.TextureLoader().load('./planet/nbo_image.png'),
  ]
let D = [
  new THREE.TextureLoader().load('./planet/f_image.png'),
  new THREE.TextureLoader().load('./planet/b_image.png'),
  new THREE.TextureLoader().load('./planet/r_image.png'),
  new THREE.TextureLoader().load('./planet/l_image.png'),
  new THREE.TextureLoader().load('./planet/t_image.png'),
  new THREE.TextureLoader().load('./planet/bo_image.png'),
]

class ViewGL {
  constructor() {
  }
  
  render(canvasViewPort) {
    this.rend = renderer;
    this.rend.WebGLRenderer(canvasViewPort);
    this.rend.scene();
    this.rend.stats();
    this.rend.camera();
    this.rend.updateCamera(0,0,10000)
    this.rend.orbitControls()
    this.space = new Space()
  }
  
  initViewPort(canvasViewPort) {
  this.canvasViewPort = canvasViewPort;
  }

  initCubeMapPlanet() {
    const displacmentMaps = new CubeMap(2000,3,true)
    const download = false
    displacmentMaps.build(2512,this.rend.renderer)
    displacmentMaps.simplexNoiseFbm({
      inScale:            3.5,
      scale:              0.1,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .09,
      redistribution:      1.,
      persistance:        .35,
      lacunarity:          2.,
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
      levels:              5,
      radius:          10000,
      displacmentScale:    0,
      lodDistanceOffset: 1.4,
    })

    this.planet.textuers(N,N)
    this.planet.light(NODE.vec3(0.0,20.0,20.0))
    this.quads = this.planet.getAllInstance()
    this.rend.scene_.add( this.planet.sphere);
    console.log(this.planet.metaData())
  }
  
  initPlanet() {
    this.planet = new Planet({
      size:            10000,
      polyCount:          30,
      quadTreeDimensions:  1,
      levels:              5,
      radius:          10000,
      displacmentScale: 22.5,
      lodDistanceOffset: 1.4,
    })

    this.planet.textuers(N,D)
    this.planet.light(NODE.vec3(0.0,100.0,100.0))

    this.space.createAtmosphere(this.planet,12000)
    this.rend.scene_.add( this.planet.sphere);
  }
  
  initPlayer(){
    var boxGeometry        = new THREE.BoxGeometry( 10.1, 10.1, 10.1, 1 )
    var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
    this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
    this.player.position.z = this.rend.camera_.position.z
    this.controls               = new FirstPersonControls( this.player, document.body );
    this.controls.movementSpeed = 500
    this.controls.lookSpeed     = 0
    this.clock = new THREE.Clock();
    this.rend.scene_.add(this.player)

    var boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1, 1 )
    var boxMaterial = new THREE.MeshBasicMaterial({color:'blue'});
    let box         = new THREE.Mesh( boxGeometry, boxMaterial );
    let planetQuads = this.planet.getAllInstance()
  
    planetQuads[0].center.z += 7
    box.position.copy(planetQuads[0].center)
    this.rend.scene_.add( box);
  }
  
  start() {
    this.render(this.canvasViewPort);
    this.initPlanet()
    this.initPlayer()
    this.update();
  }
  
  update(t) {
    requestAnimationFrame(this.update.bind(this));
    if(this.space){
      this.controls.update(this.clock.getDelta())
      this.space.update(this.player)
    }
    nodeFrame.update();
    this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
  }

}
  
  
  var viewGL = new ViewGL();
  export default viewGL;