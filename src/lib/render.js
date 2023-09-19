
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
//import Stats from 'https://www.unpkg.com/stats-gl';
import * as Nodes from 'three/nodes';
import { global } from 'three/nodes';

global.set('TSL', Nodes);

class Renderer {
constructor() {}

webglRenderer(canvasRef) {
this.renderer = new THREE.WebGLRenderer({
powerPreference: "high-performance",
canvas: canvasRef,
logarithmicDepthBuffer: true,
});
this.renderer.setClearColor('black');
this.container = document.getElementById('canvasContainer');
this.renderer.setSize(
this.container.clientWidth,
this.container.clientHeight
);
}

stats() {
  /*
this.stats_ =  new Stats();
document.body.appendChild(this.stats_.container );
this.stats_.init( this.renderer.domElement );
var that = this
this.rtt.rtScene_.onBeforeRender = function () {
  that.stats_.begin();
};

this.rtt.rtScene_.onAfterRender = function () {
  that.stats_.end();
};
*/
}

camera(x = 0, y = 0, z = 0) {
this.camera_ = new THREE.PerspectiveCamera(
75,
this.container.clientWidth / this.container.clientHeight,
0.01,
Number.MAX_SAFE_INTEGER
);
console.log(this.container.clientWidth , this.container.clientHeight)
}




updateCamera(x, y, z) {
this.camera_.position.x = x;
this.camera_.position.y = y;
this.camera_.position.z = z;
}

scene() {
this.scene_ = new THREE.Scene();
}

clock() {
  this.clock_ = new THREE.Clock();
}

light() {
const ambientLight     = new THREE.AmbientLight( 0x404040 ); // soft white light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
this.rtt.rtScene_.add(ambientLight)
this.rtt.rtScene_.add(directionalLight)

}

orbitControls(){
    this. controls = new OrbitControls(this.camera_, this.renderer.domElement);
  }


FPControls() {
  this.controls = new FirstPersonControls(this.camera_, this.renderer.domElement);
  this.controls.enableDamping = true; // <--- add this line
  this.controls.movementSpeed = 50000
  this.controls.lookSpeed = 0.005
}

updateControlsSpeed(movementSpeed, lookSpeed) {}

PLControls() {}

physics() {}

info() {
console.log('Scene polycount:', this.renderer.info.render.triangles);
console.log('Active Drawcalls:', this.renderer.info.render.calls);
console.log('Textures in Memory', this.renderer.info.memory.textures);
console.log('Geometries in Memory', this.renderer.info.memory.geometries);
}

createcomposer() {}

runVFX() {}

}

var renderer = new Renderer();
export default renderer;