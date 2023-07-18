import * as NODE from 'three/nodes';
import * as THREE from 'three';
import renderer from './render';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import Quad         from './core/quad/quad.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';



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
  this. q = new Quad(100,100,50,50,2)
  this.q.createQuadTree(3)
  this.q.createDimensions()
  const loader1 = new THREE.TextureLoader().load('./front_image.png');
  this.q.addTexture  (loader1)
  this.rend.scene_.add( ...this.q.instances.map(x=>x.plane) );
}

initPlanet() {}

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
this.initQuad()
this.update();
}

onWindowResize(vpW, vpH) {
this.rend.renderer.setSize(vpW, vpH);
}

updateMeshPosition(value){
//this.mesh.position.x = value
}

update(t) {
this.rend.stats_.begin();

if(this.q){
  this.controls.update(this.clock.getDelta())
  for (var i = 0; i < this.q.instances.length; i++) {
    this.q.instances[i].update(this.player)
  }
}

this.rend.stats_.end();
requestAnimationFrame(this.update.bind(this));
nodeFrame.update();
this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
}
}

var viewGL = new ViewGL();
export default viewGL;