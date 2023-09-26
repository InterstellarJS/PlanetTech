import * as NODE  from 'three/nodes';
import * as THREE from 'three';
import { CelestialBodies } from './celestialbodies';

export class Planet extends CelestialBodies{
    constructor(params,name){
        super(params,'Planet')
        this.name = name
    }
}