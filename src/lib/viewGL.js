import * as NODE     from 'three/nodes';
import * as THREE    from 'three';
import renderer      from './render';
import Sphere        from './core/sphere/sphere'
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { getRandomColor,hexToRgbA } from './core/sphere/utils'
import { CubeMapTexture } from './core/textures/cubeMap/cubeMap.js';


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

initQuad(tex) {
  /*const loader1 = new THREE.TextureLoader().load('./hm4.png');
  this.q = new Quad(100,100,50,50,2)
  this.q.createQuadTree(3)
  this.q.createDimensions()
  this.q.addTexture  (loader1)
  this.rend.scene_.add( ...this.q.instances.map(x=>x.plane) );*/
}

initPlanet() {




  const cm = new CubeMapTexture()
  cm.build(2048)
  cm.simplexNoiseFbm({
    inScale:1,
    scale:0.1,  
    scaleHeightOutput:.5,
    seed:6.15,
    normalScale:.001,
    persistance:.4,
    lacunarity:1.8,
    redistribution:1.,
    octaves:4,
    iteration:8,
    terbulance:false,
    ridge:false,
    vn:NODE.normalLocal, 
    tangent:NODE.tangentLocal,  
  })
  /*
  cm.simplexNoiseFbmD({ 
    scale:12., 
    octaves:8,  
    persistence:.15,  
    lacunarity:2.4
  })*/

  cm.snapShot(false)
  let DN = cm.getTexture()
  let N  = DN.normal
  let D  = DN.displacement



  const params = {
    width: 10000,
    height: 10000,
    widthSegment: 50,
    heightSegment:50,
    quadTreeDimensions: 1,
    levels: 1,
    radius: 10000,
    displacmentScale:100,
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

  this.s.front.lighting    (NODE.vec3(0,0,0))
  this.s.back.lighting     (NODE.vec3(0,0,0))
  this.s.right.lighting    (NODE.vec3(0,0,0))
  this.s.left.lighting     (NODE.vec3(0,0,0))
  this.s.top.lighting      (NODE.vec3(0,0,0))
  this.s.bottom.lighting   (NODE.vec3(0,0,0))


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