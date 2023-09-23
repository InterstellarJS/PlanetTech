import * as THREE from 'three';
import renderer from '../../render';

export default class CharacterControles{
    constructor(skin){
     skin.position.z += -1.1
     this.skin       = skin
     this.camera     = renderer.camera_
     this.camHolder  = new THREE.Group();
     this.camera.position.y += .1
     this.camHolder.add(skin);
     this.camHolder.add(this.camera); 
     this.speedTrans = 500;
     this.speedRot = THREE.MathUtils.degToRad(45);
     this.clock = new THREE.Clock();
     this.delta = 0;
    document.addEventListener('keydown',(evt)=>{this.move(evt)})
    }
    
    move(evt) {
     if (evt.keyCode === 87) {
       this.camHolder.translateZ(-this.speedTrans * this.delta);
     } // w fast vorward
     if (evt.keyCode === 83) {
       this.camHolder.translateZ( this.speedTrans * this.delta);
     } // s backward a little slowerself
     if (evt.keyCode === 65) {
       this.camHolder.translateX(-this.speedTrans * this.delta);
     } // a slowly leftwards
     if (evt.keyCode === 68) {
       this.camHolder.translateX( this.speedTrans * this.delta);
     } // d slowly rightwards
   
     if (evt.keyCode === 76) {
       this.camHolder.rotateY(this.speedRot * this.delta);
     } // l turn to the left
     if (evt.keyCode === 82) {
       this.camHolder.rotateY(-this.speedRot * this.delta);
     } // r turn to the right
   
     if (evt.keyCode === 84) {
       this.camHolder.translateY(this.speedTrans * this.delta);
     } // t upstretch
     if (evt.keyCode === 66) {
       this.camHolder.translateY(-this.speedTrans * this.delta);
     } // b bend down
   
     if (evt.keyCode === 37) {
       this.camHolder.rotation.y += this.speedRot * this.delta;
     } // left arrow, looking deeper
   
     if (evt.keyCode === 38) {
       this.camHolder.rotation.x += this.speedRot * this.delta;
     } // up arrow, looking higher
   
     if (evt.keyCode === 39) {
       this.camHolder.rotation.y += -this.speedRot * this.delta;
     } // right arrow, looking deeper
   
     if (evt.keyCode === 40) {
       this.camHolder.rotation.x += -this.speedRot * this.delta;
     } // down arrow, looking deeper
   
   }
   
   
   update(delta){
    this.delta = delta
   }
   }
   