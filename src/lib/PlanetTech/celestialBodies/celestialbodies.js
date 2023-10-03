import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import Sphere     from '../sphere/sphere';

export class CelestialBodies extends Sphere{
    constructor(params,type){
        super(
            params.size,
            params.size,
            params.polyCount,
            params.polyCount,
            params.quadTreeDimensions)

        this.build(
            params.levels,
            params.radius,
            params.displacmentScale,
            params.lodDistanceOffset,
            params.material,
            params.color,
        )
        this.params = params
        this.type   = type
    }

    textuers(N,D){
        this.front.addTexture  ([N[0],D[0]], this.params.displacmentScale)
        this.back.addTexture   ([N[1],D[1]], this.params.displacmentScale)
        this.right.addTexture  ([N[2],D[2]], this.params.displacmentScale)
        this.left.addTexture   ([N[3],D[3]], this.params.displacmentScale)
        this.top.addTexture    ([N[4],D[4]], this.params.displacmentScale)
        this.bottom.addTexture ([N[5],D[5]], this.params.displacmentScale)
    }

    light(ld){
        this.front.lighting  (ld)
        this.back.lighting   (ld)
        this.right.lighting  (ld)
        this.left.lighting   (ld)
        this.top.lighting    (ld)
        this.bottom.lighting (ld)
    }


}