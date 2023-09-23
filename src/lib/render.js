
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import * as Nodes from 'three/nodes';
import { global } from 'three/nodes';
//import Stats from 'https://www.unpkg.com/stats-gl';

global.set('TSL', Nodes);

class Renderer {
constructor() {
}

webglRenderer(canvasRef) {
  this.renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
    canvas: canvasRef,
    logarithmicDepthBuffer: true,
    antialias: true,
  });
  this.renderer.setClearColor('white');
  this.container = document.getElementById('canvasContainer');
  this.renderer.setSize(
  this.container.clientWidth,
  this.container.clientHeight
);
}

stats() {}

FPSControls() {}

updateControlsSpeed() {}

PLControls() {}

physics() {}

scene() {
  this.scene_ = new THREE.Scene();
}

camera(x = 0, y = 0, z = 0) {
  this.camera_ = new THREE.PerspectiveCamera(45,this.container.clientWidth / this.container.clientHeight,.01,6371e3);
}

updateCamera(x, y, z) {
  this.camera_.position.x = x;
  this.camera_.position.y = y;
  this.camera_.position.z = z;
}

light() {
  const ambientLight     = new THREE.AmbientLight( 0x404040 ); 
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  this.rtt.rtScene_.add(ambientLight)
  this.rtt.rtScene_.add(directionalLight)
}

orbitControls(){
  this.controls = new OrbitControls(this.camera_, this.renderer.domElement);
  }


info() {
  console.log('Scene polycount:', this.renderer.info.render.triangles);
  console.log('Active Drawcalls:', this.renderer.info.render.calls);
  console.log('Textures in Memory', this.renderer.info.memory.textures);
  console.log('Geometries in Memory', this.renderer.info.memory.geometries);
}


}

var renderer = new Renderer();
export default renderer;