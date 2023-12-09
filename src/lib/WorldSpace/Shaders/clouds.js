import Sphere from "../../PlanetTech/sphere/sphere";
import * as NODE      from 'three/nodes';
import * as THREE     from 'three';


export class Clouds extends Sphere{
    constructor(params){
        super(
            params.size,
            params.size,
            params.polyCount,
            params.polyCount,
            params.quadTreeDimensions)

        this.build(
            1.,
            params.radius,
            0,
            0,
            params.material,
            params.color,
        )
        this.params = params
    }
}