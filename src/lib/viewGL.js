import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import renderer       from './render';
import Sphere         from './PlanetTech/sphere/sphere'
import { Planet }     from './PlanetTech/celestialBodies/planet';
import { nodeFrame }  from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { Atmosphere } from './PlanetTech/shaders/vfx/atmosphereScattering';
import { FirstPersonControls }      from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './PlanetTech/engine/utils'

class ViewGL {
  constructor() {
    this.Texts = [];
  }
  
  render(canvasViewPort) {
    this.rend = renderer;
    this.rend.WebGLRenderer(canvasViewPort);
    this.rend.scene();
    this.rend.stats();
    this.rend.camera();
    this.rend.updateCamera(0,0,10000)
    this.rend.orbitControls()
  }
  
  initViewPort(canvasViewPort) {
  this.canvasViewPort = canvasViewPort;
  }
  
  initPlanet() {

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
        
    this.planet = new Planet({
      width:          10000,
      height:         10000,
      widthSegment:      30,
      heightSegment:     30,
      quadTreeDimensions: 1,
      levels:             1,
      radius:         10000,
      displacmentScale:  0,
      lodDistanceOffset:1.4,
      //color: () => NODE.vec3(...hexToRgbA(getRandomColor())),
    })

    this.planet.textuers(N,D)
    this.planet.light(NODE.vec3(0.0,20.0,20.0))
    this.quads = this.planet.getAllInstance()

    console.log(this.planet.log())
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
  }
  
  start() {
    this.render(this.canvasViewPort);
    this.initPlanet()
    this.initPlayer()
    this.update();
  }
  
  onWindowResize(vpW, vpH) {
    this.rend.renderer.setSize(vpW, vpH);
  }
  
  updateMeshPosition(value){
    //this.mesh.position.x = value
  }
  
  update(t) {
    requestAnimationFrame(this.update.bind(this));
    if(this.planet){
      this.controls.update(this.clock.getDelta())
      for (var i = 0; i < this.quads.length; i++) {
      this.quads[i].update(this.player)
      }
    }
    nodeFrame.update();
    this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
  }
}
  
  var viewGL = new ViewGL();
  export default viewGL;