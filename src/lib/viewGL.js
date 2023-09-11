import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './core/sphere/utils'
import { CubeMap, CubeMapTexture } from './core/textures/cubeMap/cubeMap.js';
import { Atmosphere } from './core/shaders/vfx/atmosphereScattering';


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
  this.rend.updateCamera(0,0,10000)
  this.rend.orbitControls()
  this.atmo = new Atmosphere()
  this.atmo.createcomposer()
  }
  
  initViewPort(canvasViewPort) {
  this.canvasViewPort = canvasViewPort;
  }
  
  initQuad(tex) {
    /*
    const loader1 = new THREE.TextureLoader().load('./hm4.png');
    this.q = new Quad(100,100,50,50,2)
    this.q.createQuadTree(3)
    this.q.createDimensions()
    this.q.addTexture  (loader1)
    this.rend.scene_.add( ...this.q.instances.map(x=>x.plane));
    */
  }
  
  initPlanet() {
   
    const cm = new CubeMap(2,1,true)
    const download = false
    cm.build(512)
    cm.simplexNoiseFbm({
      inScale:            1.5,
      scale:              0.05,
      radius:             100,
      scaleHeightOutput:   0.1,
      seed:              0.0,
      normalScale:        .1,
      redistribution:      2.,
      persistance:         .3,
      lacunarity:          3.,
      iteration:           5,
      terbulance:       false,
      ridge:            false,
    })
    cm.snapShot(download)
    let t = cm.textuerArray
  


    const cmn = new CubeMap(2,1,false)
    cmn.build(2512)
    cmn.simplexNoiseFbm({
      inScale:            1.5,
      scale:              0.05,
      radius:             100,
      scaleHeightOutput:   0.1,
      seed:              0.0,
      normalScale:        .1,
      redistribution:      2.,
      persistance:         .3,
      lacunarity:          4.,
      iteration:           5,
      terbulance:       false,
      ridge:            false,
    })
    cmn.snapShot(download)
    let td = cmn.textuerArray

    const params = {
      width: 10000,
      height: 10000,
      widthSegment: 50,
      heightSegment:50,
      quadTreeDimensions: 1,
      levels: 5,
      radius: 10000,
      displacmentScale:200,
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
  
    this.s.front.addTexture  ([t[0],td[0]], params.displacmentScale)
    this.s.back.addTexture   ([t[1],td[1]], params.displacmentScale)
    this.s.right.addTexture  ([t[2],td[2]], params.displacmentScale)
    this.s.left.addTexture   ([t[3],td[3]], params.displacmentScale)
    this.s.top.addTexture    ([t[4],td[4]], params.displacmentScale)
    this.s.bottom.addTexture ([t[5],td[5]], params.displacmentScale)

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
 
 this.s.position(0,0,10000/2) 
  
/*
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
      levels:             5,
      radius:         10000,
      displacmentScale:  0,
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
*/

  
    this.rend.scene_.add( this.s.sphere);
  }
  
  initPlayer(){
  var boxGeometry        = new THREE.BoxGeometry( 1, 1, 1,1 )
  var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
  this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
  this.player.position.z = this.rend.camera_.position.z
  this.controls               = new FirstPersonControls( this.player, document.body );
  this.controls.movementSpeed = 100
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
  //this.rend.stats_.begin();
  
  if(this.s){
    this.controls.update(this.clock.getDelta())
   for (var i = 0; i < this.allp.length; i++) {
      this.allp[i].update(this.player)
   }
  }
  
  //this.rend.stats_.end();
  requestAnimationFrame(this.update.bind(this));
  nodeFrame.update();
  this.atmo.run()
  //this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
  }
  }
  
  var viewGL = new ViewGL();
  export default viewGL;