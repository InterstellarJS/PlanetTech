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
  this.rend.clock()
  this.rend.scene();
  this.rend.stats();
  this.rend.camera();
  this.rend.updateCamera(0,0,10000*2.0)
  this.rend.orbitControls()
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
   /*
    const displacmentMaps = new CubeMap(2000,1,false)
    const ddownload = false
    displacmentMaps.build(512)
    displacmentMaps.simplexNoiseFbm({
      inScale:            1.5,
      scale:              0.2,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .01,
      redistribution:      2.,
      persistance:        .35,
      lacunarity:          2.,
      iteration:            5,
      terbulance:       false,
      ridge:            false,
    })
    displacmentMaps.snapShot(ddownload)
    let dt = displacmentMaps.textuerArray
  
    const normalMap = new CubeMap(2000,1,true)
    const ndownload = false
    normalMap.build(512)
    normalMap.simplexNoiseFbm({
      inScale:            1.5,
      scale:              0.2,
      radius:             100,
      scaleHeightOutput:  0.1,
      seed:               0.0,
      normalScale:        .01,
      redistribution:      2.,
      persistance:        .35,
      lacunarity:          2.,
      iteration:            5,
      terbulance:       false,
      ridge:            false,
    })
    normalMap.snapShot(ndownload)
    let nt = normalMap.textuerArray

    const params = {
      width:  10000,
      height: 10000,
      radius: 10000,
      widthSegment: 500,
      heightSegment:500,
      displacmentScale:30.,
      quadTreeDimensions: 1,
      levels: 1,
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
  
    this.s.front.addTexture  ([nt[0],dt[0]], params.displacmentScale)
    this.s.back.addTexture   ([nt[1],dt[1]], params.displacmentScale)
    this.s.right.addTexture  ([nt[2],dt[2]], params.displacmentScale)
    this.s.left.addTexture   ([nt[3],dt[3]], params.displacmentScale)
    this.s.top.addTexture    ([nt[4],dt[4]], params.displacmentScale)
    this.s.bottom.addTexture ([nt[5],dt[5]], params.displacmentScale)

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
      widthSegment:     500,
      heightSegment:    500,
      quadTreeDimensions: 1,
      levels:             1,
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



this.atmo = new Atmosphere()
this.atmo.createcomposer(params.radius,this.s.log().cnt,11000)
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
  //this.rend.scene_.add(this.player)
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
  this.rend.controls.update(this.rend.clock_.getDelta())

  if(this.s){
    this.atmo.run()
    //this.controls.update(this.clock.getDelta())
   for (var i = 0; i < this.allp.length; i++) {
      //this.allp[i].update(this.player)
   }
  }
  
  //this.rend.stats_.end();
  requestAnimationFrame(this.update.bind(this));
  nodeFrame.update();
  //this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
  }
  }
  
  var viewGL = new ViewGL();
  export default viewGL;