import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import { CelestialBodies } from './celestialbodies';

export class Sun extends CelestialBodies {
    constructor(params,name){
        super(params,'Sun')
        this.name = name
    }
}