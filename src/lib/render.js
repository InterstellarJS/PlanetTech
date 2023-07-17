
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import Stats from 'stats-js';
import * as Nodes from 'three/nodes';
import { global } from 'three/nodes';

global.set('TSL', Nodes);

class Renderer {
constructor() {}

webglRenderer(canvasRef) {
this.renderer = new THREE.WebGLRenderer({
canvas: canvasRef,
antialias: true,
});
this.renderer.setClearColor('white');
this.container = document.getElementById('canvasContainer');
this.renderer.setSize(
this.container.clientWidth,
this.container.clientHeight
);
}

stats() {
this.stats_ = new Stats();
this.stats_.showPanel(0);
document.body.appendChild(this.stats_.dom);
}

camera(x = 0, y = 0, z = 0) {
this.camera_ = new THREE.PerspectiveCamera(
75,
this.container.clientWidth / this.container.clientHeight,
0.1,
6371e3
);
}

updateCamera(x, y, z) {
this.camera_.position.x = x;
this.camera_.position.y = y;
this.camera_.position.z = z;
}

scene() {
this.scene_ = new THREE.Scene();
}

clock() {}

cameraLight() {}

orbitControls() {}

FPSControls() {}

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