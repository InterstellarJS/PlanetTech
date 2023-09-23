import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls }      from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './core/sphere/utils'
import { CubeMap, CubeMapTexture }  from './core/textures/cubeMap/cubeMap.js';
import CharacterControles from './core/addOn/controls';

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
}

initViewPort(canvasViewPort) {
this.canvasViewPort = canvasViewPort;
}

initQuad(tex) {

}

initPlanet() {
 /*
  const cm = new CubeMap(2000,3,false)
  const download = false
  cm.build(2512)
  cm.simplexNoiseFbm({
    inScale:            5.0,
    scale:              0.04,
    radius:             100,
    scaleHeightOutput:   0.1,
    seed:                0.0,
    normalScale:        .05,
    redistribution:      2.,
    persistance:         .5,
    lacunarity:          2.,
    iteration:           5,
    terbulance:       false,
    ridge:            false,
  })

  cm.snapShotFront (download)
  cm.snapShotTop   (download)
  cm.snapShotLeft  (download)

  //cm.snapShotBack   (download)
  //cm.snapShotBottom (download)
  //cm.snapShotRight  (download)

  let t = cm.textuerArray

  const params = {
    width: 10000,
    height: 10000,
    widthSegment: 1,
    heightSegment:1,
    quadTreeDimensions: 1,
    levels: 1,
    radius: 10000,
    displacmentScale:0,
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

this.s.front.addTexture  ([t[0],t[0]], params.displacmentScale)

const ld = NODE.vec3(0.0,100.0,100.0)

this.s.front.lighting    (ld)


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
  widthSegment:      50,
  heightSegment:     50,
  quadTreeDimensions: 2,
  levels:             3,
  radius:         10000,
  displacmentScale:  20,
  color: () => NODE.vec3(...hexToRgbA(getRandomColor())),

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
  params.color
)


this.allp = [

  ...this.s.front.instances,
]

  this.rend.scene_.add( this.s.front.instances[0].plane);
  this.rend.scene_.add( this.s.front.instances[1].plane);
  this.rend.scene_.add( this.s.front.instances[2].plane);
  this.rend.scene_.add( this.s.front.instances[3].plane);

  //this.rend.scene_.add( this.s.sphere);

}

initPlayer(){
var boxGeometry             = new THREE.BoxGeometry( 2.1, 2.1, 2.1 )
var boxMaterial             = new THREE.MeshBasicMaterial({color:'red'});
this.player                 = new THREE.Mesh( boxGeometry, boxMaterial );
this.player.position.z      = this.rend.camera_.position.z
this.controls               = new FirstPersonControls( this.player, document.body );
this.controls.movementSpeed = 100
this.controls.lookSpeed     = 0
this.clock = new THREE.Clock();
this.rend.scene_.add(this.player)

/*
var boxGeometry             = new THREE.BoxGeometry( .1, .1, .1 )
var boxMaterial             = new THREE.MeshBasicMaterial({color:'red'});
this.player                 = new THREE.Mesh( boxGeometry, boxMaterial );
this.player.position.z      = this.rend.camera_.position.z
this.controls               = new CharacterControles( this.player);

this.clock = new THREE.Clock();
console.log(this.controls.camHolder)
this.rend.scene_.add(this.controls.camHolder)
 */
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
  for (var i = 0; i < this.allp.length; i++) {
    this.allp[i].update(this.player)
  }
}
this.controls.update(this.clock.getDelta())
requestAnimationFrame(this.update.bind(this));
nodeFrame.update();
this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
}
}

var viewGL = new ViewGL();
export default viewGL;