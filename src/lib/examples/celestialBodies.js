import { Moon } from "../PlanetTech/celestialBodies/moon";
import * as NODE from 'three/nodes';
 
export function celestialBodies(N,D){
    
    let moon = new Moon({
      size:            10000,
      polyCount:          50,
      quadTreeDimensions:  4,
      levels:              4,
      radius:          80000,
      displacmentScale: 80.5,
      lodDistanceOffset: 7.4,
      material: new NODE.MeshBasicNodeMaterial(),
    })
    
    moon.textuers(N,D)
    moon.light(NODE.vec3(0.0,-6.5,6.5))
    return moon
}