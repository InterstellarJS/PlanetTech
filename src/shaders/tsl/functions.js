import * as THREE from 'three/tsl'
import { float, vec3, storage, Fn, instanceIndex,vec2 } from 'three/tsl';
import { FBM } from './noise.js';

export const setStorageBufferAttribute = ({ mesh })=>{

    const directionVectorsBaseAttribute = mesh.geometry.attributes.directionVectors;
    const positionBaseAttribute = mesh.geometry.attributes.position;
    const normalBaseAttribute = mesh.geometry.attributes.normal;
    const indexBaseAttribute = mesh.geometry.index;

    const directionVectorsStorageBufferAttribute = new THREE.StorageBufferAttribute( directionVectorsBaseAttribute.count, 4 );
    const positionStorageBufferAttribute = new THREE.StorageBufferAttribute( positionBaseAttribute.count, 4 );
    const normalStorageBufferAttribute = new THREE.StorageBufferAttribute( normalBaseAttribute.count, 4 );
    const indexStorageBufferAttribute = new THREE.StorageBufferAttribute( indexBaseAttribute.count, 1 );

    mesh.geometry.setAttribute( 'position', positionStorageBufferAttribute );
    mesh.geometry.setAttribute( 'normal', normalStorageBufferAttribute );

    return {
        positionBaseAttribute,
        normalBaseAttribute,
        positionStorageBufferAttribute,
        normalStorageBufferAttribute,
        indexBaseAttribute,
        indexStorageBufferAttribute,
        directionVectorsStorageBufferAttribute,
        directionVectorsBaseAttribute
    }
}


export  const defaultLight = Fn(({ lightDirection })=>{

    const _lightDirection = THREE.normalize(lightDirection);

    const normalMapColor  = THREE.normalLocal;    

    const grayscale = THREE.dot(normalMapColor.rgb, vec3(0.125, 0.125, 0.125)); 

    const grayColor = THREE.vec4(grayscale, grayscale, grayscale, 1.0);

    const lightIntensity = THREE.dot(normalMapColor.rgb, _lightDirection); 

    return  grayColor.mul(lightIntensity)
   })


   export const tangentNormal = Fn(([ transformed, center, _unifroms,_noiseUnifroms ])=>{

    let u = transformed.toVar();
    let w = transformed.toVar();
  
    u.addAssign(vec3(_unifroms.epsilon.x,0.,0.));
    let nu = FBM(u,_noiseUnifroms).sub(center)
  
    w.addAssign(vec3(0.,_unifroms.epsilon.y,0.));
    let nw = FBM(w,_noiseUnifroms).sub(center)
  
    let tangent   = THREE.normalize(vec3(1.0, 0.0, nu.mul(_unifroms.normalScale.x)))
  
    let bitangent = THREE.normalize(vec3(0.0, 1.0, nw.mul(_unifroms.normalScale.y)))
  
    let normal    = THREE.cross(tangent, bitangent)
  
    normal = normal.mul(0.5).add(0.5)

    return normal 
  })


  export  const transForm = Fn(({ buffers })=>{
  
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
    let directionVectors = vec3( directionVectorsAttribute  .element( instanceIndex ) ).toVar();
    let normals = vec3( normalAttribute  .element( instanceIndex ) ).toVar();


    let _noiseUnifroms = { 
     G : THREE.pow(2.,-.6).toVar(),
     amplitude : float(1.0).toVar(),
     frequency : float(1.0).toVar(),
     normalization: float(0.0).toVar(),
     total : float(0.).toVar(),
     lacunarity : float(1.4).toVar(),
     exponentiation : float(5.).toVar(),
     height : float(1.5/8).toVar(),
     iteration :float(50.).toVar()}

    let normalUnifroms = {
        epsilon: vec2(.05,.05),
        normalScale: vec2(10.,60.)
    }

  
    const center = FBM(position,_noiseUnifroms)//.mul(0.5).add(0.5)
    let z = directionVectors.mul(center).toVar()
    _position.addAssign(z)
  
    let n = tangentNormal(position,center,normalUnifroms,_noiseUnifroms)
  
    positionStorageAttribute.element( instanceIndex ).assign( _position );
    normalStorageAttribute.element( instanceIndex ).assign( n );
  })