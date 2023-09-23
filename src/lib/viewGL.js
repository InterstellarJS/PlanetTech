import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Sphere        from './engine/sphere/sphere'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './engine/sphere/utils'
import { nodeFrame } from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';


class ViewGL {
  constructor() {
  this.Texts = [];
  }
  
  render(canvasViewPort) {
    this.rend = renderer;
    this.rend.webglRenderer(canvasViewPort);
    this.rend.scene();
    this.rend.stats();
    this.rend.camera();
    this.rend.updateCamera(0,0,10000*2)
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
    
    const params = {
      width:          10000,
      height:         10000,
      widthSegment:     50,
      heightSegment:    50,
      quadTreeDimensions: 1,
      levels:             4,
      radius:         10000,
      displacmentScale:  30,
    }
    
    this. s = new Sphere(
      params.width,
      params.height,
      params.widthSegment,
      params.heightSegment,
      params.quadTreeDimensions
      )
    
    this.s.build(
      params.levels,
      params.radius,
      params.displacmentScale,
    )
    this.s.front.addTexture  ([N[0],D[0]], params.displacmentScale)
    this.s.back.addTexture   ([N[1],D[1]], params.displacmentScale)
    this.s.right.addTexture  ([N[2],D[2]], params.displacmentScale)
    this.s.left.addTexture   ([N[3],D[3]], params.displacmentScale)
    this.s.top.addTexture    ([N[4],D[4]], params.displacmentScale)
    this.s.bottom.addTexture ([N[5],D[5]], params.displacmentScale)
    
    const ld = NODE.vec3(0.0,100.0,100.0)
    
    this.s.front.lighting    (ld)
    this.s.back.lighting     (ld)
    this.s.right.lighting    (ld)
    this.s.left.lighting     (ld)
    this.s.top.lighting      (ld)
    this.s.bottom.lighting   (ld)
    
    this.allp = [
      ...this.s.front.instances,
      ...this.s.back.instances,
      ...this.s.right.instances,
      ...this.s.left.instances,
      ...this.s.top.instances,
      ...this.s.bottom.instances,
    ]
    
      this.rend.scene_.add( this.s.sphere);
  }
  
  initPlayer(){
  var boxGeometry        = new THREE.BoxGeometry( 1, 1, 1,1 )
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
  this.initPlayer()
  this.initPlanet()
  this.update();
  }
  
  onWindowResize(vpW, vpH) {
  this.rend.renderer.setSize(vpW, vpH);
  }
  
  updateMeshPosition(value){
  //this.mesh.position.x = value
  }
  
  update(t) {
  
  if(this.s){
    this.controls.update(this.clock.getDelta())
   for (var i = 0; i < this.allp.length; i++) {
      this.allp[i].update(this.player)
   }
  }
  
  requestAnimationFrame(this.update.bind(this));
  nodeFrame.update();
  this.rend.renderer.render(this.rend.scene_, this.rend.camera_);

  }
  }
  
  var viewGL = new ViewGL();
  export default viewGL;