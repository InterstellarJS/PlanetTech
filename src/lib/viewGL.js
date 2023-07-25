import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Quad          from './core/quad/quad.js'
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA,displacementNormalNoiseFBM } from './core/sphere/utils'
import {CubeTexture} from "./core/textures/cubetexture"



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
this.rend.updateCamera(0,0,200000)
this.rend.orbitControls()
}

initViewPort(canvasViewPort) {
this.canvasViewPort = canvasViewPort;
}

initQuad(tex) {
  const loader1 = new THREE.TextureLoader().load('./hm4.png');
  this.q = new Quad(100,100,50,50,2)
  this.q.createQuadTree(3)
  this.q.createDimensions()
  this.q.addTexture  (loader1)
  this.rend.scene_.add( ...this.q.instances.map(x=>x.plane) );
}

initPlanet(c) {
 

  var cbt = new CubeTexture()
  var t = cbt.get(this.rend)
  console.log(t)

  const params = {
    width: 100000,
    height: 100000,
    widthSegment: 50,
    heightSegment: 50,
    quadTreeDimensions: 1,
    levels: 2,
    radius: 100000,
    displacmentScale:10000,
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





  //var cbt = new CubeTexture()
  //var t = cbt.get(this.rend)
  t[0][0] = new THREE.CanvasTexture(c)

  t[2][0] = new THREE.CanvasTexture(c)

  console.log(t[0][0])
  this.s.front.addTexture  (t[0], params.displacmentScale)
  this.s.back.addTexture   (t[1], params.displacmentScale)
  this.s.right.addTexture  (t[2], params.displacmentScale)
  this.s.left.addTexture   (t[3], params.displacmentScale)
  this.s.top.addTexture    (t[4], params.displacmentScale)
  this.s.bottom.addTexture (t[5], params.displacmentScale)


  this.s.front.lighting    (NODE.vec3(0,0,0))
  this.s.back.lighting     (NODE.vec3(0,0,0))
  this.s.right.lighting    (NODE.vec3(0,0,0))
  this.s.left.lighting     (NODE.vec3(0,0,0))
  this.s.top.lighting      (NODE.vec3(0,0,0))
  this.s.bottom.lighting   (NODE.vec3(0,0,0))
  


  this.allp = [
    ...this.s.front.instances,
    ...this.s.back.instances,
    ...this.s.right.instances,
    ...this.s.left.instances,
    ...this.s.top.instances,
    ...this.s.bottom.instances,
  ]

console.log( this.s.quadTreeconfig.shardedData)

  this.rend.scene_.add( this.s.sphere);
}

initPlayer(){
var boxGeometry        = new THREE.BoxGeometry( 1, 1, 1,1 )
var boxMaterial        = new THREE.MeshBasicMaterial({color:'red'});
this.player            = new THREE.Mesh( boxGeometry, boxMaterial );
this.player.position.z = this.rend.camera_.position.z
this.controls               = new FirstPersonControls( this.player, document.body );
this.controls.movementSpeed = 30
this.controls.lookSpeed     = 0
this.clock = new THREE.Clock();
this.rend.scene_.add(this.player)
}

start() {
this.render(this.canvasViewPort);
this.initPlayer()
//this.initPlanet()
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
this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
}
}

var viewGL = new ViewGL();
export default viewGL;