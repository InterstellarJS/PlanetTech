import * as THREE     from 'three';
import renderer from '../render.js';

let rend = renderer
let frustumObj = new THREE.Frustum()

class PlanetFrustumCulling{
    constructor(planet,showBB=false){
        if(showBB){
            planet.getAllInstance().forEach((e)=>{

                const g = new THREE.SphereGeometry( 102, 5, 5 ); 
                var ma = new THREE.MeshBasicMaterial({color:'blue',wireframe:true});
                let m  = new THREE.Mesh( g, ma );
                m.idx = `${e.side}_${e.idx}`

                rend.scene_.add(e.plane.bh)
            })
        }
        this.planet = planet 
    }

    update(){
        let frustum = frustumObj.setFromProjectionMatrix( new THREE.Matrix4().multiplyMatrices(  rend.camera_.projectionMatrix,  rend.camera_.matrixWorldInverse ) );
        rend.scene_.traverse( node => {
            if(( node.isMesh)){
                if(node.geometry.type == "SphereGeometry"){
                if(( frustum.intersectsBox ( node.bb ) )){
                    node.parent.material.visible = true
                    console.log(node.idx)
                }else{
                    node.parent.material.visible = false
                }
                }
            }
        })
    }
}