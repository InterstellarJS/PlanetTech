import * as THREE from 'three/tsl'
import { Sphere } from './primitives.js'

let project=( normalizedCenter, r, center,p )=>{
    normalizedCenter.sub(p).normalize()
    center.copy(normalizedCenter)
    normalizedCenter.multiplyScalar(r)
    normalizedCenter.add(p).add(center)
}

const createLocations = ( size, offset, axis ) => {
    const halfSize = size 
    switch (axis) {
     case 'z':
       return [
         [ halfSize + offset[0],  halfSize + offset[1], offset[2]],
         [-halfSize + offset[0],  halfSize + offset[1], offset[2]],
         [ halfSize + offset[0], -halfSize + offset[1], offset[2]],
         [-halfSize + offset[0], -halfSize + offset[1], offset[2]],
       ];
     case 'x':
       return [
         [offset[0],  halfSize + offset[1],  halfSize + offset[2]],
         [offset[0],  halfSize + offset[1], -halfSize + offset[2]],
         [offset[0], -halfSize + offset[1],  halfSize + offset[2]],
         [offset[0], -halfSize + offset[1], -halfSize + offset[2]],
       ];
     case 'y':
       return [
         [ halfSize + offset[0], offset[1],  halfSize + offset[2]],
         [-halfSize + offset[0], offset[1],  halfSize + offset[2]],
         [ halfSize + offset[0], offset[1], -halfSize + offset[2]],
         [-halfSize + offset[0], offset[1], -halfSize + offset[2]],
       ];
     default:
       return [];
   }
 };


class Node extends THREE.Object3D{ 

    constructor(params){ 
      super(); 
      this.params = params
      this._children = []
    }

}

export class PrimitiveNode extends Node{ 

    constructor(params){ 
        super(params); 
     }

    mesh(){
        if (this.children[0] instanceof THREE.Mesh) // just to make sure
        return this.children[0]
    }

}




export class QuadTreeNode extends Node{

    constructor(params, normalize){ 
        super(params);
        this.normalize = normalize
 
        let matrixRotationData =  this.params.metaData.matrixRotationData
        let offset =  this.params.metaData.offset
        let matrix = matrixRotationData.propMehtod ? new THREE.Matrix4()[[matrixRotationData.propMehtod]](matrixRotationData.input) : new THREE.Matrix4() 
        matrix.premultiply(new THREE.Matrix4().makeTranslation(...offset));  
        this.position.applyMatrix4(matrix)
    }

    setBounds(primitive){
        let size = this.params.size
        if(this.normalize){
            let M = new THREE.Vector3();

            let radius =  this.params.quadTreeController.config.radius

            const axis = this.params.metaData.direction.includes('z') ? 'z' : this.params.metaData.direction.includes('x') ? 'x' : 'y';
            createLocations(size, this.params.metaData.offset, axis).forEach(e=>{
                let k = new THREE.Vector3(...e)
                var A = this.localToWorld(k )
                project(A,radius,new THREE.Vector3(),new THREE.Vector3().copy(primitive.position))
                M.add(k)

                const geometry = new THREE.SphereGeometry(   .5, 32, 16 ); 
                const material = new THREE.MeshStandardMaterial( { color: 'green' } ); 
                const sphere   = new THREE.Mesh( geometry, material ); 
                sphere.position.copy(A)
                this.attach(sphere)
            })

            M.divideScalar(4);
            
            project( M,radius,new THREE.Vector3() ,new THREE.Vector3().copy(primitive.position));
            //this.position.copy(M)

            
            const geometry = new THREE.SphereGeometry(     .5, 32, 16 ); 
            const material = new THREE.MeshStandardMaterial( { color: 'red' } ); 
            const sphere   = new THREE.Mesh( geometry, material ); 
            sphere.position.copy(M)
            this.attach(sphere)
            this.bounds = M
        }
    }

    insert(OBJECT3D,primitive){
        let localToWorld = primitive.localToWorld(new THREE.Vector3().copy(this.position)) 
        var distance = localToWorld.distanceTo(OBJECT3D.position)
      
        if ( (distance) < (primitive.quadTreeController.config.lodDistanceOffset * this.params.size) && this.params.size > primitive.quadTreeController.config.minLevelSize ){
      
            if (this._children.length === 0) { this.subdivide(primitive); }
     
            for (const child of this._children) { child.insert(OBJECT3D,primitive) } 
        }

    }


    subdivide(primitive){
        let { metaData, size } = this.params;
        let { direction, matrixRotationData } = metaData;
        let  offset = metaData.offset

        let axis = direction.includes('z') ? 'z' : direction.includes('x') ? 'x' : 'y';
         let segments = primitive.quadTreeController.config.arrybuffers[Math.floor(size/2)].geometryData.parameters.widthSegments
        let quadTreeController = primitive.quadTreeController
        size = Math.floor(size/2)
        let locations = createLocations( (size/2 ), offset.map(v=> (v/2 )), axis); 

        locations.forEach((location,idx) => {

            let metaData={
                index:0,  //TODO
                offset:location,  
                direction,
                matrixRotationData}   
        
            let quadtreeNode = new QuadTreeNode( {size, segments , metaData , quadTreeController}, (primitive instanceof Sphere))
            this.add(quadtreeNode)
            quadtreeNode.setBounds(primitive)

            this._children.push(quadtreeNode)
            const geometry = new THREE.SphereGeometry( 0.25, 32, 16 ); 
            const material = new THREE.MeshStandardMaterial( { color: 'white' } ); 
            const sphere   = new THREE.Mesh( geometry, material ); 
            sphere.position.copy(quadtreeNode.position)
            this.attach(sphere)
        });
    
        }

}