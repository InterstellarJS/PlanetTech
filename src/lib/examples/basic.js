import { Moon } from "../PlanetTech/celestialBodies/moon"
import * as NODE  from 'three/nodes';
import * as THREE from 'three';

export async function basic(){
    let moon = new Moon({
        size:            10000,
        polyCount:          50,
        quadTreeDimensions:  4,
        levels:              1,
        radius:          80000,
        displacmentScale: 1.5,
        lodDistanceOffset: 7.4,
        material: new NODE.MeshBasicNodeMaterial(),
      })
      let D = await Promise.all([
        new THREE.TextureLoader().loadAsync('./planet/displacement/right_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/left_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/top_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/bottom_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/front_displacement_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/displacement/back_displacement_image.png'),
      ])
    
    let N = await Promise.all([
        new THREE.TextureLoader().loadAsync('./planet/normal/right_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/left_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/top_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/bottom_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/front_normal_image.png'),
        new THREE.TextureLoader().loadAsync('./planet/normal/back_normal_image.png'),
      ])
    
      moon.textuers(N,D)
      moon.light(NODE.vec3(0.0,-6.5,6.5))
      return moon.sphere
}