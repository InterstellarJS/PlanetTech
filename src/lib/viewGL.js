import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './core/sphere/utils'
import { CubeMap } from './core/textures/cubeMap';
import {NormalMaterial,NoiseMaterial} from './core/shaders/material';


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
this.rend.updateCamera(0,0,200)
this.rend.orbitControls()
}

initViewPort(canvasViewPort) {
this.canvasViewPort = canvasViewPort;
}

initQuad(tex) {
  /*const loader1 = new THREE.TextureLoader().load('./hm4.png');
  this.q = new Quad(100,100,50,50,2)
  this.q.createQuadTree(3)
  this.q.createDimensions()
  this.q.addTexture  (loader1)
  this.rend.scene_.add( ...this.q.instances.map(x=>x.plane) );*/
}

initPlanet() {
 let noiseMaterial = new NoiseMaterial()

  const cm = new CubeMap(noiseMaterial)
  cm.material.simplexPerlinNoiseFBm('+',5.3,{x:1,y:1,z:1}, 1., 2.0, .5, 1., 4,  5, false,  false)
  cm.material.simplexPerlinNoiseFBm('*',6.3,{x:1,y:1,z:1}, 1., 2.0, .5, 1., 4,  5, true,  false)

  cm.buildRttMesh(true)
  cm.complie(512*2)
  let ta  =  (cm.textuerArray)

  const params = {
    width: 100,
    height: 100,
    widthSegment: 150,
    heightSegment: 150,
    quadTreeDimensions: 1,
    levels: 3,
    radius: 100,
    displacmentScale:2.4,
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

  const loader1 = new THREE.TextureLoader().load('./tf.jpg');
  const loader2 = new THREE.TextureLoader().load('./tr.jpg');
  const loader1d = new THREE.TextureLoader().load('./tfd.jpg');
  const loader2d = new THREE.TextureLoader().load('./trd.jpg');

  this.s.front.addTexture  ([ta[4]], params.displacmentScale)
  this.s.back.addTexture   ([ta[5]], params.displacmentScale)
  this.s.right.addTexture  ([ta[0]], params.displacmentScale)
  this.s.left.addTexture   ([ta[1]], params.displacmentScale)
  this.s.top.addTexture    ([ta[2]], params.displacmentScale)
  this.s.bottom.addTexture ([ta[3]], params.displacmentScale)


  //this.s.front.addTexture  ([loader1,loader1d], params.displacmentScale)
  //this.s.right.addTexture  ([loader2,loader2d], params.displacmentScale)

  //this.s.front.lighting    (NODE.vec3(0,0,0))
  //this.s.right.lighting    (NODE.vec3(0,0,0))

/*


  

  this.s.front.lighting    (NODE.vec3(0,0,0))
  this.s.back.lighting     (NODE.vec3(0,0,0))
  this.s.right.lighting    (NODE.vec3(0,0,0))
  this.s.left.lighting     (NODE.vec3(0,0,0))
  this.s.top.lighting      (NODE.vec3(0,0,0))
  this.s.bottom.lighting   (NODE.vec3(0,0,0))
*/


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
this.controls.movementSpeed = 30
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
   //this.allp[i].update(this.player)
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