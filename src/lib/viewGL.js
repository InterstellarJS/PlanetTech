import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Quad          from './core/quad/quad.js'
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './core/sphere/utils'



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
  const loader1 = new THREE.TextureLoader().load('./hm4.png');
  this.q = new Quad(100,100,50,50,2)
  this.q.createQuadTree(3)
  this.q.createDimensions()
  this.q.addTexture  (loader1)
  this.rend.scene_.add( ...this.q.instances.map(x=>x.plane) );
}

initPlanet() {
  const params = {
    width: 100,
    height: 100,
    widthSegment: 50,
    heightSegment: 50,
    quadTreeDimensions: 3,
    levels: 2,
    radius: 100,
    displacmentScale:5,
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


  const loader1 = new THREE.TextureLoader().load('./worldTextures/front_image.png');
  const loader2 = new THREE.TextureLoader().load('./worldTextures/back_image.png');
  const loader3 = new THREE.TextureLoader().load('./worldTextures/right_image.png');
  const loader4 = new THREE.TextureLoader().load('./worldTextures/left_image.png');
  const loader5 = new THREE.TextureLoader().load('./worldTextures/top_image.png');
  const loader6 = new THREE.TextureLoader().load('./worldTextures/bottom_image.png');


  
  this.s.front.addTexture  ([loader1], params.displacmentScale)
  this.s.back.addTexture   ([loader2], params.displacmentScale)
  this.s.right.addTexture  ([loader3], params.displacmentScale)
  this.s.left.addTexture   ([loader4], params.displacmentScale)
  this.s.top.addTexture    ([loader5], params.displacmentScale)
  this.s.bottom.addTexture ([loader6], params.displacmentScale)


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
this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
}
}

var viewGL = new ViewGL();
export default viewGL;