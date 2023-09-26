import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import { CelestialBodies } from './celestialbodies';

export class Moon extends CelestialBodies {
    constructor(params,name){
        super(params,'Moon')
        this.name = name
    }
}