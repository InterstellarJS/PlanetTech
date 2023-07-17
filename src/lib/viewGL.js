import * as THREE from 'three';
import renderer from './render';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';

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
this.rend.updateCamera(0,0,.8)

}

initViewPort(canvasViewPort) {
this.canvasViewPort = canvasViewPort;
}

initQuad(tex) {}

initPlanet() {}

start() {
this.render(this.canvasViewPort);
const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();
this. mesh = new THREE.Mesh( geometry, material );
this.rend.scene_.add( this.mesh );
this.update();
}

onWindowResize(vpW, vpH) {
this.rend.renderer.setSize(vpW, vpH);
}

update(t) {
this.rend.stats_.begin();
this.mesh.rotation.x = t / 2000;
this.mesh.rotation.y = t / 1000;
this.rend.stats_.end();
requestAnimationFrame(this.update.bind(this));
nodeFrame.update();
this.rend.renderer.render(this.rend.scene_, this.rend.camera_);
}
}

var viewGL = new ViewGL();
export default viewGL;