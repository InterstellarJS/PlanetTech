import * as THREE from 'three/tsl'
import { Sphere } from './primitives.js'
import { project, createLocations, isWithinBounds } from './utils.js';

class Node extends THREE.Object3D{ 

    constructor(params){ 
      super() 
      this.params = params
      this._children = []
    }

}

export class MeshNode extends Node{ 

    constructor(params,state = 'inactive'){ 
        super(params)
        this.state = state 
     }
    
    add(mesh){
        super.add(mesh)
        this.showMesh()
        this.hideMesh()
        return this
    }

    mesh(){
        if (this.children[0] instanceof THREE.Mesh) // todo
        return this.children[0]
    }

    showMesh() {
        if (this.state === 'active') {
            this.mesh().visible = true;
            this.state = 'active';
        }
      }

    hideMesh() {
        if (this.state !== 'active') {
            this.mesh().visible = false;
            this.state = 'inactive';
        }
    }

}


export class QuadTreeNode extends Node{

    constructor(params, normalize){ 
        super(params) 
        this.normalize = normalize
 
        let matrixRotationData =  this.params.metaData.matrixRotationData
        let offset =  this.params.metaData.offset
        let matrix = matrixRotationData.propMehtod ? new THREE.Matrix4()[[matrixRotationData.propMehtod]](matrixRotationData.input) : new THREE.Matrix4() 
        matrix.premultiply(new THREE.Matrix4().makeTranslation(...offset)) 
        this.position.applyMatrix4(matrix)
    }

    setBounds(primitive){
        let size = this.params.size
        if(this.normalize){
            let M = new THREE.Vector3() 

            let radius =  this.params.quadTreeController.config.radius

            const axis = this.params.metaData.direction.includes('z') ? 'z' : this.params.metaData.direction.includes('x') ? 'x' : 'y';
            createLocations(size, this.params.metaData.offset, axis).forEach(e=>{
                let k = new THREE.Vector3(...e)
                var A = this.localToWorld( k )
                project(A,radius,new THREE.Vector3(),new THREE.Vector3().copy(primitive.position))
                M.add(A)

                /*const geometry = new THREE.SphereGeometry(   .5, 32, 16 ) 
                const material = new THREE.MeshStandardMaterial( { color: 'green' } ) 
                const sphere   = new THREE.Mesh( geometry, material ) 
                sphere.position.copy(A)
                this.attach(sphere)*/
            })

            M.divideScalar(4) 
            
            project( M,radius,new THREE.Vector3() ,new THREE.Vector3().copy(primitive.position)) 

            /*const geometry = new THREE.SphereGeometry( .5, 32, 16 )  
            const material = new THREE.MeshStandardMaterial( { color: 'red' } ) 
            const sphere   = new THREE.Mesh( geometry, material ) 
            sphere.position.copy(M)
            this.attach(sphere)*/
            this.bounds = M
        }
    }

    insert(OBJECT3D,primitive){

        var distance = this.bounds.distanceTo(OBJECT3D.position)
      
        if ( isWithinBounds(distance,primitive,this.params.size) ) {
      
            if (this._children.length === 0) { this.subdivide(primitive) }
     
            for (const child of this._children) { child.insert(OBJECT3D,primitive) } 
        }

    }

    subdivide(primitive){
        let { metaData, size } = this.params;
        let { direction, matrixRotationData } = metaData;
        let  offset = metaData.offset

        let axis = direction.includes('z') ? 'z' : direction.includes('x') ? 'x' : 'y';
        let segments = primitive.quadTreeController.config.arrybuffers[(size/2)].geometryData.parameters.widthSegments
        let quadTreeController = primitive.quadTreeController
        size =  (size/2)
        let locations = createLocations( (size/2 ), offset.map(v=> (v/1 )), axis) 

        locations.forEach((location) => {

            let metaData={
                index:0,  //TODO
                offset:location,  
                direction,
                matrixRotationData}   
        
            let quadtreeNode = new QuadTreeNode( {size, segments , metaData , quadTreeController}, (primitive instanceof Sphere))
            primitive.add(quadtreeNode)
            quadtreeNode.setBounds(primitive)

            this._children.push(quadtreeNode)

            /*const geometry = new THREE.SphereGeometry( 0.25, 32, 16 ) 
            const material = new THREE.MeshStandardMaterial( { color: 'white' } ) 
            const sphere   = new THREE.Mesh( geometry, material ) 
            sphere.position.copy(quadtreeNode.position)
            this.attach(sphere)*/
        });
    
        }


    visibleNodes(OBJECT3D,primitive){

        const nodes = [] 
    
        const traverse = ( node ) => {
            
            var distance = node.bounds.distanceTo(OBJECT3D.position)

            if( isWithinBounds( distance, primitive, node.params.size ) ){

                for (const child of node._children) { traverse(child)  }

            }else{

                /*for (const child of node.children ) {
                        child.material.color = new THREE.Color(0,0,1)
                        child.scale.multiplyScalar(.5)
                    }*/

                nodes.push(node);

            }
        }
    
        traverse(this)

        return nodes
    }

}