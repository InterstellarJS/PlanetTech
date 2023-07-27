import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Quad          from './core/quad/quad.js'
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA,displacementNormalNoiseFBM } from './core/sphere/utils'
import {CubeTexture} from "./core/textures/cubetexture"
import {CubeMap} from "./core/textures/cubeMap"



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
this.rend.updateCamera(0,0,2000)
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

initPlanet(canvas) {
 

  //var cbt = new CubeTexture()
  //var t = cbt.get(this.rend)
  //console.log(t)

  const params = {
    width: 1,
    height: 1,
    widthSegment: 50,
    heightSegment: 50,
    quadTreeDimensions: 1,
    levels: 2,
    radius: 1000,
    displacmentScale:50,
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





var cm = new CubeMap()
/*
let frtt = cm.snapShotFront({v: NODE.positionWorld.sub(NODE.vec3(0,0,-1)).normalize() })
var fpixels = frtt.getPixels(this.rend)
var fcanvas = frtt.toImage(fpixels)
frtt.download(fcanvas,'front')

let rrtt = cm.snapShotRight({v: NODE.positionWorld.sub(NODE.vec3(0,0,-1)).normalize() })
let rpixels = rrtt.getPixels(this.rend)
let rcanvas = rrtt.toImage(rpixels)
rrtt.download(rcanvas,'right')

let trtt = cm.snapShotTop({v: NODE.positionWorld.sub(NODE.vec3(0,0,-1)).normalize() })
let tpixels = trtt.getPixels(this.rend)
let tcanvas = trtt.toImage(tpixels)
trtt.download(tcanvas,'top')
*/



  

  this.s.front.addTexture  ([ new THREE.TextureLoader().load('./worldTextures/fc.png')], params.displacmentScale)
  //this.s.back.addTexture   ([new THREE.CanvasTexture(canvas[5])], params.displacmentScale)
  this.s.right.addTexture  ([new THREE.TextureLoader().load('./worldTextures/rc.png')], params.displacmentScale)
  //this.s.left.addTexture   ([new THREE.CanvasTexture(canvas[3])], params.displacmentScale)
  this.s.top.addTexture    ([new THREE.TextureLoader().load('./worldTextures/tc.png')], params.displacmentScale)
  //this.s.bottom.addTexture ([new THREE.CanvasTexture(canvas[4])], params.displacmentScale)


  this.s.front.lighting    (NODE.vec3(0,0,0))
 // this.s.back.lighting     (NODE.vec3(0,0,0))
  this.s.right.lighting    (NODE.vec3(0,0,0))
  //this.s.left.lighting     (NODE.vec3(0,0,0))
  this.s.top.lighting      (NODE.vec3(0,0,0))
  //this.s.bottom.lighting   (NODE.vec3(0,0,0))


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