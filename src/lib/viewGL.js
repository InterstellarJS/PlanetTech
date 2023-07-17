import * as NODE from 'three/nodes';
import * as THREE from 'three';
import renderer from './render';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';

console.log(NODE)


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
this.rend.orbitControls()


}

initViewPort(canvasViewPort) {
this.canvasViewPort = canvasViewPort;
}

initQuad(tex) {}

initPlanet() {}

start() {
this.render(this.canvasViewPort);
const geometry = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
const material = new NODE.MeshStandardNodeMaterial({color:'blue'});
this. mesh     = new THREE.Mesh( geometry, material );
const light    = new THREE.AmbientLight( 0x404040 ); // soft white light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
this.rend.scene_.add( this.mesh );
this.rend.scene_.add( light );
this.rend.scene_.add( directionalLight );
this.mesh.material.positionNode = NODE.glslFn(`
vec3 planeToSphere(vec3 p, vec3 localCenter){
    return 1.2*normalize(p-localCenter) + localCenter;
  }
`)({p:NODE.positionLocal,localCenter:NODE.vec3(0,0,-.9)})

this.update();
}

onWindowResize(vpW, vpH) {
this.rend.renderer.setSize(vpW, vpH);
}

updateMeshPosition(value){
this.mesh.position.x = value
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