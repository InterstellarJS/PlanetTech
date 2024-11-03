import * as THREE from 'three/tsl'
import { vec3, storage,  instanceIndex } from 'three/tsl';


export const setStorageBufferAttribute = ({ mesh, buffers })=>{

    for (const [key, value] of Object.entries(mesh.geometry.attributes)) {
        
        mesh.geometry.setAttribute( key , buffers[`${key}StorageBufferAttribute`] );

      }

}

export const getStorageBufferAttribute = ({ mesh })=>{

    let buffers = {}

    for (const [key, value] of Object.entries(mesh.geometry.attributes)) {

        buffers[`${key}BaseAttribute`] = value;

        buffers[`${key}StorageBufferAttribute`] = new THREE.StorageBufferAttribute( value.count, value.itemSize );

      }

    return buffers
}


export  const sphereStagging = ({ buffers })=>{
  
    const positionBaseAttribute = buffers.positionBaseAttribute
    const normalBaseAttribute = buffers.normalBaseAttribute
    const directionVectorsBaseAttribute = buffers.directionVectorsBaseAttribute
  
    const positionStorageBufferAttribute = buffers.positionStorageBufferAttribute
    const normalStorageBufferAttribute = buffers.normalStorageBufferAttribute
    const directionVectorsStorageBufferAttribute = buffers.directionVectorsStorageBufferAttribute
  
    const positionAttribute = storage( positionBaseAttribute, 'vec3', positionBaseAttribute.count ).toReadOnly();
    const normalAttribute = storage( normalBaseAttribute, 'vec3', normalBaseAttribute.count ).toReadOnly();
    const directionVectorsAttribute = storage( directionVectorsBaseAttribute, 'vec3', directionVectorsBaseAttribute.count ).toReadOnly();
  
    const positionStorageAttribute = storage( positionStorageBufferAttribute, 'vec4', positionStorageBufferAttribute.count );
    const normalStorageAttribute = storage( normalStorageBufferAttribute, 'vec4', normalStorageBufferAttribute.count );
    const directionVectorsStorageAttribute = storage( directionVectorsStorageBufferAttribute, 'vec4', directionVectorsStorageBufferAttribute.count );
  
    let position  = vec3( positionAttribute.element( instanceIndex ) ).toVar().mul(1.5);
    let _position = vec3( positionAttribute.element( instanceIndex ) ).toVar();
    let normal    = vec3( normalAttribute.element( instanceIndex ) ).toVar();
    let directionVectors = vec3( directionVectorsAttribute.element( instanceIndex ) ).toVar();

    let storageAttribute ={
        positionStorageAttribute,
        normalStorageAttribute,
        directionVectorsStorageAttribute
    }

    let vars = {
        position,
        _position,
        directionVectors,
        normal,
    }

   return {vars,storageAttribute}
  }
  
export  const quadStagging = ({ buffers })=>{
  
    const positionBaseAttribute = buffers.positionBaseAttribute
    const normalBaseAttribute = buffers.normalBaseAttribute
  
    const positionStorageBufferAttribute = buffers.positionStorageBufferAttribute
    const normalStorageBufferAttribute = buffers.normalStorageBufferAttribute
  
    const positionAttribute = storage( positionBaseAttribute, 'vec3', positionBaseAttribute.count ).toReadOnly();
    const normalAttribute = storage( normalBaseAttribute, 'vec3', normalBaseAttribute.count ).toReadOnly();
  
    const positionStorageAttribute = storage( positionStorageBufferAttribute, 'vec4', positionStorageBufferAttribute.count );
    const normalStorageAttribute = storage( normalStorageBufferAttribute, 'vec4', normalStorageBufferAttribute.count );
  
    let position  = vec3( positionAttribute.element( instanceIndex ) ).toVar().mul(1.5);
    let _position = vec3( positionAttribute.element( instanceIndex ) ).toVar();
    let normal    = vec3( normalAttribute.element( instanceIndex ) ).toVar();

    let storageAttribute ={
        positionStorageAttribute,
        normalStorageAttribute,
    }

    let vars = {
        position,
        _position,
        normal,
    }

   return {vars,storageAttribute}
  }