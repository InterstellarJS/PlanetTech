
import * as THREE from 'three';
import { OrbitControls }       from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
//webgpu
import * as Nodes     from 'three/nodes';
import {global}       from 'three/nodes';
import WebGPU         from 'three/addons/capabilities/WebGPU.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import Stats  from 'stats-js';

global.set('TSL', Nodes);

class Renderer {
  constructor(type) {this.type = type}

  WebGLRenderer(canvasRef) {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      canvas: canvasRef,
      logarithmicDepthBuffer: true,
      antialias: true,
    });
    this.renderer.setClearColor('black');
    this.container = document.getElementById('canvasContainer');
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.type=localStorage.setItem('type','WebGL');
  }

  WebGPURenderer(canvasRef) {
    if ( WebGPU.isAvailable() === false ) {
      document.body.appendChild( WebGPU.getErrorMessage() );
      throw new Error( 'No WebGPU support' );
    }
    this.renderer = new WebGPURenderer({
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
    this.type=localStorage.setItem('type','WebGPU');
  }

  getType(){
    return localStorage.getItem('type');
  }

  scene() {
    this.scene_ = new THREE.Scene();
  }

  orbitControls(){
    this. controls = new OrbitControls(this.camera_, this.renderer.domElement);
  }

  camera(x = 0, y = 0, z = 0) {
    let aspect = (this.container.clientWidth / this.container.clientHeight)
    let fov    =  30
    let near   = .01
    let far    =  Number.MAX_SAFE_INTEGER
    this.camera_ = new THREE.PerspectiveCamera(fov,aspect,near,far);
  }

  updateCamera(x, y, z) {
    this.camera_.position.x = x;
    this.camera_.position.y = y;
    this.camera_.position.z = z;
  }


  info() {
    console.log('Scene polycount:', this.renderer.info.render.triangles);
    console.log('Active Drawcalls:', this.renderer.info.render.calls);
    console.log('Textures in Memory', this.renderer.info.memory.textures);
    console.log('Geometries in Memory', this.renderer.info.memory.geometries);
  }

  stats() {
    this.stats_ = new Stats();
    this.stats_.showPanel( 0 );
    this.stats_.showPanel( 1 );
    document.body.appendChild( this.stats_.dom );
  }

  updateControlsSpeed(movementSpeed, lookSpeed) {}
  createcomposer() {}
  runVFX() {}
  PLControls() {}
  physics() {}
  clock() {}
  FPSControls() {}

}

var renderer = new Renderer();
export default renderer;